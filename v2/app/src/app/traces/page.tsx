"use client";

// ============================================================
// Trace 日志列表页
// ============================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Trace } from "@/lib/types";

const DEMO_USER_ID = "demo-alice";

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTraces = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/traces/${DEMO_USER_ID}`);
      if (resp.ok) {
        const data = await resp.json();
        setTraces(data.traces || []);
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTraces();
  }, [loadTraces]);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ←
        </Link>
        <h1 className="font-semibold text-gray-900 flex-1">Trace 日志</h1>
        <button
          onClick={loadTraces}
          className="text-sm text-indigo-500 hover:text-indigo-600"
        >
          刷新
        </button>
      </header>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 mt-20">加载中...</div>
        ) : traces.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 space-y-2">
            <div className="text-4xl">📋</div>
            <p>还没有 Trace 记录</p>
            <p className="text-sm">
              去{" "}
              <Link href="/chat" className="text-indigo-500">
                聊天
              </Link>{" "}
              产生 Trace
            </p>
          </div>
        ) : (
          traces.map((trace) => {
            const isExpanded = expandedId === trace.id;
            return (
              <div
                key={trace.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* 折叠标题 */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : trace.id)
                  }
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {trace.user_input}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>🧠 {Array.isArray(trace.used_memory) ? trace.used_memory.length : 0} 召回</span>
                      <span>✏️ {Array.isArray(trace.memory_writes) ? trace.memory_writes.length : 0} 写入</span>
                      {trace.latency_ms && <span>⏱ {trace.latency_ms}ms</span>}
                      <span>
                        {new Date(trace.created_at).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </button>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {/* AI 回复 */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">AI 回复</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-2">
                        {trace.ai_reply || "(空)"}
                      </p>
                    </div>

                    {/* 召回的记忆 */}
                    {Array.isArray(trace.used_memory) && trace.used_memory.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                          召回记忆 ({trace.used_memory.length})
                        </p>
                        <div className="space-y-1">
                          {trace.used_memory.map((m, i) => (
                            <div key={i} className="text-sm bg-indigo-50 rounded px-2 py-1.5 flex justify-between items-start gap-2">
                              <span>{(m as { memory?: string }).memory || JSON.stringify(m)}</span>
                              {(m as { score?: number }).score !== undefined && (
                                <span className="text-xs text-indigo-400 flex-shrink-0">
                                  {((m as { score?: number }).score! * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 写入的记忆 */}
                    {Array.isArray(trace.memory_writes) && trace.memory_writes.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                          写入记忆 ({trace.memory_writes.length})
                        </p>
                        <div className="space-y-1">
                          {trace.memory_writes.map((m, i) => (
                            <div key={i} className="text-sm bg-green-50 rounded px-2 py-1.5 flex gap-2">
                              <span className="text-green-600 text-xs font-mono">{(m as { event?: string }).event || "ADD"}</span>
                              <span>{(m as { memory?: string }).memory}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompt 版本 */}
                    {trace.prompt_version && (
                      <p className="text-xs text-gray-300 font-mono">
                        prompt: {trace.prompt_version}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
