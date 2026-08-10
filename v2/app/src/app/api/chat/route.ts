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
  finalizeTraceWrite,
  getUserPersona,
} from "@/lib/db";
import { env } from "@/lib/env";
import { containsCrisis } from "@/lib/eval-crisis";
import { RECALL_TOP_K, RECALL_THRESHOLD, WRITE_MODE } from "@/lib/memory-config";
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

    // Step 2: mem0 语义召回（过滤低相似度结果；阈值/条数来自共享常量 memory-config.ts）
    const MIN_SCORE = RECALL_THRESHOLD; // 低于阈值的 Memory 不返回
    const rawMemories = await mem0.search(user_id, message, RECALL_TOP_K);
    const memories = rawMemories.filter((m) => (m.score ?? 0) >= MIN_SCORE);
    const usedMemory = memories.map((m) => ({
      ...m,
      recall_reason: `语义相似度匹配 (score: ${
        m.score ? (m.score * 100).toFixed(0) : "N/A"
      }%)`,
    }));
    const filteredCount = rawMemories.length - memories.length;
    const recallReason = `mem0 向量检索返回 ${rawMemories.length} 条，过滤 ${filteredCount} 条低相似度，最终使用 ${memories.length} 条`;

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

    // Step 6: 记录 Trace（先写入，memory_writes 后台更新）
    const latencyMs = Date.now() - startTime;
    const traceId = await insertTrace({
      userId: user_id,
      conversationId: userConvId,
      userInput: message,
      aiReply: difyResult.reply,
      usedMemory,
      recallReason,
      memoryWrites: [], // 异步写入后更新
      conflictResult: null,
      promptVersion: env.PROMPT_VERSION,
      latencyMs,
    });

    // Step 7: 返回结构化结果（不等 mem0 add）
    const response: ChatResponse = {
      reply: difyResult.reply,
      used_memory: usedMemory,
      recall_reason: recallReason,
      memory_writes: [], // 异步写入后可在 Trace 页查看
      conflict_result: null,
      trace_id: traceId,
      conversation_id: aiConvId,
      latency_ms: latencyMs,
    };

    // Step 8: Memory 写入——模式来自共享只读配置 memory-config.ts（WRITE_MODE=async →
    // fire-and-forget 不阻塞用户响应；快照 write_mode 与此同源，非影子配置）
    // 终态协议（CR-C）：Trace 插入时已为 pending；
    //   写入完成 → completed + disposition(written|no_write) + memory_writes
    //   危机拦截 → completed + skipped_crisis（不调用 mem0.add，CR-A）
    //   服务异常 → failed + write_error
    const conversationText = `用户: ${message}\nAI: ${difyResult.reply}`;
    if (WRITE_MODE === "async") {
      void (async () => {
      // CR-A：危机表达默认不写入长期 Memory——命中则跳过 mem0.add
      if (containsCrisis(message)) {
        await finalizeTraceWrite({
          traceId,
          status: "completed",
          disposition: "skipped_crisis",
          memoryWrites: [],
        });
        console.log(`[async] crisis detected, memory write skipped for trace ${traceId}`);
        return;
      }
      try {
        const memoryWrites = await mem0.add(user_id, conversationText, {
          source: "v2-chatflow",
          timestamp: new Date().toISOString(),
        });
        const candidates = memoryWrites.candidates ?? [];
        await finalizeTraceWrite({
          traceId,
          status: "completed",
          disposition: candidates.length > 0 ? "written" : "no_write",
          memoryWrites: candidates,
        });
        console.log(
          `[async] mem0 add completed for trace ${traceId} (${candidates.length} items, ${candidates.length > 0 ? "written" : "no_write"})`
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        await finalizeTraceWrite({
          traceId,
          status: "failed",
          writeError: msg.slice(0, 500),
        });
        console.error(`[async] mem0 add failed for trace ${traceId}:`, msg);
      }
      })();
    }

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
