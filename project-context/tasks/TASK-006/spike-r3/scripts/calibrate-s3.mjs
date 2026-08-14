// ============================================================
// S3 校准脚本：确定方案 A / B 阈值与停止判据（仅校准集 22 对）
// 方案 A：mem0 score（余弦相似度 0-1）+ 阈值
// 方案 B：cross-encoder logit → sigmoid 归一化 + 阈值
// 判据（DRAFT §9.1 / §4.3）：
//   - 分离边际 = 最低正例分 − 最高负例分（>0.1 才可靠分离）
//   - 波动 > 0.1 → 判据失效
//   - F1 单独不足以证明分离（R3 教训）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, nowIso } from "./config.mjs";

const CAL_DIR = path.join(DATA_DIR, "calibration");
const DEF = path.join(import.meta.dirname, "..", "calibration-only-definition.json");

const definition = JSON.parse(fs.readFileSync(DEF, "utf8"));
const pairs = definition.pairs; // 22 校准对

const schemeA = JSON.parse(fs.readFileSync(path.join(CAL_DIR, "scheme-a-rounds.json"), "utf8"));
const schemeB = JSON.parse(fs.readFileSync(path.join(CAL_DIR, "scheme-b-scores.json"), "utf8"));

// ---- 对齐方案 A 分数（memory 文本 → score，三轮均值）----
// schemeA.rounds["round-1..3"] 每轮是 [{scenario, query, user_id, hits:[{memory,score}]}]
const rounds = [schemeA.rounds["round-1"], schemeA.rounds["round-2"], schemeA.rounds["round-3"]];

// 建 pair 索引：scenario + memory → pair_id
const pairByScenarioMemory = new Map();
for (const p of pairs) {
  pairByScenarioMemory.set(p.scenario + "||" + p.memory, p);
}

// 方案 A 三轮分数（按 pair_id）
const scoreA = {}; // pair_id -> [s1, s2, s3]
for (const p of pairs) {
  scoreA[p.pair_id] = [];
  for (const round of rounds) {
    const sceneRec = round.find((r) => r.scenario === p.scenario);
    if (!sceneRec) continue;
    const hit = sceneRec.hits.find((h) => h.memory === p.memory);
    scoreA[p.pair_id].push(hit ? hit.score : null);
  }
}

// ---- 方案 B 分数（pair_id → logit）----
const scoreB = {}; // pair_id -> logit
for (const sc of schemeB.scenes) {
  for (const pr of sc.pairs) {
    scoreB[pr.pair_id] = pr.score;
  }
}

// ---- 工具函数 ----
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// 用阈值判保留：score >= thr → relevant（保留）
function judge(score, thr) {
  return score >= thr;
}

