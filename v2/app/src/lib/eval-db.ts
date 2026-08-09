// ============================================================
// 评测数据库操作 — eval_cases / eval_runs / eval_results
// ============================================================

import { pool } from "./db";
import type {
  EvalCase,
  EvalConfig,
  EvalResult,
  EvalRun,
  FinalVerdict,
  HumanOverride,
  LLMJudgeResult,
  ProgramVerdict,
  RunSummary,
} from "./eval-types";

// ── eval_cases ──────────────────────────────────────────────

/** 获取全部 Case（可按活跃状态筛选） */
export async function getEvalCases(activeOnly = false): Promise<EvalCase[]> {
  const result = await pool.query(
    `SELECT * FROM eval_cases ${activeOnly ? "WHERE is_active = TRUE" : ""} ORDER BY case_id`
  );
  return (result.rows as Array<Record<string, unknown>>).map(mapCaseRow);
}

/** 按 case_id 获取单个 Case */
export async function getEvalCaseByCode(caseId: string): Promise<EvalCase | null> {
  const result = await pool.query(
    `SELECT * FROM eval_cases WHERE case_id = $1`,
    [caseId]
  );
  return result.rows.length > 0 ? mapCaseRow(result.rows[0]) : null;
}

/** 按 UUID 获取单个 Case */
export async function getEvalCaseById(id: string): Promise<EvalCase | null> {
  const result = await pool.query(`SELECT * FROM eval_cases WHERE id = $1`, [
    id,
  ]);
  return result.rows.length > 0 ? mapCaseRow(result.rows[0]) : null;
}

/** 新增 Case（返回完整行） */
export async function insertEvalCase(input: {
  caseId: string;
  title: string;
  category: string;
  testTarget: string;
  inputText: string;
  preconditions: unknown[];
  expected: string;
  passCriteria: EvalCase["pass_criteria"];
  evalType: string;
  source: string;
  sourceBadCase?: string | null;
}): Promise<EvalCase> {
  const result = await pool.query(
    `INSERT INTO eval_cases
      (case_id, title, category, test_target, input_text, preconditions, expected, pass_criteria, eval_type, source, source_bad_case)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (case_id) DO UPDATE SET
       title = EXCLUDED.title,
       category = EXCLUDED.category,
       test_target = EXCLUDED.test_target,
       input_text = EXCLUDED.input_text,
       preconditions = EXCLUDED.preconditions,
       expected = EXCLUDED.expected,
       pass_criteria = EXCLUDED.pass_criteria,
       eval_type = EXCLUDED.eval_type,
       source = EXCLUDED.source,
       source_bad_case = EXCLUDED.source_bad_case,
       is_active = TRUE
     RETURNING *`,
    [
      input.caseId,
      input.title,
      input.category,
      input.testTarget,
      input.inputText,
      JSON.stringify(input.preconditions),
      input.expected,
      JSON.stringify(input.passCriteria),
      input.evalType,
      input.source,
      input.sourceBadCase ?? null,
    ]
  );
  return mapCaseRow(result.rows[0]);
}

/** 更新 Case 活跃状态 */
export async function setEvalCaseActive(
  id: string,
  active: boolean
): Promise<void> {
  await pool.query(`UPDATE eval_cases SET is_active = $1 WHERE id = $2`, [
    active,
    id,
  ]);
}

// ── eval_runs ───────────────────────────────────────────────

/** 创建 Run（status=running） */
export async function createEvalRun(config: EvalConfig): Promise<EvalRun> {
  const result = await pool.query(
    `INSERT INTO eval_runs (status, config_snapshot, policy_version, case_set_version)
     VALUES ('running', $1, $2, $3) RETURNING *`,
    [
      JSON.stringify(config),
      config.judge_rubric_version || "v1.0",
      config.case_set_version || "8-case-v1",
    ]
  );
  return mapRunRow(result.rows[0]);
}

