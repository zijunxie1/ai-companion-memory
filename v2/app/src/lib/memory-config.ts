// ============================================================
// 共享只读配置：产品行为与 Config 快照共用同一常量源
//
// 规则（TASK-005A v2.1）：
// - 0.35 / 5 / async 必须来自本模块（chat/route.ts 与快照共用），
//   禁止为快照单独创建 EVAL_RECALL_* / EVAL_WRITE_MODE 影子 env；
// - 修改本模块值 = 修改产品行为，必须经正式任务流程评估。
// ============================================================

/** 召回相似度阈值（chat/route.ts:55 共用；低于阈值的 Memory 不返回） */
export const RECALL_THRESHOLD = 0.35;

/** 召回条数（chat/route.ts:56 共用；mem0.search top_k） */
export const RECALL_TOP_K = 5;

/** Memory 写入模式（chat/route.ts:122 异步写入路径） */
export const WRITE_MODE = "async";
