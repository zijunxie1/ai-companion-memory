"use client";

// ============================================================
// Run 详情 — 逐条 Case 证据链
//   · 每条 Case：输入/回复/召回/写入 + 三层判定（程序/LLM/人工）
//   · 评分来源标注（judge_type）+ 人工覆盖入口（留理由）
//   · 与上一次 Run 的 GSB 对比
// ============================================================

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { EvalResult, EvalRun } from "@/lib/eval-types";

const DIM_CN: Record<string, string> = {
  recall_accuracy: "召回准确率",
  irrelevant_rejection: "不应召回率",
  reply_naturalness: "回复自然度",
  continuity: "连续性",
};

const STRONG_CN: Record<string, string> = {
  false_memory: "误记率",
  deletion: "删除合规",
  safety: "安全兜底",
  privacy: "隐私边界",
};

export default function EvalRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [run, setRun] = useState<EvalRun | null>(null);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/eval/runs/${id}`);
      if (resp.ok) {
        const data = await resp.json();
        setRun(data.run);
        setResults(data.results || []);
        setPolling(data.run?.status === "running");
      } else {
        setError("Run 不存在");
      }
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { id } = await params;
      if (!cancelled) await load(id);
    })();
    return () => {
      cancelled = true;
    };
  }, [params, load]);

  // Run 执行中轮询
  useEffect(() => {
    if (!polling || !run) return;
    const timer = setInterval(async () => {
      const resp = await fetch(`/api/eval/runs/${run.id}`);
      if (resp.ok) {
        const data = await resp.json();
        setRun(data.run);
        setResults(data.results || []);
        if (data.run?.status !== "running") setPolling(false);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [polling, run]);

  if (loading) {
    return <div className="text-center text-[#70747D]">加载中…</div>;
  }

  if (error || !run) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* 头部 */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/eval"
          className="text-sm text-[#70747D] hover:text-[#70747D]"
        >
          ← 返回总览
        </Link>
        <h2 className="text-lg font-semibold text-[#1C1D21]">
          Run #{run.run_number} 详情
        </h2>
        <StatusBadge status={run.status} />
        {polling && <span className="text-xs text-amber-500">执行中，自动刷新…</span>}
      </div>

      {run.summary && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
            Good {run.summary.gsb.good}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[#70747D]">
            Same {run.summary.gsb.same}
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">
            Bad {run.summary.gsb.bad}
          </span>
          {run.summary.score_avg !== null && run.summary.score_avg !== undefined && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">
              平均分 <span className="tabular-nums">{run.summary.score_avg}/5</span>
            </span>
          )}
        </div>
      )}

      {/* 逐条 Case */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-[#70747D]">
          {run.status === "running"
            ? "正在跑 Case…（首次加载需要一些时间）"
            : "无结果"}
        </div>
      ) : (
        results.map((result) => (
          <CaseEvidenceCard key={result.id} result={result} />
        ))
      )}
    </div>
  );
}

// ── 单条 Case 证据链卡 ──────────────────────────────────────

function CaseEvidenceCard({ result }: { result: EvalResult }) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [strongOverride, setStrongOverride] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cs = result.case_snapshot;
  const final = result.final_verdict;

  const submitOverride = async () => {
    if (!reason.trim()) {
      setError("必须填写覆盖理由");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { reason: reason.trim() };
      if (strongOverride) {
        const [key, value] = strongOverride.split(":");
        body.strong = { [key]: value };
      }
      const resp = await fetch(`/api/eval/results/${result.id}/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "覆盖失败");
      } else {
        setOverrideOpen(false);
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "覆盖失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {/* Case 头 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-50 px-4 py-3">
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">
          {cs.case_id}
        </span>
        <span className="text-sm font-medium text-[#1C1D21]">{cs.title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-[#70747D]">
          {cs.category}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-[#70747D]">
          {cs.eval_type}
        </span>
        {result.gsb && (
          <span
            className={`ml-auto rounded-md px-2 py-0.5 text-xs font-bold ${
              result.gsb === "Good"
                ? "bg-emerald-50 text-emerald-600"
                : result.gsb === "Bad"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#F6F7F9] text-[#70747D]"
            }`}
            title="GSB = 相比上一轮的相对变化，不等于当前通过"
          >
            {result.gsb === "Good" ? "↑ Good" : result.gsb === "Bad" ? "↓ Bad" : "→ Same"}
          </span>
        )}
        {/* 绝对状态（Review R3 §4.1：与 GSB 分离展示） */}
        {final.absolute_status && (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold ${
              final.absolute_status === "PASS"
                ? "bg-emerald-50 text-emerald-700"
                : final.absolute_status === "FAIL"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {final.absolute_status === "PASS"
              ? "✓ 通过"
              : final.absolute_status === "FAIL"
                ? "✗ 未通过"
                : "? 未测试"}
          </span>
        )}
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-600">
          来源: {JUDGE_LABEL[result.judge_type]}
        </span>
        {final.write_state && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              final.write_state.state !== "completed"
                ? "bg-orange-50 text-orange-600"
                : final.write_state.disposition === "skipped_crisis"
                  ? "bg-purple-50 text-purple-600"
                  : final.write_state.disposition === "written"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-[#70747D]"
            }`}
          >
            写入:{" "}
            {final.write_state.state === "failed"
              ? "失败"
              : final.write_state.state === "timeout"
                ? "超时(NOT_TESTED)"
                : final.write_state.disposition === "skipped_crisis"
                  ? "危机拦截(未写入)"
                  : final.write_state.disposition === "written"
                    ? "已写入"
                    : "无写入"}
          </span>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* 强约束 */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(final.strong ?? {}).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="text-xs text-[#70747D]">{STRONG_CN[k] ?? k}</span>
              <StrongBadge status={v} />
            </div>
          ))}
          {Object.keys(final.strong ?? {}).length === 0 && (
            <span className="text-xs text-gray-300">无强约束</span>
          )}
        </div>

        {/* 程序失败标记（Review：失败显式可见） */}
        {final.program_failed && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs font-semibold text-red-700">
              ✗ 程序规则 {final.program_failures?.length ?? 0} 项未通过
            </p>
            {(final.program_failures ?? []).map((f, i) => (
              <p key={i} className="mt-0.5 text-xs text-red-600/80">
                <span className="font-mono">{f.name}</span> — {f.detail}
              </p>
            ))}
          </div>
        )}

        {/* 分档分 */}
        {Object.keys(final.scores ?? {}).length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {Object.entries(final.scores).map(([k, v]) => (
              <span key={k} className="text-xs text-[#70747D]">
                {DIM_CN[k] ?? k}:{" "}
                <b className="tabular-nums text-[#1C1D21]">{v}/5</b>
              </span>
            ))}
          </div>
        )}

        {/* 对话 */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F6F7F9] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#70747D]">
              用户输入
            </p>
            <p className="mt-1 text-sm text-[#1C1D21]">{result.user_input}</p>
          </div>
          <div className="rounded-lg bg-indigo-50/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-400">
              AI 回复{" "}
              {result.latency_ms ? (
                <span className="tabular-nums">· {result.latency_ms}ms</span>
              ) : null}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#1C1D21]">
              {result.ai_reply || "(空/异常)"}
            </p>
          </div>
        </div>

        {/* 召回 + 写入 */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#70747D]">
              召回 Memory（{result.used_memory.length}）
            </p>
            <div className="mt-1 space-y-1">
              {result.used_memory.length === 0 ? (
                <p className="text-xs text-gray-300">无</p>
              ) : (
                result.used_memory.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 rounded bg-amber-50 px-2 py-1 text-xs text-[#1C1D21]"
                  >
                    <span>{String((m as { memory?: string }).memory ?? JSON.stringify(m))}</span>
                    {(m as { score?: number }).score !== undefined && (
                      <span className="shrink-0 tabular-nums text-amber-500">
                        {(((m as { score?: number }).score ?? 0) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#70747D]">
              写入 Memory（{result.memory_writes.length}）
            </p>
            <div className="mt-1 space-y-1">
              {result.memory_writes.length === 0 ? (
                <p className="text-xs text-gray-300">无</p>
              ) : (
                result.memory_writes.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded bg-emerald-50 px-2 py-1 text-xs text-[#1C1D21]"
                  >
                    <span className="shrink-0 font-mono text-[10px] text-emerald-600">
                      {(m as { event?: string }).event ?? "ADD"}
                    </span>
                    <span>{String((m as { memory?: string }).memory ?? "")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 程序判定 */}
        {result.program_verdict && result.program_verdict.checks.length > 0 && (
          <div className="rounded-lg border border-gray-100 bg-[#F6F7F9]/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#70747D]">
              程序规则判定
            </p>
            <div className="mt-1.5 space-y-1">
              {result.program_verdict.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={c.pass ? "text-emerald-500" : "text-red-500"}>
                    {c.pass ? "✓" : "✗"}
                  </span>
                  <div>
                    <span className="font-mono text-[#70747D]">{c.name}</span>
                    <span className="ml-1 text-[#70747D]">{c.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LLM Judge */}
        {result.llm_judge && (
          <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-purple-400">
              LLM Judge（候选评分）
            </p>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {Object.entries(result.llm_judge.dimensions ?? {}).map(([k, d]) => (
                <div key={k} className="flex items-start gap-2 text-xs">
                  <span className="rounded bg-purple-100 px-1.5 font-semibold tabular-nums text-purple-700">
                    {d.score}/5
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1C1D21]">{DIM_CN[k] ?? k}</p>
                    <p className="text-[#70747D]">{String(d.analysis ?? "")}</p>
                  </div>
                </div>
              ))}
              {result.llm_judge.strong && (
                <div className="col-span-full flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {Object.entries(result.llm_judge.strong).map(([k, v]) => (
                    <span key={k} className="text-[#70747D]">
                      {k}: <b className={v === "PASS" ? "text-emerald-600" : "text-red-600"}>{v}</b>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {result.llm_judge.error && (
              <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-500">
                Judge 异常: {result.llm_judge.error}
              </p>
            )}
            {result.llm_judge.overall_reasoning && (
              <p className="mt-2 text-xs text-[#70747D]">
                {result.llm_judge.overall_reasoning}
              </p>
            )}
          </div>
        )}

        {/* 人工覆盖 */}
        {result.human_override && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
              人工覆盖（最终判定）
            </p>
            <p className="mt-1 text-xs text-[#1C1D21]">{result.human_override.reason}</p>
            <p className="mt-0.5 text-[10px] text-[#70747D]">
              {new Date(result.human_override.judged_at).toLocaleString("zh-CN")}
            </p>
          </div>
        )}

        {final.notes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {final.notes.map((n, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-[#70747D]">
                {n}
              </span>
            ))}
          </div>
        )}

        {/* 人工覆盖入口 */}
        {!result.human_override && (
          <div className="border-t border-gray-50 pt-3">
            {!overrideOpen ? (
              <button
                onClick={() => setOverrideOpen(true)}
                className="text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                ✎ 人工覆盖（否决/确认）
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={strongOverride}
                    onChange={(e) => setStrongOverride(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-[#1C1D21]"
                  >
                    <option value="">仅留理由（不覆盖强约束）</option>
                    {Object.keys(final.strong ?? {}).map((k) => (
                      <option key={k} value={`${k}:PASS`}>
                        {STRONG_CN[k] ?? k} → PASS
                      </option>
                    ))}
                    {Object.keys(final.strong ?? {}).map((k) => (
                      <option key={`${k}-f`} value={`${k}:FAIL`}>
                        {STRONG_CN[k] ?? k} → FAIL
                      </option>
                    ))}
                  </select>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="覆盖理由（必填）…"
                    className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-[#1C1D21] placeholder:text-gray-300"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={submitOverride}
                    disabled={saving}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {saving ? "提交中…" : "确认覆盖"}
                  </button>
                  <button
                    onClick={() => setOverrideOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-[#70747D] hover:bg-[#F6F7F9]"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const JUDGE_LABEL: Record<string, string> = {
  program: "程序",
  llm: "LLM",
  human: "人工",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    running: { text: "执行中", cls: "bg-amber-50 text-amber-600" },
    completed: { text: "已完成", cls: "bg-emerald-50 text-emerald-600" },
    failed: { text: "失败", cls: "bg-red-50 text-red-600" },
  };
  const m = map[status] ?? { text: status, cls: "bg-[#F6F7F9] text-[#70747D]" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.text}
    </span>
  );
}

function StrongBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    PASS: { text: "PASS", cls: "bg-emerald-100 text-emerald-700" },
    FAIL: { text: "FAIL", cls: "bg-red-100 text-red-700" },
    NOT_TESTED: { text: "NOT TESTED", cls: "bg-gray-100 text-[#70747D]" },
  };
  const m = map[status] ?? { text: status, cls: "bg-gray-100 text-[#70747D]" };
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.cls}`}>
      {m.text}
    </span>
  );
}
