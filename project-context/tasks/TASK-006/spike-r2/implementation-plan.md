# TASK-006 第二轮本地相关性 Gate Spike — 实施计划（Review 2）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-006/spike-r2-candidate-draft.md（v1.2，APPROVED + 8 项批准约束 + PR #18 修订，本任务唯一权威方案）
  - project-context/tasks/TASK-006/spike-r2-research.md（调研报告，方向依据）
  - project-context/tasks/TASK-006/spike-r2-builder-handoff.md（十七字段交接包，本任务约束）
  - project-context/tasks/TASK-006/spike-stop-cr.md（第一轮裁决，DECIDED-A）
  - project-context/tasks/TASK-006/spike/（第一轮全部证据：implementation-plan.md / preflight-check.md / holdout-freeze.md / mechanism-freeze.md / data/calibration / data/labels）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/app/api/chat/route.ts
doc_type: Builder 实施计划（Review 2 用；阶段 1 交付物）
task_id: TASK-006（内部第二轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R2）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R2
status: DRAFT_FOR_REVIEW_2（等待 Founder/Reviewer 批准；批准前不进入任何实测）
execution_mode: persistent_session（已确认）
assigned_role: Builder（长期会话）
branch: feature/task-006-r2-spike
plan_version: v1.0
author: Builder（TASK-006｜Builder｜第二轮本地相关性 Gate Spike）
date: 2026-08-12
```

> **本计划批准前禁止一切实测动作**：禁止执行预装检查、禁止确定候选 A 具体模型、禁止下载或安装、禁止写测量/验证脚本、禁止建立 holdout、禁止任何测量（交接包 §12 禁止 12/13/14 + DRAFT §7 禁止 13/14 + 批准约束 4）。
> 本文件只做规划与设计；批准后按 §13 分步骤执行，每步落盘证据到 `spike-r2/`。

---

## 1. 当前事实与待验证假设

### 1.1 已核验事实（证据锚点，本次只读核验）

| 事实 | 证据 |
|---|---|
| 权威主线 origin/main @ `9ab87f2`（PR #18 规划已合入：DRAFT v1.2 + 调研报告 + 决策登记 + 状态同步） | 本 worktree `git fetch origin main` + `git rev-parse origin/main`（2026-08-12） |
| 实施分支 `feature/task-006-r2-spike` @ `dcb7646`（仅交接包提交，领先 origin/main 1 个提交），工作区干净、与远端同步 | `git status` / `git rev-parse HEAD` / `git log --oneline -3`（本次核验） |
| 第二轮 DRAFT v1.2 = APPROVED + Founder 8 项批准约束（§0.2）：候选 A 只批准"本地 cross-encoder 重排"**方向**、不批准具体模型；"零新增依赖"一律待核验；Review 2 实施计划必须含模型事实报告要求；模型确认前禁运行候选 A；候选 A 权重缺失只停候选 A、候选 B 独立继续；候选级/整轮停止语义分离；"冻结早于候选设计"= 早于 Builder 实现/参数/调优；许可证按具体权重模型卡记录 | `spike-r2-candidate-draft.md` §0.2/§3/§5.4/§9 |
| 候选 A = 本地 cross-encoder 相关性重排（bge-reranker 系方向，经 fastembed TextCrossEncoder 本地推理）；fastembed 接口可用性、reranker 权重是否已缓存 = **待预装检查核验事实**（§5.4 P5），不得表述为既成事实 | DRAFT §3.1/§5.4；`spike-r2-research.md` §2 方案 1/4 |
| 候选 B = 本地 embedding 校准集原型聚类（k-means 单一方法）；输入来源仅 (a) 正式 8 Case 种子文本（002_eval.sql E001–E008）+ (b) 第一轮已入库校准检索样本（`spike/data/calibration/round-{1,2,3}/`，合成数据）；"能否零新增依赖运行"属待核验事实（§5.4 P4） | DRAFT §3.2/§5.4 |
| 第一轮失败根因：R1 词法不可分（E001 相关对与 E004 无关对记忆文本几乎相同）；R2 手工词表覆盖不足（"下雨"未收录 → 信号归零）。第一轮候选 1/2 已冻结，不作第二轮候选或调参对象 | `spike/` 证据（scores/candidate1.json、candidate2.json、holdout/run.json）；`spike-stop-cr.md` |
| 产品召回链路：mem0.search top5 → score ≥ 0.35 过滤；E004 程序判定 `max_irrelevant_recall ≤ 1`（关键词 猫/吉他/失眠/小橘）；E001 判定 `recall_min_related ≥ 1`（related_keywords 猫/失眠 类目） | `chat/route.ts:55-58`；`eval-program-rules.ts:401-446`；`002_eval.sql:74-112` |
| 校准场景查询（002_eval.sql 种子 input_text）：E001"又失眠了……"、E002"我最近开始学吉他了"、E003"我家猫叫什么来着"、E004"今天天气不错"、E005"我不是不喜欢你问，我只是不想每次都解释" | `002_eval.sql` E001–E005 行；第一轮 `spike/scripts/config.mjs` 同源 |
| 本地组件事实（第一轮 preflight 实测，**本轮 S0 须重新核验，非既成事实**）：mem0-server 容器 v2-mem0-server、**host 端口 8100**（容器内 8900）；mem0 **2.0.13**；PostgreSQL v2-postgres（5432，库 ai_companion，eval_cases=8）；Node **v22.23.2** + npm 12.0.2；pg 依赖经**主检出 `E:\正式作品\v2\app\node_modules`** 只读复用（worktree 无 node_modules）；embedding 缓存 `/tmp/fastembed_cache/models--Qdrant--bge-small-zh-v1.5/snapshots/46fbe35f.../model_optimized.onnx`（512 维）；宿主代理 HTTP(S)/ALL_PROXY=http://127.0.0.1:7890、NO_PROXY=127.0.0.1,localhost,::1 | `spike/preflight-check.md`（2026-08-12） |
| 零外发种子写入事实：REST `POST /memories` 固定走 LLM 抽取（main.py 硬编码 `infer=True` + 容器 env `MEM0_LLM_BASE_URL=https://api.deepseek.com/v1`）→ **脚本侧 fetch 审计拦不到容器内部外发**；零外发替代 = `docker exec -i v2-mem0-server python -c` 容器内 `Memory.from_config(_build_config())` + `add(text, user_id=..., infer=False)`（纯本地 fastembed + Qdrant，不调 LLM）；清理仍走 REST DELETE（不触发 LLM） | 技能参考 mem0-eval-pipeline.md「零外发种子写入」（TASK-006 S7 沉淀） |
| 评测用户隔离：正式格式 `eval-<runShort>-<case>-<rand>`；R2 专用格式 `eval-spike-r2-<用途>-<rand>`（DRAFT §5.1）；第一轮 holdout 格式 `eval-spike-<Hn>-<rand>` | DRAFT §5.1；`spike/holdout-freeze.md` |
| 第一轮冻结 holdout 原文（H1 苹果多义词 / H2 朋友分手 / H3 猫跑酷隐式关联 / H4 下雨天气变体）——**R2 holdout 禁止复用其具体文本** | `spike/holdout-definition.json`（已读，逐场景比对过） |

