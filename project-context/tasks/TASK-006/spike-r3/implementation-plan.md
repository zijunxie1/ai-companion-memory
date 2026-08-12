# TASK-006 第三轮「检索后相关性判断」对照 Spike — 实施计划（Review 2）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-006/spike-r3-candidate-draft.md（v1.1，APPROVED，本任务唯一权威方案）
  - project-context/tasks/TASK-006/spike-r3-builder-handoff.md（十七字段交接包）
  - project-context/tasks/TASK-006/spike-r2-candidate-draft.md（v1.2，APPROVED + 8 项约束；方向与纪律参考）
  - project-context/tasks/TASK-006/spike-r2-research.md（第二轮公开方案调研，方向依据）
  - project-context/tasks/TASK-006/spike-stop-cr.md（CR-T006-SPIKE-STOP-01，DECIDED-A）
  - project-context/tasks/TASK-006/spike/（第一轮证据：preflight-check.md / holdout-freeze.md / mechanism-freeze.md / implementation-plan.md / scripts/ / data/）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/mem0-client.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/app/api/chat/route.ts
doc_type: Builder 实施计划（Review 2 用；阶段 1 交付物）
task_id: TASK-006（内部第三轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R3）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
status: DRAFT_FOR_REVIEW_2（等待 Founder/Reviewer 批准；批准前不进入任何实测）
execution_mode: persistent_session（已确认）
assigned_role: Builder（长期会话）
assigned_session: TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike
branch: feature/task-006-r3-spike
plan_version: v1.0
author: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
date: 2026-08-13
```

> **本计划批准前禁止一切实测动作**：禁止预装检查执行、禁止确定方案 B 具体模型、禁止下载或安装、禁止写脚本、禁止建 holdout、禁止外部调用、禁止任何实测（交接包 §12 禁止 12/13 + DRAFT §7 禁止 1/2/3/4）。
> 本文件只做规划与设计；批准后按 §7 分步骤执行，每步落盘证据。

---

## 1. 当前事实与待验证假设

### 1.1 已核验事实（证据锚点）

| 事实 | 证据 |
|---|---|
| E004 缺陷仍存在：Run #28 天气话题召回无关 2 条（失眠 0.431、橘猫 0.360，允许 ≤ 1） | `release-qa-report.md` §5/§6；`eval_runs.run_number=28` |
| E001 正向召回：失眠 0.660 + 橘猫 0.445（两条件均按"相关"计入，PASS） | `release-qa-report.md` §5；`eval-program-rules.ts:401-423` |
| 产品召回链路：`mem0.search(user_id, query, 5)` → `score >= 0.35` 过滤 | `chat/route.ts:55-58`；`memory-config.ts`（RECALL_THRESHOLD=0.35 / RECALL_TOP_K=5） |
| REST 请求参数面：当前搜索接口只接收 `{ user_id, query, limit }`，**未开放 threshold / rerank** | ✅ `mem0-client.ts:16-31`（`JSON.stringify({ user_id, query, limit })`） |
| mem0 版本 = 2.0.13（容器 v2-mem0-server），host 端口 = 8100 | 第一轮 `spike/preflight-check.md` P1/P2 |
| mem0 Python API 能力：`search(..., threshold: float = 0.1, rerank: bool = False)`；RerankerFactory 支持 5 种 provider | ✅ `main.py:1385-1386`、`main.py:1499-1503`、`factory.py:226-241` |
| 当前配置 `reranker = None`（默认）→ `Memory.search` 内 `self.reranker = None` | ✅ `main.py:505-509`；`memory-config.ts` 无 reranker 配置 |
| 零条返回能力：mem0 search 过滤后可返回空 results → 产品层 `usedMemory` 可为空数组 | ✅ `main.py:989/1043`；`chat/route.ts:57-64` |
| 本机 fastembed 缓存：仅 `models--Qdrant--bm25` + `models--Qdrant--bge-small-zh-v1.5`；**无任何 reranker/cross-encoder 权重** | 第一轮 `spike/preflight-check.md` P5；第二轮 `spike-r2/model-facts.md`（未发现 reranker 权重） |
| fastembed 0.8.0；`TextCrossEncoder` import ok（未实例化）；无权重可加载 | 第二轮 `spike-r2/preflight-check.md` P5-A2 |
| mem0 容器 env：`MEM0_LLM_BASE_URL=https://api.deepseek.com/v1`、`MEM0_LLM_MODEL=deepseek-chat` | 第二轮 `spike-r2/preflight-check.md` P6；`v2/app/.env.example` |
| 第一轮失败根因：R1 词法不可分（16 版本分离边际全负）/ R2 手工词表覆盖不足（H4 失败）/ R3 F1 高是"阈值选在重叠区"假象 | `spike/data/scores/candidate1.json`、`spike/data/scores/candidate2.json`、`spike/data/holdout/run.json` |
| 第二轮预装检查：共享依赖 P1–P6 通过；候选 A 专属 P5-A 未发现 reranker 权重 → 只停候选 A | 第一轮 `spike/preflight-check.md`（共享全通过）；第二轮 DRAFT v1.2 §5.4 |
| 分支 `feature/task-006-r3-spike` @ `e8dc976`，从 `origin/main` @ `6660ca2` 派生，工作区干净 | 本次只读核验（`git rev-parse` + `git status` + `git merge-base`） |
| 规划 PR #19 已合入 `origin/main` @ `6660ca2`（DRAFT v1.1 + 决策登记 + 状态同步） | `decision-register.md` D-T006-R3-SPIKE |

