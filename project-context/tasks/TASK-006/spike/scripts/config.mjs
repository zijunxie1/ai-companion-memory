// ============================================================
// TASK-006 Spike 脚本共享配置（只读；仅 loopback）
// 来源：preflight-check.md（P1 mem0 host 端口 8100 实测；P3 PG 默认凭据来自 v2/docker-compose.yml）
// ============================================================
import path from "node:path";

export const MEM0_BASE_URL = "http://127.0.0.1:8100"; // preflight P1 实测
export const TOP_K = 5;

// pg 依赖复用主检出已预装 node_modules（preflight P4；createRequire 基路径）
export const PG_TARGET_BASE = "E:/正式作品/v2/app";

// PG 只读连接（本地测试库默认凭据，来源 v2/docker-compose.yml 默认值，非生产密钥）
export const PG = {
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "ai_companion",
};

// 校准场景（8 Case 中的 E001-E005；query 来自 002_eval.sql 种子 input_text）
export const CALIBRATION_CASES = ["E001", "E002", "E003", "E004", "E005"];
export const CALIBRATION_QUERIES = {
  E001: "又失眠了……",
  E002: "我最近开始学吉他了",
  E003: "我家猫叫什么来着",
  E004: "今天天气不错",
  E005: "我不是不喜欢你问，我只是不想每次都解释",
};

// 3 轮独立采集（取最近 3 个 completed run 的评测 user，池独立）
export const ROUNDS = 3;

// 数据目录（spike/data/）
export const DATA_DIR = path.join(import.meta.dirname, "..", "data");
export const CALIBRATION_DIR = path.join(DATA_DIR, "calibration");
export const AUDIT_DIR = path.join(DATA_DIR, "audit");

export function nowIso() {
  return new Date().toISOString();
}
