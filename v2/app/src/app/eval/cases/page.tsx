"use client";

// ============================================================
// Case 管理 — 列表 + 新增 + traces 一键转 Case（回归集）
// ============================================================

import { useCallback, useEffect, useState } from "react";
import type { EvalCase } from "@/lib/eval-types";

const CATEGORY_CN: Record<string, string> = {
  core: "核心",
  adversarial: "对抗",
  safety: "安全",
};

const TYPE_CN: Record<string, string> = {
  program: "🔧 程序",
  llm: "🤖 LLM",
  human: "👤 人工",
  mixed: "混合",
};

export default function EvalCasesPage() {
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | core | adversarial | safety
  const [newOpen, setNewOpen] = useState(false);

  // 纯数据获取（不含 setState）
  const fetchCases = useCallback(async (): Promise<EvalCase[]> => {
    const resp = await fetch("/api/eval/cases");
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.cases || [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCases()
      .then((list) => {
        if (!cancelled) setCases(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchCases]);

  const filtered =
    filter === "all" ? cases : cases.filter((c) => c.category === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1D21]">Case 管理</h2>
          <p className="mt-0.5 text-sm text-[#70747D]">
            种子 8 条（E001-E008）+ 线上 Bad Case / Trace 转回归
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-[#70747D]"
          >
            <option value="all">全部分类</option>
            <option value="core">核心</option>
            <option value="adversarial">对抗</option>
            <option value="safety">安全</option>
          </select>
          <button
            onClick={() => setNewOpen(true)}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            + 新增 Case / 从 Trace 转
          </button>
        </div>
      </div>

      {newOpen && (
        <NewCaseForm onClose={() => setNewOpen(false)} onCreated={fetchCases} />
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-[#70747D]">
          加载中…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-[#70747D]">
          暂无 Case
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-[#70747D]">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">标题</th>
                <th className="px-4 py-2.5 font-medium">分类</th>
                <th className="px-4 py-2.5 font-medium">评测方式</th>
                <th className="px-4 py-2.5 font-medium">输入</th>
                <th className="px-4 py-2.5 font-medium">来源</th>
                <th className="px-4 py-2.5 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-[#F6F7F9]/50">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-indigo-600">
                    {c.case_id}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[#1C1D21]">{c.title}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-[#70747D]">
                      {CATEGORY_CN[c.category] ?? c.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[#70747D]">
                    {TYPE_CN[c.eval_type] ?? c.eval_type}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-[#70747D]">
                    {c.input_text}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[#70747D]">{c.source}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-[#70747D]"
                      }`}
                    >
                      {c.is_active ? "启用" : "停用"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 新增 / 转 Case 表单 ────────────────────────────────────

function NewCaseForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"manual" | "trace">("manual");
  const [traces, setTraces] = useState<Array<{ id: string; user_input: string; ai_reply: string | null; created_at: string }>>([]);
  const [form, setForm] = useState({
    case_id: "",
    title: "",
    category: "core",
    test_target: "",
    input_text: "",
    expected: "",
    eval_type: "program",
    source_bad_case: "",
  });
  const [traceId, setTraceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载 traces（用于一键转 Case）— 纯数据获取
  const fetchTraces = useCallback(async (): Promise<
    Array<{ id: string; user_input: string; ai_reply: string | null; created_at: string }>
  > => {
    const resp = await fetch("/api/traces/demo-alice");
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.traces || [];
  }, []);

  useEffect(() => {
    if (mode !== "trace") return;
    let cancelled = false;
    fetchTraces()
      .then((list) => {
        if (!cancelled) setTraces(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode, fetchTraces]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      let url = "/api/eval/cases";
      let body: Record<string, unknown> = {
        ...form,
        case_id: form.case_id || undefined,
      };
      if (mode === "trace") {
        url = "/api/eval/cases/from-trace";
        const trace = traces.find((t) => t.id === traceId);
        if (!trace) {
          setError("请选择一条 Trace");
          setSaving(false);
          return;
        }
        body = {
          trace_id: traceId,
          title: form.title,
          category: form.category,
          test_target: form.test_target,
          expected: form.expected,
          eval_type: form.eval_type,
          source_bad_case: form.source_bad_case || null,
        };
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "创建失败");
      } else {
        onCreated();
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("manual")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-[#70747D]"
            }`}
          >
            手动新增
          </button>
          <button
            onClick={() => setMode("trace")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === "trace"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-[#70747D]"
            }`}
          >
            📋 从 Trace 一键转 Case
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-[#70747D] hover:text-[#70747D]"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Case ID（留空自动生成）">
          <input
            value={form.case_id}
            onChange={(e) => setForm({ ...form, case_id: e.target.value })}
            placeholder="如 BC008 / T001"
            className="eval-input"
          />
        </Field>
        <Field label="标题">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="如：手机号不写入"
            className="eval-input"
          />
        </Field>
        <Field label="分类">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="eval-input"
          >
            <option value="core">核心</option>
            <option value="adversarial">对抗</option>
            <option value="safety">安全</option>
          </select>
        </Field>
        <Field label="评测方式">
          <select
            value={form.eval_type}
            onChange={(e) => setForm({ ...form, eval_type: e.target.value })}
            className="eval-input"
          >
            <option value="program">🔧 程序</option>
            <option value="llm">🤖 LLM</option>
            <option value="human">👤 人工</option>
            <option value="mixed">混合</option>
          </select>
        </Field>
        <Field label="测试目标">
          <input
            value={form.test_target}
            onChange={(e) => setForm({ ...form, test_target: e.target.value })}
            placeholder="要验证什么"
            className="eval-input"
          />
        </Field>
        <Field label="关联 Bad Case（可选）">
          <input
            value={form.source_bad_case}
            onChange={(e) => setForm({ ...form, source_bad_case: e.target.value })}
            placeholder="如 BC006"
            className="eval-input"
          />
        </Field>

        {mode === "manual" ? (
          <Field label="用户输入（input_text）" full>
            <textarea
              value={form.input_text}
              onChange={(e) => setForm({ ...form, input_text: e.target.value })}
              placeholder="用户说的话"
              rows={2}
              className="eval-input resize-none"
            />
          </Field>
        ) : (
          <Field label="选择线上 Trace" full>
            <select
              value={traceId}
              onChange={(e) => setTraceId(e.target.value)}
              className="eval-input"
            >
              <option value="">选择一条 Trace…</option>
              {traces.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user_input.slice(0, 30)}（{new Date(t.created_at).toLocaleDateString("zh-CN")}）
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="预期行为（expected）" full>
          <textarea
            value={form.expected}
            onChange={(e) => setForm({ ...form, expected: e.target.value })}
            placeholder="期望 AI 怎么做"
            rows={2}
            className="eval-input resize-none"
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-xs text-[#70747D] hover:bg-[#F6F7F9]"
        >
          取消
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "创建中…" : mode === "trace" ? "转成 Case（加入回归集）" : "创建 Case"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs text-[#70747D]">{label}</span>
      {children}
    </label>
  );
}
