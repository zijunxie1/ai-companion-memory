// ============================================================
// Memory 单条操作
// DELETE /api/memories/[user_id]/[memory_id] — 删除
// PUT    /api/memories/[user_id]/[memory_id] — 更新内容
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mem0 } from "@/lib/mem0-client";

/** DELETE — 删除 Memory */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ user_id: string; memory_id: string }> }
) {
  const { user_id, memory_id } = await params;
  try {
    await mem0.delete(memory_id);
    return NextResponse.json({ success: true, memory_id, user_id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** PUT — 更新 Memory 内容 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; memory_id: string }> }
) {
  const { user_id, memory_id } = await params;
  try {
    const body = await request.json();
    if (!body.content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }
    await mem0.update(memory_id, body.content);
    return NextResponse.json({ success: true, memory_id, user_id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
