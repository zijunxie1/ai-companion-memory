// ============================================================
// S7 run-holdout：冻结机制对冻结 holdout 一次性运行（步骤④）
// 只运行一次；运行后禁止继续调参（DRAFT §5.3 步骤④）
// 机制 = theme-system.json（冻结哈希校验）+ w1=0.8/w2=0.2/阈值=0.05（冻结参数）
// 输出：data/holdout/run.json（每场景 + 合并 F1/边际，原始样本）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, AUDIT_DIR, nowIso } from "./config.mjs";
import { mem0Search } from "./lib/mem0-api.mjs";
import { installFetchAudit, ensureAuditFile } from "./lib/fetch-audit.mjs";
import { loadThemeSystem, themeScore, classify } from "./lib/theme-engine.mjs";
import { buildCorpusContext } from "./lib/features.mjs";
import { evaluateBinary, separationMargin } from "./lib/metrics.mjs";

// 冻结参数（mechanism-freeze.md）
const FROZEN = { w1: 0.8, w2: 0.2, threshold: 0.05, themeHash: "bd4cc70c84dca5a578f25aef6460d213a6b8fe9e4c3d414fab7780169b960a7b" };

// 冻结对象读取 + 哈希校验
const themeJson = path.join(DATA_DIR, "..", "theme-system.json");
const themeRaw = fs.readFileSync(themeJson);
if (crypto.createHash("sha256").update(themeRaw).digest("hex") !== FROZEN.themeHash) {
  console.error("STOP: theme-system.json 哈希与冻结记录不一致——机制被修改，中止");
  process.exit(2);
}
const theme = loadThemeSystem(themeJson);

const holdoutJson = path.join(DATA_DIR, "..", "holdout-definition.json");
const holdoutRaw = fs.readFileSync(holdoutJson);
const HOLD_HASH = "307d266374f850e3abc282182e15b9f7c398f5417de4bd7326896cbea1ab0336";
if (crypto.createHash("sha256").update(holdoutRaw).digest("hex") !== HOLD_HASH) {
  console.error("STOP: holdout-definition.json 哈希与冻结记录不一致——冻结对象被修改，中止");
  process.exit(2);
}
const definition = JSON.parse(holdoutRaw);

// 种子注册表（seed-holdout 产物）
const seeds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "holdout", "seeds.json"), "utf8")).seeds;

// 校准集语料（与校准一致的 IDF 上下文——机制冻结定义的一部分）
const labels = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "labels", "labels.json"), "utf8"));
const calibDocs = [];
for (const e of labels.rounds) for (const s of e.samples) calibDocs.push({ query: e.query, memory: s.memory });
const ctx = buildCorpusContext(calibDocs);

// 激活网络审计
const auditFile = ensureAuditFile(path.join(AUDIT_DIR, `network-holdout-${Date.now()}.log`));
installFetchAudit(auditFile);

// 种子 → 标签映射（按 userId + 文本精确匹配；infer=False 直存保证文本一致）
const userIdByScenario = {};
for (const s of seeds) {
  userIdByScenario[s.scenario] = s.userId;
}
const labelByScenario = {};
for (const sc of definition.scenarios) {
  const map = {};
  sc.seed_memories.forEach((text, i) => {
    map[text] = sc.expected_labels.relevant.includes(i) ? 1 : 0;
  });
  labelByScenario[sc.id] = map;
}

// 一次性运行
const scenarioResults = [];
for (const sc of definition.scenarios) {
  const userId = userIdByScenario[sc.id];
  const search = await mem0Search(userId, sc.query, 5);
  const samples = search.items.map((it) => {
    const label = labelByScenario[sc.id][it.memory] ?? null; // 未匹配 → null（异常上报）
    const t = themeScore(sc.query, it.memory, ctx, FROZEN.w1, FROZEN.w2);
    return {
      memory: it.memory,
      mem0_score: it.score,
      label,
      score: t.score,
      comp: t.comp,
      lex: t.lex,
      qCategory: t.qCategory,
      mCategory: t.mCategory,
      predicted: t.score >= FROZEN.threshold ? 1 : 0,
    };
  });
  const unknown = samples.filter((s) => s.label === null);
  const labeled = samples.filter((s) => s.label !== null);
  const ev = labeled.length > 0 ? evaluateBinary(labeled.map((s) => ({ score: s.score, label: s.label })), FROZEN.threshold) : null;
  const margin = labeled.length > 0 ? separationMargin(labeled.map((s) => ({ score: s.score, label: s.label }))) : null;
  scenarioResults.push({
    id: sc.id,
    type: sc.type,
    userId,
    query: sc.query,
    retrieved: search.count,
    samples,
    unknown_count: unknown.length,
    f1: ev?.f1 ?? null,
    precision: ev?.precision ?? null,
    recall: ev?.recall ?? null,
    margin,
    passes: ev?.f1 >= 0.9 && (margin ?? -1) > 0.1,
  });
  console.log(`[${sc.id}] retrieved=${search.count} F1=${ev?.f1?.toFixed(4) ?? "n/a"} 边际=${margin?.toFixed(4) ?? "n/a"} ${sc.passes ? "PASS" : sc.id ? (ev ? "FAIL" : "n/a") : ""}`);
  for (const s of samples) {
    console.log(`   label=${s.label} score=${s.score.toFixed(4)} (comp=${s.comp} lex=${s.lex.toFixed(3)}) [${s.qCategory}->${s.mCategory}] pred=${s.predicted} | ${s.memory.slice(0, 40)}`);
  }
}

// 合并评估（所有已标注样本）
const allLabeled = scenarioResults.flatMap((s) => s.samples.filter((x) => x.label !== null).map((x) => ({ score: x.score, label: x.label })));
const merged = allLabeled.length > 0 ? evaluateBinary(allLabeled, FROZEN.threshold) : null;
const mergedMargin = allLabeled.length > 0 ? separationMargin(allLabeled) : null;

const output = {
  doc_type: "holdout 一次性运行（步骤④）",
  frozen_mechanism: { candidate: "candidate-2", w1: FROZEN.w1, w2: FROZEN.w2, threshold: FROZEN.threshold, theme_hash: FROZEN.themeHash },
  holdout_hash: HOLD_HASH,
  run_timestamp: nowIso(),
  audit_log: auditFile,
  scenario_results: scenarioResults,
  merged: merged ? { ...merged, margin: mergedMargin, passes: merged.f1 >= 0.9 && (mergedMargin ?? -1) > 0.1 } : null,
  note: "一次性运行，运行后无任何调参；若 holdout 不达标不得回头调参重跑，直接标记候选失败并如实记录（DRAFT §5.3 步骤④）",
};

fs.mkdirSync(path.join(DATA_DIR, "holdout"), { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "holdout", "run.json"), JSON.stringify(output, null, 2), "utf8");
console.log(`合并：F1=${merged?.f1?.toFixed(4) ?? "n/a"} 边际=${mergedMargin?.toFixed(4) ?? "n/a"} 通过=${merged?.f1 >= 0.9 && (mergedMargin ?? -1) > 0.1 ? "是" : "否"}`);
console.log(`输出：${path.join(DATA_DIR, "holdout", "run.json")}`);
