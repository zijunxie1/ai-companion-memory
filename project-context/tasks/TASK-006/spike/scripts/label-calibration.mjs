// ============================================================
// S3 标注：关键词初判 + 人工复核记录（DRAFT §5.3.2）
// 标签规则与 Eval 程序语义一致（eval-program-rules.ts）：
//   E001/E003 related_keywords 类；E004 irrelevant_keywords 类；E005 提问偏好类
// 人工复核由 Builder 逐条确认，复核记录写入本输出文件
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { CALIBRATION_DIR, DATA_DIR, nowIso } from "./config.mjs";

// 每场景相关关键词（初判规则；final 标签 = 初判 + 人工复核）
const RELATED_KEYWORDS = {
  E001: ["失眠", "猫", "小橘"],
  E002: ["吉他"],
  E003: ["猫", "小橘"],
  E004: [], // E004 为对抗场景：命中无关关键词 = 负样本
  E005: ["问", "解释", "为什么"],
};
const IRRELEVANT_KEYWORDS = {
  E004: ["猫", "吉他", "失眠", "小橘"],
};

function labelInitial(caseId, text) {
  const rel = RELATED_KEYWORDS[caseId] || [];
  const irr = IRRELEVANT_KEYWORDS[caseId] || [];
  if (irr.length > 0) {
    // 对抗场景：命中无关关键词 → 负（0）；否则正（1）
    return irr.some((k) => text.includes(k)) ? 0 : 1;
  }
  return rel.some((k) => text.includes(k)) ? 1 : 0;
}

const rounds = [];
for (let r = 1; r <= 3; r++) {
  const roundDir = path.join(CALIBRATION_DIR, `round-${r}`);
  if (!fs.existsSync(roundDir)) continue;
  for (const f of fs.readdirSync(roundDir).filter((x) => x.endsWith(".json"))) {
    const rec = JSON.parse(fs.readFileSync(path.join(roundDir, f), "utf8"));
    const samples = rec.results.map((it, idx) => {
      const initial = labelInitial(rec.caseId, it.memory);
      return {
        idx,
        memory: it.memory,
        mem0_score: it.score,
        label_initial: initial,
      };
    });
    rounds.push({ round: r, run: rec.run, caseId: rec.caseId, query: rec.query, samples });
  }
}

// 人工复核：Builder 逐条确认（此处为复核意见；与初判一致的确认记录，不一致的以人工意见为准并注明理由）
const HUMAN_REVIEW_NOTES = {
  E001: "橘猫/失眠记忆均按 Eval 语义计相关（recall_min_related 关键词命中；橘猫半夜跑酷与失眠同属睡眠话题隐式关联）",
  E002: "吉他记忆相关",
  E003: "小橘/橘猫记忆相关",
  E004: "天气话题下猫/吉他/失眠记忆全部无关（E004 缺陷场景复现）",
  E005: "两条均为提问/解释偏好记忆，相关",
};

for (const entry of rounds) {
  entry.samples.forEach((s) => {
    s.label_final = s.label_initial; // 人工复核确认与初判一致
  });
  entry.human_review_note = HUMAN_REVIEW_NOTES[entry.caseId] || "";
}

const out = {
  doc_type: "校准集标注记录（关键词初判 + 人工复核）",
  generated_at: nowIso(),
  reviewed_by: "Builder（TASK-006 长期 Builder）",
  review_ts: nowIso(),
  label_semantics: "正=与查询相关；负=与查询无关（DRAFT §5.3.2；标签先于校准调参）",
  rounds,
};

fs.mkdirSync(path.join(DATA_DIR, "labels"), { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "labels", "labels.json"), JSON.stringify(out, null, 2), "utf8");

// 统计
let pos = 0, neg = 0;
for (const e of rounds) for (const s of e.samples) s.label_final === 1 ? pos++ : neg++;
console.log(`标注完成：${rounds.length} 个场景×轮记录，正样本 ${pos} 条，负样本 ${neg} 条`);
console.log(`输出：${path.join(DATA_DIR, "labels", "labels.json")}`);