### 1.2 待验证假设（Spike 要回答的问题）

| # | 假设 | 实验归属 | 验证方式 | 若证伪 |
|---|---|---|---|---|
| H1 | 方案 A（零新增依赖基线）在固定候选池上用"检索分数 + 校准集定阈值"能比现状 0.35 改善分离质量 | 主实验（A-主） | 固定候选池 F1/分离边际/误删率/零条准确率 | 校准定阈值不优于 0.35 → 方案 A 基线价值仅记录现状，不单独停止 |
| H2 | mem0 原生 `search(threshold=t)` 在召回阶段过滤后能返回零条无关候选（端到端） | 补充实验（A-补） | 逐 threshold 测召回候选集合变化 + 零条行为 | threshold 过滤仍混入无关候选 → 补充实验如实记录 |
| H3 | 方案 B（本地 cross-encoder）与 mem0 原始 score 非冗余（Spearman ρ < 0.9），且提供独立分离信号 | 主实验（B） | 校准集 ρ 诊断 | ρ ≥ 0.9 → 降级冗余对照（仅 B 降级） |
| H4 | 方案 B 在固定候选池上分离边际 > 0.1 且 F1 ≥ 0.9 | 主实验（B） | 固定候选池同口径指标表 | 不达标 → B 候选级停止 | 
| H5 | 方案 C（外部大模型相关性裁判）在固定候选池上效果最强（F1/分离边际上限参照） | 主实验（C） | 固定候选池同口径指标表 | 效果不优于 A/B → 如实记录 |
| H6 | 三方案在"关键相关记忆不得漏掉"独立门上表现一致或不等 | 主实验 | §6.4 独立门检 | 任一方案漏关键记忆 → 独立门不通过（即使 F1 高） |
| H7 | 方案 C 批处理延迟优于逐条调用 | 主实验（C 延迟子项） | C 批 vs 逐条 P50/P95 对比 | 不优于 → 如实记录 |
| H8 | 不同 threshold 下 mem0 召回候选集合发生变化（补充实验关注点） | 补充实验（A-补） | 逐 threshold 候选集合变化 | threshold 不改变候选池 → 如实记录（说明 threshold 在召回阶段无效或效果微弱） |

> **预设淘汰阈值**：本轮**不沿用** P95 > 200ms 淘汰旧前提（DRAFT §6.3 / 交接包 §16 禁止 16）。延迟数据先测真实值，取舍交 Founder。

### 1.3 完成度分档前置声明（DRAFT §8.0）

| 档位 | 成立条件 | 结论 |
|---|---|---|
| 三方案完整对比 | A + B + C **三项均获所需授权并运行完成**（B 获下载授权、C 获外部调用授权） | 可形成"三方案完整对比"结论 |
| 部分证据 | B 未获下载授权或 C 未获外部调用授权/不可执行 | 只形成**部分证据**，**不得宣称第三轮完整通过**，返回 Founder |
| 返回 Founder | 形成部分证据 | Builder **返回 Founder 决定**（补授权 / 缩小范围 / 停止），不得自行缩成单方案 |

> 方案 A 是零新增依赖基线，无需额外授权即可运行。方案 B 需 Founder 批准下载授权后运行。方案 C 需单独 Change Request + Founder 批准外部调用与数据外发政策后运行。

---

## 2. 目标 / 非目标

