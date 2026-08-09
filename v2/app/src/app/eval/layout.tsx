"use client";

// ============================================================
// 评测台布局 — 侧边导航 + 顶栏（视觉参考作品1/index.html 静态原型）
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

  return (
    <div className="flex min-h-screen bg-[#F6F7F9]">
      {/* 侧边导航 */}
      <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col border-r border-gray-200 bg-white">
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
            const active =
              item.href === "/eval"
                ? pathname === "/eval"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
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
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#70747D] hover:bg-[#F6F7F9]"
          >
            <span aria-hidden="true">←</span> 返回产品
          </Link>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-[#70747D]">
                <span>AI Companion Memory OS</span>
                <span aria-hidden="true">/</span>
                <span>TASK-003</span>
              </div>
              <h1 className="text-base font-semibold text-[#1C1D21]">
                {pathname.includes("/cases")
                  ? "Case 管理"
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

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