### 1.2 待验证假设（Spike 要回答的问题）

| # | 假设 | 验证方式 | 若证伪 |
|---|---|---|---|
| H0 | 预装检查 P1–P6 通过；P5-A 缓存中含 cross-encoder reranker 权重且 TextCrossEncoder 接口可用 | S0 只读核验 | P5-A 缺失/不可用 → 只停候选 A（§9.1-4），候选 B 继续；共享依赖缺失致两候选均不可执行 → 整轮停止（§9.2-10） |
| H1 | 候选 A 与 mem0 原始 score 非冗余（Spearman ρ < 0.9）且实现非单一余弦 | S5 校准集计算 ρ + 冗余降级自检 | ρ ≥ 0.9 或实现退化为单一余弦 → 候选 A 降级为冗余基线（仅 A，B 独立继续） |
| H2 | 候选 A 的 0–1 分数在 E001–E005 校准集上分离 E004 无关候选与 E001 等正向候选（F1 ≥ 0.9、分离边际 > 0.1） | S5 校准评估 | 校准不达标 → 候选 A 记录失败，候选 B 继续（不停止） |
| H3 | 候选 B 的 k-means 原型空间对校准集达到 F1 ≥ 0.9、分离边际 > 0.1（数据驱动空间不因"词表未命中"归零） | S4 校准评估（k/阈值网格仅校准集） | 校准不达标 → 候选 B 记录失败（候选级停止） |
| H4 | 冻结 holdout（4 新场景，未参与任何调参）一次性运行 F1 ≥ 0.9、分离边际 > 0.1（两候选分别） | S7 一次性运行（冻结机制 + 冻结 holdout） | 某候选 holdout 不达标 → 该候选失败（候选级）；两候选均失败 → 整轮停止（§9.2-10） |
| H5 | 候选 Gate 增量 P95 ≤ 200ms、总预算 ≤ 1000ms、内存 ≤ 512MB、CPU ≤ 500ms | S8 延迟/资源测量（冻结机制） | 门不达标 → 该候选失败（如实记录） |

> **诚实预判（非结论）**：
> 1. 候选 A 的可执行性完全取决于 P5-A（reranker 权重是否已缓存、TextCrossEncoder 接口是否可用）——这是待核验事实，本计划不预设通过或失败；若权重缺失，按批准约束 4/5 只停候选 A，不下载不安装不替换。
> 2. 候选 B 的聚类语料（DRAFT 批准输入 (a)+(b)）与校准集**同源同族**（校准集 = 第一轮已入库校准样本，语料 (b) 即同一批样本）：校准 F1 属"拟合度证据"，**独立泛化检验完全依赖冻结 holdout**。此属性是批准输入范围决定的，本计划如实披露，不以校准高分代替 holdout 结论。
> 3. 候选 A（cross-encoder）的判别力理论上强于候选 B（原型分布相似），但 A 受模型确认门约束且依赖预装权重；两候选独立评估，结论以各自实测为准。

---

## 2. 目标 / 非目标

### 2.1 目标

1. 在**不接入产品路径、不外发任何用户数据、仅使用经预装检查核验的本地组件**前提下，验证候选 A（cross-encoder 重排）与候选 B（k-means 原型聚类）能否可靠分离 E004 无关召回与 E001 等正向召回（各自独立评估）；
2. 产出可复现证据：脚本 + 原始数据 + 冻结记录（时间戳/提交号/哈希）+ 模型事实报告（候选 A）+ 延迟/资源/网络审计 + Spike 报告，全部落盘 `spike-r2/`；
3. 至少一个正式候选通过 DRAFT §8 全部适用门 + 统一门 → 形成"存在可行候选"结论；Spike 通过 ≠ TASK-006 完成。

### 2.2 非目标（明确不做）

1. 不修改任何产品代码（v2/ 全部文件）、正式 8 Case、Schema、评测规则、治理文件；
2. 不进入 /api/chat 产品路径、不创建新 eval Run（不写 eval_runs/eval_results 等正式表）；
3. 不引入第三候选、不调用外部模型、不做任何运行时下载/安装；候选 A 具体模型未经确认不运行；
4. 不触碰 TASK-007 / TASK-005B / TASK-004（保持 PAUSED）；
5. 不写真实用户数据、不复用第一轮 holdout 原文、不重新启用第一轮已冻结机制调参；
6. Spike 通过 ≠ TASK-006 完成，不产生任何产品实现授权。

---

## 3. 依赖与前置条件（预装检查核验命令【共享 vs 候选 A 专属】）

> 批准后执行；全部命令只读、零下载、零安装。**禁止执行任何会触发下载的实例化命令**（仅 import 核验接口，不实例化模型）。
> 判定语义（PR #18 修订，DRAFT §5.4）：**共享依赖**缺失 → 提交范围/依赖裁决；若致两候选均不可执行 → 整轮停止（§9.2-10）；仅影响部分能力按实际可执行性判定。**候选 A 专属依赖**缺失 → 只停候选 A（§9.1-4），候选 B 独立继续；不得下载/安装/替换权重。

### 3.1 共享依赖（两候选共同，缺失影响两候选执行能力）

| # | 检查项 | 核验命令（批准后执行） | 通过标准 |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | `docker ps --format '{{.Names}} {{.Status}}' \| grep v2-mem0-server`；`curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8100/openapi.json` | 容器 Up；HTTP 200（host 端口以实测为准，R1 实测 8100，须本轮复核 `docker port v2-mem0-server`） |
| P2 | mem0-server 版本 | `docker exec v2-mem0-server python -c "import mem0;print(getattr(mem0,'__version__','n/a'))"` | 版本号记录到 preflight-check.md（R1 实测 2.0.13，以本轮为准） |
| P3 | PostgreSQL（ai_companion）运行中、loopback 可达、评测表存在 | `docker exec v2-postgres pg_isready -U postgres -d ai_companion`；`docker exec v2-postgres psql -U postgres -d ai_companion -tAc 'select count(*) from eval_cases'` | pg_isready 就绪；count ≥ 8（只读） |
| P4 | Node/npm 版本与现有依赖满足脚本运行（**"零新增依赖"待核验，非既成事实**） | `node --version`；`npm --version`；`node -e "const {createRequire}=require('module');const r=createRequire('E:/正式作品/v2/app/package.json');const {Client}=r('pg');console.log('pg ok')"` | node ≥ 22；pg 可解析（复用主检出已预装 node_modules，不安装任何包）。**pg 解析失败 → 提交依赖裁决** |
| P5-S | fastembed embedding 模型缓存存在（候选 B 与 mem0 基线共同依赖） | `docker exec v2-mem0-server sh -c 'ls /tmp/fastembed_cache/models--Qdrant--bge-small-zh-v1.5/snapshots/*/ 2>/dev/null \|\| find / -maxdepth 6 -type d -name "*bge-small-zh-v1.5*" 2>/dev/null'` | 目录存在且含模型文件（model_optimized.onnx 等） |
| P6 | 网络边界：宿主环境 + 容器网络面审计 | `env \| grep -iE '^(http\|https\|all\|no)_proxy' \|\| echo 'no proxy vars'`；`docker inspect v2-mem0-server --format '{{range .Config.Env}}{{println .}}{{end}}' \| grep -iE 'LLM\|API\|BASE'` | 记录宿主代理变量状态；**确认容器 env 含 MEM0_LLM_BASE_URL → REST POST /memories 一律禁用（写种子走 §11.3 零外发路径）**；脚本目标 URL 白名单仅 loopback |