### 2.1 目标

1. 在**不接入产品路径、不修改产品代码、不下载不安装任何新模型（方案 B/C 获授权前）、不外发任何真实用户数据**的前提下，用三方案对照 Spike 同时验证三种"检索后相关性判断"机制的相对表现；
2. 产出三方案在**统一指标集**上的真实对比（质量/延迟/费用/资源/数据边界），主实验与补充实验**分表**；
3. 把四维取舍交 Founder，为 TASK-006 后续 Change Request 提供证据基础。

### 2.2 非目标

1. 不修改产品代码（`v2/` 任何文件）、正式 8 Case、Schema、评测规则、治理文件；
2. 不接入产品路径；不触碰 TASK-007 / TASK-005B / TASK-004（保持 PAUSED）；
3. 不预先选定最终方案——三方案如实报告，取舍交 Founder；
4. 不预设淘汰阈值（延迟/资源先测，Founder 后裁）；
5. 不预先写死 0.3 / 0.5 / 0.7 等公开项目阈值作为方案阈值；
6. 不手工枚举主题词表 / 固定字面量硬编码；
7. 不复用第一轮 H1–H4 原文、第二轮骨架原文、E001–E005 原文作为 holdout 内容；
8. 不接生产密钥、不部署、不合并、不 force push。

---

## 3. 依赖与前置条件

### 3.1 共享依赖（三方案共同）

| # | 检查项 | 核验方式（只读） | 缺失影响 |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | `docker ps` 确认容器 `v2-mem0-server` Up；`curl http://127.0.0.1:8100/openapi.json` → HTTP 200 | 三方案均依赖 → 缺失则整轮停止 |
| P2 | mem0 版本 = 2.0.13 | `docker exec v2-mem0-server python -c "import mem0; print(mem0.__version__)"` | 同上 |
| P3 | PostgreSQL（ai_companion）loopback 可达、评测表存在 | `docker ps` 确认 `v2-postgres` Up（healthy）；`pg_isready`；`select count(*) from eval_cases`（只读，应 = 8） | 同上 |
| P4 | Node/npm 现有依赖满足脚本运行 | `node --version`（≥ 22）；检查 `v2/app/node_modules` 中 `pg` 解析可用（worktree 无 node_modules，只读复用主仓库已预装依赖） | 影响部分能力，按实际判定 |
| P6 | 网络边界：脚本环境确认仅 loopback | `env \| grep -i proxy`；fetch 白名单仅 `127.0.0.1/::1/localhost`；fetch 包装审计 | 方案 C 外部调用属审批后例外 |

> **P6 特别说明**：当前环境存在 `HTTP_PROXY/HTTPS_PROXY=http://127.0.0.1:7890`（loopback 本机代理）。方案 C 若获授权进入实验，须**单独审计**其发送内容与白名单接口，并将其外部调用行为与 P6 网络隔离纪律的一致性如实记录。

### 3.2 候选专属依赖

| # | 检查项 | 关联方案 | 核验方式 | 缺失处理 |
|---|---|---|---|---|
| P5-A | fastembed 缓存目录是否含 cross-encoder/reranker 权重 | 方案 B | `find /tmp/fastembed_cache -type d -name "models--*reranker*"` 或等价路径检查 | **只停方案 B**（候选级停止 §9.1-4），A/C 不受影响 |
| P5-B | DeepSeek OpenAI 兼容接口连通性（仅连通性，不发送评测内容） | 方案 C | `curl -s -o /dev/null -w "%{http_code}" $MEM0_LLM_BASE_URL/v1/models -H "Authorization: Bearer $DEEPSEEK_API_KEY"`（只读列表请求） | 同左，**只停 C**。方案 C 获授权后此项才执行 |

> **禁止执行会触发下载的实例化命令**。P5-A 全部只读核验。若 P5-A 发现权重缺失，**不得下载、安装或替换权重**，直接标记 B 不可执行（候选级停止）。

### 3.3 方案 B 模型事实报告要求（DRAFT §4.0 / 交接包 §3）

预装检查 P5-A 通过后（若权重已缓存），产出 `spike-r3/model-facts.md`，逐项报告：

