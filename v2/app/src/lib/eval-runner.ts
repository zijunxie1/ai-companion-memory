// ============================================================
// 评测 Run 执行器 — 触发 Run → 逐条跑 8 Case（真实 /api/chat）→ 三层判定 → 入库
//
// 环境隔离：评测使用 EVAL_USER_ID（eval-runner），与 demo-alice 产品数据隔离；
//           每次 Run 开始前清空该用户全部 mem0 Memory，保证环境一致。
// 真实链路：每条 Case 调真实 /api/chat（HTTP 全链路，含异步 mem0 写入）。
// ============================================================

import { mem0 } from "./mem0-client";
import { env } from "./env";
import { pool } from "./db";
import {
  deleteRunResults,
  getEvalCases,
  getEvalRun,
  getLastCompletedRun,
  getRunResults,
  insertEvalResult,
  updateEvalRun,
} from "./eval-db";
import { runProgramRules, memoryText } from "./eval-program-rules";
import { runLLMJudge, mergeVerdicts } from "./eval-llm-judge";
import type {
  EvalCase,
  EvalResult,
  FinalVerdict,
  RunSummary,
} from "./eval-types";

const CHAT_API_URL = process.env.EVAL_CHAT_API_URL || "http://localhost:3000/api/chat";

// ── 用户环境准备 ────────────────────────────────────────────

/** 确保 eval 用户存在（复制 demo-alice 的 Persona） */
export async function ensureEvalUser(userId: string): Promise<void> {
  await pool.query(
    `INSERT INTO users (id, nickname, persona, relationship_stage)
     SELECT $1, '评测机器人', persona, relationship_stage FROM users WHERE id = $2
     ON CONFLICT (id) DO NOTHING`,
    [userId, env.DEMO_USER_ID]
  );
}

/** 清空 eval 用户的全部 Memory（环境重置） */
export async function resetEvalUserMemory(userId: string): Promise<void> {
  const all = await mem0.getAll(userId);
  for (const m of all) {
    try {
      await mem0.delete(m.id);
    } catch (e) {
      console.error(`[eval] delete memory ${m.id} failed:`, e);
    }
  }
  console.log(`[eval] reset ${userId} memory: cleared ${all.length} items`);
}

/**
 * 生成 Case 级唯一 eval 用户 ID。
 * 修复点（Reviewer R3 P1-2）：Run 级用户 + reset 无法隔离跨 Case 异步写入污染；
 * 每个 Case 独立用户（eval-<runShort>-<case>-<rand>），Trace/Memory/Result 可互相追溯。
 */
