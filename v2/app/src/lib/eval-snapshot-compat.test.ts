// TASK-005A：快照展示兼容性测试（node --test + type stripping，零副作用依赖）
// 运行：node --test src/lib/eval-snapshot-compat.test.ts
//
// 覆盖：T4 旧格式 / T5 新格式 / T6 混存 / T7 缺失与未知字段 /
//       T9 未知 schema_version / T11 快照不可变结构性护栏
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { buildSnapshot, buildSnapshotDisplayRows } from "./eval-snapshot-core.ts";
import type { EvalConfig, SnapshotMeta } from "./eval-types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 构造测试快照 ──

/** 新格式快照（schema_version 2 + meta） */
function newSnapshot(): EvalConfig {
  return buildSnapshot({
    chatModel: "deepseek-v4-flash",
    extractModel: "deepseek-v4-flash",
    chatflowVersion: "2026-07-26 01:02:55.290923",
    judgeModelEnv: null,
    judgeModelCodeDefault: "deepseek-v4-flash",
    persona: {
      value: "persona-hash-1",
      meta: { status: "available", source_type: "derived", source_ref: "users 表" },
    },
    extractPrompt: {
      value: "875129e48a7b1ae3",
      meta: { status: "available", source_type: "derived", source_ref: "repo" },
    },
    judgePrompt: {
      value: "6bff2fcfcde01605",
      meta: { status: "available", source_type: "derived", source_ref: "code" },
    },
    judgeRubricVersion: "v1.0",
    caseSetVersion: "8-case-v1",
    caseSetVersionOverridden: false,
  });
}

/** 旧格式快照（纯字符串/数值，无 _snapshot_meta） */
function legacySnapshot(): Record<string, unknown> {
  return {
    chat_model: "unavailable",
    extract_model: "deepseek-chat",
    embed_model: "unavailable",
    persona_prompt_hash: "old-persona-hash",
    extract_prompt_hash: "unavailable",
    judge_rubric_version: "v1.0",
    recall_threshold: "unavailable",
    recall_top_k: "unavailable",
    write_mode: "unavailable",
    chatflow_version: "unavailable",
    case_set_version: "8-case-v1",
  };
}

// ── T4：旧格式快照可读（无 meta → 来源 "—"、状态 "未知来源"，不崩溃） ──
test("T4: 旧格式快照可读，来源显示 —，状态未知来源", () => {
  const { rows, unknownSchema } = buildSnapshotDisplayRows(
    legacySnapshot() as EvalConfig,
    { policy_version: "v1.0" }
  );
  assert.equal(unknownSchema, true, "旧快照无 meta → 视为未知 schema");
  assert.ok(rows.length >= 11, "旧快照字段均应展示");
  const chatRow = rows.find((r) => r.key === "chat_model");
  assert.equal(chatRow!.value, "unavailable");
  assert.equal(chatRow!.sourceType, "—");
  assert.equal(chatRow!.status, "未知来源");
  // 旧键 persona_prompt_hash 归并展示为 persona_data_hash
  const personaRow = rows.find((r) => r.key === "persona_data_hash");
  assert.ok(personaRow, "persona 行应存在");
  assert.equal(personaRow!.value, "old-persona-hash");
  // policy_version 值来自独立列
  const policyRow = rows.find((r) => r.key === "policy_version");
  assert.equal(policyRow!.value, "v1.0");
});

// ── T5：新 meta 格式可读 ──
test("T5: 新格式快照带全量来源与状态", () => {
  const snap = newSnapshot();
  const { rows, unknownSchema } = buildSnapshotDisplayRows(snap, { policy_version: "v1.0" });
  assert.equal(unknownSchema, false);
  const hashRow = rows.find((r) => r.key === "extract_prompt_hash");
  assert.equal(hashRow!.value, "875129e48a7b1ae3");
  assert.equal(hashRow!.sourceType, "derived");
  assert.equal(hashRow!.status, "available");
  const userRow = rows.find((r) => r.key === "user_isolation");
  assert.equal(userRow!.value, "per_case");
  // 快照顶层本身不再平铺 _snapshot_meta 为普通行
  assert.ok(!rows.some((r) => r.key === "_snapshot_meta"), "meta 块不应作为展示行");
});