| # | 报告项 | 说明 |
|---|---|---|
| 1 | 模型名称与版本 | 精确到仓库+权重标识（如 `BAAI/bge-reranker-base` vs `BAAI/bge-reranker-v2-m3`，不得混为一谈） |
| 2 | 权重内容哈希 | SHA256（缓存快照目录下 safetensors / onnx 文件） |
| 3 | 许可证 | **按具体权重自身的模型卡记录**，不得用代码仓库许可证代替模型许可证；引用模型卡 URL |
| 4 | 缓存来源与路径 | 本地缓存目录完整路径 + 来源证明（何时缓存、由谁触发） |
| 5 | 运行接口 | fastembed `TextCrossEncoder` 版本号 + 实际可调用的 API 签名；或 mem0 内置 reranker 配置路径 |
| 6 | 资源需求 | 内存/CPU/磁盘占用估算（基于模型卡声称值 + 本机实测） |

> 该报告须经 Founder 确认后，方案 B 才可运行（交接包 §12 禁止 13）。**P5-A 未发现权重 → 不产出本报告，直接标记 B 不可执行**。

---

## 4. 拟修改文件和原因

### 4.1 新增文件（全部在 `spike-r3/` 目录内，零产品改动）

| 文件 | 用途 | 阶段 |
|---|---|---|
| `spike-r3/implementation-plan.md` | 本计划（Review 2 交付物） | 阶段 1 |
| `spike-r3/preflight-check.md` | S0 预装检查记录 | 阶段 2 |
| `spike-r3/model-facts.md` | 方案 B 模型事实报告（若 P5-A 通过） | 阶段 2.5 |
| `spike-r3/candidate-pool-freeze.md` | S1 冻结候选池定义与哈希 | 阶段 3 |
| `spike-r3/candidate-pool-definition.json` | 冻结候选池原始数据（query+memory+label 对） | 阶段 3 |
| `spike-r3/mechanism-freeze-a.md` | 方案 A 机制冻结记录 | 阶段 5 |
| `spike-r3/mechanism-freeze-b.md` | 方案 B 机制冻结记录（若 B 可执行） | 阶段 5 |
| `spike-r3/mechanism-freeze-c.md` | 方案 C 机制冻结记录（若 C 可执行） | 阶段 5 |
| `spike-r3/calibration-data/` | 校准集三轮采集原始数据 | 阶段 3 |
| `spike-r3/scripts/` | 测量/验证脚本 | 阶段 3—6 |
| `spike-r3/data/main-experiment/` | 主实验指标表原始数据 | 阶段 5 |
| `spike-r3/data/supplement-experiment/` | 补充实验指标表原始数据 | 阶段 5 |
| `spike-r3/holdout-freeze.md` | 冻结 holdout 定义与哈希（若使用独立 holdout） | 阶段 3 |
| `spike-r3/spike-report.md` | 最终 Spike 报告 | 阶段 8 |
| `spike-r3/governance-sync-summary.md` | 事实表 + 待决项建议（不直接改 current-state/decision-register） | 阶段 8 |
| `spike-r3/network-audit.md` | 网络审计记录 | 阶段 7 |

### 4.2 不修改的文件

- `v2/` 任何文件（产品代码零改动）；
- `eval/` 任何文件（评测规则不改）；
- `project-context/tasks/` 之外的治理文件（不直接改 `current-state.md` / `decision-register.md`）；
- `AGENTS.md` 及 `project-context/` 治理文件；
- 第一轮 `spike/` 和第二轮 `spike-r2/` 证据（只读参考）。

---

## 5. 数据流、状态流和错误路径

### 5.1 主实验数据流

```text
冻结候选池（S1，query+memory+label 对，哈希锁定，三方案共享）
  │
  ├─ 方案 A-主：对每对 (query, memory) 取 mem0 原始 score → 用阈值判保留/过滤
  │   → 输出: 每对的 label_pred(保留/过滤) + score → 主实验指标表
  │
  ├─ 方案 B：对每对 (query, memory) 用 cross-encoder 推理 → 相关性分数 → 用阈值判保留/过滤
  │   → 输出: 每对的 label_pred + score → 主实验指标表
  │
  └─ 方案 C：批量提交 (query, 全部候选) → 外部大模型返回 标签 + 相关性分数 → 用阈值判保留/过滤
      → 输出: 每对的 label_pred + score → 主实验指标表
```

> 三方案主实验**输入完全相同**（同一冻结候选池），**只比较判断器输出**（保留/过滤 + score）。三个判断器各自的阈值均在校准集上确定，冻结后不变。

### 5.2 补充实验数据流

