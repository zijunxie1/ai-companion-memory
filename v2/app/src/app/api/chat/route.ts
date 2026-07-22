// ============================================================
// POST /api/chat — 核心端到端 Memory 闭环
//
// 数据流：
//   1. 接收用户消息
//   2. 调用 mem0.search() 语义召回相关 Memory
//   3. 获取用户 Persona
//   4. 组装 { message, memories, persona } → 调用 Dify Chatflow
//   5. 接收 AI 回复
//   6. 调用 mem0.add() 从本轮对话抽取候选 Memory
//   7. 写入 conversations + traces 到 PostgreSQL
//   8. 返回 { reply, used_memory, memory_writes, trace_id }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mem0 } from "@/lib/mem0-client";
import { callDifyChatflow } from "@/lib/dify-client";
import {
  insertConversation,
  insertTrace,
  getUserPersona,
} from "@/lib/db";
import { env } from "@/lib/env";
import type { ChatRequest, ChatResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { user_id, message } = body;

  if (!user_id || !message) {
    return NextResponse.json(
      { error: "user_id and message are required" },
      { status: 400 }
    );
  }

  try {
    // Step 1: 记录用户消息到对话表
    const userConvId = await insertConversation(user_id, "user", message);

    // Step 2: mem0 语义召回
    const memories = await mem0.search(user_id, message, 5);
    const usedMemory = memories.map((m) => ({
      ...m,
      recall_reason: `语义相似度匹配 (score: ${
        m.score ? (m.score * 100).toFixed(0) : "N/A"
      }%)`,
    }));
    const recallReason = `mem0 向量检索返回 ${memories.length} 条记忆，按语义相似度排序`;

    // Step 3: 获取 Persona
    const userMeta = await getUserPersona(user_id);
    const persona = userMeta?.persona || {};
    const relationshipStage = userMeta?.relationshipStage || "new";

    // Step 4: 调用 Dify Chatflow（注入 Memory + Persona）
    const difyResult = await callDifyChatflow({
      message,
      memories: usedMemory,
      persona,
      relationshipStage,
      userId: user_id,
      conversationId: body.conversation_id,
    });

    // Step 5: 记录 AI 回复到对话表
    const aiConvId = await insertConversation(
      user_id,
      "assistant",
      difyResult.reply
    );

    // Step 6: mem0 抽取 + 写入候选 Memory
    const conversationText = `用户: ${message}\nAI: ${difyResult.reply}`;
    let memoryWrites: { candidates: { id?: string; memory: string; event?: string }[] } = {
      candidates: [],
    };
    try {
      memoryWrites = await mem0.add(user_id, conversationText, {
        source: "v2-chatflow",
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // mem0 写入失败不影响主链路，记录在 Trace 中
      console.error("mem0 add failed:", e);
    }

    // Step 7: 记录 Trace
    const latencyMs = Date.now() - startTime;
    const traceId = await insertTrace({
      userId: user_id,
      conversationId: userConvId,
      userInput: message,
      aiReply: difyResult.reply,
      usedMemory,
      recallReason,
      memoryWrites: memoryWrites.candidates,
      conflictResult: null, // V2 不做自动冲突检测，mem0 内部处理 UPDATE
      promptVersion: env.PROMPT_VERSION,
      latencyMs,
    });

    // Step 8: 返回结构化结果
    const response: ChatResponse = {
      reply: difyResult.reply,
      used_memory: usedMemory,
      recall_reason: recallReason,
      memory_writes: memoryWrites.candidates,
      conflict_result: null,
      trace_id: traceId,
      conversation_id: aiConvId,
      latency_ms: latencyMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("/api/chat error:", errMsg);
    return NextResponse.json(
      {
        error: "Chat processing failed",
        detail: errMsg,
      },
      { status: 500 }
    );
  }
}
