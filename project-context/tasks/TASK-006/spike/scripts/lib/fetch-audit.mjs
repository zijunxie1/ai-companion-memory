// ============================================================
// 运行期网络审计：包装全局 fetch，逐次记录 URL，断言仅 loopback
// （DRAFT v1.2 §5.1 / §6.2 无外发验证；零容忍非 loopback）
// ============================================================
import fs from "node:fs";
import path from "node:path";

const ALLOWED_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

let logPath = null;

export function installFetchAudit(logFile) {
  logPath = logFile;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init && init.method) || "GET";
    const line = `${new Date().toISOString()} ${method} ${url}`;
    appendLog(line);

    let host = null;
    try {
      host = new URL(url).hostname;
    } catch {
      appendLog(`URL_PARSE_FAIL ${url}`);
      throw new Error(`网络边界审计：URL 解析失败 ${url}`);
    }
    if (!ALLOWED_HOSTS.has(host)) {
      appendLog(`BLOCKED_NON_LOOPBACK ${url} (host=${host})`);
      throw new Error(`网络边界违规：非 loopback 目标 ${url}（host=${host}），已中止`);
    }
    return originalFetch(input, init);
  };
}

function appendLog(line) {
  if (!logPath) return;
  try {
    fs.appendFileSync(logPath, line + "\n", "utf8");
  } catch {
    // 审计日志写入失败不阻塞测量（但会由调用方在最终核验时发现）
  }
}

export function auditLogPath() {
  return logPath;
}

export function ensureAuditFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `# TASK-006 Spike 网络审计 ${new Date().toISOString()}\n`, "utf8");
  return filePath;
}
