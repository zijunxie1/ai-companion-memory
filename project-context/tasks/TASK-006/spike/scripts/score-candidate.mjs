// ============================================================
// S4 候选 1：本地词法/统计二次相关性 Gate 评分 + 校准评估
// 分数 = Σ wi·fi（0-1 连续；默认等权），阈值在校准集网格校准
// 输出：data/scores/candidate1.json（含 ρ 非冗余诊断、逐轮与合并 F1/边际）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, nowIso } from "./config.mjs";
import { computeFeatures, buildCorpusContext, featureNames } from "./lib/features.mjs";
import { evaluateBinary, separationMargin, spearman } from "./lib/metrics.mjs";

const labels = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "labels", "labels.json"), "utf8"));

// 展平样本（query + memory + mem0_score + label_final + round/caseId）
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

// 语料上下文（IDF 基于所有样本的 memory 文本 + query）
const ctx = buildCorpusContext(samples.map((s) => ({ query: s.query, memory: s.memory })));

// 计算特征
for (const s of samples) {
  s.features = computeFeatures(s.query, s.memory, ctx);
}

// 候选 1 机制版本：v1 等权 + v2 主特征权重网格（第二轮校准；计划 §5.4）
const FNAMES = featureNames();
function buildWeights(main, wMain) {
  const w = {};
  for (const n of FNAMES) w[n] = 0;
  w[main] = wMain;
  const rest = (1 - wMain) / (FNAMES.length - 1);
  for (const n of FNAMES) if (n !== main) w[n] = rest;
  return w;
}
const MECHANISMS = [{ version: "v1-equal-weights", weights: { f1: 0.2, f2: 0.2, f3: 0.2, f4: 0.2, f5: 0.2 } }];
for (const main of FNAMES) {
  for (const wMain of [0.3, 0.5, 0.7]) {
    MECHANISMS.push({ version: `v2-grid-main-${main}-w${wMain}`, weights: buildWeights(main, wMain) });
  }
}

function scoreWithWeights(s, w) {
  const f = s.features;
  return FNAMES.reduce((acc, n) => acc + w[n] * f[n], 0);
}

// 阈值校准：网格 0.05..0.95（步长 0.05），选择满足 F1>=0.9 且分离边际最大者
const thresholds = [];
for (let t = 0.05; t <= 0.95; t += 0.05) thresholds.push(Number(t.toFixed(2)));

function evaluateAll(samples, threshold) {
  const evalObj = evaluateBinary(samples, threshold);
  const margin = separationMargin(samples);
  return { threshold, ...evalObj, margin };
}

function calibrate(samples) {
  return thresholds
    .map((t) => evaluateAll(samples, t))
    .sort((a, b) => {
      // 优先 F1 >= 0.9，再按边际降序；都不满足按 F1 降序
      const aOk = a.f1 >= 0.9 ? 1 : 0;
      const bOk = b.f1 >= 0.9 ? 1 : 0;
      if (aOk !== bOk) return bOk - aOk;
      return (b.margin ?? -1) - (a.margin ?? -1);
    })[0];
}

// 对每个机制版本评分 + 校准
const mechanismResults = [];
for (const mech of MECHANISMS) {
  for (const s of samples) s.score = scoreWithWeights(s, mech.weights);
  const merged = calibrate(samples);
  const perRound = [];
  for (let r = 1; r <= 3; r++) {
    const rs = samples.filter((s) => s.round === r);
    perRound.push({ round: r, n: rs.length, ...evaluateAll(rs, merged.threshold) });
  }
  mechanismResults.push({ version: mech.version, weights: mech.weights, merged, per_round: perRound });
}

// ρ 诊断用 v1 等权分数
for (const s of samples) s.score = scoreWithWeights(s, MECHANISMS[0].weights);
const rho = spearman(samples.map((s) => s.mem0Score), samples.map((s) => s.score));

// mem0 原始分数作为对照（阈值 0.35 产品口径 + 校准阈值口径）
const mem0Samples = samples.map((s) => ({ score: s.mem0Score, label: s.label }));
const mem0At035 = evaluateAll(mem0Samples, 0.35);
const mem0Best = thresholds
  .map((t) => ({ t, e: evaluateAll(mem0Samples, t) }))
  .sort((a, b) => (b.e.f1 >= 0.9 ? 1 : 0) - (a.e.f1 >= 0.9 ? 1 : 0) || (b.e.margin ?? -1) - (a.e.margin ?? -1))[0];

