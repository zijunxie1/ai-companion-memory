# TASK-006 第三轮 Spike — 预装检查记录（S0 preflight-check）

```yaml
doc_type: 预装检查记录（DRAFT v1.1 §7 S0 / 实施计划 v1.1 §7 S0 产物）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
check_date: 2026-08-13（Asia/Shanghai）
checker: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
plan_commit: 7996847（实施计划 v1.1）
branch: feature/task-006-r3-spike
conclusion: 共享依赖 P1-P4/P6 通过；方案 B 已下载核验（B-1 bge-reranker-base）；方案 C S0.3 连通检查通过（HTTP 200，认证通过，模型已裁决为 deepseek-v4-flash）；docker diff 无产品代码改动
```

## 核验结果

| # | 检查项 | 结果 | 证据（命令输出摘要） |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | ✅ | 容器 `v2-mem0-server` Up；host 端口 `8100 → 8900/tcp`；`curl http://127.0.0.1:8100/openapi.json` → HTTP 200 |
| P2 | mem0 版本 | ✅ | `docker exec v2-mem0-server python -c "import mem0; print(mem0.__version__)"` → **2.0.13** |
| P3 | PostgreSQL（ai_companion）loopback 可达、评测表存在 | ✅ | `v2-postgres` Up（healthy）；`docker exec v2-postgres psql -U postgres -d ai_companion -t -c "select count(*) from eval_cases;"` → **8**（只读） |
| P4 | Node/npm 现有依赖满足脚本运行 | ✅ | node **v22.23.2**；pg **8.22.0**（经主仓库 `E:\正式作品\v2\app\node_modules` 解析，worktree 无 node_modules，只读复用，不安装任何包） |
| P5-A | 方案 B 专属：fastembed 缓存含 reranker/cross-encoder 权重 | ❌ | 容器内 `/tmp/fastembed_cache/` 仅 `models--Qdrant--bge-small-zh-v1.5`（embedding）与 `models--Qdrant--bm25`；全容器 find 无任何 `*reranker*` / `*cross*encoder*` / `*bge-reranker*` 目录；`HF_HOME` 与 `TRANSFORMERS_CACHE` 均为空 |
| P5-B | 方案 C 专属：外部模型接口连通性（S0.3） | ✅ | 2026-08-13 S0.3 执行：`GET https://api.deepseek.com/v1/models` → **HTTP 200**，Bearer 认证通过，返回模型 `[deepseek-v4-flash, deepseek-v4-pro]`；仅此一次只读列表请求，未发送任何评测/用户数据；**发现事实差异见下方 S0.3 记录** |
| P6 | 网络边界：默认禁止外部访问；方案 C 获准后仅放行指定 DeepSeek 地址，其余外部访问仍禁止 | ✅ | `HTTP_PROXY/HTTPS_PROXY/ALL_PROXY=http://127.0.0.1:7890`（本机代理，存在真实外网出口）；`NO_PROXY=127.0.0.1,localhost,::1`；实验脚本 fetch 白名单默认仅 loopback，方案 C 获准后追加 DeepSeek 白名单 |

## S0.3 方案 C 连通检查记录（2026-08-13）

> 唯一目标：只验证已授权 DeepSeek 接口能否连接和通过身份验证；不发送评测题、Memory 或任何真实用户数据。

| 项 | 脱敏记录 |
|---|---|
| 时间 | 2026-08-13（Asia/Shanghai） |
| 接口（脱敏） | `https://api.deepseek.com/v1/models`（GET，只读列表；基础地址 = `https://api.deepseek.com/v1`，已含 `/v1`，未重复拼接） |
| 认证方式 | `Authorization: Bearer <REDACTED>`（密钥来自容器 env `MEM0_LLM_API_KEY`，**全文未回显、未记录任何密钥特征**） |
| 状态码 | **HTTP 200**（认证通过） |
| 返回内容 | 可用模型 `["deepseek-v4-flash", "deepseek-v4-pro"]` |
| 调用次数 | 1 次（仅本次只读列表请求） |
| 费用 | 0 元（models 列表请求不计费） |
| 网络边界 | 仅访问白名单 `api.deepseek.com` 一个地址；未发送评测题/Memory/真实用户数据 |

