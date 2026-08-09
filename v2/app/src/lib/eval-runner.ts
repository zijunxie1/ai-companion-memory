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
const ASYNC_WRITE_POLL_MS = 2000; // 轮询间隔

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
 * 生成 Run 级唯一 eval 用户 ID。
 * 修复点（Run#5 实测）：固定用户跨 Run 积累 mem0 历史 → 去重导致 seed/写入失效。
 * 每次 Run 用全新用户（eval-<timestamp>），彻底隔离历史，保证环境可复现。
 */
export function generateEvalUserId(): string {
  return `eval-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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

/**
 * 等待 mem0 异步写入完成。
 * 修复点（Reviewer #3 + Run#2 实测）：
 *   1) minGrowth>0（seed_chat）：必须等到增长达标 + 稳定 2 轮，不得提前返回；
 *   2) minGrowth=0（主输入）：给足时间窗口（15s）+ 稳定 2 轮，避免漏掉延迟写入；
 *   3) 超时兜底（30s），返回实际增长用于日志。
 */
async function waitForAsyncWrites(
  userId: string,
  before: Array<{ id: string }>,
  opts?: { minGrowth?: number; minWaitMs?: number; timeoutMs?: number }
): Promise<{ growth: number }> {
  const minGrowth = opts?.minGrowth ?? 0;
  const minWaitMs = opts?.minWaitMs ?? (minGrowth > 0 ? 8000 : 15000);
  const timeoutMs = opts?.timeoutMs ?? 60000;
  const deadline = Date.now() + timeoutMs;
  const startedAt = Date.now();
  let lastLength = before.length;
  let stableRounds = 0;
  let lastGrowth = 0;

  while (Date.now() < deadline) {
    await sleep(ASYNC_WRITE_POLL_MS);
    const after = await mem0.getAll(userId);
    lastGrowth = after.length - before.length;
    const elapsed = Date.now() - startedAt;

    if (after.length === lastLength) {
      stableRounds++;
    } else {
      stableRounds = 0;
      lastLength = after.length;
    }

    // 超过最小等待窗口 + 连续两轮稳定 才可返回
    if (elapsed >= minWaitMs && stableRounds >= 2) {
      // 有增长预期时必须达标；无预期则稳定即可
      if (minGrowth > 0) {
        if (lastGrowth >= minGrowth) return { growth: lastGrowth };
      } else {
        return { growth: lastGrowth };
      }
    }
  }
  console.warn(
    `[eval] async write wait timed out (growth=${lastGrowth}/${minGrowth}, stable=${stableRounds})`
  );
  return { growth: lastGrowth };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 轮询 traces 表获取该 trace 的异步 memory_writes（/api/chat Step 8 异步更新）。
 * 修复点（Run#4 实测）：getAll diff 会漏掉 fire-and-forget 写入，
 * traces.memory_writes 是产品链路自己回填的，最可靠。
 * 轮询最长 60s，每 2s 一次；超时返回空数组（由调用方走 diff 兜底）。
 */
async function fetchTraceMemoryWrites(
  traceId: string | null
): Promise<Array<{ event: string; memory: string }>> {
  if (!traceId) return [];
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await sleep(2000);
    const result = await pool.query(
      `SELECT memory_writes FROM traces WHERE id = $1`,
      [traceId]
    );
    const writes = result.rows[0]?.memory_writes;
    if (Array.isArray(writes) && writes.length > 0) {
      return writes.map((w) => {
        const obj = (w ?? {}) as Record<string, unknown>;
        return {
          event: String(obj.event ?? "ADD"),
          memory: String(obj.memory ?? obj.content ?? ""),
        };
      });
    }
  }
  console.warn(`[eval] trace ${traceId.slice(0, 8)} memory_writes 60s 内未回填，走 diff 兜底`);
  return [];
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

/** 执行单个 Case（返回结果行数据） */
async function runOneCase(
  runId: string,
  caseDef: EvalCase,
  previous: EvalResult | null,
  userId: string
): Promise<void> {
  const start = Date.now();
  let aiReply: string | null = null;
  let usedMemory: unknown[] = [];
  let recallReason: string | null = null;
  let memoryWrites: unknown[] = [];

  try {
    // 0. 环境隔离：每个 Case 独立环境——先清空 eval 用户全部 Memory，
    //    再按本 Case 前置条件重建（seed_chat 写入 / delete_memory 删除）。
    //    保证 Case 之间无 Memory 串扰、结果可复现。
    await resetEvalUserMemory(userId);

    // 1. 前置条件（seed / delete）
    const deletedTerms = await applyPreconditions(caseDef, userId);

    // 2. 主输入前 Memory 快照（diff 兜底用）
    const beforeMain = await mem0.getAll(userId);

    // 3. 调真实 /api/chat
    const chatResult = await chatOnce(caseDef.input_text, userId);
    aiReply = chatResult.reply;
    usedMemory = chatResult.usedMemory;
    recallReason = chatResult.recallReason;

    // 4. 等待异步写入完成，获取实际写入：
    //    首选：轮询 traces 表 memory_writes 字段（/api/chat 异步更新，最可靠）
    //    兜底：before/after diff（轮询超时后）
    memoryWrites = await fetchTraceMemoryWrites(chatResult.traceId);
    if (memoryWrites.length === 0) {
      await waitForAsyncWrites(userId, beforeMain, { minGrowth: 0 });
      const afterMain = await mem0.getAll(userId);
      memoryWrites = diffMemories(beforeMain, afterMain);
    }

    // 5. 程序规则判定
    const programVerdict = runProgramRules({
      caseDef,
      usedMemory,
      memoryWrites,
      aiReply,
      deletedTerms,
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
    };

    // 8. GSB 对比（与上一次 Run 同 Case）
    const gsb = compareGSB(finalVerdict, previous);

    // 9. 入库
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
    });
    console.log(
      `[eval] ${caseDef.case_id} done (${Date.now() - start}ms, gsb=${gsb ?? "—"}, judge=${merged.judgeType})`
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
        checks: [{ name: "execution", pass: false, detail: msg }],
      },
      llmJudge: null,
      finalVerdict: failedVerdict,
      judgeType: "program",
      gsb: previous ? "Bad" : null,
    });
  }
}

/** diff 两次 Memory 快照 → 新增条目（简化：按 memory 文本去重） */
function diffMemories(
  before: Array<{ id: string; memory?: string }>,
  after: Array<{ id: string; memory?: string }>
): Array<{ event: string; memory: string }> {
  const beforeTexts = new Set(before.map((m) => memoryText(m)));
  return after
    .filter((m) => !beforeTexts.has(memoryText(m)))
    .map((m) => ({ event: "ADD", memory: memoryText(m) }));
}

// ── Run 入口（API 调用） ────────────────────────────────────

/**
 * 执行一次完整 Run：
 *   ensure 用户 → 逐条跑 8 Case（每条 Case 独立重置环境）→ 汇总 summary → 更新 Run 状态
 * 环境隔离策略（双层）：
 *   - Run 级：每次 Run 生成全新 eval 用户（eval-<ts>-<rand>），
 *     规避 mem0 用户历史去重导致 seed/写入失效（Run#5 实测根因）；
 *   - Case 级：每个 Case 在 runOneCase 内自行 reset + 重建前置条件，
 *     Case 之间完全隔离（无 Memory 串扰），保证结果可复现。
 */
export async function executeEvalRun(runId: string): Promise<void> {
  try {
    // Run 级全新用户（彻底隔离 mem0 历史）
    const evalUserId = generateEvalUserId();
    await ensureEvalUser(evalUserId);
    console.log(`[eval] run ${runId} started, eval user = ${evalUserId}`);

    // 将 eval 用户写入 config_snapshot（追溯用）
    try {
      await pool.query(
        `UPDATE eval_runs SET config_snapshot = config_snapshot || $2::jsonb WHERE id = $1`,
        [runId, JSON.stringify({ eval_user_id: evalUserId })]
      );
    } catch {
      // 非关键，忽略
    }

    const cases = await getEvalCases(true);
    console.log(`[eval] run ${runId} started, ${cases.length} cases`);

    // 上一次 completed Run（GSB 基准）
    const prevRun = await getLastCompletedRun(runId);
    const prevResults = prevRun ? await getRunResults(prevRun.id) : [];
    const prevByCase = new Map<string, EvalResult>();
    for (const r of prevResults) {
      prevByCase.set(r.case_snapshot?.case_id ?? r.case_id, r);
    }

    // 逐条跑（顺序执行，每条 Case 独立环境）
    for (const caseDef of cases) {
      await runOneCase(runId, caseDef, prevByCase.get(caseDef.case_id) ?? null, evalUserId);
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
  }

  return {
    gsb,
    strong,
    score_avg: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    program_failures: programFailures,
    not_tested: notTested,
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