```text
mem0 Python API search(threshold=t)
  │
  对每个场景的 query 执行 search(threshold=t)（t ∈ 阈值网格）
  │
  ├─ 逐 threshold 记录：召回哪些候选 / 丢失哪些候选 / 候选集合是否变化
  ├─ 端到端零条行为：threshold 过滤后空 results 的场景与比例
  └─ 召回阶段延迟：各 threshold 下 recall 阶段 P50/P95
  → 补充实验指标表（独立成表，不与主实验合表）
```

### 5.3 错误路径与失败处理

| 错误类型 | 处理 |
|---|---|
| 方案 B 权重缺失（P5-A 未通过） | 只停 B，标记不可执行；A/C 独立继续；产出 model-facts.md 说明缺失 |
| 方案 C 未获外部调用授权 | 只停 C，标记不可执行；A/B 独立继续（CR 待 Founder 批准） |
| 方案 C 外部调用超时/失败 | 如实记录失败样本清单（超时次数、异常类型）；keep-all 回退如实记录（回退会恢复 E004 缺陷，不得表述为修复） |
| 校准集分离边际 ≤ 0.1（某方案） | 候选级停止该方案（§9.1-1），其余独立继续 |
| 漏关键记忆独立门未通过（某方案） | 候选级停止该方案（§9.1-2），其余独立继续 |
| 数据外发/非授权网络访问 | 整轮红线停止（§9.2-5），提交 CR 返回 Founder |
| 接触或落盘真实用户数据 | 整轮红线停止（§9.2-6） |

---

## 6. 契约、Schema、权限和兼容性影响

### 6.1 零产品改动声明

- 本 Spike **不修改任何产品代码、Schema、契约或权限文件**；
- 分支 diff 仅含 `project-context/tasks/TASK-006/spike-r3/` 文件（DRAFT §7 / 交接包 §12 禁止 1）；
- 脚本运行不接触产品路径，不修改 `v2/` 任何文件。

### 6.2 数据与网络边界（DRAFT §6.5）

- 仅合成评测数据 + 评测专用 user_id；
- 不读取/复制/落盘真实用户内容；
- 禁止非 loopback 网络（方案 C 外部调用除外——若获批，单独审计发送内容与白名单）；
- 零外发种子写入走容器内 `add(..., infer=False)`；REST `POST /memories` 禁用；
- 种子运行后立即清理并核验清零；
- fetch 包装审计 + 容器网络面核验 + `docker diff` 零产品改动证据。

---

## 7. 分步骤实现顺序

> **三方案评估顺序**：方案 A 先行（零依赖基线，无需额外授权）→ 方案 B 条件触发（P5-A 权重核验通过 + Founder 批准下载/使用后）→ 方案 C 条件触发（独立 CR + Founder 批准外部调用后）。A 与 B/C 的启动可交错，但**主实验指标采集必须在同一冻结候选池上完成**。

### S0: 预装检查（阶段 2）

**前置条件**：实施计划获 Founder/Reviewer 批准。

| 步骤 | 内容 | 产出 |
|---|---|---|
| S0.1 | 执行 P1–P4 + P6 共享依赖只读核验 | `preflight-check.md` |
| S0.2 | 执行 P5-A 方案 B 专属依赖只读核验（fastembed 缓存目录 reranker 权重检查） | 同上（附结果） |
| S0.3 | 执行 P5-B 方案 C 连通性只读核验（**仅当 C 已获外部调用授权时**；未获授权则跳过并标记 C 不可执行） | 同上（附结果） |
| S0.4 | 核验 `docker diff v2-mem0-server` 无产品改动 | 同上 |

**禁止**：下载、安装、实例化任何模型；发送任何评测内容到外部接口。

### S0.5: 方案 B 模型事实报告（阶段 2.5，条件触发）

**前置条件**：S0.2 P5-A 通过（权重已缓存）。

| 步骤 | 内容 | 产出 |
|---|---|---|
| S0.5.1 | 逐项报告 §3.3 模型事实 6 项 | ``model-facts.md`` |
| S0.5.2 | **暂停**，等待 Founder 确认模型事实报告 | 无（等待 Founder 授权） |

> P5-A 未通过 → 跳过此步，直接标记 B 不可执行。Founder 确认后方案 B 才可进入主实验。

