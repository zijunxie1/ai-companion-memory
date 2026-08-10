// TASK-005A：eval_runs 独立列数据库写入测试（集成）
// 运行：node --test src/lib/eval-db-integration.test.ts
//
// 验证契约：policy_version / case_set_version 必须继续作为**字符串**写入
// eval_runs 独立列（不从 config_snapshot JSON 读取回退）。
// 连接串从本地 .env / .env.local 解析（不打印、不入库）；无可用连接时 skip。
// 测试数据：插入后立即按 id 删除，不污染 eval_runs。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import { buildSnapshot } from "./eval-snapshot-core.ts";
import type { EvalConfig } from "./eval-types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 从本地 env 文件解析 DATABASE_URL（仅连接用，不输出内容） */
function loadDatabaseUrl(): string | null {
  const candidates = [
    resolve(__dirname, "../../.env.local"), // v2/app/.env.local
    resolve(__dirname, "../../../.env"), // v2/.env
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(/^\s*DATABASE_URL=(.+)$/m);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

const databaseUrl = loadDatabaseUrl();
const skipReason = databaseUrl
  ? undefined
  : "本地 .env/.env.local 未提供 DATABASE_URL（集成核验在部署环境执行）";

test(
  "policy_version / case_set_version 以字符串写入 eval_runs 独立列（含 config_snapshot 元数据）",
  { skip: skipReason },
  async () => {
    const pool = new Pool({ connectionString: databaseUrl!, max: 2 });
    let insertedId: string | null = null;
    try {
      // 用真实快照构建逻辑生成 config_snapshot（含 _snapshot_meta）
      const snapshot = buildSnapshot({
        chatModel: null,
        extractModel: "deepseek-chat",
        chatflowVersion: null,
        judgeModelEnv: null,
        judgeModelCodeDefault: "deepseek-v4-flash",
        persona: {
          value: "persona-test",
          meta: { status: "available", source_type: "derived", source_ref: "test" },
        },
        extractPrompt: {
          value: "875129e48a7b1ae3",
          meta: { status: "available", source_type: "derived", source_ref: "test" },
        },
        judgePrompt: {
          value: "6bff2fcfcde01605",
          meta: { status: "available", source_type: "derived", source_ref: "test" },
        },
        judgeRubricVersion: "v1.0",
        caseSetVersion: "8-case-v1",
        caseSetVersionOverridden: false,
      }) as EvalConfig;

      const ins = await pool.query(
        `INSERT INTO eval_runs (status, config_snapshot, policy_version, case_set_version)
         VALUES ('completed', $1, $2, $3) RETURNING id, policy_version, case_set_version, config_snapshot`,
        [JSON.stringify(snapshot), snapshot.judge_rubric_version, snapshot.case_set_version]
      );
      const row = ins.rows[0];
      insertedId = row.id;

      // 独立列必须是字符串（pg 对 varchar 返回 string）
      assert.equal(typeof row.policy_version, "string");
      assert.equal(typeof row.case_set_version, "string");
      assert.equal(row.policy_version, "v1.0");
      assert.equal(row.case_set_version, "8-case-v1");

      // config_snapshot JSONB 完整保留 meta（值不进 meta、meta 不丢）
      const snap = row.config_snapshot as EvalConfig;
      assert.equal(snap._snapshot_meta?.schema_version, 2);
      assert.ok(snap._snapshot_meta?.fields["policy_version"], "policy_version 在 meta.fields 有登记");
      assert.ok(snap._snapshot_meta?.fields["case_set_version"], "case_set_version 在 meta.fields 有登记");
      assert.equal(snap.user_isolation, "per_case");
      // 新快照不再写旧键 persona_prompt_hash
      assert.equal(snap.persona_prompt_hash, undefined);
    } finally {
      if (insertedId) {
        await pool.query(`DELETE FROM eval_runs WHERE id = $1`, [insertedId]).catch(() => {});
      }
      await pool.end().catch(() => {});
    }
  }
);
