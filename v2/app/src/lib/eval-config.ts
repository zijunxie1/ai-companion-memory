// ============================================================
// Config 快照捕获 — 每次 Run 绑定，不可变（TASK-005A v2.1）
// 覆盖 16 个可修改环节的可见部分
//
// 诚实原则：能真实采集的值如实记录；采集不到的值显式标注
// "unavailable" + reason，不得用硬编码值伪装成真实采集。
// 来源分类：observed / code / declared / derived（见契约）；
// 本任务无任何字段标 observed——外部服务（Dify / mem0 容器）
// 实际执行无法从应用侧观测。
//
// 纯逻辑（字段组装 / 哈希解析 / 展示行）在 eval-snapshot-core.ts，
// 本文件只负责采集（env / DB / 文件）并调用组装。
// ============================================================

import { env } from "./env";
import { getUserPersona } from "./db";
import { JUDGE_RUBRIC_VERSION, JUDGE_SYSTEM_PROMPT } from "./eval-llm-judge";
import { hashContent } from "./eval-hash";
import { readExtractPromptHash } from "./eval-extract-prompt";
import {
  CASE_SET_VERSION_DEFAULT,
  buildSnapshot,
  derivedField,
  unavailableField,
} from "./eval-snapshot-core";
import type { EvalConfig } from "./eval-types";

export { hashContent };

/**
 * 捕获当前系统 Config 快照（Run 创建时调用，一次性写入，不可变）
 *
 * 采集路径：
 * - persona_data_hash：users 表 Persona JSON 实时计算（derived）
 * - extract_prompt_hash：读仓库版本化源码 mem0-server/main.py 解析计算
 *   （repository source；读取/解析失败仅该字段 unavailable，不使 Run 失败）
 * - judge_prompt_hash：从导出常量 JUDGE_SYSTEM_PROMPT 直接计算（derived）
 * - 其余字段：共享常量（code）/ env 声明（declared）/ 诚实边界（unavailable+reason）
 */
export async function captureConfigSnapshot(
  caseSetVersion = CASE_SET_VERSION_DEFAULT
): Promise<EvalConfig> {
  // Persona 内容哈希（users 表实时计算；读取失败 → unavailable + reason）
  let personaHash: string | null = null;
  try {
    const persona = await getUserPersona(env.EVAL_USER_ID);
    if (persona) {
      personaHash = hashContent(JSON.stringify(persona));
    } else {
      // eval-runner 用户可能不存在，回退 demo-alice 的 Persona 哈希
      const demo = await getUserPersona(env.DEMO_USER_ID);
      personaHash = demo ? hashContent(JSON.stringify(demo)) : null;
    }
  } catch {
    personaHash = null;
  }
  const persona = personaHash
    ? derivedField(
        personaHash,
        "users 表 Persona JSON（getUserPersona，实时计算）"
      )
    : unavailableField(
        "users 表 Persona（getUserPersona）",
        "读取 Persona 失败或不存在（eval-runner 与 demo-alice 均无数据）"
      );

  // mem0 抽取 Prompt 内容哈希（独立处理，不使 Run 失败）
  const extractPrompt = readExtractPromptHash(process.cwd());

  // Judge Prompt 内容哈希（从导出常量直接计算；不解析源文件、不硬编码）
  const judgePrompt = derivedField(
    hashContent(JUDGE_SYSTEM_PROMPT),
    "eval-llm-judge.ts:15 JUDGE_SYSTEM_PROMPT（导出常量，运行时原样发送）"
  );

  return buildSnapshot({
    chatModel: process.env.CHAT_MODEL,
    extractModel: process.env.MEM0_LLM_MODEL,
    chatflowVersion: process.env.CHATFLOW_VERSION,
    judgeModelEnv: process.env.JUDGE_MODEL,
    judgeModelCodeDefault: env.JUDGE_MODEL,
    persona,
    extractPrompt,
    judgePrompt,
    judgeRubricVersion: JUDGE_RUBRIC_VERSION,
    caseSetVersion,
  });
}
