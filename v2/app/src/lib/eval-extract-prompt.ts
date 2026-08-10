// ============================================================
// mem0 抽取 Prompt 哈希采集（服务端专用；repository source）
//
// 来源语义：仓库版本化源码（v2/mem0-server/main.py）中的
// MEMORY_EXTRACT_PROMPT 内容，**不是运行容器实际执行的 Prompt**
// （无只读配置接口，不得视为 observed）。
// 独立 try/catch：读取/解析失败仅返回 unavailable 结果，不使 Run 失败。
// ============================================================

import * as fs from "fs";
import * as path from "path";
import { hashContent } from "./eval-hash.ts";
import {
  derivedField,
  parseMemoryExtractPrompt,
  unavailableField,
} from "./eval-snapshot-core.ts";
import type { FieldResult } from "./eval-snapshot-core.ts";

/** extract prompt 文件路径：相对 Next.js 运行目录（npm run dev / build，cwd = v2/app） */
export function extractPromptFilePath(cwd: string): string {
  return path.join(cwd, "..", "mem0-server", "main.py");
}

/** 读取并计算 extract prompt 内容哈希（repository source；失败 → unavailable + reason） */
export function readExtractPromptHash(cwd: string): FieldResult {
  const sourceRef =
    "v2/mem0-server/main.py:107-117（repository source——仓库版本化源码中的 Prompt 内容，非运行容器观测；无只读配置接口，不得视为 observed）";
  try {
    const content = fs.readFileSync(extractPromptFilePath(cwd), "utf8");
    const prompt = parseMemoryExtractPrompt(content);
    if (prompt === null) {
      return unavailableField(
        sourceRef,
        "MEMORY_EXTRACT_PROMPT 常量解析失败（格式变化或出现未知转义）；请检查 mem0-server/main.py"
      );
    }
    return derivedField(hashContent(prompt), sourceRef);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return unavailableField(
      sourceRef,
      `读取 mem0-server/main.py 失败：${msg}；若部署布局变化，请更新 extractPromptFilePath`
    );
  }
}