### S1: 冻结候选池与 holdout（阶段 3）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S1.1 | 按 DRAFT §6.2 构建冻结候选池：明确相关 ≥ 8 对 / 明确无关 ≥ 8 对 / 容易混淆 ≥ 8 对 / 应返回零条 ≥ 3 场景 / 关键记忆 ≥ 5 条 / 总 ≥ 30 对 | `candidate-pool-definition.json` |
| S1.2 | 计算候选池内容哈希（SHA256），冻结定义文件 | `candidate-pool-freeze.md` |
| S1.3 | 构建冻结 holdout（若使用独立 holdout 样本；§6.2 要求不复用第一/二轮原文） | `holdout-freeze.md` + `holdout-definition.json` |
| S1.4 | Git 提交冻结记录（提交号+时间戳+哈希） | Git 历史 |

> **冻结候选池 vs holdout**：候选池 = 主实验三方案共享的固定判断输入（S1 冻结，全方案共享，同口径比较）；holdout = 独立于校准集的一次性验证集（S1 冻结，S7 一次性运行）。冻结候选池本身也含 labeled pairs，用于校准集确定阈值 + holdout 评估分离质量（DRAFT §6.3）。
>
> **隔离纪律**：候选设计（阈值确定、机制参数）只接触校准集部分（候选池中约 70%），holdout（候选池中约 30%）只一次性运行。具体比例在 S1 冻结时锁定并记录。

### S2/S3: 校准集核验与标注（阶段 4）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S2.1 | 对校准集部分执行三轮 mem0 真实本地检索（mem0 检索非确定性，禁止单轮结论），采集原始 score | `calibration-data/round-{1,2,3}.json` |
| S2.2 | 标签复核：正/负样本定义 + 人工复核（关键词初判 + 人工复核，复核记录入库，沿用第一轮纪律） | `calibration-data/labels.json` |
| S3.1 | 方案 A 用校准集确定最优阈值（现状 0.35 vs 校准网格 → 选最佳） | 校准结果 |
| S3.2 | 方案 B 用校准集确定 cross-encoder 阈值 + ρ 非冗余诊断（若 B 可执行） | 校准结果 + ρ 值 |
| S3.3 | 方案 C 用校准集确定外部模型相关性分数阈值（若 C 可执行） | 校准结果 |

### S4: 主实验三方案评估（阶段 5）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S4.1 | 方案 A-主：在**完整冻结候选池**上用"检索 score + 校准阈值"判断每对保留/过滤 → P/R/F1/分离边际/误删率/零条准确率/保留数量 | `data/main-experiment/scheme-a.json` |
| S4.2 | 方案 B：在**同一冻结候选池**上用 cross-encoder 分数 + 校准阈值判断 → 同口径指标（若 B 可执行） | `data/main-experiment/scheme-b.json` |
| S4.3 | 方案 C：在**同一冻结候选池**上批量提交外部模型 → 返回标签 + 相关性分数 + 校准阈值判断 → 同口径指标（若 C 可执行） | `data/main-experiment/scheme-c.json` |
| S4.4 | 关键记忆独立门：逐方案检查 §6.4 指定的 ≥ 5 条关键相关记忆是否被保留 | `data/main-experiment/key-memory-gate.json` |

> **主实验指标表**（三方案同口径，一张表）按 DRAFT §6.3 主实验指标表全量填写。

### S4.5: 补充实验（方案 A 端到端，独立成表）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S4.5.1 | Python API `search(threshold=t)` 逐阈值测召回候选集合变化（t ∈ 阈值网格，不预设 0.3/0.5/0.7） | `data/supplement-experiment/threshold-sweep.json` |
| S4.5.2 | 端到端零条行为：threshold 过滤后空 results 的场景与比例 | 同上 |
| S4.5.3 | 召回阶段延迟：各 threshold 下 recall P50/P95 | 同上 |

> **补充实验指标表**按 DRAFT §6.3 补充实验指标表填写，**与主实验分表，不合并**。

### S5: 机制冻结（阶段 5 完成后）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S5.1 | 方案 A 机制冻结：记录阈值参数 + 候选池哈希 + 时间戳 + 提交号 | `mechanism-freeze-a.md` |
| S5.2 | 方案 B 机制冻结（若 B 可执行）：记录模型版本 + 阈值 + ρ + 哈希 + 时间戳 | `mechanism-freeze-b.md` |
| S5.3 | 方案 C 机制冻结（若 C 可执行）：记录接口 + prompt 模式 + 阈值 + 哈希 + 时间戳 | `mechanism-freeze-c.md` |

