// ============================================================
// S2 采集脚本：seed 校准候选 memory + 方案 A 三轮 mem0 检索 + 方案 B cross-encoder
// 零外发路径：
//   - seed 走容器内 mem0 SDK add(..., infer=False)（本地 embedding，不调 LLM）
//   - 方案 A 检索走 REST loopback 8100（产品同路径 mem0 search）
//   - 方案 B 走容器内 fastembed TextCrossEncoder（本地 ONNX 推理）
// 只读 calibration-only-definition.json（22 校准对）；holdout 10 对全程不读取
// ============================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  MEM0_BASE_URL,
  TOP_K,
  DATA_DIR,
  CALIBRATION_DEFINITION,
  CROSS_ENCODER_MODEL,
  nowIso,
} from "./config.mjs";

const AUDIT_DIR = path.join(DATA_DIR, "audit");
const CAL_DIR = path.join(DATA_DIR, "calibration");
fs.mkdirSync(AUDIT_DIR, { recursive: true });
fs.mkdirSync(CAL_DIR, { recursive: true });

// 访问审计记录（全程仅 loopback + 容器内本地推理）
const auditLog = [];
const auditFile = path.join(AUDIT_DIR, `network-s2-${Date.now()}.log`);
function audit(entry) {
  auditLog.push({ ts: nowIso(), ...entry });
  fs.writeFileSync(auditFile, JSON.stringify(auditLog, null, 2), "utf8");
}

// 读取派生校准文件，校验父哈希
const derivedRaw = fs.readFileSync(CALIBRATION_DEFINITION);
const derived = JSON.parse(derivedRaw.toString("utf8"));
const parentHash = derived.parent_content_hash.replace("sha256=", "");
const parentRaw = fs.readFileSync(path.join(import.meta.dirname, "..", "candidate-pool-definition.json"));
const actualParentHash = crypto.createHash("sha256").update(parentRaw).digest("hex");
if (parentHash !== actualParentHash) {
  console.error(`STOP: 父文件哈希不一致（派生记录 ${parentHash} vs 实际 ${actualParentHash}）——冻结对象被修改，中止`);
  process.exit(2);
}
audit({ event: "verify", parent_hash_ok: true, calibration_pairs: derived.pairs.length });

// 按 scenario 分组校准对
const scenes = new Map();
for (const p of derived.pairs) {
  if (!scenes.has(p.scenario)) scenes.set(p.scenario, { scenario: p.scenario, query: p.query, memories: [] });
  scenes.get(p.scenario).memories.push({ pair_id: p.pair_id, memory: p.memory, label: p.label, category: p.category });
}

// 生成评测专用 user（每场景独立）
const rand = () => Math.random().toString(36).slice(2, 8);
const sceneList = [...scenes.values()].map((s) => ({
  ...s,
  user_id: `eval-spike-r3-${s.scenario.toLowerCase()}-${rand()}`,
}));

// ---- Step 1: seed（容器内 SDK add infer=False）----
const SEED_PY = `
import json, sys
sys.path.insert(0, '/app')
from main import _build_config
from mem0 import Memory
m = Memory.from_config(_build_config())
data = json.load(sys.stdin)
out = []
for sc in data['scenes']:
    for mem in sc['memories']:
        res = m.add(mem['memory'], user_id=sc['user_id'], infer=False)
        results = (res.get('results') or []) if isinstance(res, dict) else (res or [])
        out.append({'scenario': sc['scenario'], 'pair_id': mem['pair_id'], 'user_id': sc['user_id'],
                    'memory': mem['memory'], 'added_ids': [str(r.get('id','')) for r in results]})
print('SEED_JSON:' + json.dumps(out, ensure_ascii=False))
`;
const seedInput = { scenes: sceneList.map((s) => ({ scenario: s.scenario, user_id: s.user_id, memories: s.memories.map((m) => ({ pair_id: m.pair_id, memory: m.memory })) })) };
let seedOut;
try {
  seedOut = execFileSync("docker", ["exec", "-i", "v2-mem0-server", "python", "-c", SEED_PY], {
    input: JSON.stringify(seedInput), encoding: "utf8", maxBuffer: 10 * 1024 * 1024,
  });
} catch (e) {
  console.error("seed 失败：" + (e.stderr?.slice(0, 800) ?? e.message));
  process.exit(1);
}
const seedLine = seedOut.split("\n").find((l) => l.startsWith("SEED_JSON:"));
if (!seedLine) { console.error("未找到 seed 回传 JSON：" + seedOut.slice(0, 400)); process.exit(1); }
const seeded = JSON.parse(seedLine.slice("SEED_JSON:".length));
console.log(`seed 完成：${seeded.length} 条候选 memory 写入（infer=False，零外发）`);
audit({ event: "seed", count: seeded.length, method: "docker exec mem0 SDK add(infer=False)", external: false });

