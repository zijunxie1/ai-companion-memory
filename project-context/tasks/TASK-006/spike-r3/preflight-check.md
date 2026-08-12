# TASK-006 第三轮 Spike — 预装检查记录（S0 preflight-check）

```yaml
doc_type: 预装检查记录（DRAFT v1.1 §7 S0 / 实施计划 v1.1 §7 S0 产物）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
check_date: 2026-08-13（Asia/Shanghai）
checker: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
plan_commit: 7996847（实施计划 v1.1）
branch: feature/task-006-r3-spike
conclusion: 共享依赖全部通过；方案 B 专属依赖 P5-A 未通过（无 reranker 权重）；方案 C 未获外部调用授权（P5-B 跳过）；docker diff 无产品代码改动
```

## 核验结果

| # | 检查项 | 结果 | 证据（命令输出摘要） |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | ✅ | 容器 `v2-mem0-server` Up；host 端口 `8100 → 8900/tcp`；`curl http://127.0.0.1:8100/openapi.json` → HTTP 200 |
| P2 | mem0 版本 | ✅ | `docker exec v2-mem0-server python -c "import mem0; print(mem0.__version__)"` → **2.0.13** |
| P3 | PostgreSQL（ai_companion）loopback 可达、评测表存在 | ✅ | `v2-postgres` Up（healthy）；`docker exec v2-postgres psql -U postgres -d ai_companion -t -c "select count(*) from eval_cases;"` → **8**（只读） |
| P4 | Node/npm 现有依赖满足脚本运行 | ✅ | node **v22.23.2**；pg **8.22.0**（经主仓库 `E:\正式作品\v2\app\node_modules` 解析，worktree 无 node_modules，只读复用，不安装任何包） |
| P5-A | 方案 B 专属：fastembed 缓存含 reranker/cross-encoder 权重 | ❌ | 容器内 `/tmp/fastembed_cache/` 仅 `models--Qdrant--bge-small-zh-v1.5`（embedding）与 `models--Qdrant--bm25`；全容器 find 无任何 `*reranker*` / `*cross*encoder*` / `*bge-reranker*` 目录；`HF_HOME` 与 `TRANSFORMERS_CACHE` 均为空 |
| P5-B | 方案 C 专属：外部模型接口连通性 | ⏭️ 跳过 | **方案 C 未获 Founder 外部调用授权**（D-T006-R3-C-EXT 待决）→ 按实施计划 §7 S0.3，跳过 P5-B，标记方案 C 不可执行；本检查未发起任何外部调用 |
| P6 | 网络边界：仅 loopback | ✅ | `HTTP_PROXY/HTTPS_PROXY/ALL_PROXY=http://127.0.0.1:7890`（loopback 本机代理）；`NO_PROXY=127.0.0.1,localhost,::1`；脚本 fetch 白名单仅 loopback |

## S0.4 docker diff 核验（零产品改动）

- `docker diff v2-mem0-server` 输出分类：
  - **历史 spike 脚本残留**（`/app/spike_s2.py` / `spike_s2b.py` / `spike_s3.py` / `spike_s4.py` / `spike_s4b.py` / `spike_probe.py`）：时间戳 `2026-08-09 18:17~18:22 UTC` = 主仓库 `E:\正式作品\eval\spikes\`（08-10 02:16~02:22 +08:00）的 **TASK-004 第一轮脚本**，经 `docker exec` 拷入容器执行的历史残留，非本轮产生；
  - **运行时缓存**（`/tmp/fastembed_cache`、`/root/.cache/huggingface`、`/usr/local/lib/python3.12/*` pyc、`/root/.mem0`）：mem0 容器正常运行时状态；
  - **无产品源文件改动**：`main.py` 及任何 mem0-server 源文件、`requirements`、`.env` 均无 `C` 标记（`grep -E "^C /app/(main|mem0|config|requirements|.env)"` 空结果）。
- 结论：**零产品代码改动**；分支 diff 仅含 TASK-006 文档与 `spike-r3/` 文件。

## 环境事实修正记录（与实施计划附录的差异）

1. **Docker Desktop 启动前 daemon 未运行**：本次 S0 开始时 `docker` 报 pipe 不存在（daemon 未启动），经 `Start-Process 'Docker Desktop.exe'` 恢复已预装组件（非下载/安装/外部调用）；容器随 Docker Desktop 启动自动恢复（compose restart policy）。检查全程只读，未向容器写入任何新文件。
2. **容器内存在 TASK-004 历史 spike 脚本残留**：属历史证据，本轮不清理（交接包 §12 禁止 11：历史工作区只记 W2，禁止写入/同步/清理）。

## 结论与后续动作

1. **共享依赖 P1–P4、P6 全部通过** → 方案 A（零新增依赖基线）可执行；
2. **方案 B 专属依赖 P5-A 未通过**（本机无任何 reranker/cross-encoder 权重）→ 按 DRAFT §9.1 候选级停止第 4 条，**标记方案 B 不可执行**；不产出 model-facts.md（权重未缓存）；**不得下载/安装/替换权重**（交接包 §12 禁止 13）；
3. **方案 C 未获外部调用授权** → 标记方案 C 不可执行；P5-B 跳过，未发起任何外部调用；
4. **完成度分档**（DRAFT §8.0）：B 未获下载授权 + C 未获外部调用授权 → 本轮只能形成**部分证据**（仅方案 A 主实验 + 补充实验），**不得宣称第三轮完整通过**，须返回 Founder 决定是否补授权 / 缩小范围 / 停止。

## 下一步（等待 Founder 决策）

S0 预装检查已完成。因方案 B/C 均不可执行，在进入 S1 冻结候选池前，需 Founder 裁决：

- **选项 1**：只执行方案 A（零新增依赖基线）主实验 + 补充实验，形成部分证据后如实报告；
- **选项 2**：批准方案 B 下载授权（需先产出模型事实报告 + Founder 逐项裁决下载哪个候选，见 D-T006-R3-B-MODEL）；
- **选项 3**：批准方案 C 外部调用（需单独 Change Request + 数据外发政策裁决，见 D-T006-R3-C-EXT）；
- **选项 4**：停止本轮 Spike。

Builder 不自行缩成单方案，不跳过未授权方案。