### ✅ 模型名事实差异（已由 Founder 裁决，2026-08-13）

- **Founder 授权卡原文**：方案 C 使用"现有 DeepSeek `deepseek-chat` 接口"；
- **容器实际配置**：`MEM0_LLM_MODEL=deepseek-v4-flash`（非 `deepseek-chat`）；
- **API 实际可用模型**：`deepseek-v4-flash`、`deepseek-v4-pro`——**列表中没有 `deepseek-chat`**；
- **Founder 裁决（2026-08-13）**：方案 C 实验模型由 `deepseek-chat` 调整为 **`deepseek-v4-flash`**，仅限本次合成数据 Spike；DeepSeek 白名单、≤100 次、≤10 元、零真实用户数据等限制不变。

> 结论：方案 C 实验模型名 = `deepseek-v4-flash`（已裁决确定）；其余 C 授权边界（白名单/次数/费用/零真实数据）不变。

## S0.4 docker diff 核验（零产品改动）

- `docker diff v2-mem0-server` 输出分类：
  - **历史 spike 脚本残留**（`/app/spike_s2.py` / `spike_s2b.py` / `spike_s3.py` / `spike_s4.py` / `spike_s4b.py` / `spike_probe.py`）：时间戳 `2026-08-09 18:17~18:22 UTC` = 主仓库 `E:\正式作品\eval\spikes\`（08-10 02:16~02:22 +08:00）的 **TASK-004 第一轮脚本**，经 `docker exec` 拷入容器执行的历史残留，非本轮产生；
  - **运行时缓存**（`/tmp/fastembed_cache`、`/root/.cache/huggingface`、`/usr/local/lib/python3.12/*` pyc、`/root/.mem0`）：mem0 容器正常运行时状态；
  - **无产品源文件改动**：`main.py` 及任何 mem0-server 源文件、`requirements`、`.env` 均无 `C` 标记（`grep -E "^C /app/(main|mem0|config|requirements|.env)"` 空结果）。
- 结论：**零产品代码改动**；分支 diff 仅含 TASK-006 文档与 `spike-r3/` 文件。

## 环境事实修正记录（与实施计划附录的差异）

1. **Docker Desktop 启动前 daemon 未运行**：本次 S0 开始时 `docker` 报 pipe 不存在（daemon 未启动），经 `Start-Process 'Docker Desktop.exe'` 恢复已预装组件（非下载/安装/外部调用）；容器随 Docker Desktop 启动自动恢复（compose restart policy）。检查全程只读，未向容器写入任何新文件。
2. **容器内存在 TASK-004 历史 spike 脚本残留**：属历史证据，本轮不清理（交接包 §12 禁止 11：历史工作区只记 W2，禁止写入/同步/清理）。

## 结论与后续动作（2026-08-13 更新，S0.3 已执行）

1. **共享依赖 P1–P4、P6 全部通过** → 方案 A（零新增依赖基线）可执行；
2. **方案 B 已下载核验完成** → B-1 `bge-reranker-base`（固定 sha `2cfc18c...`）可执行（见 `model-facts.md`）；
3. **方案 C S0.3 连通检查通过** → 接口可连接 + 认证通过（HTTP 200）；模型名已由 Founder 裁决为 `deepseek-v4-flash`（仅限本次合成数据 Spike）；
4. **完成度分档**（DRAFT §8.0）：三方案均已获授权并具备执行条件 → 待 S1 冻结后进入完整对比实验。

## 下一步（S0.3 已通过，进入 S1 冻结统一测试题）

S0 预装检查 + S0.3 方案 C 连通检查全部完成。下一步 = **S1 冻结统一候选池与 holdout**（三方案共用，A/B/C 不得提前查看 holdout）。本轮不直接造题，等待 Founder 确认后进入 S1。
