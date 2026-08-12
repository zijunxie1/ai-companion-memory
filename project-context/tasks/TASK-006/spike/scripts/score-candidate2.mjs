// ============================================================
// S5 候选 2：本地主题类别 Gate 校准（步骤②）
// score = w1·comp + w2·lex；w1/w2 与阈值在校准集网格调参；矩阵为 theme-system.json 初始版
// 输出：data/scores/candidate2.json（含逐轮与合并 F1/边际、参数选择）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, nowIso } from "./config.mjs";
import { buildCorpusContext } from "./lib/features.mjs";
import { loadThemeSystem, themeScore, classify } from "./lib/theme-engine.mjs";
import { evaluateBinary, separationMargin } from "./lib/metrics.mjs";

const labels = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "labels", "labels.json"), "utf8"));
const theme = loadThemeSystem(path.join(DATA_DIR, "..", "theme-system.json"));

const samples = [];
for (const entry of labels.rounds) {
  for (const s of entry.samples) {
    samples.push({
      round: entry.round,
      caseId: entry.caseId,
      query: entry.query,
      memory: s.memory,
      mem0Score: s.mem0_score,
      label: s.label_final,
    });
  }
}

const ctx = buildCorpusContext(samples.map((s) => ({ query: s.query, memory: s.memory })));

// 分类快照（诊断用）
for (const s of samples) {
  s.qCat = classify(s.query).category;
  s.mCat = classify(s.memory).category;
}

// w1/w2 网格（校准阶段允许调整）+ 阈值网格
const WEIGHT_GRID = [
  { w1: 0.5, w2: 0.5 },
  { w1: 0.6, w2: 0.4 },
  { w1: 0.7, w2: 0.3 },
  { w1: 0.8, w2: 0.2 },
];
const THRESHOLDS = [];
for (let t = 0.05; t <= 0.95; t += 0.05) THRESHOLDS.push(Number(t.toFixed(2)));

function evaluateAll(samples, threshold) {
  const evalObj = evaluateBinary(samples, threshold);
  const margin = separationMargin(samples);
  return { threshold, ...evalObj, margin };
}

function calibrate(samples) {
  return THRESHOLDS.map((t) => evaluateAll(samples, t))
    .sort((a, b) => {
      const aOk = a.f1 >= 0.9 ? 1 : 0;
      const bOk = b.f1 >= 0.9 ? 1 : 0;
      if (aOk !== bOk) return bOk - aOk;
      return (b.margin ?? -1) - (a.margin ?? -1);
    })[0];
}

// 对每个权重组合评分 + 校准
const attempts = [];
for (const w of WEIGHT_GRID) {
  for (const s of samples) {
    const r = themeScore(s.query, s.memory, ctx, w.w1, w.w2);
    s.score = r.score;
    s.comp = r.comp;
    s.lex = r.lex;
  }
  const merged = calibrate(samples);
  const perRound = [];
  for (let r = 1; r <= 3; r++) {
    const rs = samples.filter((s) => s.round === r);
    perRound.push({ round: r, n: rs.length, ...evaluateAll(rs, merged.threshold) });
  }
  attempts.push({ w1: w.w1, w2: w.w2, merged, per_round: perRound });
}

const passed = attempts.filter((a) => a.merged.f1 >= 0.9 && (a.merged.margin ?? -1) > 0.1);
const best = [...attempts].sort((a, b) => {
  const aOk = a.merged.f1 >= 0.9 && (a.merged.margin ?? -1) > 0.1 ? 1 : 0;
  const bOk = b.merged.f1 >= 0.9 && (b.merged.margin ?? -1) > 0.1 ? 1 : 0;
  if (aOk !== bOk) return bOk - aOk;
  return (b.merged.margin ?? -1) - (a.merged.margin ?? -1);
})[0];

const output = {
  doc_type: "候选 2 校准评估（S5，步骤②）",
  candidate: "candidate-2",
  mechanism: "本地主题类别 Gate：score = w1·comp + w2·lex（0-1 连续）",
  theme_system: { file: "theme-system.json", version: theme.version, basis: theme.basis },
  generated_at: nowIso(),
  sample_count: samples.length,
  weight_grid: WEIGHT_GRID,
  calibration_attempts: attempts.map((a) => ({
    w1: a.w1, w2: a.w2, merged: a.merged, per_round: a.per_round,
    passes_quality: a.merged.f1 >= 0.9 && (a.merged.margin ?? -1) > 0.1,
  })),
  best_parameters: { w1: best.w1, w2: best.w2, threshold: best.merged.threshold, merged: best.merged, per_round: best.per_round },
  calibration_verdict: passed.length > 0
    ? { passed: true, best: { w1: best.w1, w2: best.w2, threshold: best.merged.threshold, f1: best.merged.f1, margin: best.merged.margin } }
    : { passed: false, note: "所有权重组合均未同时满足 F1>=0.9 且分离边际>0.1 → 候选 2 校准不达标，标记失败（记录失败，按 DRAFT 语义处理）" },
  category_breakdown: (() => {
    const b = {};
    for (const s of samples) {
      const key = `${s.qCat}->${s.mCat}`;
      b[key] = b[key] || { n: 0, pos: 0, neg: 0 };
      b[key].n++;
      if (s.label === 1) b[key].pos++; else b[key].neg++;
    }
    return b;
  })(),
};

fs.mkdirSync(path.join(DATA_DIR, "scores"), { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "scores", "candidate2.json"), JSON.stringify(output, null, 2), "utf8");

console.log(`候选 2：样本 ${samples.length}`);
console.log(`类别分布：` + Object.entries(output.category_breakdown).map(([k, v]) => `${k}(${v.pos}p/${v.neg}n)`).join(" "));
for (const a of attempts) {
  console.log(`w1=${a.w1} w2=${a.w2}: 阈值=${a.merged.threshold} F1=${a.merged.f1.toFixed(4)} 边际=${a.merged.margin?.toFixed(4)} 通过=${a.merged.f1 >= 0.9 && (a.merged.margin ?? -1) > 0.1 ? "是" : "否"}`);
}
console.log(`候选 2 校准结论：${passed.length > 0 ? `达标（w1=${best.w1} w2=${best.w2} 阈值=${best.merged.threshold} F1=${best.merged.f1.toFixed(4)} 边际=${best.merged.margin?.toFixed(4)}）` : "不达标 → 标记失败"}`);