export function generateEvalUserId(runId: string, caseId: string): string {
  const runShort = runId.replace(/-/g, "").slice(0, 8);
  return `eval-${runShort}-${caseId}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── 真实 /api/chat 调用 ────────────────────────────────────

interface ChatOnceResult {
  reply: string;
  usedMemory: unknown[];
  recallReason: string;
  traceId: string | null;
}

/** 调真实 /api/chat（完整 HTTP 链路） */
async function chatOnce(message: string, userId: string): Promise<ChatOnceResult> {
  const resp = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`/api/chat failed: ${resp.status} ${errText.slice(0, 200)}`);
  }
  const data = await resp.json();
  return {
    reply: data.reply ?? "",
    usedMemory: data.used_memory ?? [],
    recallReason: data.recall_reason ?? "",
    traceId: data.trace_id ?? null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 轮询 trace 的 write_status 直到终态（CR-C 终态协议）。
 * 修复点（Reviewer R3 P1-2）：不得用 memory_writes 非空/空数组猜终态，
 * 也不得用 before/after diff 差值回退；只认 write_status 状态机。
 * 返回：
 *   { status: "completed", disposition, memoryWrites }
 *   { status: "failed", writeError }
 *   { status: "timeout" }（轮询超时，调用方按 NOT_TESTED 处理）
 * 轮询最长 90s，每 2s 一次。
 */
async function waitForTraceWriteFinal(
  traceId: string | null,
  timeoutMs = 90000
): Promise<{
  status: "completed" | "failed" | "timeout";
  disposition?: string | null;
  memoryWrites?: Array<{ event: string; memory: string }>;
  writeError?: string | null;
}> {
  if (!traceId) return { status: "timeout" };
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(2000);
    const result = await pool.query(
      `SELECT write_status, write_disposition, write_error, memory_writes
       FROM traces WHERE id = $1`,
      [traceId]
    );
    const row = result.rows[0];
    if (!row) return { status: "timeout" };
    if (row.write_status === "completed") {
      const writes = Array.isArray(row.memory_writes)
        ? row.memory_writes.map((w: Record<string, unknown>) => {
            const obj = (w ?? {}) as Record<string, unknown>;
            return {
              event: String(obj.event ?? "ADD"),
              memory: String(obj.memory ?? obj.content ?? ""),
            };
          })
        : [];
      return {
        status: "completed",
        disposition: row.write_disposition ?? null,
        memoryWrites: writes,
      };
    }
    if (row.write_status === "failed") {
      return {
        status: "failed",
        writeError: row.write_error ? String(row.write_error) : "未知错误",
      };
    }
    // pending：继续轮询
  }
  console.warn(`[eval] trace ${traceId.slice(0, 8)} write_status ${timeoutMs / 1000}s 内未达终态`);
  return { status: "timeout" };
}

/** 执行前置条件（seed_chat 建 Memory / delete_memory 删 Memory） */
async function applyPreconditions(
  caseDef: EvalCase,
  userId: string
): Promise<string[]> {
  const deletedTerms: string[] = [];
  for (const pc of caseDef.preconditions || []) {
    if (pc.type === "seed_chat") {
      // 直接调 mem0.add（同步：返回时已写入 qdrant，无需轮询）。
      // 不走 /api/chat——其 mem0.add 是 fire-and-forget 异步，无法可靠等待，
      // 且 seed 的目的是预置 Memory，不需要 Dify 生成回复。
      // 仍使用 mem0 真实抽取链路（MEMORY_EXTRACT_PROMPT）。
      // 若抽取 0 条（LLM 偶发失败），重试一次。
      let addResult = await mem0.add(
        userId,
        `用户: ${pc.value}\nAI: （预置环境）`,
        { source: "eval-seed", case_id: caseDef.case_id }
      );
      if (addResult.candidates.length === 0) {
        console.warn(`[eval] ${caseDef.case_id} seed_chat 首次抽取 0 条，重试…`);
        await sleep(2000);
        addResult = await mem0.add(
          userId,
          `用户: ${pc.value}\nAI: （预置环境）`,
          { source: "eval-seed", case_id: caseDef.case_id }
        );
      }
      const written = addResult.candidates.length;
      console.log(
        `[eval] ${caseDef.case_id} seed_chat done: "${pc.value.slice(0, 30)}" (mem0 写入 ${written} 条)`
      );
      if (written === 0) {
        console.warn(
          `[eval] ${caseDef.case_id} seed_chat 两次均未抽取到 Memory，前置条件可能未生效`
        );
      }
    } else if (pc.type === "delete_memory") {
      const all = await mem0.getAll(userId);
      const targets = all.filter((m) => memoryText(m).includes(pc.value));
      for (const t of targets) {
        try {
          await mem0.delete(t.id);
          deletedTerms.push(pc.value);
          console.log(`[eval] ${caseDef.case_id} deleted memory: "${memoryText(t).slice(0, 40)}"`);
        } catch (e) {
          console.error(`[eval] delete failed for ${t.id}:`, e);
        }
      }
    }
  }
  return deletedTerms;
}

// ── GSB 对比 ────────────────────────────────────────────────

/** 对比当前结果与上一次 Run 同 Case 结果 → Good/Same/Bad */
export function compareGSB(
  current: FinalVerdict,
  previous: EvalResult | null
): "Good" | "Same" | "Bad" | null {
  if (!previous) return null;

  const prevStrong = previous.final_verdict?.strong ?? {};
  const prevScores = previous.final_verdict?.scores ?? {};

  // 0. 程序失败对比（Review #1+#2：程序失败优先于分数，防止"稳定失败"被包装成"没有退化"）
  const curProgFailed = Boolean(current.program_failed);
  const prevProgFailed = Boolean(previous.final_verdict?.program_failed);
  if (curProgFailed && !prevProgFailed) return "Bad"; // 新失败
  if (!curProgFailed && prevProgFailed) return "Good"; // 修复

  // 1. 强约束优先：PASS→FAIL = Bad；FAIL→PASS = Good
  const allStrongKeys = new Set([
    ...Object.keys(current.strong),
    ...Object.keys(prevStrong),
  ]);
  for (const k of allStrongKeys) {
    const cur = current.strong[k];
    const prev = prevStrong[k];
    if (cur === "FAIL" && prev === "PASS") return "Bad";
    if (cur === "PASS" && prev === "FAIL") return "Good";
  }

  // 2. 分档分数：均值变化 ≥1 分 → Good/Bad
  const keys = new Set([
    ...Object.keys(current.scores),
    ...Object.keys(prevScores),
  ]);
  if (keys.size === 0) return "Same";
  let diffSum = 0;
  let count = 0;
  for (const k of keys) {
    const c = current.scores[k as keyof FinalVerdict["scores"]];
    const p = prevScores[k as keyof FinalVerdict["scores"]];
    if (typeof c === "number" && typeof p === "number") {
      diffSum += c - p;
      count++;
    }
  }
  if (count === 0) return "Same";
  const avgDiff = diffSum / count;
  if (avgDiff >= 1) return "Good";
  if (avgDiff <= -1) return "Bad";
  return "Same";
}

// ── Run 主流程 ──────────────────────────────────────────────

/** 执行单个 Case（返回结果行数据）
 *  Review R3 P1-2：每条 Case 独立 userId（Case 级隔离），
 *  写入结果只认 trace write_status 终态，不做 before/after 差值猜测。 */
async function runOneCase(
  runId: string,
  caseDef: EvalCase,
  previous: EvalResult | null
): Promise<void> {
  const start = Date.now();
  // Case 级独立用户（eval-<runShort>-<case>-<rand>）
  const userId = generateEvalUserId(runId, caseDef.case_id);
  let aiReply: string | null = null;
  let usedMemory: unknown[] = [];
  let recallReason: string | null = null;
  let memoryWrites: unknown[] = [];
  let writeState: string | null = null;
  let writeDisposition: string | null = null;

  try {
    // 0. 确保 Case 用户存在（全新用户，无需 reset——历史天然隔离）
    await ensureEvalUser(userId);

    // 1. 前置条件（seed / delete，使用 Case 专属用户）
    const deletedTerms = await applyPreconditions(caseDef, userId);

    // 2. 调真实 /api/chat（使用 Case 专属用户）
    const chatResult = await chatOnce(caseDef.input_text, userId);
    aiReply = chatResult.reply;
    usedMemory = chatResult.usedMemory;
    recallReason = chatResult.recallReason;

    // 3. 等待异步写入终态（CR-C：只认 write_status，不做差值回退）
    const writeFinal = await waitForTraceWriteFinal(chatResult.traceId);
    if (writeFinal.status === "completed") {
      writeState = "completed";
      writeDisposition = writeFinal.disposition ?? null;
      memoryWrites = writeFinal.memoryWrites ?? [];
    } else if (writeFinal.status === "failed") {
      writeState = "failed";
      console.warn(`[eval] ${caseDef.case_id} memory write failed: ${writeFinal.writeError}`);
    } else {
      writeState = "timeout";
      console.warn(`[eval] ${caseDef.case_id} write_status 轮询超时，按 NOT_TESTED 处理`);
    }

    // 4. 程序规则判定（写入状态透传给规则：timeout/failed → 相关规则 NOT_TESTED）
    const programVerdict = runProgramRules({
      caseDef,
      usedMemory,
      memoryWrites,
      aiReply,
      deletedTerms,
      writeState,
      writeDisposition,
    });

    // 6. LLM Judge（主观维度候选评分）
    const needsLLM = caseDef.eval_type === "llm" || caseDef.eval_type === "mixed";
    const llmJudge = needsLLM
      ? await runLLMJudge(caseDef, { aiReply, usedMemory, memoryWrites })
      : null;

    // 7. 合并最终判定（候选）
    const merged = mergeVerdicts({
      programChecks: programVerdict.checks,
      programStrong: programVerdict.strong,
      programAbsoluteStatus: programVerdict.absolute_status,
      llmJudge,
      caseDef,
    });
    const finalVerdict: FinalVerdict = {
      strong: merged.strong,
      scores: merged.scores,
      judge_type: merged.judgeType,
      notes: merged.notes,
      program_failed: merged.program_failed,
      program_failures: merged.program_failures,
      absolute_status: merged.absolute_status,
    };

    // 8. GSB 对比（与上一次 Run 同 Case）
    const gsb = compareGSB(finalVerdict, previous);

    // 9. 入库（记录 Case 级 eval_user_id + 写入终态）
    await insertEvalResult({
      runId,
      caseDef,
      userInput: caseDef.input_text,
      aiReply,
      usedMemory,
      recallReason,
      memoryWrites,
      latencyMs: Date.now() - start,
      programVerdict,
      llmJudge,
      finalVerdict,
      judgeType: merged.judgeType,
      gsb,
      evalUserId: userId,
      writeState,
      writeDisposition,
    });
    console.log(
      `[eval] ${caseDef.case_id} done (${Date.now() - start}ms, gsb=${gsb ?? "—"}, judge=${merged.judgeType}, write=${writeState ?? "?"})`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`[eval] ${caseDef.case_id} failed:`, msg);
    const failedVerdict: FinalVerdict = {
      strong: (caseDef.pass_criteria.strong || []).reduce(
        (acc, s) => ({ ...acc, [s]: "FAIL" }),
        {} as Record<string, "PASS" | "FAIL" | "NOT_TESTED">
      ),
      scores: {},
      judge_type: "program",
      notes: [`执行异常: ${msg}`],
    };
    await insertEvalResult({
      runId,
      caseDef,
      userInput: caseDef.input_text,
      aiReply: null,
      usedMemory: [],
      recallReason: null,
      memoryWrites: [],
      latencyMs: Date.now() - start,
      programVerdict: {
        checks: [{ name: "execution", pass: false, status: "FAIL", detail: msg }],
        absolute_status: "FAIL",
      },
      llmJudge: null,
      finalVerdict: failedVerdict,
      judgeType: "program",
      gsb: previous ? "Bad" : null,
    });
  }
}

// ── Run 入口（API 调用） ────────────────────────────────────

/**
 * 执行一次完整 Run：
 *   ensure 用户 → 逐条跑 8 Case（每条 Case 独立重置环境）→ 汇总 summary → 更新 Run 状态
 * 环境隔离策略（Review R3 P1-2 修正）：
 *   - Case 级：每条 Case 独立 eval 用户（eval-<runShort>-<case>-<rand>），
 *     彻底隔离 mem0 历史与跨 Case 异步写入污染；
 *   - config_snapshot 记录 per_case 策略，不表达为单一评测用户。
 */
export async function executeEvalRun(runId: string): Promise<void> {
  try {
    // config_snapshot 记录 per_case 隔离策略（不再写入单一 eval_user_id）
    try {
      await pool.query(
        `UPDATE eval_runs SET config_snapshot = config_snapshot || $2::jsonb WHERE id = $1`,
        [runId, JSON.stringify({ user_isolation: "per_case" })]
      );
    } catch {
      // 非关键，忽略
    }

    const cases = await getEvalCases(true);
    console.log(`[eval] run ${runId} started, ${cases.length} cases (per-case user isolation)`);

    // 上一次 completed Run（GSB 基准）
    const prevRun = await getLastCompletedRun(runId);
    const prevResults = prevRun ? await getRunResults(prevRun.id) : [];
    const prevByCase = new Map<string, EvalResult>();
    for (const r of prevResults) {
      prevByCase.set(r.case_snapshot?.case_id ?? r.case_id, r);
    }

    // 逐条跑（每条 Case 独立用户 + 独立环境）
    for (const caseDef of cases) {
      await runOneCase(runId, caseDef, prevByCase.get(caseDef.case_id) ?? null);
    }

    // 汇总
    const results = await getRunResults(runId);
    const summary = buildSummary(results);

    await updateEvalRun(runId, {
      status: "completed",
      summary,
      completedAt: new Date().toISOString(),
    });
    console.log(`[eval] run ${runId} completed, gsb=${JSON.stringify(summary.gsb)}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`[eval] run ${runId} failed:`, msg);
    await updateEvalRun(runId, {
      status: "failed",
      error: msg,
      completedAt: new Date().toISOString(),
    });
    // 清理半成品结果
    await deleteRunResults(runId).catch(() => {});
  }
}

