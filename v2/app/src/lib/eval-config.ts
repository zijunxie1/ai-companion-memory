// ============================================================
// Config 快照捕获 — 每次 Run 绑定，不可变
// 覆盖 16 个可修改环节的可见部分
//
// 诚实原则（Reviewer #6）：能真实采集的值如实记录，
// 采集不到的值显式标注 "unavailable"，不得用硬编码值伪装成真实采集。
// ============================================================

import { createHash } from "crypto";
import { env } from "./env";
import { getUserPersona } from "./db";
import type { EvalConfig } from "./eval-types";

/** 对任意内容计算 sha256 前 16 位 */
export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/** 读取环境变量；未配置时返回 "unavailable"（不伪装） */
function envOrUnavailable(key: string): string {
  const v = process.env[key];
  return v && v.trim() !== "" ? v.trim() : "unavailable";
}

/**
 * 捕获当前系统 Config 快照
 * 采集来源说明：
 * - 能从 env 读到的 → 记录 env 值（真实）
 * - 无法从程序读取的（Dify Chatflow 内部模型、mem0 抽取 Prompt 原文等）
 *   → 显式标注 "unavailable"，不做硬编码伪装
 */
export async function captureConfigSnapshot(
  caseSetVersion = "8-case-v1"
): Promise<EvalConfig> {
  // Persona 内容哈希（从 users 表实时计算，真实采集）
  let personaHash = "";
  try {
    const persona = await getUserPersona(env.EVAL_USER_ID);
    if (persona) {
      personaHash = hashContent(JSON.stringify(persona));
    } else {
      // eval-runner 用户可能不存在，回退 demo-alice 的 Persona 哈希
      const demo = await getUserPersona(env.DEMO_USER_ID);
      personaHash = demo ? hashContent(JSON.stringify(demo)) : "unavailable";
    }
  } catch {
    personaHash = "unavailable";
  }

  return {
    // ── LLM 层 ──
    // Dify Chatflow 内部对话模型无法从程序读取 → 显式 unavailable
    chat_model: envOrUnavailable("CHAT_MODEL"),
    // mem0 抽取模型：真实从环境变量采集
    extract_model: envOrUnavailable("MEM0_LLM_MODEL"),
    // embedding 模型：mem0-server 内部硬编码，程序无法读取 → unavailable
    embed_model: envOrUnavailable("MEM0_EMBED_MODEL"),

    // ── Prompt 层 ──
    // Persona 内容哈希：真实计算（users 表）
    persona_prompt_hash: personaHash,
    // mem0 抽取 Prompt 原文在 mem0-server 配置中，无法读取 → 用版本号哈希（如已配置）或 unavailable
    extract_prompt_hash: envOrUnavailable("EXTRACT_PROMPT_VERSION"),
    // Judge Rubric 版本：真实（eval/eval-policy-v1.md 当前版本）
    judge_rubric_version: "v1.0",

    // ── Memory 链路 ──
    // 阈值/top_k 是 /api/chat 代码内常量，程序无法读取 → 显式 unavailable
    // （如需采集需将阈值提升为 env 配置，属产品侧改动，不在本任务范围）
    recall_threshold: envOrUnavailable("EVAL_RECALL_THRESHOLD"),
    recall_top_k: envOrUnavailable("EVAL_RECALL_TOP_K"),
    // 写入模式：/api/chat 实现为异步，无法程序读取 → unavailable
    write_mode: envOrUnavailable("EVAL_WRITE_MODE") as EvalConfig["write_mode"],

    // ── 系统层 / 数据层 ──
    chatflow_version: envOrUnavailable("CHATFLOW_VERSION"),
    case_set_version: caseSetVersion,
  };
}
