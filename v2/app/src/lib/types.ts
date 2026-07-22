// ============================================================
// 核心类型定义
// ============================================================

/** mem0 返回的记忆条目 */
export interface Memory {
  id: string;
  memory: string;
  user_id: string;
  metadata?: Record<string, unknown>;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

/** Memory 召回时的解释 */
export interface UsedMemoryItem extends Memory {
  recall_reason?: string;
}

/** mem0 写入的候选记忆 */
export interface MemoryCandidate {
  id?: string;
  memory: string;
  event?: string; // ADD | UPDATE | DELETE | NOOP
}

/** Dify Chatflow 返回的结构化结果 */
export interface DifyResult {
  reply: string;
  emotion?: string;
  risk_level?: string;
  handoff_needed?: boolean;
}

/** Trace 记录 */
export interface Trace {
  id: string;
  user_id: string;
  conversation_id: string;
  user_input: string;
  ai_reply: string | null;
  used_memory: UsedMemoryItem[];
  recall_reason: string | null;
  memory_writes: MemoryCandidate[];
  conflict_result: Record<string, unknown> | null;
  prompt_version: string | null;
  latency_ms: number | null;
  created_at: string;
}

/** 对话记录 */
export interface Conversation {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/** POST /api/chat 请求 */
export interface ChatRequest {
  user_id: string;
  message: string;
  conversation_id?: string;
}

/** POST /api/chat 响应 */
export interface ChatResponse {
  reply: string;
  used_memory: UsedMemoryItem[];
  recall_reason: string;
  memory_writes: MemoryCandidate[];
  conflict_result: Record<string, unknown> | null;
  trace_id: string;
  conversation_id: string;
  latency_ms?: number;
}
