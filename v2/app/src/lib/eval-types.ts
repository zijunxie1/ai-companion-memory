// ============================================================
// 评测模块类型定义（TASK-003 阶段2 方案 B+）
// ============================================================

/** Config 快照（每次 Run 绑定，不可变） */
export interface EvalConfig {
  chat_model: string; // "deepseek-v4-flash"（Dify Chatflow 实际模型）
  extract_model: string; // mem0 抽取模型
  embed_model: string; // "bge-small-zh-v1.5"
  persona_prompt_hash: string; // Dify Persona 内容哈希
  extract_prompt_hash: string; // mem0 抽取 Prompt 哈希
  judge_rubric_version: string; // "v1.0"
  recall_threshold: number | string; // 0.35 或 "unavailable"
  recall_top_k: number | string; // 5 或 "unavailable"
  write_mode: "sync" | "async" | "unavailable";
  chatflow_version: string;
  case_set_version: string;
  [key: string]: unknown;
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

/** 程序规则判定结果 */
export interface ProgramVerdict {
  checks: Array<{
    name: string;
    pass: boolean;
    detail: string;
    evidence?: unknown;
  }>;
  strong?: Record<string, "PASS" | "FAIL" | "NOT_TESTED">;
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
