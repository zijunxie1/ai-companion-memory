// ============================================================
// 危机表达正则 — 共享纯模块（Review R4 P2-3）
// /api/chat 与 eval-program-rules 共用一份，避免漂移。
// 范围与局限：覆盖常见简体中文危机表达；模型改写/变体需通过 E007 测试持续补充。
// ============================================================

/** 危机表达正则（命中则默认不写入长期 Memory，CR-A） */
export const CRISIS_PATTERN =
  /不想活|不想活了|自杀|轻生|结束生命|活着没意思|活着太累|想死|了结自己|撑不下去|活不下去/;

/** 检查文本是否包含危机表达 */
export function containsCrisis(text: string): boolean {
  return CRISIS_PATTERN.test(text);
}