### 3.2 候选 A 专属依赖（约束 4/5；缺失 → 只停候选 A）

| # | 检查项 | 核验命令（批准后执行） | 通过标准 |
|---|---|---|---|
| P5-A | fastembed 缓存目录是否含 **cross-encoder reranker 权重**（具体模型名/版本待核验，不预选） | `docker exec v2-mem0-server sh -c 'ls -d /tmp/fastembed_cache/models--*reranker* /tmp/fastembed_cache/models--*cross* 2>/dev/null; find /tmp/fastembed_cache -maxdepth 2 -type d 2>/dev/null \| head -30'` | 发现 reranker 权重目录 → 记录模型名/版本/文件清单；**未发现 → 候选 A 标记不可执行（§9.1-4），候选 B 独立继续；不下载** |
| P5-A2 | fastembed 版本与 `TextCrossEncoder` 接口可用性（**仅 import，禁止实例化**——实例化可能触发下载） | `docker exec v2-mem0-server python -c "import fastembed;print('fastembed',fastembed.__version__)"`；`docker exec v2-mem0-server python -c "from fastembed.rerank.cross_encoder import TextCrossEncoder;print('TextCrossEncoder import ok')"` | import 成功；版本号记录。**缓存权重模型名若不被该 fastembed 版本支持 → 视为运行接口不可用 → 候选 A 停止（候选级 4）** |

记录方式：核验输出、版本号、路径、时间戳写入 `spike-r2/preflight-check.md` 并随分支入库；P5-A 通过后进入 §7 模型事实报告。

---

## 4. 修改文件清单（全部为 spike-r2/ 新增，零产品改动）

> **不修改任何现有文件**。以下全部为批准后新建文件，位于 `project-context/tasks/TASK-006/spike-r2/`（R2 唯一证据落盘区；R1 证据根为 `spike/`，只读引用、不写入）。

```text
spike-r2/
├── implementation-plan.md        # 本文件（阶段 1 交付物）
├── preflight-check.md            # S0 产物（预装检查记录，共享/专属分别判定）
├── model-facts.md                # S0.5 产物（候选 A 模型事实报告；经 Founder/决策 Chief 确认后才可运行候选 A）
├── holdout-freeze.md             # S1 产物（holdout 冻结记录：时间戳/提交号/哈希）
├── holdout-definition.json       # 冻结的 holdout 场景定义（内容哈希对象；S1 锁定后不再改动）
├── mechanism-freeze.md           # S6 产物（机制冻结记录：每正式候选一份，版本/参数/哈希）
├── spike-report.md               # S10 产物（Spike 报告，含验收逐项对标）
├── governance-sync-summary.md    # S10 产物（治理同步建议事实表；Builder 不直接改 current-state/decision-register，由 Chief 落盘）
├── scripts/                      # 测量/验证脚本（纯 Node ESM .mjs，零新增依赖——待 P4 核验）
│   ├── config.mjs                # 环境配置：loopback URL、路径、k 网格、阈值常量（只读配置）
│   ├── lib/mem0-api.mjs          # mem0 REST 只读客户端（search/getAll/delete，仅 loopback）——沿用第一轮
│   ├── lib/db-read.mjs           # PostgreSQL 只读查询（定位评测 user_id；pg 经 createRequire 复用主检出依赖）——沿用第一轮
│   ├── lib/fetch-audit.mjs       # 全局 fetch 包装：记录每次调用 URL，断言仅 loopback——沿用第一轮
│   ├── lib/metrics.mjs           # F1、分离边际、Spearman ρ、P50/95/99（nearest-rank）、波动——沿用第一轮
│   ├── lib/embed.mjs             # docker exec 容器内 fastembed 批量嵌入（stdin JSON 协议，零外发）
│   ├── lib/kmeans.mjs            # 候选 B：纯 JS k-means（k-means++ 初始化 + 固定随机种子，可复现）
│   ├── collect-calibration.mjs   # S2：核验/补充校准集（复用第一轮已入库样本；不足时从已完成 Run 用户只读采集）
│   ├── label-calibration.mjs     # S3：关键词初判 + 人工复核脚手架（fail-fast：每候选恰一个 label）
│   ├── score-candidate-b.mjs     # S4：语料 (a)+(b) → 嵌入 → k-means → k/阈值网格（仅校准集）→ F1/边际
│   ├── score-candidate-a.mjs     # S5：TextCrossEncoder.rerank（仅模型事实经确认后）→ ρ 诊断 + 阈值 → F1/边际
│   ├── freeze-holdout.mjs        # 对 holdout-definition.json 做哈希锁定 → holdout-freeze.md
│   ├── freeze-mechanism.mjs      # 对候选机制实现 + 参数做哈希锁定 → mechanism-freeze.md
│   ├── seed-holdout.mjs          # 按冻结定义零外发写入合成种子（docker exec + add infer=False；仅 holdout 允许）
│   ├── run-holdout.mjs           # 冻结机制对冻结 holdout 一次性运行（运行时核验冻结哈希，不一致 exit(2)）
│   ├── cleanup-holdout.mjs       # 删除 holdout 种子并核验清零（qdrant scroll filter + getAll）
│   ├── measure-latency.mjs       # 延迟/资源测量（预热 5、N≥30、基线/处理组/增量、P95、RSS/CPU）
│   └── network-audit.mjs         # 运行期网络审计 → data/audit/
└── data/                         # 原始数据（全部随分支入库）
    ├── calibration/              # S2 校准集（主要复用第一轮；补充采集时写此处）
    ├── labels/                   # 标签与人工复核记录
    ├── scores/                   # 候选分数与指标中间结果
    ├── holdout/                  # holdout 一次性运行原始输出
    ├── latency/                  # 延迟/资源原始测量
    └── audit/                    # 网络审计日志
```

依赖说明：脚本运行于 worktree 根（Node ≥ 22），`pg` 经 `createRequire` 指向主检出 `E:\正式作品\v2\app` 复用现有依赖；嵌入与（候选 A 的）重排经 `docker exec` 在容器内使用已预装 fastembed；**不安装任何包、不修改 v2/ 任何文件**。若 pg 解析失败 → 视为缺失依赖，停止并提交裁决。

---

## 5. 测量/验证脚本设计

### 5.1 数据流

