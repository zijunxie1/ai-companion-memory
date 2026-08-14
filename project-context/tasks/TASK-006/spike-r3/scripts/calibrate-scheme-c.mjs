// ============================================================
// S3 方案 C 校准脚本：外部大模型（DeepSeek deepseek-v4-flash）相关性裁判
// 只读 calibration-only-definition.json 的 22 个校准对（split=calibration）
// 绝不读取/接触 holdout 10 对（split=holdout 不在此文件内）
// 批处理：每个场景（query）一次调用，提交该 query 全部校准候选，一次返回判断
// temperature=0，跑 3 轮测波动（停止判据：波动 > 0.1 → 判据失效）
// 记录：调用次数 / 延迟 / token（费用估算）/ 失败
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { DATA_DIR, nowIso } from "./config.mjs";

const BASE_URL = "https://api.deepseek.com/v1";
const MODEL = "deepseek-v4-flash";
const ROUNDS = 3;
const TEMPERATURE = 0;

const DEF = path.join(import.meta.dirname, "..", "calibration-only-definition.json");
const CAL_DIR = path.join(DATA_DIR, "calibration");

// API key 从容器 env 读取到进程内存，不落盘、不回显
function getApiKey() {
  return execSync("docker exec v2-mem0-server printenv MEM0_LLM_API_KEY", {
    encoding: "utf8",
  }).trim();
}

const definition = JSON.parse(fs.readFileSync(DEF, "utf8"));
const pairs = definition.pairs; // 22 校准对，全部 split=calibration

// 按场景分组（同一 query 的候选一起批处理）
const byScenario = new Map();
for (const p of pairs) {
  if (!byScenario.has(p.scenario)) {
    byScenario.set(p.scenario, { query: p.query, pairs: [] });
  }
  byScenario.get(p.scenario).pairs.push(p);
}

const scenarios = [...byScenario.entries()].map(([scenario, v]) => ({
  scenario,
  query: v.query,
  pairs: v.pairs,
}));

// 构造裁判 prompt：一次提交 query + 全部候选，要求返回每条 label + score(0-1)
function buildPrompt(query, pairs) {
  const candidates = pairs
    .map((p, i) => `${i}: ${p.memory}`)
    .join("\n");
  return `你是记忆相关性裁判。给定用户当前查询和若干条候选记忆，判断每条候选记忆是否与查询相关。

判定标准：
- relevant（相关）：这条记忆能帮助理解或回应用户当前查询，或与查询话题直接相关（含语义隐式关联，如"失眠"与"橘猫陪伴入睡"）。
- irrelevant（无关）：这条记忆与查询无关，即使包含相同字面词（如"瘦"指猫瘦还是人减肥、他人的猫/同事等）。

用户查询：${query}

候选记忆：
${candidates}

只输出 JSON，格式：
{"judgments":[{"id":0,"label":"relevant","score":0.82},{"id":1,"label":"irrelevant","score":0.1}]}

score 为 0-1 的相关性分数（0=完全无关，1=高度相关），label 与 score 一致（label=relevant 则 score 应 ≥ 0.5，label=irrelevant 则 score 应 < 0.5）。`;
}

async function callJudge(query, pairs, apiKey) {
  const prompt = buildPrompt(query, pairs);
  const t0 = Date.now();
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: "你是严谨的记忆相关性裁判，只输出 JSON。" },
      { role: "user", content: prompt },
    ],
    temperature: TEMPERATURE,
    response_format: { type: "json_object" },
  };
  let status = "ok";
  let error = null;
  let res;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      status = "http_error";
      error = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
    }
  } catch (e) {
    status = "network_error";
    error = String(e).slice(0, 200);
  }
  const latencyMs = Date.now() - t0;

  let usage = null;
  let judgments = null;
  if (status === "ok") {
    const data = await res.json();
    usage = data.usage || null; // prompt_tokens / completion_tokens
    const content = data.choices?.[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content);
      judgments = parsed.judgments || null;
      if (!Array.isArray(judgments) || judgments.length !== pairs.length) {
        status = "parse_mismatch";
        error = `judgments 长度 ${judgments?.length} != 候选数 ${pairs.length}`;
        judgments = null;
      }
    } catch (e) {
      status = "parse_error";
      error = `JSON 解析失败: ${String(e).slice(0, 200)}`;
    }
  }

  return { status, error, latencyMs, usage, judgments };
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// 分离边际 = 最低正例分 − 最高负例分
function separationMargin(scores, labels) {
  const pos = [], neg = [];
  for (let i = 0; i < scores.length; i++) {
    (labels[i] === "relevant" ? pos : neg).push(scores[i]);
  }
  const minPos = Math.min(...pos);
  const maxNeg = Math.max(...neg);
  return { minPos, maxNeg, margin: minPos - maxNeg };
}

