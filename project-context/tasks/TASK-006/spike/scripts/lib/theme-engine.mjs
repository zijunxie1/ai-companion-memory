// ============================================================
// 候选 2 主题引擎：分类 + 相容矩阵 + score = w1*comp + w2*lex
// 主题体系数据源：spike/theme-system.json（冻结对象）
// lex 与候选 1 同源（features.mjs f1—f5 均值，独立于 mem0）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { computeFeatures } from "./features.mjs";

let theme = null;
export function loadThemeSystem(jsonPath) {
  theme = JSON.parse(fs.readFileSync(path.resolve(jsonPath), "utf8"));
  return theme;
}

/** 主题分类：关键词命中计数取最高；无命中 → other */
export function classify(text) {
  if (!theme) throw new Error("theme-system 未加载");
  let best = "other";
  let bestHits = 0;
  for (const cat of theme.categories) {
    if (cat.id === "other") continue;
    const hits = cat.keywords.filter((k) => text.includes(k)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = cat.id;
    }
  }
  return { category: best, hits: bestHits };
}

/** 类别相容度（对称矩阵） */
export function compat(c1, c2) {
  if (!theme) throw new Error("theme-system 未加载");
  return theme.compat_matrix[c1]?.[c2] ?? 0;
}

/** 词法重叠 lex ∈ [0,1]（候选 1 同源特征均值；需语料上下文） */
export function lexicalOverlap(q, m, ctx) {
  const f = computeFeatures(q, m, ctx);
  return (f.f1 + f.f2 + f.f3 + f.f4 + f.f5) / 5;
}

/** 完整评分 */
export function themeScore(q, m, ctx, w1, w2) {
  const cq = classify(q);
  const cm = classify(m);
  const comp = compat(cq.category, cm.category);
  const lex = lexicalOverlap(q, m, ctx);
  return { comp, lex, score: w1 * comp + w2 * lex, qCategory: cq.category, mCategory: cm.category };
}

export { theme };