/** 获取 Run 列表（按时间倒序） */
export async function getEvalRuns(limit = 20): Promise<EvalRun[]> {
  const result = await pool.query(
    `SELECT * FROM eval_runs ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows.map(mapRunRow);
}

/** 获取单个 Run */
export async function getEvalRun(id: string): Promise<EvalRun | null> {
  const result = await pool.query(`SELECT * FROM eval_runs WHERE id = $1`, [
    id,
  ]);
  return result.rows.length > 0 ? mapRunRow(result.rows[0]) : null;
}

/** 获取上一个 completed 的 Run（用于 GSB 对比） */
export async function getLastCompletedRun(
  excludeRunId?: string
): Promise<EvalRun | null> {
  const result = await pool.query(
    `SELECT * FROM eval_runs
     WHERE status = 'completed' AND ($1::uuid IS NULL OR id <> $1::uuid)
     ORDER BY created_at DESC LIMIT 1`,
    [excludeRunId ?? null]
  );
  return result.rows.length > 0 ? mapRunRow(result.rows[0]) : null;
}

/** 更新 Run 状态 + 摘要 */
export async function updateEvalRun(
  id: string,
  input: {
    status: "running" | "completed" | "failed";
    summary?: RunSummary | null;
    error?: string | null;
    /** 传 undefined 表示不更新 completed_at（避免 recalc 重写导致时间漂移） */
    completedAt?: string | null;
  }
): Promise<void> {
  if (input.completedAt === undefined) {
    // 保留原 completed_at（人工覆盖重算场景，Reviewer #4 修复）
    await pool.query(
      `UPDATE eval_runs
       SET status = $2, summary = $3, error = $4
       WHERE id = $1`,
      [
        id,
        input.status,
        input.summary ? JSON.stringify(input.summary) : null,
        input.error ?? null,
      ]
    );
    return;
  }
  await pool.query(
    `UPDATE eval_runs
     SET status = $2, summary = $3, error = $4, completed_at = $5
     WHERE id = $1`,
    [
      id,
      input.status,
      input.summary ? JSON.stringify(input.summary) : null,
      input.error ?? null,
      input.completedAt,
    ]
  );
}

// ── eval_results ────────────────────────────────────────────

/** 插入一条结果 */
export async function insertEvalResult(input: {
  runId: string;
  caseDef: EvalCase;
  userInput: string;
  aiReply: string | null;
  usedMemory: unknown[];
  recallReason: string | null;
  memoryWrites: unknown[];
  latencyMs: number | null;
  programVerdict: ProgramVerdict | null;
  llmJudge: LLMJudgeResult | null;
  finalVerdict: FinalVerdict;
  judgeType: string;
  gsb: "Good" | "Same" | "Bad" | null;
}): Promise<string> {
  const result = await pool.query(
    `INSERT INTO eval_results
      (run_id, case_id, case_snapshot, user_input, ai_reply, used_memory, recall_reason, memory_writes, latency_ms,
       program_verdict, llm_judge, final_verdict, judge_type, gsb)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      input.runId,
      input.caseDef.id,
      JSON.stringify(input.caseDef),
      input.userInput,
      input.aiReply,
      JSON.stringify(input.usedMemory),
      input.recallReason,
      JSON.stringify(input.memoryWrites),
      input.latencyMs,
      input.programVerdict ? JSON.stringify(input.programVerdict) : null,
      input.llmJudge ? JSON.stringify(input.llmJudge) : null,
      JSON.stringify(input.finalVerdict),
      input.judgeType,
      input.gsb,
    ]
  );
  return result.rows[0].id;
}

/** 获取 Run 的全部结果 */
export async function getRunResults(runId: string): Promise<EvalResult[]> {
  const result = await pool.query(
    `SELECT * FROM eval_results WHERE run_id = $1 ORDER BY created_at`,
    [runId]
  );
  return result.rows.map(mapResultRow);
}

/** 获取单条结果 */
export async function getEvalResult(id: string): Promise<EvalResult | null> {
  const result = await pool.query(`SELECT * FROM eval_results WHERE id = $1`, [
    id,
  ]);
  return result.rows.length > 0 ? mapResultRow(result.rows[0]) : null;
}