```text
S0 预装检查（只读命令；共享 P1–P4/P5-S/P6 + 候选 A 专属 P5-A/P5-A2）→ preflight-check.md
S0.5 模型事实报告（候选 A；P5-A 通过时）→ model-facts.md → Founder/决策 Chief 确认 → 候选 A 才可运行
S1 holdout 定义写入 + 哈希冻结 → holdout-freeze.md + holdout-definition.json（commit；先于一切实现/调优提交）
S2 校准集核验/补充（复用第一轮已入库样本为主；不足则从已完成 Run 评测用户只读采集）→ data/calibration/
S3 标签：关键词初判 + 人工复核（fail-fast 断言）→ data/labels/
S4 候选 B：语料 (a)+(b) → 嵌入 → k-means → k/阈值网格（仅校准集）→ F1/边际/波动
S5 候选 A（模型确认后）：rerank → ρ 诊断 + 冗余降级自检 → 阈值 → F1/边际/波动
S6 机制冻结（每正式候选；哈希）→ mechanism-freeze.md（commit）
S7 holdout 一次性运行（seed → run → cleanup；冻结机制 × 冻结 holdout）
S8 延迟/资源测量（S6 后对冻结机制测）
S9 网络/数据边界审计
S10 报告 + 全部证据 commit + governance-sync-summary.md
```

### 5.2 校准集（S2）

- **主数据源 = 第一轮已入库校准样本**（`spike/data/calibration/round-{1,2,3}/` 的 E001–E005 JSON，3 轮，合成数据、真实本地检索、已批准入库）：满足 DRAFT §5.3.1"E001–E005 场景真实本地检索样本、三轮重复采集"；同一批用户/查询重新采集只会得到同一批文本（检索确定性），重复采集无信息增量——本计划如实声明该数据来源。
- **S2 只读核验**：3 轮 × 5 场景 JSON 完整性、`results[id,memory,score]` 字段齐备、标签文件（`spike/data/labels/`）可对应；核验结果写入 preflight-check.md / 报告。
- **补充路径**：若主数据源缺失/损坏/不足 → 从已完成 Run 的评测专用 user 只读补充采集（DB 只读查询 `eval_results.eval_user_id` JOIN `eval_runs.run_number`，仅 E001–E005 场景，mem0.search 保存原始 JSON；不读取真实用户行/traces/日志）。
- **数据源裁决**：可用 run = 0 或池全空 → 停止，提交数据源/依赖裁决（等价 DRAFT §9.2-10 依赖缺失路径）。
- 校准集文本不参与 holdout 冻结定义；holdout 文本不参与校准调参。

### 5.3 标签规则（S3，DRAFT §5.3.2 沿用第一轮）

- 正样本 = 与查询相关的候选；负样本 = 与查询无关的候选。
- 关键词初判：沿用 Eval 程序语义——E001/E003 用 related_keywords（猫/失眠/小橘 类）；E004 用 irrelevant_keywords（猫/吉他/失眠/小橘）；第一轮已入库标签直接复用并核验。
- **强制断言（fail-fast）**：每个原始候选**恰有一个** label；未命中/多命中 → 抛错终止，绝不静默落默认值（第一轮教训：子串匹配静默漏标 → holdout 悄悄少样本）。
- 人工复核：Builder 逐条复核初判与语义（含隐式关联归属），复核理由记录在 `data/labels/`；标签文件含时间戳与复核人；标签在机制调参前完成并随数据入库。

### 5.4 候选 B：k-means 原型聚类 Gate（可执行定义）

**输入来源（唯一，DRAFT §3.2）**：
- (a) 正式 8 Case 种子文本：`002_eval.sql` E001–E008 的 `seed_chat.value` 文本（无 seed_chat 的 case 跳过并记录）；
- (b) 第一轮校准检索样本文本：`spike/data/calibration/round-{1,2,3}/` 各 JSON 中每条 result 的 `memory` 字段文本；
- 去重后作为聚类语料 C（记忆侧文本；查询文本仅在评分时使用，不入语料）。**不使用任何"通用知识"、未批准语料、人工词表、下载模型或新增依赖**。

**计算步骤**：
1. 语料 C 经 `lib/embed.mjs`（docker exec 容器内 fastembed TextEmbedding，与 mem0 同款 `BAAI/bge-small-zh-v1.5` 共享缓存）批量嵌入为向量集 V；
2. `lib/kmeans.mjs`（纯 JS，k-means++ 初始化 + 固定随机种子，最多 100 迭代或收敛 tol 1e-4）对 V 聚类得到 k 个原型向量 `P={p_1…p_k}`；原型权重 `w_i` = 簇 i 样本数占比（数据驱动，非人工）；
3. 查询 q 与记忆 m 分别映射为与各原型的余弦相似度分布 `a_q=[cos(v_q,p_1)…cos(v_q,p_k)]`、`a_m=[cos(v_m,p_1)…cos(v_m,p_k)]`（v_q/v_m 由 Gate 函数内嵌入获得，计入延迟增量）；
4. `score(q,m) = 加权余弦(a_q, a_m)`（权重 w_i；cos+1 映射到 (0,1) 或原生范围标定，公式随机制冻结）。

**输出分数**：0–1 连续相关性分数。

**人工输入边界**：人工仅设定元参数范围——k ∈ {2…8}、决策阈值网格（0.05–0.95 步长 0.05）；**不人工标注原型语义、不枚举主题词表**；k 与阈值仅在校准集上选定，选择准则 = F1 ≥ 0.9 且分离边际最大，随机制冻结。

**针对第一轮根因的新增能力（R2）**：主题空间由数据自动构建（聚类），未见于词表的表达（如新天气表达）经 embedding 自然落入原型分布，不因"词表未命中"信号归零。

### 5.5 候选 A：cross-encoder 相关性重排 Gate（可执行定义；方向已批准，具体模型待核验）

> **前置门（约束 1/2/4）**：本脚本仅在 §7 模型事实报告经 Founder/决策 Chief 确认后运行；P5-A 未通过 → 候选 A 标记不可执行，不运行本脚本。

**输入**：查询文本 q + 候选记忆文本 m（cross-encoder 以 (q,m) 拼接对输入，直接输出相关性分数；不依赖 mem0 原始 score）。

**计算步骤（以 P5-A 核验的接口为准）**：
1. `TextCrossEncoder.rerank(query, documents)`（fastembed 原生接口，容器内运行；或经核验的等价本地 cross-encoder 接口）对 (q, m) 逐对前向推理（top5 候选 → 每查询 ≤5 次前向，可批处理）；
2. 模型输出 logit → sigmoid 归一化到 (0,1)（或按模型原生输出范围在校准集上确定映射参数）；
3. 决策阈值在校准集上确定，随机制冻结。

**输出分数**：0–1 连续相关性分数（cross-encoder 原生相关性，非余弦相似度）。

**非冗余诊断（适用门，§5.2）**：校准集上计算候选 A 分数与 mem0 原始 score 的 Spearman ρ；ρ ≥ 0.9 → 候选 A 降级为冗余基线（仅 A 降级，B 独立评估）；ρ < 0.9 仅证明非冗余，仍须通过全部质量/延迟/资源/泛化门。