// 评估结论：存在 F1>=0.9 且边际>0.1 的版本吗？
const passed = mechanismResults.filter((m) => m.merged.f1 >= 0.9 && (m.merged.margin ?? -1) > 0.1);
const bestMech = [...mechanismResults].sort((a, b) => (b.merged.margin ?? -1) - (a.merged.margin ?? -1))[0];

const output = {
  doc_type: "候选 1 校准评估（S4；两轮校准：v1 等权 + v2 权重网格）",
  candidate: "candidate-1",
  mechanism: "本地词法/统计二次相关性 Gate（特征加权 0-1 连续分数；权重/阈值均在校准集上确定）",
  features: featureNames(),
  generated_at: nowIso(),
  sample_count: samples.length,
  rho_diagnostic: {
    spearman_rho: rho,
    verdict: rho >= 0.9 ? "降级为冗余对照（不作为正式候选）" : "非冗余（ρ<0.9）；仍须通过其余全部质量/延迟/资源/泛化门",
    note: "DRAFT §5.2：ρ 仅诊断信号冗余度，不单独证明有效性",
  },
  calibration_attempts: mechanismResults.map((m) => ({
    version: m.version,
    weights: m.weights,
    merged: m.merged,
    per_round: m.per_round,
    passes_quality: m.merged.f1 >= 0.9 && (m.merged.margin ?? -1) > 0.1,
  })),
  calibration_verdict: passed.length > 0
    ? { passed: true, versions: passed.map((m) => m.version) }
    : { passed: false, note: "所有机制版本均未同时满足 F1>=0.9 且分离边际>0.1 → 校准集不达标，候选 1 标记失败（记录失败，继续候选 2，不停止）" },
  best_margin_version: { version: bestMech.version, margin: bestMech.merged.margin, f1: bestMech.merged.f1 },
  mem0_reference: {
    at_product_threshold_035: mem0At035,
    best_calibrated: { threshold: mem0Best.t, eval: mem0Best.e },
    note: "mem0 原始分数对照（分离边际对比 = 非冗余信号增益；mem0 本身边际为负 → 简单阈值方案证伪的历史事实复现）",
  },
  score_distribution_v1: {
    positive: { min: Math.min(...samples.filter((s) => s.label === 1).map((s) => s.score)), max: Math.max(...samples.filter((s) => s.label === 1).map((s) => s.score)) },
    negative: { min: Math.min(...samples.filter((s) => s.label === 0).map((s) => s.score)), max: Math.max(...samples.filter((s) => s.label === 0).map((s) => s.score)) },
  },
};

fs.mkdirSync(path.join(DATA_DIR, "scores"), { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "scores", "candidate1.json"), JSON.stringify(output, null, 2), "utf8");

console.log(`候选 1：样本 ${samples.length}（正 ${samples.filter((s) => s.label === 1).length} / 负 ${samples.filter((s) => s.label === 0).length}）`);
console.log(`ρ(mem0, c1) = ${rho?.toFixed(4)}（${rho >= 0.9 ? "≥0.9 → 冗余对照" : "<0.9 → 非冗余"}）`);
for (const m of mechanismResults) {
  console.log(`${m.version}: 阈值=${m.merged.threshold} F1=${m.merged.f1.toFixed(4)} 边际=${m.merged.margin?.toFixed(4)} 通过=${m.merged.f1 >= 0.9 && (m.merged.margin ?? -1) > 0.1 ? "是" : "否"}`);
}
console.log(`mem0@0.35 对照：F1=${mem0At035.f1.toFixed(4)} 边际=${mem0At035.margin?.toFixed(4)}`);
console.log(`mem0 最佳校准：阈值 ${mem0Best.t} F1=${mem0Best.e.f1.toFixed(4)} 边际=${mem0Best.e.margin?.toFixed(4)}`);
console.log(`候选 1 校准结论：${passed.length > 0 ? "达标" : "不达标（边际未过 0.1）→ 记录失败，继续候选 2"}`);
