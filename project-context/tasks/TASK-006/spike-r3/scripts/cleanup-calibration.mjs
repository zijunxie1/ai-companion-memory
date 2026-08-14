// ============================================================
// S2 校准种子清理：删除本轮 seed 的 22 条评测专用记忆，核验清零
// 纪律（DRAFT §6.5 / 验收 7）：种子运行后立即清理并核验清零
// 方式：REST DELETE loopback（产品同路径）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { MEM0_BASE_URL, DATA_DIR, nowIso } from "./config.mjs";

const seeds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "calibration", "seeds.json"), "utf8"));
const ids = seeds.seeds.flatMap((s) => (s.added_ids && s.added_ids.length ? s.added_ids : []));

console.log(`待清理 memory 数：${ids.length}`);

const results = [];
for (const id of ids) {
  const resp = await fetch(`${MEM0_BASE_URL}/memories/${encodeURIComponent(id)}`, { method: "DELETE" });
  results.push({ id, status: resp.status, ok: resp.ok });
}

const okCount = results.filter((r) => r.ok).length;
console.log(`清理完成：${okCount}/${ids.length} 成功`);

// 核验清零：查询评测专用 user 池
const users = seeds.scenes.map((s) => s.user_id);
const verify = [];
for (const uid of users) {
  const resp = await fetch(`${MEM0_BASE_URL}/memories/${encodeURIComponent(uid)}`);
  const body = await resp.json();
  const list = Array.isArray(body) ? body : (body.memories || body.results || []);
  verify.push({ user_id: uid, remaining: list.length });
  if (list.length > 0) console.log(`⚠️ ${uid} 仍有 ${list.length} 条残留`);
}
const totalRemaining = verify.reduce((a, v) => a + v.remaining, 0);
console.log(`核验：${users.length} 个评测 user 池剩余记忆总数 = ${totalRemaining}（应=0）`);

fs.writeFileSync(
  path.join(DATA_DIR, "calibration", "cleanup-result.json"),
  JSON.stringify({ generated_at: nowIso(), deleted: results, verify, total_remaining: totalRemaining }, null, 2),
  "utf8"
);
console.log(totalRemaining === 0 ? "✅ 种子清理核验清零通过" : "❌ 存在残留，需排查");