**冗余降级自检（Founder Review 1 第 1 条）**：报告必须自查实现是否实际只使用了单一余弦（如错误使用 embedding 余弦而非 cross-encoder 联合编码）——若是，同样视为冗余基线，不作为正式候选；自查项（实现走 TextCrossEncoder 联合编码、无 dot 单一项）写入报告与 mechanism-freeze.md。

**针对第一轮根因的新增能力（R1）**：cross-encoder 将查询与记忆**拼接后联合编码**，建模深层语义交互（同一橘猫记忆在"天气"上下文下应判无关、在"失眠"上下文下应判相关）——第一轮词法信号物理上做不到的判别。

### 5.6 指标计算（lib/metrics.mjs）

- F1 = 2·P·R/(P+R)，对"保留/过滤"二分类（分数 ≥ 决策阈值 = 保留）；
- 分离边际 = 最低正例分 − 最高无关分；
- Spearman ρ：秩相关（纯排序实现）；
- 波动：3 轮间 F1/边际波动范围，**按同记忆文本族跨轮极差分组统计**（第一轮教训：混合所有候选算 range 会虚高）；实测波动 > 0.1 → 判据自动失效 → 候选级停止条件 1；
- 延迟百分位：P50/P90/P95/P99/max，P95 = `ceil(0.95×N)` 位（nearest-rank），方法与值写入报告与 JSON；
- **脚本直接实现报告指标口径，禁止报告手工重算**（脚本/报告漂移教训）。

---

## 6. 候选评估顺序与理由

```text
S0 预装检查 → S0.5 模型事实报告（候选 A）→ S1 holdout 冻结（步骤①）
→ S2/S3 校准集核验与标注（共用数据）
→ S4 候选 B：语料构建 + k-means + 校准调参 + 校准评估（步骤②）
→ S5 候选 A（模型确认后）：rerank + ρ 诊断 + 校准评估
→ S6 机制冻结（步骤③，每正式候选）→ S7 holdout 一次性运行（步骤④）
→ S8 延迟/资源 → S9 网络审计 → S10 报告
```

理由：

1. **holdout 冻结最早（S1）**：满足 DRAFT §5.3 四步顺序不可颠倒；冻结提交先于任何 Builder 实现/调优提交（隔离纪律，Reviewer 核对提交历史）。
2. **候选 B 先于候选 A（S4 → S5）**：① 候选 B 只依赖共享依赖（embedding 缓存 + 静态已批准语料），无未确认模型，不受模型事实确认门阻塞，可立即执行；② 候选 A 的执行受 Founder/决策 Chief 模型确认门约束（S0.5），时序天然靠后，且其 ρ 诊断必须先有 A 分数、无法早于确认门；③ 两候选互相独立（DRAFT §8 候选独立性），评估顺序不改变各自适用门/通过门判定；④ B 先行产出的校准 F1/边际为 A 提供同数据、同标签、同口径的对照基线。
3. **延迟/资源测量在机制冻结后（S8）**：只对冻结机制测（保证测的就是最终提交的机制）；测量本身不改变机制。
4. **S0.5 确认门不阻塞 B**：等待模型确认期间继续 S4 候选 B，不空等（A 的确认门与 B 的执行互不依赖）。

---

## 7. 模型事实报告要求（候选 A 专属；约束 3/8；S0.5 产物 `spike-r2/model-facts.md`）

P5-A 通过（发现缓存 reranker 权重）后产出；P5-A 未通过 → 候选 A 不可执行，`model-facts.md` 记录"N/A + 缺失证据（核验命令输出）"，不产生候选 A 结果。报告逐项填写：

| # | 字段 | 定义与来源 |
|---|---|---|
| ① | 模型名称与版本 | P5-A 核验发现的缓存权重模型名（如 models--*--bge-reranker-*）+ 版本；fastembed 版本（P5-A2） |
| ② | 权重内容哈希 | 权重文件（onnx/safetensors 等）sha256 逐文件计算并记录 |
| ③ | 许可证 | **按具体权重自身的模型卡记录，不得用代码仓库许可证代替**：优先读取缓存内模型元数据（config.json/README 的 license 字段）；缺失时引用 `spike-r2-research.md` §4 已抓取的对应模型卡记录（如 bge-reranker-v2-m3 = apache-2.0）；**无法从缓存或已入库调研证据确定 → 标记"待确认（以模型卡为准）"，不运行时联网抓取**（Spike 全程零非本机网络） |
| ④ | 缓存来源与路径 | 本地缓存目录绝对路径（P5-A 核验结果）、来源证明（随镜像预装 / 首次实例化缓存——以核验记录为准，不假设） |
| ⑤ | 运行接口 | fastembed TextCrossEncoder 版本 + `rerank(query, documents)` 签名（P5-A2 import 核验）；或经核验的等价本地接口 |
| ⑥ | 资源需求 | 磁盘 = 权重文件大小合计（ls -la）；内存/CPU = 模型卡声称值（引用）+ S8 实测值补充；先给文件大小估算，S8 实测为准 |

**确认门**：本报告提交 Founder/决策 Chief 确认；确认前不得运行候选 A、不得下载/安装/替换权重（约束 4）。确认记录（日期/确认人）回填 model-facts.md。

---

## 8. 冻结记录文件结构

### 8.1 `holdout-freeze.md`（S1 生成）

```yaml
freeze_type: holdout
freeze_timestamp: <ISO8601>
git_commit: <提交号>
content_hash: <sha256(holdout-definition.json)>
scenario_count: 4
scenarios:
  - id: H-R2-1
    type: 多义词
    query: <S1 冻结文本，新文本，非第一轮 H1 原文>
    seed_memories: [<冻结合成种子文本>]
    expected_labels: {relevant: [...], irrelevant: [...]}
  - id: H-R2-2
    type: 他人属性
    ...
  - id: H-R2-3
    type: 语义隐式关联
    ...
  - id: H-R2-4
    type: 未见过表达泛化（新天气表达；新文本，非 H4 原文、非 E004 原文）
    ...
note: holdout 内容不用于设计/调整任何候选机制（含候选 B 的 k/阈值、候选 A 的映射/阈值与全部实现参数）
```

- 冻结对象为 `holdout-definition.json`（机器可读、唯一事实），`content_hash` 为其 sha256；冻结后文件不可修改（Reviewer 核对 Git 历史）。
- 本实施计划 §9.2 给出 holdout 场景**骨架**（类型/意图/标签结构，来自已批准 DRAFT v1.2 §5.3.3 困难负例类型）；**最终冻结文本在 S1 写入并哈希锁定**，二者以 `holdout-definition.json` 为准（第一轮同款模式）。

### 8.2 `mechanism-freeze.md`（S6 生成，每正式候选一份）

