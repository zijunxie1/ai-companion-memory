// ============================================================
// Memory CRUD API Routes
//
// GET    /api/memories/[user_id]               — 获取用户全部 Memory
// DELETE /api/memories/[user_id]/[memory_id]   — 删除 Memory
// PUT    /api/memories/[user_id]/[memory_id]   — 更新 Memory 内容
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mem0 } from "@/lib/mem0-client";

/** GET /api/memories/[user_id] — 获取用户全部 Memory */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  try {
    const memories = await mem0.getAll(user_id);
    return NextResponse.json({ memories });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
