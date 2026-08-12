// ============================================================
// S7 seed-holdout：按冻结定义写入 holdout 合成种子（零外发路径）
// 为什么不用 REST POST /memories：main.py 固定走 LLM 抽取（api.deepseek.com，
//   非 loopback）→ 违反 DRAFT §5.1/验收 8「零非本机网络调用」。
// 替代路径：docker exec 容器内 mem0 SDK add(..., infer=False)——
//   mem0 SDK 签名含 infer: bool = True；infer=False 时不调用 LLM 抽取，
//   直接把文本存为记忆（本地 fastembed embedding + Qdrant upsert，零外发）。
// 证据：main.py add_memory 未暴露 infer；docker exec 验证 Memory.add 签名含 infer。
// 输出：data/holdout/seeds.json（userId + 种子文本 + candidate id）
// ============================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { DATA_DIR, nowIso } from "./config.mjs";

const HOLD = path.join(DATA_DIR, "..", "holdout-definition.json");
const definition = JSON.parse(fs.readFileSync(HOLD, "utf8"));

// 校验冻结哈希（与 holdout-freeze.md 一致；防止读入被修改版本）
const raw = fs.readFileSync(HOLD);
const hash = crypto.createHash("sha256").update(raw).digest("hex");
const FROZEN_HASH = "307d266374f850e3abc282182e15b9f7c398f5417de4bd7326896cbea1ab0336";
if (hash !== FROZEN_HASH) {
  console.error(`STOP: holdout-definition.json 哈希 ${hash} 与冻结记录不一致（期望 ${FROZEN_HASH}）——冻结对象被修改，中止`);
  process.exit(2);
}

// 生成评测专用 user
const rand = () => Math.random().toString(36).slice(2, 6);
const plan = definition.scenarios.map((s) => ({
  id: s.id,
  userId: `eval-spike-${s.id.toLowerCase()}-${rand()}`,
  seeds: s.seed_memories.map((text, i) => ({ index: i, text })),
}));

// 容器内 python 代码（infer=False 直存；stdin 传 JSON，stdout 回传结果）
const PY_CODE = `
import json, sys
sys.path.insert(0, '/app')
from main import _build_config
from mem0 import Memory
m = Memory.from_config(_build_config())
data = json.load(sys.stdin)
out = []
for item in data['seeds']:
    res = m.add(item['text'], user_id=item['user_id'], infer=False)
    results = (res.get('results') or []) if isinstance(res, dict) else (res or [])
    out.append({'user_id': item['user_id'], 'seed_index': item['index'], 'text': item['text'], 'added': results})
print('SEED_JSON:' + json.dumps(out, ensure_ascii=False))
`;

const seeds = [];
for (const sc of plan) {
  const input = { seeds: sc.seeds.map((s) => ({ index: s.index, text: s.text, user_id: sc.userId })) };
  let out;
  try {
    out = execFileSync(
      "docker", ["exec", "-i", "v2-mem0-server", "python", "-c", PY_CODE],
      { input: JSON.stringify(input), encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (e) {
    console.error(`seed 写入失败（场景 ${sc.id}）：${e.stderr?.slice(0, 500) ?? e.message}`);
    process.exit(1);
  }
  const line = out.split("\n").find((l) => l.startsWith("SEED_JSON:"));
  if (!line) {
    console.error(`未找到容器回传 JSON（场景 ${sc.id}）：${out.slice(0, 300)}`);
    process.exit(1);
  }
  const added = JSON.parse(line.slice("SEED_JSON:".length));
  for (const a of added) {
    seeds.push({
      scenario: sc.id,
      userId: a.user_id,
      seedIndex: a.seed_index,
      text: a.text,
      memoryId: a.added?.[0]?.id ?? null,
      addedCount: a.added?.length ?? 0,
    });
    console.log(`[${sc.id}] user=${a.user_id} seed#${a.seed_index} added=${a.added?.length ?? 0} id=${a.added?.[0]?.id ?? "n/a"}`);
  }
}

const outFile = path.join(DATA_DIR, "holdout", "seeds.json");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ generated_at: nowIso(), seeds }, null, 2), "utf8");
console.log(`种子写入完成：${seeds.length} 条 → ${outFile}`);
