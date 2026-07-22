"use client";

// ============================================================
// TracePanel — 底部可折叠面板，展示本轮 Memory 使用详情
// ============================================================

import type { ChatResponse } from "@/lib/types";

interface TracePanelProps {
  trace: ChatResponse;
  onClose: () => void;
}

export function TracePanel({ trace, onClose }: TracePanelProps) {
  return (
    <div className="bg-gray-900 text-gray-100 rounded-t-2xl max-h-[40vh] overflow-y-auto shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          📋 Memory Trace
          <span className="text-xs text-gray-400 font-normal">
            {trace.latency_ms || 0}ms
          </span>
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* 召回的记忆 */}
        <section>
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            召回记忆 ({trace.used_memory.length})
          </h4>
          {trace.used_memory.length === 0 ? (
            <p className="text-sm text-gray-500">本轮未召回任何记忆</p>
          ) : (
            <div className="space-y-1.5">
              {trace.used_memory.map((m, i) => (
                <div
                  key={m.id || i}
                  className="text-sm bg-gray-800 rounded-lg px-3 py-2 flex items-start justify-between gap-2"
                >
                  <span className="flex-1">{m.memory}</span>
                  {m.score && (
                    <span className="text-xs text-indigo-400 flex-shrink-0">
                      {(m.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {trace.recall_reason && (
            <p className="text-xs text-gray-500 mt-2 italic">
              💡 {trace.recall_reason}
            </p>
          )}
        </section>

        {/* 写入的记忆 */}
        <section>
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            写入记忆 ({trace.memory_writes.length})
          </h4>
          {trace.memory_writes.length === 0 ? (
            <p className="text-sm text-gray-500">本轮未写入新记忆</p>
          ) : (
            <div className="space-y-1.5">
              {trace.memory_writes.map((m, i) => (
                <div
                  key={m.id || i}
                  className="text-sm bg-green-900/30 border border-green-700/30 rounded-lg px-3 py-2 flex items-start gap-2"
                >
                  <span className="text-green-400 text-xs font-mono mt-0.5">
                    {m.event || "ADD"}
                  </span>
                  <span className="flex-1">{m.memory}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trace ID */}
        <div className="text-xs text-gray-600 font-mono pt-2 border-t border-gray-700">
          trace_id: {trace.trace_id}
        </div>
      </div>
    </div>
  );
}
