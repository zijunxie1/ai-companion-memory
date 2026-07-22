// ============================================================
// GET /api/conversations/[user_id] — 获取用户对话历史
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getRecentConversations } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  try {
    const conversations = await getRecentConversations(user_id, 50);
    return NextResponse.json({ conversations });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
