// ============================================================
// 快照纯逻辑核心（TASK-005A v2.1）
//
// 零 Node 内置依赖（无 crypto / fs / path）——客户端组件（eval 页）
// 与服务端（采集层）/ 测试可共用，避免 Turbopack 客户端打包失败。
// 需要 Node 内置的职责在独立模块：
//   - hashContent（crypto）           → eval-hash.ts
//   - extract prompt 文件读取（fs）    → eval-extract-prompt.ts
//
// 来源分类红线：
// - observed：真实调用响应/运行证据——本任务无任何字段标 observed
//   （外部服务实际执行无法从应用侧观测）；
// - unavailable / not_applicable 是 status（不是来源），此时省略
//   source_type 且必须带 reason + source_ref。
// ============================================================

import type {
  EvalConfig,
  SnapshotFieldMeta,
  SnapshotMeta,
} from "./eval-types";
import { RECALL_THRESHOLD, RECALL_TOP_K, WRITE_MODE } from "./memory-config.ts";

/** 快照 schema 版本（当前 2） */
export const SNAPSHOT_SCHEMA_VERSION = 2;

/** 环境隔离策略（每条 Case 独立 eval 用户；Run 创建时一次性写入，不可变） */
export const USER_ISOLATION = "per_case";

/** Case 集默认版本 */
export const CASE_SET_VERSION_DEFAULT = "8-case-v1";

// ── 字段构造辅助 ────────────────────────────────────────────

export interface FieldResult {
  value: string | number;
  meta: SnapshotFieldMeta;
}

/** code：决定产品行为的共用代码配置 */
export function codeField(value: string | number, sourceRef: string): FieldResult {
  return {
    value,
    meta: { status: "available", source_type: "code", source_ref: sourceRef },
  };
}

/** declared：环境/部署声明；未配置 → unavailable + reason */
export function declaredField(
  value: string | null | undefined,
  sourceRef: string,
  reason: string
): FieldResult {
  const v = value && value.trim() !== "" ? value.trim() : null;
  if (v !== null) {
    return {
      value: v,
      meta: { status: "available", source_type: "declared", source_ref: sourceRef },
    };
  }
  return { value: "unavailable", meta: { status: "unavailable", source_ref: sourceRef, reason } };
}

/** derived：由真实数据或代码内容计算的哈希 */
export function derivedField(value: string, sourceRef: string): FieldResult {
  return {
    value,
    meta: { status: "available", source_type: "derived", source_ref: sourceRef },
  };
}

/** unavailable：诚实证据边界（必带 reason + 最后核验位置） */
export function unavailableField(sourceRef: string, reason: string): FieldResult {
  return { value: "unavailable", meta: { status: "unavailable", source_ref: sourceRef, reason } };
}

// ── extract prompt：repository source 解析（纯字符串逻辑） ──

/**
 * 解析 mem0-server/main.py 中的 MEMORY_EXTRACT_PROMPT 常量
 * （Python 隐式字符串拼接：`NAME = ( "..." "..." )`）。
 * 仅支持双引号字面量 + \n / \" / \\ 转义；出现任何其他格式 → null（诚实降级）。
 */
