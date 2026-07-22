// ============================================================
// Dify Chatflow 客户端 — 调用 V1 Chatflow API
//
// V1 Chatflow 定义的输入变量（通过 /parameters API 确认）：
//   - user_input (paragraph, 必填) — 用户输入的内容
//   - user_id (text, 必填) — 用户ID
//   - conversation_id (text, 必填) — 对话ID
//
// V2 策略：mem0 召回的 Memory 拼接到 user_input 前面，
// 让 V1 的知识检索节点和 LLM 都能看到 Memory 上下文。
// 这样不需要修改 Dify Chatflow。
// ============================================================

import { env } from "./env";
import type { Memory, DifyResult } from "./types";

export async function callDifyChatflow(params: {
  message: string;
  memories: Memory[];
  persona: Record<string, unknown>;
  relationshipStage: string;
  userId: string;
  conversationId?: string;
}): Promise<DifyResult> {
  const { message, memories, userId } = params;

  // 将 Memory 拼接到 user_input 前面（V1 Chatflow 通过 user_input 接收全部内容）
  const memoryBlock = formatMemoriesForPrompt(memories);
  const fullInput = memoryBlock
    ? `[Memory Context]\n${memoryBlock}\n\n[User Message]\n${message}`
    : message;

  const body = {
    inputs: {
      user_input: fullInput,
      user_id: userId,
      conversation_id: params.conversationId || "demo-session-001",
    },
    query: message,
    response_mode: "blocking" as const,
    conversation_id: "",
    user: userId,
  };

  const resp = await fetch(`${env.DIFY_API_URL}/chat-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DIFY_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(
      `Dify API call failed: ${resp.status} ${await resp.text()}`
    );
  }

  const data = await resp.json();

  // Dify 返回格式解析
  const answer = data.answer || data.message || "";

  // 默认结构化字段
  let emotion = "neutral";
  let risk_level = "safe";
  let handoff_needed = false;

  // 尝试从 answer 中提取结构化 JSON（V1 的代码兜底节点可能输出 JSON）
  try {
    const parsed = JSON.parse(answer);
    if (parsed.reply) {
      return {
        reply: parsed.reply,
        emotion: parsed.emotion || emotion,
        risk_level: parsed.risk_level || risk_level,
        handoff_needed: parsed.handoff_needed || handoff_needed,
      };
    }
  } catch {
    // 不是 JSON，继续用 metadata 提取
  }

  // 从 metadata 中提取（Dify 的 retriever_resources 等）
  if (data.metadata) {
    emotion = data.metadata.emotion || emotion;
    risk_level = data.metadata.risk_level || risk_level;
    handoff_needed = data.metadata.handoff_needed || handoff_needed;
  }

  return { reply: answer, emotion, risk_level, handoff_needed };
}

/**
 * 格式化 Memory 列表为 Prompt 可用文本
 * 按 memory-strategy.md 的分层拼接策略组织
 */
function formatMemoriesForPrompt(memories: Memory[]): string {
  if (!memories || memories.length === 0) {
    return "";
  }

  const lines = memories.map((m, i) => {
    const score = m.score ? ` (相关性: ${(m.score * 100).toFixed(0)}%)` : "";
    return `[${i + 1}] ${m.memory}${score}`;
  });
  return lines.join("\n");
}