function evaluate(scores, labels, thr) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < scores.length; i++) {
    const pred = scores[i] >= thr;
    const actual = labels[i] === "relevant";
    if (pred && actual) tp++;
    else if (pred && !actual) fp++;
    else if (!pred && !actual) tn++;
    else fn++;
  }
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return { tp, fp, tn, fn, precision, recall, f1 };
}

function gridSearch(scores, labels) {
  let best = null;
  for (let t = 0; t <= 1.001; t += 0.01) {
    const m = evaluate(scores, labels, t);
    if (!best || m.f1 > best.f1) best = { thr: Math.round(t * 100) / 100, ...m };
  }
  return best;
}

// ============ 主流程 ============
const apiKey = getApiKey();
if (!apiKey) {
  console.error("FATAL: 无法读取 API key");
  process.exit(1);
}

const rounds = []; // 每轮：{ round, calls:[{scenario, status, latencyMs, usage, judgments}], scores: {pair_id: score} }
let totalCalls = 0;
let totalFail = 0;
let totalPromptTokens = 0;
let totalCompletionTokens = 0;
let totalLatencyMs = 0;

for (let r = 1; r <= ROUNDS; r++) {
  const roundCalls = [];
  const scoreMap = {}; // pair_id -> score
  let roundOk = true;
  let roundError = null;

  for (const sc of scenarios) {
    const call = await callJudge(sc.query, sc.pairs, apiKey);
    roundCalls.push({ scenario: sc.scenario, ...call });
    totalCalls++;
    totalLatencyMs += call.latencyMs;
    if (call.usage) {
      totalPromptTokens += call.usage.prompt_tokens || 0;
      totalCompletionTokens += call.usage.completion_tokens || 0;
    }
    if (call.status !== "ok") {
      totalFail++;
      roundOk = false;
      roundError = roundError || `${sc.scenario}: ${call.status} ${call.error || ""}`;
      continue;
    }
    // 记录逐配对分数（judgments 按候选顺序对齐）
    call.judgments.forEach((j, i) => {
      scoreMap[sc.pairs[i].pair_id] = Number(j.score);
    });
  }

  rounds.push({ round: r, ok: roundOk, error: roundError, calls: roundCalls, scores: scoreMap });
  console.log(`round ${r}: ${roundOk ? "ok" : "FAILED (" + roundError + ")"} | 调用 ${roundCalls.length} 次`);
}

// 汇总：每对取三轮均值 + 波动
const pairIds = pairs.map((p) => p.pair_id);
const meanScore = {};
const volScore = {};
for (const pid of pairIds) {
  const vals = rounds.filter((r) => r.scores[pid] !== undefined).map((r) => r.scores[pid]);
  if (vals.length === 0) {
    meanScore[pid] = null;
    volScore[pid] = null;
  } else {
    meanScore[pid] = vals.reduce((a, b) => a + b, 0) / vals.length;
    volScore[pid] = Math.max(...vals) - Math.min(...vals);
  }
}

const validPairs = pairs.filter((p) => meanScore[p.pair_id] !== null);
const scoresArr = validPairs.map((p) => meanScore[p.pair_id]);
const labelsArr = validPairs.map((p) => p.label);
const volArr = validPairs.map((p) => volScore[p.pair_id]);

const separation = separationMargin(scoresArr, labelsArr);
const bestGrid = gridSearch(scoresArr, labelsArr);
const maxVol = Math.max(...volArr);
const volOver = volArr.filter((v) => v > 0.1).length;

// 关键记忆独立门：正向关键候选对（is_key && label=relevant）
const keyPairs = validPairs.filter((p) => p.is_key && p.label === "relevant");
const keyGate = keyPairs.map((p) => ({
  pair_id: p.pair_id,
  key_id: p.key_id,
  memory: p.memory,
  score: Number(meanScore[p.pair_id].toFixed(4)),
  passed_at_best_thr: meanScore[p.pair_id] >= bestGrid.thr,
}));

