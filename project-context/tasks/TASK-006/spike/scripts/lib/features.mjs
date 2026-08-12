// ============================================================
// 词法/统计特征库（候选 1 独立信号 + 候选 2 lex 组件）
// 纯文本表面统计；不调用 mem0、不复用向量相似度、不依赖 bge
// ============================================================

// 极小通用停用字表（仅用于 f5 实义重叠；不包含领域词）
const STOPWORDS = new Set(
  "的了是在我你他她它们吗呢啊吧很都也就有和与及这那一个什么最近用户自己经常开始喜欢".split("")
);

function chars(text) {
  return Array.from(String(text).replace(/\s+/g, ""));
}

function charSet(text) {
  return new Set(chars(text));
}

function bigrams(text) {
  const cs = chars(text);
  const set = new Set();
  for (let i = 0; i < cs.length - 1; i++) set.add(cs[i] + cs[i + 1]);
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function overlapRatio(a, b) {
  // 交 / min(|a|,|b|)（共现占比）
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / Math.min(a.size, b.size);
}

/**
 * BM25 类统计评分（词项 = 字符 bigram）
 * @param {string} q 查询
 * @param {string} m 记忆
 * @param {Map<string,number>} idf 词项 idf 表（语料级）
 * @param {number} avgDl 语料平均长度
 */
function bm25(q, m, idf, avgDl) {
  const qBigrams = bigrams(q);
  const mBigrams = bigrams(m);
  const dl = mBigrams.size;
  if (qBigrams.size === 0 || dl === 0) return 0;
  const k1 = 1.5, b = 0.75;
  let score = 0;
  for (const t of qBigrams) {
    const idfT = idf.get(t) ?? 0;
    if (idfT <= 0) continue;
    // tf 在 m 中
    let tf = 0;
    for (const mt of mBigrams) if (mt === t) tf++;
    const denom = tf + k1 * (1 - b + b * (dl / (avgDl || 1)));
    score += idfT * ((tf * (k1 + 1)) / (denom || 1));
  }
  return score;
}

/**
 * 计算特征向量（0-1 归一）
 * @param {string} q 查询
 * @param {string} m 记忆
 * @param {{idf: Map, avgDl: number, bm25Max: number}} ctx 语料上下文
 */
export function computeFeatures(q, m, ctx) {
  const qc = charSet(q);
  const mc = charSet(m);
  const qb = bigrams(q);
  const mb = bigrams(m);

  const f1 = jaccard(qb, mb);                       // 字符 bigram Jaccard
  const f2 = overlapRatio(qc, mc);                  // 单字共现占比
  const f3 = ctx.bm25Max > 0 ? bm25(q, m, ctx.idf, ctx.avgDl) / ctx.bm25Max : 0; // BM25 归一
  const lenRatio = Math.min(qc.size, mc.size) / Math.max(qc.size, mc.size || 1); // 长度比
  const f4 = lenRatio;
  // 停用词过滤后实义单字重叠率（交 / min 长度，去停用字）
  const qSw = new Set([...qc].filter((c) => !STOPWORDS.has(c)));
  const mSw = new Set([...mc].filter((c) => !STOPWORDS.has(c)));
  const f5 = overlapRatio(qSw, mSw);

  return { f1, f2, f3, f4, f5 };
}

/**
 * 构建语料上下文（IDF 表 + 平均长度 + BM25 最大值）
 * @param {Array<{query:string, memory:string}>} docs
 */
export function buildCorpusContext(docs) {
  const docBigrams = docs.map((d) => bigrams(d.memory));
  const N = docBigrams.length;
  const df = new Map();
  for (const db of docBigrams) {
    for (const t of db) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map();
  for (const [t, d] of df) {
    idf.set(t, Math.log((N - d + 0.5) / (d + 0.5) + 1));
  }
  const avgDl =
    docBigrams.reduce((s, db) => s + db.size, 0) / (N || 1);
  // BM25 最大值（用于归一）
  let bm25Max = 0;
  for (const d of docs) {
    const v = bm25(d.query, d.memory, idf, avgDl);
    if (v > bm25Max) bm25Max = v;
  }
  return { idf, avgDl, bm25Max };
}

export function featureNames() {
  return ["f1", "f2", "f3", "f4", "f5"];
}