// ── T6：新旧混存可读（部分字段有 meta、部分无） ──
test("T6: 混存快照——部分字段有 meta，缺失部分按未知来源展示", () => {
  const snap = newSnapshot() as EvalConfig & { _snapshot_meta: SnapshotMeta };
  // 人为删掉一半字段的 meta（模拟部分登记）
  delete snap._snapshot_meta.fields["recall_threshold"];
  delete snap._snapshot_meta.fields["chatflow_version"];
  const { rows } = buildSnapshotDisplayRows(snap, { policy_version: "v1.0" });
  const thresholdRow = rows.find((r) => r.key === "recall_threshold");
  assert.equal(thresholdRow!.status, "未知来源");
  assert.equal(thresholdRow!.value, "0.35");
  const chatflowRow = rows.find((r) => r.key === "chatflow_version");
  assert.equal(chatflowRow!.status, "未知来源");
  const chatRow = rows.find((r) => r.key === "chat_model");
  assert.equal(chatRow!.sourceType, "declared");
});

// ── T7：缺失字段 / null / 未知附加字段不崩溃 ──
test("T7: null 值、未知附加字段、缺失字段均不崩溃", () => {
  const snap = newSnapshot() as Record<string, unknown>;
  snap["weird_extra_field"] = 123;
  snap["null_field"] = null;
  const { rows } = buildSnapshotDisplayRows(snap as EvalConfig, {});
  assert.ok(rows.some((r) => r.key === "weird_extra_field" && r.value === "123"));
  assert.ok(rows.some((r) => r.key === "null_field" && r.value === "—"));
  // 空快照也不崩溃
  const empty = buildSnapshotDisplayRows(null, {});
  assert.ok(Array.isArray(empty.rows));
  assert.equal(empty.unknownSchema, true);
});

// ── T9：未知 schema_version 标记 ──
test("T9: 未知 schema_version → unknownSchema=true（不崩溃，UI 标记未知快照版本）", () => {
  const snap = newSnapshot() as EvalConfig & { _snapshot_meta: SnapshotMeta };
  snap._snapshot_meta.schema_version = 99;
  const { unknownSchema } = buildSnapshotDisplayRows(snap, {});
  assert.equal(unknownSchema, true);
});

// ── T11：快照不可变结构性护栏（eval-runner 不再出现 config_snapshot || 追加） ──
test("T11: eval-runner.ts 不再包含 config_snapshot || 静默追加（快照不可变契约）", () => {
  const runnerSrc = readFileSync(resolve(__dirname, "eval-runner.ts"), "utf8");
  assert.ok(
    !runnerSrc.includes("config_snapshot ||"),
    "eval-runner 不得再以 config_snapshot || jsonb 方式在创建后追加修改快照"
  );
  assert.ok(
    !runnerSrc.includes("UPDATE eval_runs SET config_snapshot"),
    "eval-runner 不得再对 config_snapshot 发起创建后 UPDATE"
  );
});

// ── T12：WRITE_MODE 非影子配置——产品写入路径与快照共同消费同一只读来源 ──
test("T12a: memory-config.ts WRITE_MODE 为 async（产品行为与快照同源）", () => {
  const cfgSrc = readFileSync(resolve(__dirname, "memory-config.ts"), "utf8");
  assert.match(cfgSrc, /export const WRITE_MODE\s*=\s*"async"/);
});

test("T12b: chat/route.ts 产品写入路径实际消费 WRITE_MODE（import + 分支判断）", () => {
  const chatSrc = readFileSync(resolve(__dirname, "../app/api/chat/route.ts"), "utf8");
  assert.match(chatSrc, /import[^;]*WRITE_MODE/, "产品路径必须 import WRITE_MODE");
  assert.match(
    chatSrc,
    /if \(WRITE_MODE === "async"\)/,
    "产品异步写入路径必须由 WRITE_MODE 控制（WRITE_MODE=async → fire-and-forget）"
  );
  // 快照 write_mode 与产品路径同源（buildSnapshot 直接读同一常量）
  const snap = newSnapshot();
  assert.equal(snap.write_mode, "async");
});

// ── T13：历史 Run 详情渲染（旧格式 → 未知来源；与详情页共用同一展示函数） ──
test("T13: 历史 Run 旧格式快照经详情页同一函数渲染——来源未知、不崩溃、policy 取独立列", () => {
  const { rows, unknownSchema } = buildSnapshotDisplayRows(
    legacySnapshot() as EvalConfig,
    { policy_version: "v1.0" }
  );
  assert.equal(unknownSchema, true, "历史 Run 无 meta → 标记未知快照版本");
  assert.ok(rows.length >= 11, "历史快照字段全量展示");
  assert.ok(rows.every((r) => r.status === "未知来源"), "历史格式全部显示未知来源");
  assert.equal(rows.find((r) => r.key === "policy_version")!.value, "v1.0");
  // 新快照不再写旧键，但展示层仍兼容旧键（历史 Run 的 persona_prompt_hash 归并展示）
  const personaRow = rows.find((r) => r.key === "persona_data_hash");
  assert.equal(personaRow!.value, "old-persona-hash");
});
