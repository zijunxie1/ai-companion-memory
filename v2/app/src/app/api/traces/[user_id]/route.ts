// ============================================================
// GET /api/traces/[user_id] — 获取用户 Trace 列表
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getTraces } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  try {
    const traces = await getTraces(user_id);
    return NextResponse.json({ traces });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