/** 构建 Run 摘要（GSB + 强约束统计 + 平均分） */
export function buildSummary(results: EvalResult[]): RunSummary {
  const gsb = { good: 0, same: 0, bad: 0, total: results.length };
  for (const r of results) {
    if (r.gsb === "Good") gsb.good++;
    else if (r.gsb === "Bad") gsb.bad++;
    else if (r.gsb === "Same") gsb.same++;
  }

  // 强约束统计
  const strong: RunSummary["strong"] = {};
  for (const r of results) {
    for (const [k, v] of Object.entries(r.final_verdict?.strong ?? {})) {
      if (!strong[k]) strong[k] = { pass: 0, fail: 0, not_tested: 0 };
      if (v === "PASS") strong[k].pass++;
      else if (v === "FAIL") strong[k].fail++;
      else if (v === "NOT_TESTED") strong[k].not_tested++;
    }
  }

  // 平均分（分档维度）
  let scoreSum = 0;
  let scoreCount = 0;
  for (const r of results) {
    for (const v of Object.values(r.final_verdict?.scores ?? {})) {
      if (typeof v === "number") {
        scoreSum += v;
        scoreCount++;
      }
    }
  }

  // 程序规则失败 Case（Review #2：失败必须显式呈现，不得被平均分掩盖）
  const programFailures: RunSummary["program_failures"] = [];
  const notTested: string[] = [];
  const absolute = { pass: 0, fail: 0, not_tested: 0 };
  for (const r of results) {
    const cs = r.case_snapshot;
    const fails = r.final_verdict?.program_failures ?? [];
    if (fails.length > 0) {
      programFailures.push({
        case_id: cs.case_id,
        title: cs.title,
        rules: fails,
      });
    }
    // 强约束 NOT_TESTED 的 Case
    for (const [k, v] of Object.entries(r.final_verdict?.strong ?? {})) {
      if (v === "NOT_TESTED") notTested.push(`${cs.case_id}(${k})`);
    }
    // 绝对状态分布（Review R3 §4.1）
    const abs = r.final_verdict?.absolute_status;
    if (abs === "FAIL") absolute.fail++;
    else if (abs === "NOT_TESTED") absolute.not_tested++;
    else if (abs === "PASS") absolute.pass++;
  }

  return {
    gsb,
    strong,
    score_avg: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    program_failures: programFailures,
    not_tested: notTested,
    absolute,
  };
}

