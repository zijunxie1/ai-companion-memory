// ============================================================
// 评测模块类型定义（TASK-003 阶段2 方案 B+）
// ============================================================

/** Config 快照（每次 Run 绑定，不可变） */
export interface EvalConfig {
  chat_model: string; // Dify Chatflow 实际模型（declared / unavailable）
  extract_model: string; // mem0 抽取模型（declared / unavailable）
  embed_model: string; // mem0 embedding 模型（本任务固定 unavailable + reason，见契约）
  persona_prompt_hash: string; // 旧键（兼容历史 Run；新快照同时写 persona_data_hash）
  persona_data_hash?: string; // 新键：用户 Persona JSON 内容哈希（derived）
  extract_prompt_hash: string; // mem0 抽取 Prompt 内容哈希（derived / unavailable）
  judge_rubric_version: string; // "v1.0"（code，来自 JUDGE_RUBRIC_VERSION 常量）
  judge_model?: string; // Judge 模型（code 默认 / declared env 覆盖）
  judge_prompt_hash?: string; // Judge Prompt 内容哈希（derived）
  recall_threshold: number | string; // 0.35（code，共享常量）或 "unavailable"
  recall_top_k: number | string; // 5（code，共享常量）或 "unavailable"
  write_mode: "sync" | "async" | "unavailable"; // "async"（code，共享常量）
  chatflow_version: string; // Dify 工作流版本（declared / unavailable）
  case_set_version: string; // "8-case-v1"（与 eval_runs 独立列同值）
  user_isolation?: string; // "per_case"（Run 创建时一次性写入，不可变）
  snapshot_schema_version?: number; // 2（code）
  _snapshot_meta?: SnapshotMeta; // 全字段来源/状态登记（schema_version 2）
  [key: string]: unknown;
}

/** 快照字段状态（不可用是状态，不是证据来源） */
export type SnapshotStatus = "available" | "unavailable" | "not_applicable";

/** 证据来源分类（unavailable / not_applicable 时省略） */
export type SnapshotSourceType = "observed" | "code" | "declared" | "derived";

/** 单字段来源元数据 */
export interface SnapshotFieldMeta {
  status: SnapshotStatus;
  source_type?: SnapshotSourceType; // unavailable / not_applicable 时省略
  source_ref: string; // 证据位置：文件:行 / env 键 / 哈希来源
  reason?: string; // unavailable / not_applicable 时必填
}

/** 快照元数据块（schema_version 2：顶层值兼容 + 来源登记分离） */
export interface SnapshotMeta {
  schema_version: number; // 当前 2；未知版本由 UI 标记"未知快照版本"
  fields: Record<string, SnapshotFieldMeta>;
}

/** 前置条件项 */
export type EvalPrecondition =
  | { type: "seed_chat"; value: string } // 先发一条消息建立 Memory
  | { type: "delete_memory"; value: string }; // 删除包含关键词的 Memory

/** eval_cases 行 */
export interface EvalCase {
  id: string;
  case_id: string;
  title: string;
  category: "core" | "adversarial" | "safety";
  test_target: string;
  input_text: string;
  preconditions: EvalPrecondition[];
  expected: string;
  pass_criteria: EvalPassCriteria;
  eval_type: "program" | "llm" | "human" | "mixed";
  source: string;
  source_bad_case: string | null;
  is_active: boolean;
  created_at: string;
}

/** 通过标准（结构化） */
export interface EvalPassCriteria {
  strong?: string[]; // 强约束类型: false_memory | deletion | safety | privacy
  program?: Record<string, unknown>; // 程序规则参数
  llm?: Record<string, unknown>; // LLM Judge 参数（阈值等）
}

/** 规则三态（Review R3 §4.2：不用 pass:boolean 表达证据缺失） */
export type RuleStatus = "PASS" | "FAIL" | "NOT_TESTED";

/** 程序规则判定结果 */
export interface ProgramVerdict {
  checks: Array<{
    name: string;
    /** 兼容字段（旧 UI/GSB 使用）；新逻辑以 status 为准 */
    pass: boolean;
    detail: string;
    evidence?: unknown;
    /** 三态结果（Review R3：NOT_TESTED 表示证据缺失，不算 FAIL） */
    status: RuleStatus;
  }>;
  strong?: Record<string, "PASS" | "FAIL" | "NOT_TESTED">;
  /** 绝对状态（强约束 FAIL > 强约束 NOT_TESTED > 普通程序 FAIL > PASS） */
  absolute_status?: RuleStatus;
}

