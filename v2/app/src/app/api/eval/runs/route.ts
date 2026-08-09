// ============================================================
// 评测 Run API
//
// POST /api/eval/runs — 触发一次新 Run（捕获 Config 快照，后台逐条跑 8 Case）
// GET  /api/eval/runs — Run 历史列表
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createEvalRun, getEvalRuns } from "@/lib/eval-db";
import { captureConfigSnapshot } from "@/lib/eval-config";
import { executeEvalRun } from "@/lib/eval-runner";

/** POST /api/eval/runs — 触发新 Run（立即返回 run_id，后台执行） */
export async function POST(request: NextRequest) {
  try {
    // Reviewer #5：单 Run 互斥——同一时刻只允许一个 running Run，
    // 防止并发 Run 共享 EVAL_USER_ID 导致 Memory 环境互相污染。
    const existing = await getEvalRuns(5);
    const running = existing.find((r) => r.status === "running");
    if (running) {
      return NextResponse.json(
        {
          error: `已有 Run #${running.run_number} 正在执行，请等待完成后再触发`,
          running_run_id: running.id,
        },
        { status: 409 }
      );
    }

    let caseSetVersion = "8-case-v1";
    try {
      const body = await request.json();
      if (body?.case_set_version) caseSetVersion = String(body.case_set_version);
    } catch {
      // 无 body 也允许触发（默认版本）
    }

    // 1. 捕获 Config 快照（当前系统配置，不可变绑定）
    const configSnapshot = await captureConfigSnapshot(caseSetVersion);

    // 2. 创建 Run（status=running）
    const run = await createEvalRun(configSnapshot);

    // 3. 后台执行（不阻塞响应；失败时 Run 状态置 failed）
    void executeEvalRun(run.id);

    return NextResponse.json({
      run: { id: run.id, run_number: run.run_number, status: "running" },
      message: `Run #${run.run_number} 已触发，正在逐条跑 ${caseSetVersion} Case`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** GET /api/eval/runs — Run 历史列表 */
export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.min(Number(limitParam) || 20, 100) : 20;
    const runs = await getEvalRuns(limit);
    return NextResponse.json({ runs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
