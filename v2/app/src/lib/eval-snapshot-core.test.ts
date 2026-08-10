// TASK-005A：快照核心纯逻辑测试（node --test + type stripping，零副作用依赖）
// 运行：node --test src/lib/eval-snapshot-core.test.ts
//
// 覆盖：T1 extract prompt 解析（fixture + repository source 真值）
//       T2 judge prompt 哈希（导出常量直接计算）
//       T3 版本一致性（代码常量 vs eval-policy-v1.md）
//       T8 user_isolation / schema_version 存在性
//       T10 来源分类正确性（无 observed、unavailable 必带 reason、embed_model 定稿）
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  buildSnapshot,
  parseMemoryExtractPrompt,
  SNAPSHOT_SCHEMA_VERSION,
  USER_ISOLATION,
} from "./eval-snapshot-core.ts";
import { hashContent } from "./eval-hash.ts";
import { readExtractPromptHash } from "./eval-extract-prompt.ts";
import { JUDGE_RUBRIC_VERSION, JUDGE_SYSTEM_PROMPT } from "./eval-llm-judge.ts";
import type { SnapshotFieldMeta } from "./eval-types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

function firstExisting(...candidates: string[]): string {
  const hit = candidates.find((p) => existsSync(p));
  assert.ok(hit, `找不到仓库文件（尝试 ${candidates.join(" / ")}）`);
  return hit!;
}

// ── fixture：v2/mem0-server/main.py 的 MEMORY_EXTRACT_PROMPT 块（repository source） ──
const MEM0_MAIN_FIXTURE = `MEMORY_EXTRACT_PROMPT = (
    "你是一个记忆管理助手。请从下面的对话中提取用户的关键信息和偏好。\\n\\n"
    "规则：\\n"
    "1. 只提取【用户明确说过的】信息——不提取 AI 回复中的内容、不推断、不补充\\n"
    "2. 只提取值得长期记住的信息（稳定偏好、重要事件、关系节点、共同经历）\\n"
    "3. 忽略一次性情绪、随口玩笑、临时状态\\n"
    "4. 【隐私保护】禁止提取身份证号、手机号、银行卡号、精确住址、密码等敏感个人信息\\n"
    "5. 用中文输出每条记忆，格式为简洁的事实陈述\\n"
    "6. 如果没有值得提取的信息，返回空数组\\n\\n"
    "对话内容：\\n{content}"
)
`;

// ── T1：extract prompt 解析器 ──
test("T1a: 解析 fixture 与 Python 求值一致（240 字符，hash=875129e48a7b1ae3）", () => {
  const prompt = parseMemoryExtractPrompt(MEM0_MAIN_FIXTURE);
  assert.ok(prompt, "应解析成功");
  assert.equal(prompt!.length, 240);
  assert.equal(hashContent(prompt!), "875129e48a7b1ae3");
});

test("T1b: 从真实 repository source（mem0-server/main.py）解析并计算哈希", () => {
  const mainPy = firstExisting(
    resolve(process.cwd(), "../mem0-server/main.py"),
    resolve(__dirname, "../../../mem0-server/main.py")
  );
  const content = readFileSync(mainPy, "utf8");
  const prompt = parseMemoryExtractPrompt(content);
  assert.ok(prompt, "真实 main.py 应可解析");
  assert.equal(hashContent(prompt!), "875129e48a7b1ae3");
});

test("T1c: readExtractPromptHash 返回 derived（repository source，非 observed）", () => {
  const result = readExtractPromptHash(process.cwd());
  assert.equal(result.value, "875129e48a7b1ae3");
  assert.equal(result.meta.status, "available");
  assert.equal(result.meta.source_type, "derived");
  assert.match(result.meta.source_ref, /repository source/);
});

test("T1d: 解析失败路径——非常规格式返回 null，不抛异常", () => {
  assert.equal(parseMemoryExtractPrompt("MEMORY_EXTRACT_PROMPT = ('single quote')"), null);
  assert.equal(parseMemoryExtractPrompt("const x = 1;"), null);
  assert.equal(parseMemoryExtractPrompt("MEMORY_EXTRACT_PROMPT = (\"含\\x转义\")"), null);
});

// ── T2：judge prompt 哈希（导出常量直接计算） ──
test("T2: hashContent(JUDGE_SYSTEM_PROMPT) == 6bff2fcfcde01605（与 DRAFT v2.1 核验值一致）", () => {
  assert.equal(hashContent(JUDGE_SYSTEM_PROMPT), "6bff2fcfcde01605");
});

