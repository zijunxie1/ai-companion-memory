"use client";

// ============================================================
// AI 私聊页 — 社交 App 风格（非 ChatGPT 风格）
//
// 特点：
// - 消息气泡（用户右侧蓝色，AI 左侧白色）
// - AI 头像 + 角色名
// - 底部 Trace 面板（可折叠，展示本轮 used_memory + recall_reason）
// - 社交风格的输入栏
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatResponse, Conversation } from "@/lib/types";
import { TracePanel } from "@/components/TracePanel";

const DEMO_USER_ID = "demo-alice";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  trace?: ChatResponse;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [activeTrace, setActiveTrace] = useState<ChatResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 加载历史对话
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/conversations/${DEMO_USER_ID}`);
        if (resp.ok && !cancelled) {
          const data = await resp.json();
          const history: MessageItem[] = (data.conversations || []).map(
            (c: Conversation) => ({
              id: c.id,
              role: c.role,
              content: c.content,
            })
          );
          if (!cancelled) setMessages(history);
        }
      } catch {
        // 首次加载没有历史，忽略
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const tempId = `temp-${Date.now()}`;

    // 乐观更新：立即显示用户消息
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: userMessage },
    ]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          message: userMessage,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `HTTP ${resp.status}`);
      }

      const data: ChatResponse = await resp.json();

      // 替换临时消息，追加 AI 回复
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        { id: `user-${Date.now()}`, role: "user", content: userMessage },
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          trace: data,
        },
      ]);

      // 自动展开 Trace 面板
      setActiveTrace(data);
      setShowTrace(true);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "发送失败";
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ←
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
            P
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">PList</h1>
            <span className="text-xs text-green-500">● 在线</span>
          </div>
        </div>
        <Link
          href="/memories"
          className="text-sm text-indigo-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Memory
        </Link>
      </header>

      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20 space-y-2">
            <div className="text-4xl">🌙</div>
            <p>开始和 PList 聊天吧</p>
            <p className="text-xs">
              试试输入「又失眠了……」
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onTraceClick={() => {
            if (msg.trace) {
              setActiveTrace(msg.trace);
              setShowTrace(true);
            }
          }} />
        ))}
        {loading && (
          <div className="flex items-end gap-2 msg-enter">
            <AvatarAI />
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trace 面板（底部可折叠） */}
      {showTrace && activeTrace && (
        <TracePanel
          trace={activeTrace}
          onClose={() => setShowTrace(false)}
        />
      )}

      {/* 输入栏 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="发消息..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bubble-user)] text-white disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function AvatarAI() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      P
    </div>
  );
}

function MessageBubble({
  message,
  onTraceClick,
}: {
  message: MessageItem;
  onTraceClick: () => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end msg-enter">
        <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-md text-white text-sm bg-[var(--bubble-user)] shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 msg-enter">
      <AvatarAI />
      <div className="max-w-[70%]">
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-800 text-sm shadow-sm border border-gray-100 whitespace-pre-wrap">
          {message.content}
        </div>
        {message.trace && (
          <button
            onClick={onTraceClick}
            className="mt-1 ml-1 text-xs text-indigo-400 hover:text-indigo-600"
          >
            📋 查看本轮 Memory ({message.trace.used_memory.length} 条召回 ·{" "}
            {message.trace.memory_writes.length} 条写入)
          </button>
        )}
      </div>
    </div>
  );
}