/** LLM Judge 维度评分 */
export interface JudgeDimension {
  score: number; // 1-5
  analysis: string;
}

/** LLM Judge 结果 */
export interface LLMJudgeResult {
  dimensions: {
    recall_accuracy?: JudgeDimension;
    irrelevant_rejection?: JudgeDimension;
    reply_naturalness?: JudgeDimension;
    continuity?: JudgeDimension;
  };
  strong?: {
    privacy_safety?: "PASS" | "FAIL";
    hallucination_check?: "PASS" | "FAIL";
  };
  strong_analysis?: Record<string, string>;
  overall_reasoning: string;
  priority_issue: string;
  raw?: unknown; // 原始 LLM 输出（审计用）
  error?: string; // Judge 调用失败时记录
}

/** 人工覆盖 */
export interface HumanOverride {
  strong?: Record<string, "PASS" | "FAIL">;
  scores?: Partial<Record<string, number>>;
  reason: string;
  judged_at: string;
}

/** 最终判定（合并三层） */
export interface FinalVerdict {
  strong: Record<string, "PASS" | "FAIL" | "NOT_TESTED">;
  scores: Partial<Record<string, number>>; // 1-5 分档维度
  judge_type: "program" | "llm" | "human";
  notes: string[];
  /** 程序规则是否存在失败项（Review：程序失败必须显式可见，不被分数掩盖） */
  program_failed?: boolean;
  /** 程序失败的具体规则名（供总览首要展示） */
  program_failures?: Array<{ name: string; detail: string }>;
  /** 绝对状态（Review R3 §4.1：GSB 表示相对变化，absolute_status 表示当前是否满足规则） */
  absolute_status?: "PASS" | "FAIL" | "NOT_TESTED";
  /** 写入终态（CR-C：completed/failed/timeout + disposition） */
  write_state?: { state: string; disposition: string | null } | null;
}

/** eval_runs 行 */
export interface EvalRun {
  id: string;
  run_number: number;
  status: "running" | "completed" | "failed";
  config_snapshot: EvalConfig;
  policy_version: string;
  case_set_version: string;
  summary: RunSummary | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

/** Run 摘要 */
export interface RunSummary {
  gsb: { good: number; same: number; bad: number; total: number };
  strong: Record<string, { pass: number; fail: number; not_tested: number }>;
  score_avg: number | null;
  /** 程序规则失败的 Case（Review：失败必须显式呈现，不得被平均分掩盖） */
  program_failures: Array<{
    case_id: string;
    title: string;
    rules: Array<{ name: string; detail: string }>;
  }>;
  not_tested: string[]; // 强约束 NOT_TESTED 的 Case 列表
  /** 绝对状态分布（Review R3 §4.1：GSB 相对变化 + 当前绝对状态分离） */
  absolute: { pass: number; fail: number; not_tested: number };
}

/** eval_results 行 */
export interface EvalResult {
  id: string;
  run_id: string;
  case_id: string;
  case_snapshot: EvalCase;
  user_input: string;
  ai_reply: string | null;
  used_memory: Array<Record<string, unknown>>;
  recall_reason: string | null;
  memory_writes: Array<Record<string, unknown>>;
  latency_ms: number | null;
  program_verdict: ProgramVerdict | null;
  llm_judge: LLMJudgeResult | null;
  human_override: HumanOverride | null;
  final_verdict: FinalVerdict;
  judge_type: "program" | "llm" | "human";
  gsb: "Good" | "Same" | "Bad" | null;
  created_at: string;
}

/** GSB 对比结果（单条 Case） */
export interface GSBComparison {
  result_id: string;
  case_id: string;
  current: GSBScorePoint;
  previous: GSBScorePoint | null;
  gsb: "Good" | "Same" | "Bad" | null;
}

interface GSBScorePoint {
  strong: Record<string, "PASS" | "FAIL" | "NOT_TESTED">;
  scores: Partial<Record<string, number>>;
  judge_type: string;
}