export function parseMemoryExtractPrompt(fileContent: string): string | null {
  const block = fileContent.match(/MEMORY_EXTRACT_PROMPT\s*=\s*\(\s*([\s\S]*?)\)/);
  if (!block) return null;
  let out = "";
  for (const line of block[1].split(/\r?\n/)) {
    const t = line.trim();
    if (t === "") continue;
    const lit = t.match(/^"((?:[^"\\]|\\.)*)"$/);
    if (!lit) return null; // 非常规字面量 → 解析失败
    out += lit[1];
  }
  // 未知转义（非 \n \" \\）→ 解析失败，避免静默改变内容语义
  if (/\\[^n"\\]/.test(out)) return null;
  return out.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

// ── 快照组装（纯函数） ──────────────────────────────────────

export interface SnapshotInput {
  chatModel: string | null | undefined; // env CHAT_MODEL
  extractModel: string | null | undefined; // env MEM0_LLM_MODEL
  chatflowVersion: string | null | undefined; // env CHATFLOW_VERSION
  judgeModelEnv: string | null | undefined; // process.env.JUDGE_MODEL
  judgeModelCodeDefault: string; // env.ts 代码默认值
  persona: FieldResult; // Persona 内容哈希（derived / unavailable）
  extractPrompt: FieldResult; // extract prompt 哈希（derived / unavailable，独立 try/catch）
  judgePrompt: FieldResult; // judge prompt 哈希（derived）
  judgeRubricVersion: string; // JUDGE_RUBRIC_VERSION 常量
  caseSetVersion: string;
  /** true = 由 POST /api/eval/runs 请求参数覆盖（declared）；false = 默认值（code） */
  caseSetVersionOverridden: boolean;
}

/** 组装完整快照：顶层兼容值 + _snapshot_meta（schema_version 2，全字段来源登记） */
export function buildSnapshot(input: SnapshotInput): EvalConfig {
  const chatModel = declaredField(
    input.chatModel,
    ".env CHAT_MODEL（optional / declared，模板不填本机值）",
    "Dify Chatflow 内部对话模型无法从程序读取；部署方可在 .env 登记 CHAT_MODEL"
  );
  const extractModel = declaredField(
    input.extractModel,
    "env MEM0_LLM_MODEL（mem0-server 部署声明，main.py:51 读取；控制真实行为，非影子配置）",
    "未配置 MEM0_LLM_MODEL（mem0 抽取模型部署声明缺失）"
  );
  const embed = unavailableField(
    "v2/mem0-server/main.py:44",
    "embedding 模型硬编码于 mem0-server/main.py:44（fastembed，无 env 覆盖）；应用侧无只读运行接口、无共享版本化配置来源；本任务不新增仅供快照读取的 env（Founder 2026-08-11 定稿）"
  );
  const judgeModel =
    input.judgeModelEnv && input.judgeModelEnv.trim() !== ""
      ? {
          value: input.judgeModelEnv.trim(),
          meta: {
            status: "available" as const,
            source_type: "declared" as const,
            source_ref: "env JUDGE_MODEL（覆盖代码默认值）",
          },
        }
      : {
          value: input.judgeModelCodeDefault,
          meta: {
            status: "available" as const,
            source_type: "code" as const,
            source_ref: "v2/app/src/lib/env.ts:27 JUDGE_MODEL 代码默认值",
          },
        };
  const rubric = codeField(input.judgeRubricVersion, "eval-llm-judge.ts:12 JUDGE_RUBRIC_VERSION 常量");
  const recallThreshold = codeField(
    RECALL_THRESHOLD,
    "memory-config.ts RECALL_THRESHOLD（chat/route.ts:55 共用）"
  );
  const recallTopK = codeField(
    RECALL_TOP_K,
    "memory-config.ts RECALL_TOP_K（chat/route.ts:56 共用）"
  );
  const writeMode = codeField(
    WRITE_MODE,
    "memory-config.ts WRITE_MODE（chat/route.ts:122 异步写入路径）"
  );
  const chatflowVersion = declaredField(
    input.chatflowVersion,
    ".env CHATFLOW_VERSION（optional / declared）",
    "Dify 工作流版本无法从程序读取；部署方可在 .env 登记 CHATFLOW_VERSION"
  );
  const caseSet = input.caseSetVersionOverridden
    ? {
        value: input.caseSetVersion,
        meta: {
          status: "available" as const,
          source_type: "declared" as const,
          source_ref: "POST /api/eval/runs 请求参数 case_set_version（覆盖默认值）",
        },
      }
    : codeField(
        input.caseSetVersion,
        "api/eval/runs route.ts 默认 8-case-v1（eval_runs.case_set_version 独立列同值）"
      );
  const userIsolation = codeField(
    USER_ISOLATION,
    "eval-runner.ts 环境隔离策略（每 Case 独立 eval 用户）；Run 创建时一次性写入，不可变"
  );
  const schemaVersion = codeField(
    SNAPSHOT_SCHEMA_VERSION,
    "eval-snapshot-core.ts SNAPSHOT_SCHEMA_VERSION 常量"
  );
  // policy_version：值在独立列（createEvalRun 写入），meta 登记来源
  const policyVersion: SnapshotFieldMeta = {
    status: "available",
    source_type: "code",
    source_ref: "eval-db.ts createEvalRun 写入独立列 policy_version（与 judge_rubric_version 同源）",
  };

  const fields: Record<string, SnapshotFieldMeta> = {
    chat_model: chatModel.meta,
    extract_model: extractModel.meta,
    embed_model: embed.meta,
    persona_data_hash: input.persona.meta,
    extract_prompt_hash: input.extractPrompt.meta,
    judge_model: judgeModel.meta,
    judge_prompt_hash: input.judgePrompt.meta,
    judge_rubric_version: rubric.meta,
    policy_version: policyVersion,
    recall_threshold: recallThreshold.meta,
    recall_top_k: recallTopK.meta,
    write_mode: writeMode.meta,
    chatflow_version: chatflowVersion.meta,
    case_set_version: caseSet.meta,
    user_isolation: userIsolation.meta,
    snapshot_schema_version: schemaVersion.meta,
  };

  return {
    // ── LLM 层 ──
    chat_model: String(chatModel.value),
    extract_model: String(extractModel.value),
    embed_model: String(embed.value),
    // ── Prompt 层 ──
    persona_data_hash: String(input.persona.value), // 新键（v2.1 字段方案）；旧键仅历史兼容，新快照不再写
    extract_prompt_hash: String(input.extractPrompt.value),
    judge_rubric_version: input.judgeRubricVersion,
    judge_model: String(judgeModel.value),
    judge_prompt_hash: String(input.judgePrompt.value),
    // ── Memory 链路 ──
    recall_threshold: recallThreshold.value,
    recall_top_k: recallTopK.value,
    write_mode: writeMode.value as EvalConfig["write_mode"],
    // ── 系统层 / 数据层 ──
    chatflow_version: String(chatflowVersion.value),
    case_set_version: input.caseSetVersion,
    user_isolation: USER_ISOLATION,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    _snapshot_meta: { schema_version: SNAPSHOT_SCHEMA_VERSION, fields },
  } as EvalConfig;
}

// ── UI 展示行（纯函数，兼容旧/新/混存格式） ─────────────────

export interface SnapshotDisplayRow {
  key: string;
  value: string;
  sourceType: string; // observed / code / declared / derived，无来源时 "—"
  status: string; // available / unavailable / not_applicable / 未知来源
  reason?: string;
}

/** 固定展示顺序（稳定输出；policy_version 值来自 eval_runs 独立列） */
const FIELD_ORDER = [
  "chat_model",
  "extract_model",
  "embed_model",
  "persona_data_hash",
  "extract_prompt_hash",
  "judge_model",
  "judge_prompt_hash",
  "judge_rubric_version",
  "policy_version",
  "recall_threshold",
  "recall_top_k",
  "write_mode",
  "chatflow_version",
  "case_set_version",
  "user_isolation",
  "snapshot_schema_version",
] as const;

/** 旧键 → 新键映射（persona_prompt_hash 归并到 persona_data_hash 展示） */
const LEGACY_KEY_ALIAS: Record<string, string> = {
  persona_prompt_hash: "persona_data_hash",
};

/**
 * 把快照转换为展示行（4 列：配置项 / 值 / 来源 / 状态或说明）。
 * 兼容：旧快照无 _snapshot_meta → 来源 "—"、状态 "未知来源"；未知字段不崩溃并展示。
 */
export function buildSnapshotDisplayRows(
  config: EvalConfig | null | undefined,
  run?: { policy_version?: string | null }
): { rows: SnapshotDisplayRow[]; unknownSchema: boolean } {
  const cfg = (config ?? {}) as Record<string, unknown>;
  const meta: SnapshotMeta | undefined = cfg._snapshot_meta as SnapshotMeta | undefined;
  const unknownSchema = !meta || meta.schema_version !== SNAPSHOT_SCHEMA_VERSION;

  const valueOf = (key: string): unknown => {
    if (key === "persona_data_hash") return cfg.persona_data_hash ?? cfg.persona_prompt_hash;
    if (key === "policy_version") return run?.policy_version ?? null;
    return cfg[key];
  };
  const metaOf = (key: string): SnapshotFieldMeta | undefined => {
    if (key === "persona_data_hash" && !meta?.fields?.[key]) {
      return meta?.fields?.["persona_prompt_hash"];
    }
    return meta?.fields?.[key];
  };

  const rows: SnapshotDisplayRow[] = [];
  for (const key of FIELD_ORDER) {
    const fmeta = metaOf(key);
    const v = valueOf(key);
    const hasValue = v !== undefined && v !== null && v !== "";
    if (!hasValue && !fmeta) continue; // 旧快照缺字段且无登记 → 跳过
    rows.push({
      key,
      value: v === undefined || v === null ? "—" : String(v),
      sourceType: fmeta?.source_type ?? "—",
      status: fmeta?.status ?? "未知来源",
      reason: fmeta?.reason,
    });
  }

  // 未知附加字段（不在固定清单的顶层键，排除 _snapshot_meta 与旧键别名）
  for (const [k, v] of Object.entries(cfg)) {
    if (k === "_snapshot_meta" || LEGACY_KEY_ALIAS[k]) continue;
    if ((FIELD_ORDER as readonly string[]).includes(k)) continue;
    const fmeta = meta?.fields?.[k];
    rows.push({
      key: k,
      value: v === undefined || v === null ? "—" : String(v),
      sourceType: fmeta?.source_type ?? "—",
      status: fmeta?.status ?? "未知来源",
      reason: fmeta?.reason,
    });
  }

  return { rows, unknownSchema };
}
