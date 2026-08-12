// ============================================================
// S2 校准集采集：3 轮真实本地 mem0 检索（loopback；只读）
// 每轮 = 一个最近 completed run 的评测专用 user 池（池独立）
// 输出：spike/data/calibration/round-{1,2,3}/{case}.json
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { CALIBRATION_QUERIES, CALIBRATION_CASES, CALIBRATION_DIR, AUDIT_DIR, nowIso } from "./config.mjs";
import { getCalibrationPlan } from "./lib/db-read.mjs";
import { mem0Search, mem0GetAll } from "./lib/mem0-api.mjs";
import { installFetchAudit, ensureAuditFile } from "./lib/fetch-audit.mjs";

// 激活运行期网络审计（全程零非 loopback）
const auditFile = ensureAuditFile(path.join(AUDIT_DIR, `network-calibration-${Date.now()}.log`));
installFetchAudit(auditFile);

const plan = await getCalibrationPlan(3, CALIBRATION_CASES);
console.log(`校准采集计划：${plan.length} 轮（run=${plan.map((p) => p.run).join(",")})`);
if (plan.length === 0) {
  console.error("STOP: 无可用评测 user 池（completed run 缺失或 eval_user_id 为空）→ 停止条件 6 路径，提交数据源裁决");
  process.exit(2);
}
if (plan.length < 3) {
  console.warn(`警告：可用 run 池仅 ${plan.length} 个（<3），重复采样，独立性局限将在报告中如实声明`);
}

fs.mkdirSync(CALIBRATION_DIR, { recursive: true });

const summary = [];
for (let i = 0; i < plan.length; i++) {
  const round = i + 1;
  const roundDir = path.join(CALIBRATION_DIR, `round-${round}`);
  fs.mkdirSync(roundDir, { recursive: true });
  const { run, users } = plan[i];
  for (const { caseId, userId } of users) {
    const query = CALIBRATION_QUERIES[caseId];
    if (!query) continue;
    const pool = await mem0GetAll(userId);
    const search = await mem0Search(userId, query, 5);
    const record = {
      round,
      run,
      caseId,
      userId,
      query,
      poolSize: pool.count,
      poolPreview: pool.items.map((m) => m.memory),
      results: search.items,
      raw_response: search.raw,
      ts: nowIso(),
    };
    const file = path.join(roundDir, `${caseId}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2), "utf8");
    summary.push({
      round, run, caseId, poolSize: pool.count, retrieved: search.count,
      scores: search.items.map((m) => m.score),
    });
    console.log(`round${round}/${caseId}: pool=${pool.count} retrieved=${search.count} scores=[${search.items.map((m) => m.score ?? "n/a").join(", ")}]`);
  }
}

fs.writeFileSync(
  path.join(CALIBRATION_DIR, "collection-summary.json"),
  JSON.stringify({ generated_at: nowIso(), audit_log: auditFile, rounds: summary }, null, 2),
  "utf8"
);
console.log("DONE 校准采集完成；审计日志：" + auditFile);