// ── T3：版本一致性（代码常量 vs eval-policy-v1.md 头部声明） ──
test("T3: JUDGE_RUBRIC_VERSION 与 eval-policy-v1.md 头部版本声明一致", () => {
  const policyMd = firstExisting(
    resolve(process.cwd(), "../../eval/eval-policy-v1.md"),
    resolve(__dirname, "../../../../eval/eval-policy-v1.md")
  );
  const head = readFileSync(policyMd, "utf8").split("\n").slice(0, 5).join("\n");
  const m = head.match(/^# Eval Policy (v[\d.]+)/m);
  assert.ok(m, "eval-policy-v1.md 头部应有版本声明");
  assert.equal(JUDGE_RUBRIC_VERSION, m![1], "代码常量版本与策略文档版本必须一致");
});

// ── 测试辅助：构造快照输入 ──
function meta(overrides: Partial<SnapshotFieldMeta>): SnapshotFieldMeta {
  return { status: "available", source_ref: "test", ...overrides };
}
function makeInput(overrides: Record<string, unknown> = {}) {
  return {
    chatModel: null,
    extractModel: "deepseek-chat",
    chatflowVersion: null,
    judgeModelEnv: null,
    judgeModelCodeDefault: "deepseek-v4-flash",
    persona: { value: "p1a2b3", meta: meta({ source_type: "derived" }) },
    extractPrompt: { value: "875129e48a7b1ae3", meta: meta({ source_type: "derived" }) },
    judgePrompt: { value: "6bff2fcfcde01605", meta: meta({ source_type: "derived" }) },
    judgeRubricVersion: "v1.0",
    caseSetVersion: "8-case-v1",
    ...overrides,
  };
}

// ── T8：user_isolation / schema_version 存在性 ──
test("T8: 新快照含 user_isolation=per_case 与 snapshot_schema_version=2", () => {
  const snap = buildSnapshot(makeInput());
  assert.equal(snap.user_isolation, USER_ISOLATION);
  assert.equal(snap.user_isolation, "per_case");
  assert.equal(snap.snapshot_schema_version, SNAPSHOT_SCHEMA_VERSION);
  assert.equal(snap._snapshot_meta?.schema_version, SNAPSHOT_SCHEMA_VERSION);
});

// ── T10：来源分类正确性 ──
test("T10a: 快照中无任何字段标 observed", () => {
  const snap = buildSnapshot(makeInput());
  const fields = snap._snapshot_meta!.fields;
  for (const [k, f] of Object.entries(fields)) {
    assert.notEqual(f.source_type, "observed", `字段 ${k} 不得标 observed（外部服务实际执行无法观测）`);
  }
});

test("T10b: embed_model = unavailable + reason（不新增 env、不硬编码模型名）", () => {
  const snap = buildSnapshot(makeInput());
  assert.equal(snap.embed_model, "unavailable");
  const f = snap._snapshot_meta!.fields["embed_model"];
  assert.equal(f.status, "unavailable");
  assert.equal(f.source_type, undefined, "unavailable 时省略 source_type");
  assert.ok(f.reason && f.reason.length > 0, "unavailable 必带 reason");
  assert.ok(!f.reason!.includes("BAAI"), "reason 不硬编码模型名");
});

test("T10c: chat_model 未配置 → unavailable + reason；已配置 → declared", () => {
  const snap1 = buildSnapshot(makeInput());
  assert.equal(snap1.chat_model, "unavailable");
  assert.equal(snap1._snapshot_meta!.fields["chat_model"].status, "unavailable");

  const snap2 = buildSnapshot(makeInput({ chatModel: "deepseek-v4-flash" }));
  assert.equal(snap2.chat_model, "deepseek-v4-flash");
  const f2 = snap2._snapshot_meta!.fields["chat_model"];
  assert.equal(f2.status, "available");
  assert.equal(f2.source_type, "declared");
});

test("T10d: judge_model 无 env → code 默认；有 env → declared", () => {
  const snap1 = buildSnapshot(makeInput());
  assert.equal(snap1.judge_model, "deepseek-v4-flash");
  assert.equal(snap1._snapshot_meta!.fields["judge_model"].source_type, "code");

  const snap2 = buildSnapshot(makeInput({ judgeModelEnv: "glm-5.1" }));
  assert.equal(snap2.judge_model, "glm-5.1");
  assert.equal(snap2._snapshot_meta!.fields["judge_model"].source_type, "declared");
});

test("T10e: recall_threshold/top_k/write_mode 为 code 且值不变（0.35 / 5 / async）", () => {
  const snap = buildSnapshot(makeInput());
  assert.equal(snap.recall_threshold, 0.35);
  assert.equal(snap.recall_top_k, 5);
  assert.equal(snap.write_mode, "async");
  assert.equal(snap._snapshot_meta!.fields["recall_threshold"].source_type, "code");
  assert.equal(snap._snapshot_meta!.fields["recall_top_k"].source_type, "code");
  assert.equal(snap._snapshot_meta!.fields["write_mode"].source_type, "code");
});

test("T10f: 全部字段在 _snapshot_meta.fields 有来源登记（含 policy_version / case_set_version）", () => {
  const snap = buildSnapshot(makeInput());
  const fields = snap._snapshot_meta!.fields;
  for (const k of [
    "chat_model", "extract_model", "embed_model", "persona_data_hash",
    "extract_prompt_hash", "judge_model", "judge_prompt_hash",
    "judge_rubric_version", "policy_version", "recall_threshold",
    "recall_top_k", "write_mode", "chatflow_version", "case_set_version",
    "user_isolation", "snapshot_schema_version",
  ]) {
    assert.ok(fields[k], `字段 ${k} 必须登记来源`);
    assert.ok(fields[k].source_ref.length > 0, `字段 ${k} 必须带 source_ref`);
  }
});

test("T10g: persona 双键兼容——persona_data_hash 新键 + persona_prompt_hash 旧键同值", () => {
  const snap = buildSnapshot(makeInput());
  assert.equal(snap.persona_data_hash, "p1a2b3");
  assert.equal(snap.persona_prompt_hash, "p1a2b3");
});