```yaml
freeze_type: mechanism
candidate: candidate-a | candidate-b
version: v1.0
freeze_timestamp: <ISO8601>
git_commit: <提交号>
score_function_hash: <sha256(评分函数实现 + 参数)>
implementation_hash: <sha256(核心实现文件)>
parameters:
  # 候选 B：k、原型权重、决策阈值、映射公式
  # 候选 A：模型名/版本、映射参数、决策阈值
calibration_summary:
  rounds: 3
  f1_per_round: [...]
  margin_per_round: [...]
  volatility: ...
  rho_spearman: <候选 A 必填>
  redundancy_self_check: <候选 A 必填：实现非单一余弦声明>
note: 冻结后不得再修改机制、参数与权重（DRAFT §5.3 步骤③）
```

### 8.3 运行时冻结哈希断言（S7 run-holdout.mjs 内置）

一次性运行脚本在启动时读取冻结记录，对冻结对象（holdout-definition.json 内容、机制哈希）做 sha256 与冻结记录比对，**不一致 → `exit(2)` 拒绝运行**；脚本打印冻结哈希 + 冻结提交号，证据链自含（防读入被修改版本）。

### 8.4 Reviewer 核验接口

Builder 只提供冻结记录 + 提交历史（时间戳/提交号/哈希）；**核对结论由独立 Reviewer 写入其审查报告**，Spike 报告不得预写 Reviewer 核对结论（DRAFT §5.3.7）。

---

## 9. 校准与 holdout 场景设计

### 9.1 校准集（已批准范围，无新增设计）

5 场景 = 正式 8 Case 中的 E001–E005（查询与种子文本来自 `002_eval.sql` 合成种子）；数据 = 第一轮已入库校准样本 3 轮（§5.2 核验/补充）。校准集文本不参与 holdout 冻结定义；holdout 文本不参与校准调参。

### 9.2 holdout 场景骨架（4 个；S1 冻结最终文本，S7 一次性运行）

> 所有场景使用**全新文本**：不复用第一轮 H1–H4 原文（H1 苹果多义词 / H2 朋友分手 / H3 猫跑酷 / H4 下雨）、不复用校准集 E001–E005 原文。以下示例仅示意类型与结构，**非最终冻结文本**；最终文本在 S1 写入并哈希锁定。

| ID | 类型（DRAFT §5.3.3） | 场景意图 | 标签结构（骨架） |
|---|---|---|---|
| H-R2-1 | 多义词（新词对，示例"杜鹃"花义 vs 鸟义） | 同词异义：query 指向一个义项，记忆含另一义项（无关）与同义项（相关） | 相关 1 条 / 无关 1 条 |
| H-R2-2 | 他人属性（新场景，示例"朋友减肥"） | 记忆关于他人，query 关于用户自身 → 他人记忆应判无关；用户自身记忆应判相关 | 正/负各 ≥1 条 |
| H-R2-3 | 语义隐式关联（新隐式因果，示例"熬夜看球→白天犯困"） | 无表面词重叠的隐式因果关联应判相关；无关干扰记忆应判无关 | 相关 1 条 / 无关 1 条 |
| H-R2-4 | 未见过表达泛化（**新天气表达**，示例"起风降温"类；禁止复用 H4 原文与 E004 原文） | 第一轮失败类型（新天气表达）的泛化：新天气表达不得召回宠物/兴趣类无关记忆；含真实天气关联的记忆应判相关（验证非纯词法信号） | 相关 1 条 / 无关 ≥2 条 |

- 每场景使用全新评测专用 user（`eval-spike-r2-h<1-4>-<rand>`，合成种子经 §11.3 零外发路径写入，S7 运行后立即删除并核验清零）；
- 不写入正式 eval_cases、不修改正式 8 Case；holdout 内容在 S1 哈希冻结前**不用于任何机制设计/实现/调优**；
- H-R2-4 的种子记忆使用与校准集不同的具体内容（新宠物/兴趣/健康样本），避免字面量复用。

---

## 10. 延迟/资源测量方案（DRAFT §6 落地，沿用第一轮口径）

`measure-latency.mjs`，对**每个正式候选**（冻结机制）执行：

| 口径项 | 落地 |
|---|---|
| 预热 | 机制函数先执行 5 次，结果丢弃 |
| 样本次数 | 每场景有效测量 N ≥ 30（场景 = E001、E004 + holdout 4 场景，≥6 个；N 与理由写入报告） |
| P95 | 有效样本升序排序取 `ceil(0.95 × N)` 位（nearest-rank）；报告 P50/P90/P95/P99/max |
| 进程边界 | 只计时候选机制函数调用本身（不含脚本启动、DB 连接、模型加载）；资源以子进程峰值 RSS 或运行前后差值记录 |
| 基线值 | 仅执行本地检索 `mem0.search(user, query, top_k=5)`；同一样本、同一检索执行 |
| 处理组 | 同一次本地检索 + 候选 Gate（复用基线检索输出） |
| 增量 | 处理组 − 基线（同一样本）；候选函数单独耗时另行报告为参考，**不得用作增量** |
| 候选 A Gate 内容 | 对 top5 候选逐对 rerank（≤5 次前向/查询，可批处理）+ 映射 + 阈值判定 |
| 候选 B Gate 内容 | q/m 嵌入（容器内 fastembed）+ 原型分布映射 + 加权余弦 + 阈值判定；**聚类构建（语料嵌入 + k-means）为校准阶段离线步骤，不计入每请求延迟，报告单独说明** |
| 内存 | 逐次采样 `process.memoryUsage().rss` 取峰值（基线/处理组/增量分别记录） |
| CPU | 每次评估前后 `process.cpuUsage()` 差值（user+system），报告 P95 与峰值 |
| 失败/回退 | 每轮记录候选机制异常次数与回退行为；**keep-all 回退会恢复 E004 缺陷，不得表述为修复** |

通过门：增量 P95 ≤ 200ms；总预算（基线+Gate）P95 ≤ 1000ms；峰值 RSS ≤ 512MB；单次 CPU ≤ 500ms。延迟门是 Spike 通过门，不是产品最终承诺。

---

## 11. 网络与数据边界审计设计

1. **fetch 包装**（lib/fetch-audit.mjs）：全局包装 fetch，每次调用记录 URL + 时间戳 + 结果码到 `data/audit/network-<阶段>-<ts>.log`；目标 host ∉ {127.0.0.1, ::1, localhost} → **立即中止运行并报错**（零容忍）；
2. **容器网络面核验（P6）**：`docker inspect v2-mem0-server` env 确认 `MEM0_LLM_BASE_URL` 存在 → **REST `POST /memories` 一律禁用**（会触发容器内部 LLM 外发，脚本侧 fetch 审计拦不到）——见 §11.3 零外发路径；
3. **运行期审计**：校准评分、holdout 运行、延迟测量全程在包装下执行，审计日志随证据入库（校准/holdout/清理三阶段 + 延迟阶段）；
4. **环境审计**：P6 记录宿主代理变量状态（R1 实测 loopback 代理 7890 + NO_PROXY）；脚本配置 `config.mjs` 中所有目标 URL 硬编码为 loopback；
5. **数据边界**：仅合成评测数据；不读取/复制/落盘真实用户内容（不读 traces/conversations/users 真实行、不读日志真实输入）；
6. **种子清理核验**：holdout 种子 S7 后删除，`qdrant scroll filter user_id` 逐 user 验证 0 剩余（更底层，直接打向量库）+ `mem0.getAll` 复核 + cleanup.json 记录；
7. **零产品改动合规证据**：`docker diff v2-mem0-server` 输出作为"未改产品代码"证据（应仅 A=新增，无 C 修改产品文件）。

