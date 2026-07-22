// ============================================================
// mem0 客户端 — 封装对 mem0-server 的 REST API 调用
// ============================================================

import { env } from "./env";
import type { Memory, MemoryCandidate } from "./types";

class Mem0Client {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /** 语义搜索记忆 */
  async search(
    userId: string,
    query: string,
    limit = 5
  ): Promise<Memory[]> {
    const resp = await fetch(`${this.baseUrl}/memories/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, query, limit }),
    });
    if (!resp.ok) {
      throw new Error(`mem0 search failed: ${resp.status} ${await resp.text()}`);
    }
    const data = await resp.json();
    return extractMemories(data.memories);
  }

  /** 获取用户全部记忆 */
  async getAll(userId: string): Promise<Memory[]> {
    const resp = await fetch(`${this.baseUrl}/memories/${userId}`, {
      method: "GET",
    });
    if (!resp.ok) {
      throw new Error(`mem0 getAll failed: ${resp.status}`);
    }
    const data = await resp.json();
    return extractMemories(data.memories);
  }

  /** 添加记忆（从对话文本中抽取） */
  async add(
    userId: string,
    text: string,
    metadata?: Record<string, unknown>
  ): Promise<{ candidates: MemoryCandidate[]; raw: unknown }> {
    const resp = await fetch(`${this.baseUrl}/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, text, metadata }),
    });
    if (!resp.ok) {
      throw new Error(`mem0 add failed: ${resp.status} ${await resp.text()}`);
    }
    const result = await resp.json();
    return normalizeAddResult(result.result);
  }

  /** 更新记忆内容 */
  async update(memoryId: string, content: string): Promise<void> {
    const resp = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!resp.ok) {
      throw new Error(`mem0 update failed: ${resp.status}`);
    }
  }

  /** 删除记忆 */
  async delete(memoryId: string): Promise<void> {
    const resp = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      throw new Error(`mem0 delete failed: ${resp.status}`);
    }
  }
}

/**
 * mem0 v2.0.13 返回格式可能是 {results: [...]} 或直接是数组
 * 统一提取为 Memory[]
 */
function extractMemories(raw: unknown): Memory[] {
  if (!raw) return [];
  // 格式1: {results: [...]}
  if (typeof raw === "object" && raw !== null && "results" in raw) {
    return (raw as { results: Memory[] }).results || [];
  }
  // 格式2: 直接是数组
  if (Array.isArray(raw)) {
    return raw as Memory[];
  }
  return [];
}

/**
 * mem0 add() 返回格式可能是多种形态，统一规范化为 MemoryCandidate[]
 * 典型返回: { results: [{ id, memory, event }, ...] }
 */
function normalizeAddResult(raw: unknown): {
  candidates: MemoryCandidate[];
  raw: unknown;
} {
  const candidates: MemoryCandidate[] = [];
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const results = (obj.results || obj.memories || []) as unknown[];
    for (const item of results) {
      if (typeof item === "object" && item !== null) {
        const m = item as Record<string, unknown>;
        candidates.push({
          id: m.id as string | undefined,
          memory: String(m.memory || m.content || ""),
          event: m.event as string | undefined,
        });
      }
    }
  }
  return { candidates, raw };
}

export const mem0 = new Mem0Client(env.MEM0_API_URL);