### S6: holdout 一次性运行（阶段 6）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S6.1 | 用 S5 冻结的机制对 holdout 部分一次性运行（**运行后禁止继续调参**） | `data/holdout-runs/{scheme}-holdout.json` |
| S6.2 | 逐方案 holdout F1 / 分离边际 / 零条准确率 / 误删率 | 同上 |

### S7: 延迟/资源/费用测量（阶段 7）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S7.1 | 预热 5 次；每场景有效样本 ≥ 30；P95 = `ceil(0.95×N)` | `data/latency/{scheme}-latency.json` |
| S7.2 | 增量 = 处理组 − 基线（基线 = 仅本地检索；处理组 = 同一次检索 + 判断器） | 同上 |
| S7.3 | 方案 C 费用估算：调用次数 × token × 单价（公开定价为线索，实测为准） | `data/latency/scheme-c-cost.json` |
| S7.4 | CPU/内存/磁盘占用：峰值 RSS、CPU 耗时、权重/缓存磁盘占用 | `data/latency/resource-{a,b,c}.json` |
| S7.5 | 外部调用比例：A/B = 0%；C = 实测 | 同上 |

> **不预设淘汰阈值**（DRAFT §6.3 / 交接包 §16 禁止 16）。延迟/资源如实测量，取舍交 Founder。

### S8: 网络审计（阶段 7.5）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S8.1 | fetch 包装审计：确认脚本 fetch 白名单仅 loopback（方案 C 外部调用除外） | `network-audit.md` |
| S8.2 | `docker diff` 核验：mem0-server 容器无产品改动 | 同上 |
| S8.3 | 种子清理核验：合成种子写入后清理并核验清零 | 同上 |

### S9: Spike 报告（阶段 8）

| 步骤 | 内容 | 产出 |
|---|---|---|
| S9.1 | 验收逐项对标（DRAFT §8.1 全 11 项） | `spike-report.md` |
| S9.2 | 诚实声明：样本量/波动/失败/ρ/增量口径/费用口径/📖与🔬区分/"Spike 通过 ≠ TASK-006 完成" | 同上 |
| S9.3 | 完成度分档结论（完整对比 / 部分证据 / 返回 Founder） | 同上 |
| S9.4 | 事实表 + 待决项建议（不直接改 `current-state.md` / `decision-register.md`） | `governance-sync-summary.md` |

---

## 8. 测试矩阵

### 8.1 主实验指标表（三方案同口径，DRAFT §6.3）

| 类别 | 指标 | 口径 | 方案 A | 方案 B | 方案 C |
|---|---|---|---|---|---|
| 质量 | 相关记忆召回率 | 关键/相关记忆有没有被错误删掉（E001/E003 正向逐轮） | □ | □ | □ |
| 质量 | 无关记忆拦截率 | E004 类无关候选被剔除比例 | □ | □ | □ |
| 质量 | 零结果准确率 | "应返回 0 条"场景返回 0 条的比例 | □ | □ | □ |
| 质量 | 误删率 | 应保留的相关记忆被删除的比例 | □ | □ | □ |
| 质量 | Precision / Recall / F1 | 校准集 + 冻结 holdout 分别报告；样本量诚实声明 | □ | □ | □ |
| 行为 | 每轮最终保留的记忆数量 | 三方案分别记录（对照是否过度删除） | □ | □ | □ |
| 性能 | P50 / P95 额外延迟 | 预热 5、N ≥ 30、P95 = `ceil(0.95×N)`；增量 = 处理组 − 基线；**不预设淘汰阈值** | □ | □ | □ |
| 成本 | 单轮费用 | A/B 本地 = 0 元；C = 调用次数×token×单价 | □ | □ | □ |
| 成本 | 外部模型调用比例 | A/B = 0%；C = 实测 | □ | □ | □ |
| 资源 | CPU / 内存 / 磁盘占用 | 峰值 RSS、CPU 耗时、权重/缓存磁盘占用 | □ | □ | □ |
| 失败 | 失败与不确定样本清单 | 超时、异常、低分、判定翻转逐条记录 | □ | □ | □ |

### 8.2 补充实验指标表（仅方案 A 端到端，独立成表）

| 指标 | 口径 |
|---|---|
| 不同 threshold 下召回候选集合变化 | 逐 threshold 记录"召回哪些候选 / 丢失哪些候选"，对比固定候选池 |
| 端到端零条行为 | threshold 过滤后空 results 的场景与比例 |
| 召回阶段延迟 | 各 threshold 下 recall 阶段 P50/P95（与主实验判断器延迟分开） |

