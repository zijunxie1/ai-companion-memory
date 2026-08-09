"use client";

// ============================================================
// 评测总览 — 从 Run 结果动态聚合（不写死）
//   · 最新 Run 摘要（GSB + 强约束 4 类 + 平均分）
//   · 触发新 Run
//   · Run 历史列表
// ============================================================

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { EvalRun } from "@/lib/eval-types";

const STRONG_LABELS: Record<string, string> = {
  false_memory: "False Memory",
  deletion: "Deletion",
  safety: "Safety",
  privacy: "Privacy",
};

const STRONG_CN: Record<string, string> = {
  false_memory: "误记率",
  deletion: "删除合规",
  safety: "安全兜底",
  privacy: "隐私边界",
};

export default function EvalOverviewPage() {
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // 纯数据获取（不含 setState，供 effect 回调与事件处理器复用）
  const fetchRuns = useCallback(async (): Promise<EvalRun[]> => {
    const resp = await fetch("/api/eval/runs?limit=10");
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.runs || [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRuns()
      .then((list) => {
        if (!cancelled) setRuns(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchRuns]);

  // 触发 Run 后轮询最新状态
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const timer = setInterval(() => {
      fetchRuns()
        .then((list) => {
          if (cancelled) return;
          setRuns(list);
          const latest = list[0];
          if (latest && latest.status !== "running") setPolling(false);
        })
        .catch(() => {});
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [polling, fetchRuns]);

  const triggerRun = async () => {
    setTriggering(true);
    setError(null);
    try {
      const resp = await fetch("/api/eval/runs", { method: "POST" });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "触发失败");
      } else {
        setPolling(true);
      }
      const list = await fetchRuns();
      setRuns(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "触发失败");
    } finally {
      setTriggering(false);
    }
  };

  const latestRun = runs[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 顶部操作 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1D21]">8 Case 真实评测</h2>
          <p className="mt-0.5 text-sm text-[#70747D]">
            改了什么（模型/Prompt/Memory 链路任一环节）→ 触发 Run → 与上一次 GSB 对比
          </p>
        </div>
        <button
          onClick={triggerRun}
          disabled={triggering || polling}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {triggering ? "触发中…" : polling ? "Run 执行中…" : "▶ 评测运行"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 最新 Run 摘要 */}
      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-[#70747D]">
          加载中…
        </div>
      ) : !latestRun ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
          <div className="text-4xl">🎯</div>
          <p className="mt-2 font-medium text-[#1C1D21]">还没有 Run</p>
          <p className="mt-1 text-sm text-[#70747D]">
            点击「评测运行」跑第一次 8 Case 基线
          </p>
        </div>
      ) : (
        <LatestRunSummary run={latestRun} />
      )}

      {/* Run 历史 */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1C1D21]">Run 历史</h3>
          <span className="text-xs text-[#70747D]">{runs.length} 次</span>
        </div>
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {runs.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#70747D]">暂无 Run</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-[#70747D]">
                  <th className="px-4 py-2.5 font-medium">Run</th>
                  <th className="px-4 py-2.5 font-medium">状态</th>
                  <th className="px-4 py-2.5 font-medium">GSB</th>
                  <th className="px-4 py-2.5 font-medium">平均分</th>
                  <th className="px-4 py-2.5 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-gray-50 hover:bg-[#F6F7F9]/50">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/eval/runs/${run.id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        Run #{run.run_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      {run.summary ? (
                        <span className="text-xs text-[#70747D]">
                          <span className="font-medium text-emerald-600">{run.summary.gsb.good}↑</span>{" "}
                          <span className="text-[#70747D]">·</span>{" "}
                          <span className="font-medium text-[#70747D]">{run.summary.gsb.same}→</span>{" "}
                          <span className="text-[#70747D]">·</span>{" "}
                          <span className="font-medium text-red-600">{run.summary.gsb.bad}↓</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#70747D]">
                      <span className="tabular-nums">
                        {run.summary?.score_avg !== null && run.summary?.score_avg !== undefined
                          ? `${run.summary.score_avg}/5`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#70747D]">
                      {new Date(run.created_at).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

// ── 最新 Run 摘要卡（强约束 4 类 + GSB + config） ─────────────

function LatestRunSummary({ run }: { run: EvalRun }) {
  const summary = run.summary;
  const gsb = summary?.gsb;
  const strong = summary?.strong ?? {};

  // 强约束 4 类完整展示（无样本显示 NOT TESTED）
  const strongKeys = ["false_memory", "deletion", "safety", "privacy"];

  return (
    <div className="space-y-4">
      {/* Run 信息栏 */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-gray-100 bg-white px-5 py-4">
        <div>
          <p className="text-xs text-[#70747D]">本次 Run</p>
          <p className="mt-0.5 text-sm font-semibold text-[#1C1D21]">
            Run #{run.run_number}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#70747D]">状态</p>
          <div className="mt-0.5">
            <StatusBadge status={run.status} />
          </div>
        </div>
        <div>
          <p className="text-xs text-[#70747D]">Case 集</p>
          <p className="mt-0.5 text-sm font-medium text-[#1C1D21]">
            {run.case_set_version}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#70747D]">Policy</p>
          <p className="mt-0.5 text-sm font-medium text-[#1C1D21]">
            {run.policy_version}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#70747D]">完成时间</p>
          <p className="mt-0.5 text-sm text-[#70747D]">
            {run.completed_at
              ? new Date(run.completed_at).toLocaleString("zh-CN")
              : "—"}
          </p>
        </div>
        {run.error && (
          <div className="ml-auto rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
            {run.error}
          </div>
        )}
      </div>

      {/* GSB + 平均分 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-[#70747D]">GSB 对比（vs 上一次 Run）</p>
          {!gsb || gsb.total === 0 ? (
            <p className="mt-3 text-sm text-[#70747D]">首次 Run，无对比基准</p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 py-2">
                <p className="text-xl font-bold tabular-nums text-emerald-600">{gsb.good}</p>
                <p className="text-xs text-emerald-600/70">Good</p>
              </div>
              <div className="rounded-lg bg-[#F6F7F9] py-2">
                <p className="text-xl font-bold tabular-nums text-[#70747D]">{gsb.same}</p>
                <p className="text-xs text-[#70747D]">Same</p>
              </div>
              <div className="rounded-lg bg-red-50 py-2">
                <p className="text-xl font-bold tabular-nums text-red-600">{gsb.bad}</p>
                <p className="text-xs text-red-600/70">Bad</p>
              </div>
              <div className="rounded-lg bg-indigo-50 py-2">
                <p className="text-xl font-bold tabular-nums text-indigo-600">{gsb.total}</p>
                <p className="text-xs text-indigo-600/70">Total</p>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="text-xs text-[#70747D]">分档平均分</span>
            <span className="text-sm font-semibold tabular-nums text-[#1C1D21]">
              {summary?.score_avg !== null && summary?.score_avg !== undefined
                ? `${summary.score_avg}/5`
                : "—"}
            </span>
          </div>
        </div>

        {/* 强约束 4 类完整展示 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-[#70747D]">强约束（一票否决）</p>
          <div className="mt-3 space-y-2">
            {strongKeys.map((key) => {
              const stat = strong[key];
              let status: "PASS" | "FAIL" | "NOT_TESTED" | "MIXED" = "NOT_TESTED";
              if (stat) {
                if (stat.fail > 0) status = "FAIL";
                else if (stat.pass > 0) status = "PASS";
                else status = "NOT_TESTED";
              }
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg bg-[#F6F7F9] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#70747D]">
                      {STRONG_CN[key]}
                    </span>
                    <span className="text-[10px] text-[#70747D]">{STRONG_LABELS[key]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stat && stat.pass + stat.fail > 0 && (
                      <span className="text-[10px] text-[#70747D]">
                        {stat.pass}P / {stat.fail}F
                      </span>
                    )}
                    <StrongBadge status={status} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href={`/eval/runs/${run.id}`}
            className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:underline"
          >
            查看逐条证据链 →
          </Link>
        </div>
      </div>

      {/* Config 快照（只读） */}
      <details className="rounded-xl border border-gray-100 bg-white px-5 py-3">
        <summary className="cursor-pointer text-xs font-medium text-[#70747D]">
          Config 快照（本次 Run 绑定，不可变）
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {Object.entries(run.config_snapshot ?? {}).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-xs">
              <span className="text-[#70747D]">{k}</span>
              <span className="max-w-[60%] truncate font-mono text-[#70747D]">
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ── 小组件 ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    running: { text: "执行中", cls: "bg-amber-50 text-amber-600" },
    completed: { text: "已完成", cls: "bg-emerald-50 text-emerald-600" },
    failed: { text: "失败", cls: "bg-red-50 text-red-600" },
  };
  const m = map[status] ?? { text: status, cls: "bg-[#F6F7F9] text-[#70747D]" };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.text}
    </span>
  );
}

function StrongBadge({ status }: { status: "PASS" | "FAIL" | "NOT_TESTED" | "MIXED" }) {
  const map = {
    PASS: { text: "PASS", cls: "bg-emerald-100 text-emerald-700" },
    FAIL: { text: "FAIL", cls: "bg-red-100 text-red-700" },
    NOT_TESTED: { text: "NOT TESTED", cls: "bg-gray-100 text-[#70747D]" },
    MIXED: { text: "MIXED", cls: "bg-amber-100 text-amber-700" },
  } as const;
  const m = map[status];
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.cls}`}>
      {m.text}
    </span>
  );
}