const result = {
  generated_at: nowIso(),
  scheme: "C (external LLM relevance judge)",
  model: MODEL,
  method: "OpenAI-compatible chat/completions, batch per scenario, temperature=0",
  base_url: BASE_URL,
  sample_pairs: validPairs.length,
  rounds: ROUNDS,
  calls: {
    total: totalCalls,
    failed: totalFail,
    prompt_tokens: totalPromptTokens,
    completion_tokens: totalCompletionTokens,
    total_latency_ms: totalLatencyMs,
    avg_latency_ms: totalCalls > 0 ? Math.round(totalLatencyMs / totalCalls) : 0,
    cost_estimate_note: "费用按 DeepSeek 公开定价估算（📖 线索，以实际账单为准）；models 列表请求不计费",
  },
  separation: {
    min_pos: Number(separation.minPos.toFixed(4)),
    max_neg: Number(separation.maxNeg.toFixed(4)),
    margin: Number(separation.margin.toFixed(4)),
  },
  volatility: {
    max: Number(maxVol.toFixed(4)),
    pairs_over_0_1: volOver,
  },
  best_grid: bestGrid,
  per_pair: validPairs.map((p) => ({
    pair_id: p.pair_id,
    scenario: p.scenario,
    label: p.label,
    category: p.category,
    is_key: p.is_key,
    key_id: p.key_id || null,
    score: Number(meanScore[p.pair_id].toFixed(4)),
    vol: Number(volScore[p.pair_id].toFixed(4)),
  })),
  key_memory_gate: {
    rule: "独立门：关键记忆作为 relevant 出现的全部正向候选对（6 个），在冻结机制下必须被判为 relevant（保留）；任一漏掉 → 方案独立门不通过",
    positive_key_pairs: keyPairs.length,
    scheme_c: keyGate,
  },
  stop_criteria: {
    margin_ok: separation.margin > 0.1,
    margin: Number(separation.margin.toFixed(4)),
    volatility_ok: maxVol <= 0.1,
    volatility_max: Number(maxVol.toFixed(4)),
    key_gate_ok: keyGate.every((k) => k.passed_at_best_thr),
    key_gate_failures: keyGate.filter((k) => !k.passed_at_best_thr).map((k) => k.pair_id),
  },
  round_details: rounds.map((r) => ({
    round: r.round,
    ok: r.ok,
    error: r.error || null,
    calls: r.calls.map((c) => ({
      scenario: c.scenario,
      status: c.status,
      latency_ms: c.latencyMs,
      prompt_tokens: c.usage?.prompt_tokens || null,
      completion_tokens: c.usage?.completion_tokens || null,
      error: c.error || null,
    })),
  })),
};

fs.writeFileSync(
  path.join(CAL_DIR, "scheme-c-result.json"),
  JSON.stringify(result, null, 2),
  "utf8"
);

console.log("\n=== 方案 C（external LLM deepseek-v4-flash）校准结果 ===");
console.log(`有效配对 ${validPairs.length}/${pairs.length}；调用 ${totalCalls} 次（失败 ${totalFail}）`);
console.log(`分离边际 = ${separation.margin.toFixed(4)}（最低正例 ${separation.minPos.toFixed(4)} − 最高负例 ${separation.maxNeg.toFixed(4)}）`);
console.log(`波动 max = ${maxVol.toFixed(4)}（>0.1 的配对 ${volOver} 个）`);
console.log(`最优阈值 = ${bestGrid.thr} → F1 = ${bestGrid.f1.toFixed(4)}（P=${bestGrid.precision.toFixed(4)} R=${bestGrid.recall.toFixed(4)}）`);
console.log(`token: prompt ${totalPromptTokens} + completion ${totalCompletionTokens}；平均延迟 ${(totalLatencyMs / Math.max(1, totalCalls)).toFixed(0)}ms`);
console.log(`关键记忆门（${keyPairs.length} 个正向关键候选对）：${keyGate.map((k) => `${k.pair_id}(${k.passed_at_best_thr ? "PASS" : "FAIL"})`).join(" ")}`);
console.log(`停止判据：边际>0.1? ${separation.margin > 0.1} | 波动≤0.1? ${maxVol <= 0.1} | 关键门全过? ${keyGate.every((k) => k.passed_at_best_thr)}`);
console.log("结果已落盘 data/calibration/scheme-c-result.json");