### 11.3 零外发种子写入（S7 seed-holdout.mjs）

```js
// 宿主 Node 脚本：docker exec -i 传 JSON，stdin 进、stdout 回（沿用第一轮验证配方）
// 容器内: sys.path.insert(0,'/app'); from main import _build_config; from mem0 import Memory
//         m = Memory.from_config(_build_config()); m.add(text, user_id=..., infer=False)  // 纯本地，不调 LLM
// 输出 'SEED_JSON:' 前缀行区分容器日志；清理仍走 REST DELETE（只删点，不触发 LLM）
```

---

## 12. 验证设计（DRAFT §8 验收逐项对标）

| DRAFT §8 项 | 验证设计 | 证据产物 |
|---|---|---|
| 1 预装检查通过（共享/专属分别判定） | P1–P4/P5-S/P6 共享逐项 + P5-A/P5-A2 候选 A 专属逐项，只读命令 | preflight-check.md |
| 2 各候选适用门独立 | 候选 A：校准集 ρ < 0.9 + 冗余降级自检（实现非单一余弦）；候选 B：数据驱动定义核对（单一方法 k-means、输入仅 (a)(b)、无人工词表/未批准语料/模型/依赖） | data/scores/、报告、mechanism-freeze.md |
| 3 每个正式候选 0–1 连续分数 + ≥3 轮测量 | 两候选均输出 0–1 分数；3 轮校准（复用第一轮 3 轮样本，来源声明）分布/边际/波动如实记录 | data/calibration、data/scores |
| 4 校准集 F1 ≥ 0.9 且边际 > 0.1（每候选分别） | 每候选各自评估（3 轮逐轮 + 合并） | data/scores/metrics.json |
| 5 冻结 holdout 一次性运行 F1 ≥ 0.9 且边际 > 0.1 | 四步顺序执行（S1→S2/3→S6→S7）；一次性运行；运行时哈希断言；运行后无继续调参提交（Reviewer 核对提交历史） | holdout-freeze.md、mechanism-freeze.md、data/holdout |
| 6 延迟门 | 增量 P95 ≤ 200ms、总预算 ≤ 1000ms | data/latency |
| 7 资源门 | 峰值 RSS ≤ 512MB、CPU ≤ 500ms | data/latency |
| 8 网络与数据边界 | fetch 包装审计 + 容器网络面核验 + 零外发种子 + 种子清理核验（qdrant scroll 0 剩余）+ docker diff | data/audit、cleanup.json |
| 9 零产品改动 | 分支 diff 相对 origin/main 仅含 project-context/tasks/TASK-006/ 文档与 spike-r2/ 文件 | git diff --stat 记录 |
| 10 证据完整落盘 | 脚本 + 原始数据 + 标签复核 + 冻结记录（时间戳/提交号/哈希）+ 模型事实报告 + 审计 + 失败尝试 + holdout 隔离审计证据（S1 先于 S6 的提交历史核验） | spike-r2/ 全目录 |
| 11 报告诚实 | 样本量声明、波动范围、失败记录（含失败候选）、ρ、增量口径、校准/语料同源披露、与 DRAFT v1.2 判据对标、"Spike 通过 ≠ TASK-006 完成"声明 | spike-report.md |

**回归证明**：E001/E003 正向场景在冻结机制下逐轮 F1/边际报告（候选不砍正向召回）；强约束（E006/E007/E008）不涉及（零产品改动）。

---

## 13. 分步骤执行顺序（批准后）

```text
S0  预装检查（P1–P4/P5-S/P6 共享 + P5-A/P5-A2 候选 A 专属）→ preflight-check.md
    （共享缺失 → 裁决；致两候选均不可执行 → 整轮停止 §9.2-10；P5-A 缺失 → 只停候选 A，B 继续）
S0.5 模型事实报告（候选 A；P5-A 通过时）→ model-facts.md → Founder/决策 Chief 确认 → 候选 A 才可运行
S1  holdout 数据冻结（步骤①）：写入 holdout-definition.json（4 新场景）→ 哈希 → holdout-freeze.md → commit
    （冻结提交先于任何 Builder 实现/调优提交）
S2  校准集核验/补充：只读核验第一轮已入库样本（3 轮 × 5 场景）→ data/calibration/（补充采集时）
S3  标注：关键词初判 + 人工复核（fail-fast 断言）→ data/labels/
S4  候选 B：语料 (a)+(b) 构建 → 嵌入 → k-means → k/阈值网格（仅校准集）→ F1/边际/波动
    （不达标 → 候选级停止 1，记录失败，继续 S5；不无限调参）
S5  候选 A（模型确认后）：rerank → ρ 诊断（≥0.9 → 降级冗余基线，仅 A）+ 冗余降级自检 → 阈值 → F1/边际/波动
    （校准不达标 → 候选级停止，记录失败）
S6  机制冻结（步骤③）：mechanism-freeze.md（每正式候选；哈希）→ commit
S7  holdout 一次性运行（步骤④）：seed-holdout（零外发）→ run-holdout（运行时哈希断言，exit(2) 保护）→ cleanup-holdout（删除并核验清零）；运行后禁止继续调参
S8  延迟/资源测量（冻结机制）：预热 5、N≥30、基线/处理组/增量、P95 nearest-rank、RSS/CPU → data/latency
S9  网络/数据边界审计 → data/audit（三阶段 + 延迟）
S10 Spike 报告（验收逐项对标、诚实声明、governance-sync-summary.md）→ spike-report.md → 全部证据 commit → 结构化实现报告 + 下一窗口唤醒卡
```

时间盒：自批准启动起 ≤ 5 个工作日（墙钟）或 ≤ 3 轮"测量—调整—复测"（先到者）；基线测量与最终验收 Run 不计入 3 轮（DRAFT §4）。

---

## 14. 风险、停止条件与 Change Request 条件

### 14.1 主要风险（含缓解）

| 风险 | 影响 | 缓解/处置 |
|---|---|---|
| P5-A 未发现 reranker 权重或接口不可用 | 候选 A 不可执行 | **只停候选 A（§9.1-4），候选 B 独立继续；不下载/不安装/不替换**（约束 4/5） |
| 候选 B 校准/语料同源（批准输入限制） | 校准 F1 虚高，泛化判断失真 | 如实披露同源属性；结论以冻结 holdout 为准；边际判据（>0.1）比 F1 更抗拟合 |
| k-means 在 8 Case 小语料上原型退化（k 接近样本数） | 聚类无意义 | k 网格上限 8 且 < 样本数/2（不足则缩小网格并在报告声明）；k-means++ + 固定种子 + 确定性重启（如 5 次取最优 inertia，种子序列固定） |
| 候选 B 运行时嵌入成本超门 | 延迟门不达标 | 如实记录（门是 Spike 通过门）；嵌入复用同一缓存模型；不调参掩盖 |
| 校准数据源不足（第一轮样本缺失/损坏） | S2 无法完成 | 从已完成 Run 用户只读补充采集；可用 run=0 → 停止提交数据源裁决 |
| mem0 检索波动 > 0.1 | 判据失效 | 触发候选级停止条件 1，如实报告 |
| 非 loopback 访问被触发 | 边界破坏 | fetch 包装立即中止 + 上报（整轮红线 5） |
| 候选 A 模型确认门阻塞 | A 评估延后 | 等待期间继续候选 B（不空等）；超时影响计入时间盒如实报告 |
| 时间盒到期未收敛 | 整轮停止 | 按 §9.2-8 处理，提交 CR 由 Founder 裁决 |