/** 人工覆盖结果（更新 human_override + final_verdict + judge_type） */
export async function applyHumanOverride(
  resultId: string,
  override: HumanOverride,
  finalVerdict: FinalVerdict
): Promise<void> {
  await pool.query(
    `UPDATE eval_results
     SET human_override = $2, final_verdict = $3, judge_type = 'human'
     WHERE id = $1`,
    [resultId, JSON.stringify(override), JSON.stringify(finalVerdict)]
  );
}

/** 按 run_id 删除结果（Run 失败重跑时清理） */
export async function deleteRunResults(runId: string): Promise<void> {
  await pool.query(`DELETE FROM eval_results WHERE run_id = $1`, [runId]);
}

// ── 行映射（snake_case → camelCase） ───────────────────────

function mapCaseRow(row: Record<string, unknown>): EvalCase {
  return {
    id: String(row.id),
    case_id: String(row.case_id),
    title: String(row.title),
    category: row.category as EvalCase["category"],
    test_target: String(row.test_target),
    input_text: String(row.input_text),
    preconditions: (row.preconditions as EvalCase["preconditions"]) || [],
    expected: String(row.expected),
    pass_criteria: (row.pass_criteria as EvalCase["pass_criteria"]) || {},
    eval_type: row.eval_type as EvalCase["eval_type"],
    source: String(row.source),
    source_bad_case: row.source_bad_case ? String(row.source_bad_case) : null,
    is_active: Boolean(row.is_active),
    created_at: row.created_at ? String(row.created_at) : "",
  };
}

function mapRunRow(row: Record<string, unknown>): EvalRun {
  return {
    id: String(row.id),
    run_number: Number(row.run_number),
    status: row.status as EvalRun["status"],
    config_snapshot: (row.config_snapshot as EvalConfig) || {},
    policy_version: String(row.policy_version),
    case_set_version: String(row.case_set_version),
    summary: (row.summary as RunSummary) || null,
    error: row.error ? String(row.error) : null,
    // 统一 ISO 格式回写（String(Date) 产生 "Sun Aug 09..." PG 无法解析）
    started_at: toIso(row.started_at),
    completed_at: row.completed_at ? toIso(row.completed_at) : null,
    created_at: toIso(row.created_at),
  };
}

/** 任意时间值 → PG timestamp 可解析字符串（保持本地时区，避免 UTC 漂移）
 *  Review #4 修复：PG timestamp(无时区) 经 node-postgres 读出是本地时区 Date，
 *  用 toISOString() 会转 UTC 偏移 8h；按本地时间格式化原样回写。 */
function toIso(v: unknown): string {
  if (!v) return "";
  const d = new Date(v as string);
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function mapResultRow(row: Record<string, unknown>): EvalResult {
  return {
    id: String(row.id),
    run_id: String(row.run_id),
    case_id: String(row.case_id),
    case_snapshot: (row.case_snapshot as EvalCase) || {},
    user_input: String(row.user_input),
    ai_reply: row.ai_reply ? String(row.ai_reply) : null,
    used_memory: (row.used_memory as EvalResult["used_memory"]) || [],
    recall_reason: row.recall_reason ? String(row.recall_reason) : null,
    memory_writes: (row.memory_writes as EvalResult["memory_writes"]) || [],
    latency_ms: row.latency_ms ? Number(row.latency_ms) : null,
    program_verdict: (row.program_verdict as ProgramVerdict) || null,
    llm_judge: (row.llm_judge as LLMJudgeResult) || null,
    human_override: (row.human_override as HumanOverride) || null,
    final_verdict: (row.final_verdict as FinalVerdict) || {
      strong: {},
      scores: {},
      judge_type: "program",
      notes: [],
    },
    judge_type: (row.judge_type as EvalResult["judge_type"]) || "program",
    gsb: row.gsb as EvalResult["gsb"],
    created_at: row.created_at ? String(row.created_at) : "",
  };
}