/**
 * 人工覆盖后重算 Run 的 GSB 与 summary（Reviewer #4）。
 * 覆盖改变了 final_verdict，因此：
 *   - 每条 result 的 gsb 需与上一次 Run 同 Case 重新对比；
 *   - run.summary 需基于新 final_verdict 重新聚合。
 * 人工覆盖后由 judge API 调用。
 */
export async function recalculateRunGSBAndSummary(runId: string): Promise<void> {
  const run = await getEvalRun(runId);
  if (!run) return;

  const results = await getRunResults(runId);

  // 上一次 completed Run（排除当前 Run）作为 GSB 基准
  const prevRun = await getLastCompletedRun(runId);
  const prevResults = prevRun ? await getRunResults(prevRun.id) : [];
  const prevByCase = new Map<string, EvalResult>();
  for (const r of prevResults) {
    prevByCase.set(r.case_snapshot?.case_id ?? r.case_id, r);
  }

  // 逐条重算 gsb（基于当前 final_verdict，可能已被人工覆盖）
  for (const result of results) {
    const prev = prevByCase.get(result.case_snapshot?.case_id ?? result.case_id) ?? null;
    const gsb = compareGSB(result.final_verdict, prev);
    await pool.query(`UPDATE eval_results SET gsb = $1 WHERE id = $2`, [gsb, result.id]);
    result.gsb = gsb;
  }

  // 重算 summary（不更新 completed_at——Reviewer #4：避免时间漂移）
  const refreshed = await getRunResults(runId);
  const summary = buildSummary(refreshed);
  await updateEvalRun(runId, {
    status: run.status === "failed" ? "failed" : "completed",
    summary,
    // completedAt 不传（undefined）→ 保留原值
  });
  console.log(`[eval] run ${runId} summary recalculated: gsb=${JSON.stringify(summary.gsb)}`);
}