### 14.2 停止条件（DRAFT §9 全量继承；候选级与整轮级分开）

**候选级（只停对应候选，另一候选独立继续）**：
1. 候选质量不达标：该校准集或冻结 holdout 分离边际 ≤ 0.1（或实测波动 > 0.1 判据失效）；
2. 正向召回退化：修复 E004 必然导致 E001 等正向召回明显退化；
3. 必须削弱测试/改判定规则/手工枚举词表/固定字面量硬编码才能变绿；
4. 候选专属依赖缺失（候选 A：reranker 权重未缓存或接口不可用；候选 B：校准数据源缺失）。

**整轮立即停止红线（任一触发 → 整轮停止，提交 CR 返回 Founder）**：
5. 数据外发 / 非本机网络访问（Spike 机制实际发起外部调用）；
6. 接触或落盘真实用户数据（非合成数据）；
7. 冻结失效：无法建立与校准数据独立的冻结 holdout 证据（holdout 不可建立、不独立，或冻结纪律被破坏）；
8. 时间盒到期（5 工作日 / 3 轮，先到者）未收敛；
9. 需要超出批准范围的改动（含必须外发才能解决）；
10. 没有任何正式候选可执行（共享依赖缺失致两候选均不可执行，或候选级停止后无剩余可执行候选）。

### 14.3 Change Request 条件

新增第三候选、修改允许/禁止范围、触碰产品代码/正式 8 Case/评测规则/治理文件、任何安装/下载、任何外发、候选 A 具体模型未经确认即运行 → 立即停止并提交 CR，由 Founder 裁决。

---

## 15. 提交边界与证据落盘

- 唯一分支：`feature/task-006-r2-spike`；不合并、不部署、不 force push；
- 提交策略：每阶段（S0/S0.5/S1/S3/S6/S7/S10）一个证据 commit，commit message 标注阶段与冻结事实（时间戳/哈希）；
- **不创建 PR**：Review 2 由 Founder 在本窗口审查；Review 3（代码与行为 Review）与合并裁决按交接包 §17 由独立 Reviewer 与 Founder 执行；
- 分支 diff 相对 origin/main 必须仅含 `project-context/tasks/TASK-006/` 文档与 `spike-r2/` 文件（验收 9）；
- 全部证据（脚本 + 原始数据 + 报告 + 冻结记录 + 模型事实报告 + 审计）随分支入库，可复现；
- 治理文件（current-state.md / decision-register.md）**Builder 不直接修改**：S10 交付 `governance-sync-summary.md`（事实表 + 待决项建议 + 边界确认），由 Chief 在 Founder 裁决后落盘；未落盘前不得声称已更新。

---

## 16. 附录：预装检查命令清单（批准后执行；共享/候选 A 专属分类）

```bash
# ========== 共享依赖（两候选共同；缺失 → 裁决；致两候选均不可执行 → 整轮停止） ==========

# P1 mem0-server 运行中 + loopback 可达（host 端口以本轮 `docker port` 实测为准；R1 实测 8100）
docker ps --format '{{.Names}} {{.Status}}' | grep v2-mem0-server
docker port v2-mem0-server
curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8100/openapi.json

# P2 mem0 版本
docker exec v2-mem0-server python -c "import mem0;print(getattr(mem0,'__version__','n/a'))"

# P3 PostgreSQL + 评测表（只读）
docker exec v2-postgres pg_isready -U postgres -d ai_companion
docker exec v2-postgres psql -U postgres -d ai_companion -tAc 'select count(*) from eval_cases'

# P4 Node/npm + pg 依赖（不安装；复用主检出已预装 node_modules）
node --version && npm --version
node -e "const {createRequire}=require('module');const r=createRequire('E:/正式作品/v2/app/package.json');const {Client}=r('pg');console.log('pg ok')"

# P5-S 共享：embedding 模型缓存存在（候选 B 与 mem0 基线共同依赖；只读，禁止实例化触发下载）
docker exec v2-mem0-server sh -c 'ls /tmp/fastembed_cache/models--Qdrant--bge-small-zh-v1.5/snapshots/*/ 2>/dev/null || find / -maxdepth 6 -type d -name "*bge-small-zh-v1.5*" 2>/dev/null'

# P6 网络边界：宿主代理 + 容器网络面（确认 MEM0_LLM_BASE_URL → 禁用 REST 写种子）
env | grep -iE '^(http|https|all|no)_proxy' || echo 'no proxy vars'
docker inspect v2-mem0-server --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -iE 'LLM|API|BASE'

# ========== 候选 A 专属依赖（缺失 → 只停候选 A；候选 B 独立继续；不下载/不安装/不替换） ==========

# P5-A reranker 权重是否已缓存（具体模型名/版本待核验，不预选；只读 ls，禁止实例化）
docker exec v2-mem0-server sh -c 'ls -d /tmp/fastembed_cache/models--*reranker* /tmp/fastembed_cache/models--*cross* 2>/dev/null; find /tmp/fastembed_cache -maxdepth 2 -type d 2>/dev/null | head -30'

# P5-A2 fastembed 版本 + TextCrossEncoder 接口（仅 import 核验；禁止实例化——实例化可能触发下载）
docker exec v2-mem0-server python -c "import fastembed;print('fastembed',fastembed.__version__)"
docker exec v2-mem0-server python -c "from fastembed.rerank.cross_encoder import TextCrossEncoder;print('TextCrossEncoder import ok')"
```

> 执行人：Builder（批准后）；全部输出记录到 `spike-r2/preflight-check.md`；共享缺失 → 按 §14.2 裁决/整轮停止路径处理；候选 A 专属缺失 → 只停候选 A。

---

## 17. 明确未处理的后续事项

1. Spike 通过 ≠ TASK-006 完成；产品实现须另经新 Change Request + 实施计划 + Founder 批准（含产品化接线、回退策略、快照字段、真实超时语义与成本口径）；
2. 候选机制若可行，其产品化接线（是否/如何进入召回链路、回退策略、配置字段）不在本 Spike 范围；
3. TASK-007 / TASK-005B / 20 Case / TASK-004 重启等均不在本 Spike 范围，主线顺序不变；
4. 本计划不预选候选 A 具体模型、不预设候选结果；一切以预装检查核验与实测证据为准。
