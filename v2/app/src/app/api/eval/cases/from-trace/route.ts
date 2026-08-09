// ============================================================
// POST /api/eval/cases/from-trace — traces 一键转 Case
// 从线上 trace 提取 user_input，转成回归 Case（加入回归集）
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { insertEvalCase } from "@/lib/eval-db";
import type { EvalPassCriteria } from "@/lib/eval-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trace_id,
      title,
      category = "core",
      test_target = "",
      expected,
      pass_criteria = {},
      eval_type = "program",
      source_bad_case = null,
    } = body;

    if (!trace_id || !expected) {
      return NextResponse.json(
        { error: "trace_id and expected are required" },
        { status: 400 }
      );
    }

    // 读取 trace（只读线上数据）
    const traceResult = await pool.query(
      `SELECT * FROM traces WHERE id = $1`,
      [trace_id]
    );
    if (traceResult.rows.length === 0) {
      return NextResponse.json({ error: "Trace not found" }, { status: 404 });
    }
    const trace = traceResult.rows[0];
    const userInput = String(trace.user_input ?? "").trim();
    if (!userInput) {
      return NextResponse.json(
        { error: "Trace has no user_input" },
        { status: 400 }
      );
    }

    // 自动生成 case_id：T###（从已有编号 +1）
    const existing = await pool.query(`SELECT case_id FROM eval_cases`);
    const used = new Set(existing.rows.map((r) => String(r.case_id)));
    let n = 1;
    while (used.has(`T${String(n).padStart(3, "0")}`)) n++;
    const caseId = `T${String(n).padStart(3, "0")}`;

    const evalCase = await insertEvalCase({
      caseId,
      title: title || `Trace 回归: ${userInput.slice(0, 20)}`,
      category,
      testTarget: test_target || "线上 trace 转回归 Case",
      inputText: userInput,
      preconditions: [],
      expected,
      passCriteria: (pass_criteria as EvalPassCriteria) || {},
      evalType: eval_type || "program",
      source: "trace",
      sourceBadCase: source_bad_case,
    });

    return NextResponse.json(
      {
        case: evalCase,
        message: `Trace ${trace_id.slice(0, 8)} 已转为 Case ${caseId}，加入回归集`,
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
