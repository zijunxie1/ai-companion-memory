// ============================================================
// TASK-006 R3 Spike 脚本共享配置（只读；仅 loopback）
// 来源：preflight-check.md（P1 mem0 host 端口 8100；P3 PG 默认凭据）
// ============================================================
import path from "node:path";

export const MEM0_BASE_URL = "http://127.0.0.1:8100"; // preflight P1 实测
export const TOP_K = 10; // 候选数 5-6，limit=10 足够返回全部候选

// pg 依赖复用主检出已预装 node_modules（preflight P4）
export const PG_TARGET_BASE = "E:/正式作品/v2/app";

// 数据目录（spike-r3/ 下）
export const DATA_DIR = path.join(import.meta.dirname, "..", "data");

// 冻结文件与派生文件
export const PARENT_DEFINITION = path.join(import.meta.dirname, "..", "candidate-pool-definition.json");
export const CALIBRATION_DEFINITION = path.join(import.meta.dirname, "..", "calibration-only-definition.json");

// 方案 B cross-encoder 模型（Founder 已裁决下载，model-facts.md）
export const CROSS_ENCODER_MODEL = "BAAI/bge-reranker-base";

export function nowIso() {
  return new Date().toISOString();
}
