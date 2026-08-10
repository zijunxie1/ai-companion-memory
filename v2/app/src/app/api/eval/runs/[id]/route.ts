// ============================================================
// GET /api/eval/runs/[id] — Run 详情（含逐条结果 + GSB 对比）
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getEvalRun, getRunResults } from "@/lib/eval-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const run = await getEvalRun(id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    const results = await getRunResults(id);
    return NextResponse.json({ run, results });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