> 主实验与补充实验的延迟、候选集合、零条结果**分别成表，不合并**（DRAFT §6.3）。

### 8.3 "关键相关记忆不得漏掉"独立门（DRAFT §6.4）

| 方案 | 独立门通过条件 | 结果 |
|---|---|---|
| A | ≥ 5 条关键相关记忆在冻结机制下被保留 | □ |
| B | 同上（若 B 可执行） | □ |
| C | 同上（若 C 可执行） | □ |

> 任一方案漏掉关键相关记忆 → 该方案独立门不通过（即使 F1 高分，可能靠多删获得）。

---

## 9. Browser / 运行验收步骤

本 Spike 为纯离线测量，无 Browser 验收步骤。运行验收以以下方式替代：

1. **容器内 Python API 直调验证**（DRAFT §2.2 主推路径）：
   - `docker exec -i v2-mem0-server python -c "..."` 确认 `Memory.from_config().search(...)` 可调用；
   - 确认 `threshold` / `rerank` 参数在本机数据上的实际行为符合预期；
   - 路径可行性已由第二轮零外发种子写入验证（`docker exec` + `Memory.from_config` + `add(infer=False)` 配方）。

2. **脚本运行检查**：
   - Node 脚本 `node --experimental-strip-types` 运行，复用主仓库 `v2/app/node_modules` 的 `pg` 依赖；
   - 确认 fetch 白名单仅 loopback；
   - 确认 `docker diff v2-mem0-server` 无产品改动。

3. **人工复核**：
   - 候选池标签复核（关键词初判 + 人工复核，复核记录入库）；
   - 冻结记录时间戳/提交号/哈希核对；
   - holdout 隔离纪律审计（S1 冻结提交先于任何实现/调优提交，Git 历史核验）。

---

## 10. 回滚与恢复方案

| 场景 | 回滚方式 |
|---|---|
| 脚本运行异常 | 脚本均在独立 `spike-r3/scripts/` 目录，不接触产品代码；异常直接停止并记录 |
| 合成种子残留 | 评测专用 user_id 隔离 + 运行后 REST DELETE 清理 + 核验清零 |
| `docker diff` 发现产品改动 | 立即停止；`docker exec` 层面检查原因；如实记录（第一轮已验证 `docker diff` 为空） |
| 方案 C 外部调用超时/失败 | 如实记录失败样本；keep-all 回退如实记录（会恢复 E004 缺陷，非修复） |
| 整轮红线触发 | 整轮停止，提交 CR 返回 Founder；分支保留所有证据不删除 |

---

## 11. 风险、停止条件和 Change Request 条件

### 11.1 候选级停止（DRAFT §9.1，只停对应方案/候选，其余独立继续）

| # | 条件 | 影响 |
|---|---|---|
| 1 | 该方案校准集或冻结 holdout 分离边际 ≤ 0.1（或实测波动 > 0.1 判据失效） | 只停该方案 |
| 2 | 该方案漏掉"关键相关记忆"独立门（§6.4） | 只停该方案 |
| 3 | 必须削弱测试/改判定规则/手工枚举词表/固定字面量硬编码才能变绿 | 只停该方案 |
| 4 | 候选专属依赖缺失（方案 B 权重未缓存且未获下载授权） | 只停该方案 |

### 11.2 整轮立即停止红线（DRAFT §9.2，任一触发→整轮停止）

| # | 条件 |
|---|---|
| 5 | 数据外发 / 非授权网络访问（方案 C 未获批即调用，或任何机制发起非白名单外部调用） |
| 6 | 接触或落盘真实用户数据（非合成数据） |
| 7 | 冻结失效：无法建立与校准数据独立的冻结 holdout 证据 |
| 8 | 时间盒到期（5 工作日 / 3 轮迭代，先到者）未收敛 |
| 9 | 需要超出批准范围的改动（含未获批的模型下载、外部调用、产品代码修改） |
| 10 | 没有任何方案可执行（共享依赖缺失致三方案均不可执行，或候选级停止后无剩余可执行方案） |

### 11.3 Change Request 触发条件

- 需要超出 DRAFT v1.1 批准范围的改动；
- 方案 B 需要下载新模型（未批�权重 → CR 请求 Founder 批准）；
- 方案 C 需要外部调用（未批准 → 独立 CR + Founder 批准外部调用与数据外发政策）；
- 需要扩大候选机制范围（新增方案须 CR）；
- 实验结果不收敛但需要继续调整。