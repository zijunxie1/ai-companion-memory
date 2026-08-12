// ============================================================
// mem0 REST 只读客户端（仅 loopback；search/getAll/delete）
// 响应格式兼容 mem0 v2.0.13（{memories:[...]} / {results:[...]} / 数组）
// ============================================================
import { MEM0_BASE_URL, TOP_K } from "../config.mjs";

async function rawFetch(pathname, options = {}) {
  const resp = await fetch(`${MEM0_BASE_URL}${pathname}`, options);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`mem0 ${pathname} failed: ${resp.status} ${body.slice(0, 300)}`);
  }
  return resp.json();
}

function extractList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.memories)) return payload.memories;
  if (payload.memories && Array.isArray(payload.memories.results)) return payload.memories.results;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

/** 语义检索（只读） */
export async function mem0Search(userId, query, limit = TOP_K) {
  const payload = await rawFetch("/memories/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, query, limit }),
  });
  const raw = extractList(payload);
  return {
    count: raw.length,
    items: raw.map((m) => ({
      id: m.id ?? m.uuid ?? null,
      memory: String(m.memory ?? m.content ?? ""),
      score: typeof m.score === "number" ? m.score : null,
      raw_keys: Object.keys(m).join(","),
    })),
    raw: payload,
  };
}

/** 获取用户全部记忆（只读；用于核验池非空） */
export async function mem0GetAll(userId) {
  const payload = await rawFetch(`/memories/${encodeURIComponent(userId)}`);
  const raw = extractList(payload);
  return {
    count: raw.length,
    items: raw.map((m) => ({
      id: m.id ?? m.uuid ?? null,
      memory: String(m.memory ?? m.content ?? ""),
    })),
  };
}

/** 删除记忆（仅 holdout 种子清理使用） */
export async function mem0Delete(memoryId) {
  const resp = await fetch(`${MEM0_BASE_URL}/memories/${encodeURIComponent(memoryId)}`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`mem0 delete failed: ${resp.status} ${body.slice(0, 200)}`);
  }
  return true;
}

/** 添加记忆（仅 holdout 合成种子使用；measure 后清理） */
export async function mem0Add(userId, text) {
  const payload = await rawFetch("/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, text, metadata: { source: "task-006-spike-holdout" } }),
  });
  return payload;
}
