// ============================================================
// PostgreSQL 连接池 + 业务数据库操作
// ============================================================

import { Pool } from "pg";
import { env } from "./env";
import type { Conversation, Trace } from "./types";

const globalForPg = globalThis as unknown as { pool?: Pool };

export const pool: Pool =
  globalForPg.pool ||
  new Pool({
    connectionString: env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

/** 插入对话记录 */
export async function insertConversation(
  userId: string,
  role: string,
  content: string
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO conversations (user_id, role, content) VALUES ($1, $2, $3) RETURNING id`,
    [userId, role, content]
  );
  return result.rows[0].id;
}

/** 获取用户最近的对话历史 */
export async function getRecentConversations(
  userId: string,
  limit = 20
): Promise<Conversation[]> {
  const result = await pool.query(
    `SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.reverse() as Conversation[];
}

/** 插入 Trace 记录 */
export async function insertTrace(trace: {
  userId: string;
  conversationId: string;
  userInput: string;
  aiReply: string;
  usedMemory: unknown[];
  recallReason: string;
  memoryWrites: unknown[];
  conflictResult: unknown;
  promptVersion: string;
  latencyMs: number;
}): Promise<string> {
  const result = await pool.query(
    `INSERT INTO traces
      (user_id, conversation_id, user_input, ai_reply, used_memory, recall_reason, memory_writes, conflict_result, prompt_version, latency_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      trace.userId,
      trace.conversationId,
      trace.userInput,
      trace.aiReply,
      JSON.stringify(trace.usedMemory),
      trace.recallReason,
      JSON.stringify(trace.memoryWrites),
      JSON.stringify(trace.conflictResult),
      trace.promptVersion,
      trace.latencyMs,
    ]
  );
  return result.rows[0].id;
}

/** 获取用户的 Trace 列表 */
export async function getTraces(userId: string): Promise<Trace[]> {
  const result = await pool.query(
    `SELECT * FROM traces WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  return result.rows as Trace[];
}

/** 获取用户 Persona */
export async function getUserPersona(
  userId: string
): Promise<{ persona: Record<string, unknown>; relationshipStage: string } | null> {
  const result = await pool.query(
    `SELECT persona, relationship_stage FROM users WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  return {
    persona: result.rows[0].persona || {},
    relationshipStage: result.rows[0].relationship_stage || "new",
  };
}
