// ============================================================
// 首页 — 导航 + Demo 介绍
// ============================================================

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Companion Memory OS
          </h1>
          <p className="text-gray-500">
            AI 陪伴产品 Memory 留存优化 — V2 真实 Memory 闭环 Demo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/chat"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="text-2xl mb-2">💬</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600">
              AI 私聊
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              社交风格聊天 · 真实 Memory 召回
            </p>
          </Link>

          <Link
            href="/memories"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600">
              Memory 管理
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              查看 · 编辑 · 删除记忆
            </p>
          </Link>

          <Link
            href="/traces"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="text-2xl mb-2">📋</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600">
              Trace 日志
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              每轮 Memory 召回 · 写入记录
            </p>
          </Link>
        </div>

        <div className="text-left bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-semibold text-gray-700">演示场景</h3>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>
              <span className="font-medium text-indigo-600">Path A:</span>{" "}
              输入「又失眠了……」，AI 召回相关 Memory 并自然回复
            </li>
            <li>
              <span className="font-medium text-indigo-600">Path B:</span>{" "}
              在 Memory 管理页删除一条记忆，再对话验证不再召回
            </li>
            <li>
              <span className="font-medium text-indigo-600">Path C:</span>{" "}
              输入新信息（如「我最近开始学吉他了」），验证 Memory 自动写入
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
