// ============================================================
// PostgreSQL 连接池 + 业务数据库操作
// ============================================================

import { Pool } from "pg";
import { env } from "./env.ts";
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

/** 插入 Trace 记录（初始 write_status='pending'，写入终态由异步任务更新） */
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
      (user_id, conversation_id, user_input, ai_reply, used_memory, recall_reason, memory_writes, conflict_result, prompt_version, latency_ms, write_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
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

/** 更新 Trace 写入终态（completed/failed + 完成时间 + 错误/处置） */
export async function finalizeTraceWrite(input: {
  traceId: string;
  status: "completed" | "failed";
  writeError?: string | null;
  disposition?: "written" | "no_write" | "skipped_crisis" | null;
  memoryWrites?: unknown[];
}): Promise<void> {
  await pool.query(
    `UPDATE traces SET
       write_status = $2,
       write_completed_at = now(),
       write_error = $3,
       write_disposition = $4,
       memory_writes = COALESCE($5::jsonb, memory_writes)
     WHERE id = $1`,
    [
      input.traceId,
      input.status,
      input.writeError ?? null,
      input.disposition ?? null,
      input.memoryWrites !== undefined ? JSON.stringify(input.memoryWrites) : null,
    ]
  );
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
