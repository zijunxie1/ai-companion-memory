// ============================================================
// 评测 Case API
//
// GET  /api/eval/cases — Case 列表（可筛选 active）
// POST /api/eval/cases — 新增 Case（含从线上 trace 转 Case 的入口）
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getEvalCases, insertEvalCase } from "@/lib/eval-db";

/** GET /api/eval/cases — Case 列表 */
export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";
    const cases = await getEvalCases(activeOnly);
    return NextResponse.json({ cases });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** POST /api/eval/cases — 新增 Case（自动生成 case_id，可带 source_bad_case） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      case_id,
      title,
      category,
      test_target,
      input_text,
      preconditions = [],
      expected,
      pass_criteria = {},
      eval_type,
      source = "manual",
      source_bad_case = null,
    } = body;

    if (!title || !input_text || !expected) {
      return NextResponse.json(
        { error: "title, input_text, expected are required" },
        { status: 400 }
      );
    }

    // 自动生成 case_id：C###（从已有编号 +1）
    let finalCaseId = case_id;
    if (!finalCaseId) {
      const existing = await getEvalCases();
      const used = new Set(existing.map((c) => c.case_id));
      let n = 1;
      while (used.has(`C${String(n).padStart(3, "0")}`)) n++;
      finalCaseId = `C${String(n).padStart(3, "0")}`;
    }

    const evalCase = await insertEvalCase({
      caseId: finalCaseId,
      title,
      category: category || "core",
      testTarget: test_target || "",
      inputText: input_text,
      preconditions,
      expected,
      passCriteria: pass_criteria,
      evalType: eval_type || "program",
      source,
      sourceBadCase: source_bad_case,
    });

    return NextResponse.json({ case: evalCase }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
