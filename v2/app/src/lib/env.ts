// ============================================================
// 环境变量集中管理
// ============================================================

export const env = {
  // mem0 Server
  MEM0_API_URL: process.env.MEM0_API_URL || "http://localhost:8900",

  // Dify
  DIFY_API_URL: process.env.DIFY_API_URL || "http://localhost:5001/v1",
  DIFY_API_KEY: process.env.DIFY_API_KEY || "",

  // 业务数据库
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ai_companion",

  // Prompt 版本（用于 Trace 追溯）
  PROMPT_VERSION: "v2.0-mem0",

  // Demo 用户
  DEMO_USER_ID: process.env.DEMO_USER_ID || "demo-alice",
};
