"use client";

// ============================================================
// Memory 管理页
//
// - Memory 列表（卡片式，每条显示 content + score）
// - 编辑按钮 → 修改 Memory content
// - 删除按钮 → 删除 Memory
// ============================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Memory } from "@/lib/types";

const DEMO_USER_ID = "demo-alice";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const loadMemories = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/memories/${DEMO_USER_ID}`);
      if (resp.ok) {
        const data = await resp.json();
        setMemories(data.memories || []);
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMemories();
  }, [loadMemories]);

  const handleDelete = async (memoryId: string) => {
    if (!confirm("确认删除这条记忆？删除后 AI 不再召回。")) return;
    try {
      const resp = await fetch(
        `/api/memories/${DEMO_USER_ID}/${memoryId}`,
        { method: "DELETE" }
      );
      if (resp.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch {
      alert("删除失败");
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditContent(memory.memory);
  };

  const handleSaveEdit = async (memoryId: string) => {
    try {
      const resp = await fetch(
        `/api/memories/${DEMO_USER_ID}/${memoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        }
      );
      if (resp.ok) {
        setMemories((prev) =>
          prev.map((m) =>
            m.id === memoryId ? { ...m, memory: editContent } : m
          )
        );
        setEditingId(null);
      }
    } catch {
      alert("更新失败");
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* 顶部 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ←
        </Link>
        <h1 className="font-semibold text-gray-900 flex-1">Memory 管理</h1>
        <button
          onClick={loadMemories}
          className="text-sm text-indigo-500 hover:text-indigo-600"
        >
          刷新
        </button>
      </header>

      {/* Memory 列表 */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 mt-20">加载中...</div>
        ) : memories.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 space-y-2">
            <div className="text-4xl">🧠</div>
            <p>还没有记忆</p>
            <p className="text-sm">
              去{" "}
              <Link href="/chat" className="text-indigo-500">
                聊天
              </Link>{" "}
              产生一些记忆吧
            </p>
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              {editingId === memory.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleSaveEdit(memory.id)}
                      className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 break-words">
                      {memory.memory}
                    </p>
                    {memory.score !== undefined && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          相关性 {(memory.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {memory.updated_at && (
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(memory.updated_at).toLocaleString("zh-CN")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(memory)}
                      className="text-xs text-indigo-400 hover:text-indigo-600 px-2 py-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
