// ============================================================
// S7 cleanup-holdout：删除 holdout 合成种子并核验清零（DRAFT 允许 1「完成后必须清理」）
// 使用 REST DELETE /memories/{id}（loopback；不触发 LLM 抽取，仅删点）
// 输出：data/holdout/cleanup.json（删除结果 + getAll 核验）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, AUDIT_DIR, nowIso } from "./config.mjs";
import { mem0Delete, mem0GetAll } from "./lib/mem0-api.mjs";
import { installFetchAudit, ensureAuditFile } from "./lib/fetch-audit.mjs";

const auditFile = ensureAuditFile(path.join(AUDIT_DIR, `network-cleanup-${Date.now()}.log`));
installFetchAudit(auditFile);

const seeds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "holdout", "seeds.json"), "utf8")).seeds;

const results = [];
for (const s of seeds) {
  if (!s.memoryId) {
    results.push({ scenario: s.scenario, userId: s.userId, seedIndex: s.seedIndex, deleted: false, reason: "无 memoryId" });
    continue;
  }
  try {
    await mem0Delete(s.memoryId);
    results.push({ scenario: s.scenario, userId: s.userId, seedIndex: s.seedIndex, memoryId: s.memoryId, deleted: true });
    console.log(`[${s.scenario}] deleted ${s.memoryId}`);
  } catch (e) {
    results.push({ scenario: s.scenario, userId: s.userId, seedIndex: s.seedIndex, memoryId: s.memoryId, deleted: false, error: e.message.slice(0, 200) });
    console.error(`[${s.scenario}] 删除失败 ${s.memoryId}: ${e.message.slice(0, 200)}`);
  }
}

// 核验清零
const verify = [];
const userIds = [...new Set(seeds.map((s) => s.userId))];
for (const uid of userIds) {
  const pool = await mem0GetAll(uid);
  verify.push({ userId: uid, remaining: pool.count, remainingTexts: pool.items.map((m) => m.memory) });
  console.log(`verify ${uid}: remaining=${pool.count}`);
}

const output = {
  doc_type: "holdout 种子清理记录",
  cleanup_timestamp: nowIso(),
  audit_log: auditFile,
  delete_results: results,
  verify_cleared: verify,
  all_cleared: verify.every((v) => v.remaining === 0),
};

fs.writeFileSync(path.join(DATA_DIR, "holdout", "cleanup.json"), JSON.stringify(output, null, 2), "utf8");
console.log(`清理核验：${output.all_cleared ? "全部清零 ✅" : "仍有残留 ⚠️（见 verify_cleared）"}`);
