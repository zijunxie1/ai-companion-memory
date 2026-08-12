// ============================================================
// PostgreSQL 只读查询（定位评测专用 user_id；仅读 eval_runs/eval_results 元数据列）
// 不读取任何真实用户行 / traces / conversations / 日志
// ============================================================
import { createRequire } from "node:module";
import path from "node:path";
import { PG, PG_TARGET_BASE, CALIBRATION_CASES } from "../config.mjs";

// createRequire 参数须为文件路径（dirname 决定 node_modules 查找起点）
const require = createRequire(path.join(PG_TARGET_BASE, "package.json"));
const { Client } = require("pg");

export async function getRecentRuns(limit = 3) {
  const client = new Client(PG);
  await client.connect();
  try {
    const res = await client.query(
      `SELECT run_number FROM eval_runs
       WHERE status = 'completed'
       ORDER BY run_number DESC LIMIT $1`,
      [limit]
    );
    return res.rows.map((r) => r.run_number);
  } finally {
    await client.end();
  }
}

/**
 * 返回 [{ run, users: [{caseId, userId}] }]：
 * 最近 limit 个 completed run × 校准场景（E001-E005），仅含 eval_user_id 非空的记录
 */
export async function getCalibrationPlan(limit = 3, cases = CALIBRATION_CASES) {
  const client = new Client(PG);
  await client.connect();
  try {
    const res = await client.query(
      `SELECT r.run_number AS run, ec.case_id AS case_id, er.eval_user_id AS user_id
       FROM eval_results er
       JOIN eval_runs r ON er.run_id = r.id
       JOIN eval_cases ec ON er.case_id = ec.id
       WHERE r.status = 'completed'
         AND er.eval_user_id IS NOT NULL
         AND ec.case_id = ANY($1)
       ORDER BY r.run_number DESC, ec.case_id`,
      [cases]
    );
    const plan = [];
    const seenRuns = new Set();
    for (const row of res.rows) {
      if (seenRuns.has(row.run)) continue;
      seenRuns.add(row.run);
      const runCases = res.rows.filter((r) => r.run === row.run);
      plan.push({
        run: row.run,
        users: runCases.map((r) => ({ caseId: r.case_id, userId: r.user_id })),
      });
      if (plan.length >= limit) break;
    }
    return plan;
  } finally {
    await client.end();
  }
}
