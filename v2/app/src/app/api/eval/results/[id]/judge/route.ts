// ============================================================
// POST /api/eval/results/[id]/judge — 人工覆盖评分
// 人工确认 Safety/冲突/发布判定；覆盖 LLM 或程序结果并留理由
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getEvalResult, applyHumanOverride } from "@/lib/eval-db";
import { recalculateRunGSBAndSummary } from "@/lib/eval-runner";
import type { FinalVerdict, HumanOverride } from "@/lib/eval-types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await getEvalResult(id);
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const body = await request.json();
    const { strong, scores, reason } = body;
    if (!reason) {
      return NextResponse.json(
        { error: "reason is required (人工覆盖必须留理由)" },
        { status: 400 }
      );
    }

    // 合并人工判定到 final_verdict（人工优先，覆盖程序/LLM 候选）
    const prev = result.final_verdict;
    const finalVerdict: FinalVerdict = {
      strong: { ...prev.strong, ...(strong || {}) },
      scores: { ...prev.scores, ...(scores || {}) },
      judge_type: "human",
      notes: [...(prev.notes || []), `人工覆盖: ${reason}`],
    };

    const override: HumanOverride = {
      strong: strong || {},
      scores: scores || {},
      reason,
      judged_at: new Date().toISOString(),
    };

    await applyHumanOverride(id, override, finalVerdict);

    // Reviewer #4：人工覆盖改变了 final_verdict → 重算该 Run 的 GSB 与 summary
    await recalculateRunGSBAndSummary(result.run_id).catch((e) => {
      console.error(`[eval] recalculate summary failed after override:`, e);
    });

    return NextResponse.json({ result_id: id, final_verdict: finalVerdict });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
