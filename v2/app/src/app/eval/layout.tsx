"use client";

// ============================================================
// 评测台布局 — 响应式导航（Review R4 P1-1 修复）
// 桌面(≥md)：固定侧边栏 208px；移动端(<md)：顶部全宽导航条，
// 不再固定占宽，main 占满可用宽度，交互目标 ≥44px。
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./eval.css";

export default function EvalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/eval", label: "评测总览", icon: "OV" },
    { href: "/eval/cases", label: "Case 管理", icon: "CS" },
  ];

  const isActive = (href: string) =>
    href === "/eval" ? pathname === "/eval" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7F9] md:flex-row">
      {/* 移动端顶部导航条（<md） */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
            EV
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1C1D21]">
              Memory 评测
            </p>
            <p className="truncate text-xs text-[#70747D]">Eval Console</p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm text-[#70747D] hover:bg-[#F6F7F9]"
          >
            <span aria-hidden="true">←</span> 返回
          </Link>
        </div>
        {/* 移动端导航项（全宽两格，紧凑布局保证 375px 不截断） */}
        <nav className="grid grid-cols-2 gap-1 border-t border-gray-100 px-2 py-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-[#70747D] hover:bg-[#F6F7F9]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md text-[9px] font-semibold ${
                    active ? "bg-indigo-600 text-white" : "bg-gray-100 text-[#70747D]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* 桌面侧边导航（≥md） */}
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
            EV
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1C1D21]">Memory 评测</p>
            <p className="text-xs text-[#70747D]">Eval Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-[#70747D] hover:bg-[#F6F7F9]"
                }`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md text-[10px] font-semibold ${
                    active ? "bg-indigo-600 text-white" : "bg-gray-100 text-[#70747D]"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#70747D] hover:bg-[#F6F7F9]"
          >
            <span aria-hidden="true">←</span> 返回产品
          </Link>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 hidden border-b border-gray-200 bg-white/90 backdrop-blur md:block">
          <div className="flex min-h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-[#70747D]">
                <span>AI Companion Memory OS</span>
                <span aria-hidden="true">/</span>
                <span>TASK-003</span>
              </div>
              <h1 className="text-base font-semibold text-[#1C1D21]">
                {pathname.includes("/cases")
                  ? "评测 Case 库 / 管理"
                  : pathname.includes("/runs/")
                    ? "Run 详情"
                    : "评测总览"}
              </h1>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[#70747D]">
              policy v1.0
            </span>
          </div>
        </header>

        {/* 移动端面包屑标题（<md，顶部导航之下） */}
        <div className="px-4 pb-1 pt-4 md:hidden">
          <div className="flex items-center gap-2 text-xs text-[#70747D]">
            <span>AI Companion Memory OS</span>
            <span aria-hidden="true">/</span>
            <span>TASK-003</span>
          </div>
          <h1 className="mt-0.5 text-base font-semibold text-[#1C1D21]">
            {pathname.includes("/cases")
              ? "评测 Case 库 / 管理"
              : pathname.includes("/runs/")
                ? "Run 详情"
                : "评测总览"}
          </h1>
        </div>

        <div className="px-4 py-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