// ---- Step 2: 方案 A 三轮 mem0 检索（REST loopback）----
function extractList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.memories)) return payload.memories;
  if (payload.memories && Array.isArray(payload.memories.results)) return payload.memories.results;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}
async function mem0Search(userId, query, limit = TOP_K) {
  const resp = await fetch(`${MEM0_BASE_URL}/memories/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, query, limit }),
  });
  const body = await resp.json();
  const raw = extractList(body);
  return raw.map((m) => ({
    memory: String(m.memory ?? m.content ?? ""),
    score: typeof m.score === "number" ? m.score : null,
  }));
}
audit({ event: "scheme_a_search", endpoint: `${MEM0_BASE_URL}/memories/search`, external: false, note: "3 rounds per scene" });

const schemeARounds = {};
for (let r = 1; r <= 3; r++) {
  schemeARounds[`round-${r}`] = [];
  for (const sc of sceneList) {
    const hits = await mem0Search(sc.user_id, sc.query);
    const record = { scenario: sc.scenario, query: sc.query, user_id: sc.user_id, hits };
    schemeARounds[`round-${r}`].push(record);
    console.log(`[A round${r}] ${sc.scenario}: ${hits.map((h) => `${h.memory.slice(0, 10)}:${h.score?.toFixed(3) ?? "n/a"}`).join(" | ")}`);
  }
}
fs.writeFileSync(
  path.join(CAL_DIR, "scheme-a-rounds.json"),
  JSON.stringify({ generated_at: nowIso(), method: "mem0 REST search loopback", rounds: schemeARounds }, null, 2),
  "utf8"
);

// ---- Step 3: 方案 B cross-encoder 分数（容器内 fastembed，本地 ONNX）----
const CE_PY = `
import json, sys
from fastembed.rerank.cross_encoder import TextCrossEncoder
model = TextCrossEncoder('${CROSS_ENCODER_MODEL}')
data = json.load(sys.stdin)
out = []
for sc in data['scenes']:
    docs = [m['memory'] for m in sc['memories']]
    scores = list(model.rerank(sc['query'], docs))
    out.append({'scenario': sc['scenario'], 'query': sc['query'],
                'pairs': [{'pair_id': m['pair_id'], 'memory': m['memory'], 'score': float(s)} for m, s in zip(sc['memories'], scores)]})
print('CE_JSON:' + json.dumps(out, ensure_ascii=False))
`;
const ceInput = { scenes: sceneList.map((s) => ({ scenario: s.scenario, query: s.query, memories: s.memories.map((m) => ({ pair_id: m.pair_id, memory: m.memory })) })) };
let ceOut;
try {
  ceOut = execFileSync("docker", ["exec", "-i", "v2-mem0-server", "python", "-c", CE_PY], {
    input: JSON.stringify(ceInput), encoding: "utf8", maxBuffer: 20 * 1024 * 1024,
  });
} catch (e) {
  console.error("cross-encoder 失败：" + (e.stderr?.slice(0, 800) ?? e.message));
  process.exit(1);
}
const ceLine = ceOut.split("\n").find((l) => l.startsWith("CE_JSON:"));
if (!ceLine) { console.error("未找到 CE 回传 JSON：" + ceOut.slice(0, 400)); process.exit(1); }
const ceResult = JSON.parse(ceLine.slice("CE_JSON:".length));
fs.writeFileSync(
  path.join(CAL_DIR, "scheme-b-scores.json"),
  JSON.stringify({ generated_at: nowIso(), model: CROSS_ENCODER_MODEL, method: "fastembed TextCrossEncoder local ONNX", scenes: ceResult }, null, 2),
  "utf8"
);
console.log("方案 B cross-encoder 分数采集完成");
audit({ event: "scheme_b_cross_encoder", model: CROSS_ENCODER_MODEL, method: "container fastembed local ONNX", external: false });

// 落盘 seed 记录
fs.writeFileSync(
  path.join(CAL_DIR, "seeds.json"),
  JSON.stringify({ generated_at: nowIso(), seeds: seeded, scenes: sceneList.map((s) => ({ scenario: s.scenario, user_id: s.user_id })) }, null, 2),
  "utf8"
);
audit({ event: "done", external_requests: auditLog.filter((a) => a.external === true).length });
console.log("S2 采集完成；审计日志：" + auditFile);
console.log("外部请求总数（应=0）：" + auditLog.filter((a) => a.external === true).length);
