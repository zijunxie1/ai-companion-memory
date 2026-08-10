// ============================================================
// 哈希工具（服务端 + 测试使用；Node crypto）
// 客户端组件不得引入本模块（crypto 为 Node 内置）。
// ============================================================

import { createHash } from "crypto";

/** 对任意内容计算 sha256 前 16 位 */
export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}
