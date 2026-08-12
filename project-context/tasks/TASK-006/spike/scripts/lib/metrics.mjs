// ============================================================
// 指标库：F1 / 分离边际 / Spearman ρ / 分位数（纯实现）
// 口径：DRAFT v1.2 §5.3.5（F1、分离边际）与 §6.1（P95=ceil(0.95N)）
// ============================================================

/** F1 = 2PR/(P+R) */
export function f1(precision, recall) {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

/** 二分类评估（score >= threshold → 保留/正） */
export function evaluateBinary(samples, threshold) {
  // samples: [{score, label}]
  let tp = 0, fp = 0, fn = 0;
  for (const s of samples) {
    const pred = s.score >= threshold ? 1 : 0;
    if (pred === 1 && s.label === 1) tp++;
    else if (pred === 1 && s.label === 0) fp++;
    else if (pred === 0 && s.label === 1) fn++;
  }
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  return { tp, fp, fn, precision, recall, f1: f1(precision, recall) };
}

/** 分离边际 = 最低正例分 − 最高无关分 */
export function separationMargin(samples) {
  const pos = samples.filter((s) => s.label === 1).map((s) => s.score);
  const neg = samples.filter((s) => s.label === 0).map((s) => s.score);
  if (pos.length === 0 || neg.length === 0) return null;
  return Math.min(...pos) - Math.max(...neg);
}

/** Spearman 秩相关（并列取平均秩） */
export function spearman(xs, ys) {
  const n = xs.length;
  if (n !== ys.length || n < 2) return null;
  const rank = (arr) => {
    const idx = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && idx[j + 1].v === idx[i].v) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[idx[k].i] = avg;
      i = j + 1;
    }
    return ranks;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  const mx = rx.reduce((s, v) => s + v, 0) / n;
  const my = ry.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? null : num / denom;
}

/** 分位数（升序排序后取 ceil(p*N) 位，1 索引） */
export function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return null;
  const idx = Math.min(sortedAsc.length, Math.max(1, Math.ceil(p * sortedAsc.length))) - 1;
  return sortedAsc[idx];
}