function evaluate(scores, labels, thr, isLogit = false) {
  const norm = isLogit ? (s) => sigmoid(s) : (s) => s;
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < scores.length; i++) {
    const pred = judge(norm(scores[i]), thr);
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

function separationMargin(scores, labels, isLogit = false) {
  const norm = isLogit ? sigmoid : (s) => s;
  const pos = [], neg = [];
  for (let i = 0; i < scores.length; i++) {
    (labels[i] === "relevant" ? pos : neg).push(norm(scores[i]));
  }
  const minPos = Math.min(...pos);
  const maxNeg = Math.max(...neg);
  return { minPos, maxNeg, margin: minPos - maxNeg };
}

// ---- 方案 A：mem0 score（三轮取均值）----
const pairsA = [], labelsA = [], scoresA = [], volatilityA = [];
for (const p of pairs) {
  const s = scoreA[p.pair_id].filter((x) => x !== null);
  if (s.length === 0) continue;
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const vol = Math.max(...s) - Math.min(...s);
  pairsA.push(p.pair_id);
  labelsA.push(p.label);
  scoresA.push(mean);
  volatilityA.push(vol);
}

// ---- 方案 B：cross-encoder logit（sigmoid 归一化）----
const pairsB = [], labelsB = [], scoresB = [];
for (const p of pairs) {
  if (scoreB[p.pair_id] === undefined) continue;
  pairsB.push(p.pair_id);
  labelsB.push(p.label);
  scoresB.push(scoreB[p.pair_id]); // 存 logit，评估时 sigmoid
}

// ---- 网格搜索最优阈值 ----
function gridSearch(scores, labels, isLogit) {
  const norm = isLogit ? sigmoid : (s) => s;
  const normScores = scores.map(norm);
  let best = null;
  const thresholds = [];
  for (let t = 0; t <= 1.001; t += 0.01) thresholds.push(t);
  for (const thr of thresholds) {
    const m = evaluate(normScores, labels, thr, false); // normScores 已归一化
    // 关键：先看分离边际，再看 F1（R3 教训：F1 高可能是阈值选在重叠区假象）
    if (!best || m.f1 > best.f1) best = { thr, ...m };
  }
  return best;
}

const resultA = {
  scheme: "A (mem0 score)",
  sample_pairs: pairsA.length,
  separation: separationMargin(scoresA, labelsA, false),
  volatility: { max: Math.max(...volatilityA), pairs_over_0_1: volatilityA.filter((v) => v > 0.1).length },
  per_pair: pairsA.map((id, i) => ({ pair_id: id, label: labelsA[i], score: Number(scoresA[i].toFixed(4)), vol: Number(volatilityA[i].toFixed(4)) })),
  best_grid: gridSearch(scoresA, labelsA, false),
};

const resultB = {
  scheme: "B (cross-encoder sigmoid)",
  sample_pairs: pairsB.length,
  separation: separationMargin(scoresB, labelsB, true),
  volatility: { note: "cross-encoder 确定性推理，单轮；无波动概念" },
  per_pair: pairsB.map((id, i) => ({ pair_id: id, label: labelsB[i], logit: Number(scoresB[i].toFixed(4)), sigmoid: Number(sigmoid(scoresB[i]).toFixed(4)) })),
  best_grid: gridSearch(scoresB, labelsB, true),
};

// ---- 关键记忆独立门（7 个正向关键候选对）----
const keyPairs = pairs.filter((p) => p.is_key && p.label === "relevant");
const keyGateA = keyPairs.map((p) => {
  const s = scoreA[p.pair_id].filter((x) => x !== null);
  const mean = s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
  const passed = mean !== null && mean >= (resultA.best_grid?.thr ?? 0.35);
  return { pair_id: p.pair_id, key_id: p.key_id, memory: p.memory, scoreA: mean, passed_at_best_thr: passed };
});
const keyGateB = keyPairs.map((p) => {
  const logit = scoreB[p.pair_id];
  const s = logit !== undefined ? sigmoid(logit) : null;
  const passed = s !== null && s >= (resultB.best_grid?.thr ?? 0.5);
  return { pair_id: p.pair_id, key_id: p.key_id, memory: p.memory, logit, sigmoid: s, passed_at_best_thr: passed };
});

const report = {
  generated_at: nowIso(),
  calibration_pairs: pairs.length,
  scheme_a: resultA,
  scheme_b: resultB,
  key_memory_gate: {
    rule: definition.key_memory_gate_rule,
    positive_key_pairs: keyPairs.length,
    scheme_a: keyGateA,
    scheme_b: keyGateB,
  },
  stop_criteria: {
    scheme_a: {
      margin_ok: resultA.separation.margin > 0.1,
      margin: resultA.separation.margin,
      volatility_max: resultA.volatility.max,
      volatility_ok: resultA.volatility.max <= 0.1,
    },
    scheme_b: {
      margin_ok: resultB.separation.margin > 0.1,
      margin: resultB.separation.margin,
    },
  },
};

fs.writeFileSync(path.join(CAL_DIR, "calibration-result.json"), JSON.stringify(report, null, 2), "utf8");

console.log("=== 方案 A（mem0 score）===");
console.log("分离边际 = " + resultA.separation.margin.toFixed(4) + "（最低正例 " + resultA.separation.minPos.toFixed(4) + " − 最高负例 " + resultA.separation.maxNeg.toFixed(4) + "）");
console.log("波动 max = " + resultA.volatility.max.toFixed(4));
console.log("最优阈值 = " + resultA.best_grid.thr + " → F1 = " + resultA.best_grid.f1.toFixed(4) + "（P=" + resultA.best_grid.precision.toFixed(4) + " R=" + resultA.best_grid.recall.toFixed(4) + "）");
console.log("停止判据：边际>0.1? " + (resultA.separation.margin > 0.1) + " | 波动≤0.1? " + (resultA.volatility.max <= 0.1));
console.log("");
console.log("=== 方案 B（cross-encoder sigmoid）===");
console.log("分离边际 = " + resultB.separation.margin.toFixed(4) + "（最低正例 " + resultB.separation.minPos.toFixed(4) + " − 最高负例 " + resultB.separation.maxNeg.toFixed(4) + "）");
console.log("最优阈值 = " + resultB.best_grid.thr + " → F1 = " + resultB.best_grid.f1.toFixed(4) + "（P=" + resultB.best_grid.precision.toFixed(4) + " R=" + resultB.best_grid.recall.toFixed(4) + "）");
console.log("停止判据：边际>0.1? " + (resultB.separation.margin > 0.1));
console.log("");
console.log("=== 关键记忆独立门 ===");
console.log("方案 A 通过情况：" + keyGateA.map((k) => `${k.pair_id}(${k.passed_at_best_thr ? "PASS" : "FAIL"})`).join(" "));
console.log("方案 B 通过情况：" + keyGateB.map((k) => `${k.pair_id}(${k.passed_at_best_thr ? "PASS" : "FAIL"})`).join(" "));
console.log("");
console.log("结果已落盘 data/calibration/calibration-result.json");
