# TASK-006 本地相关性 Gate Spike — 实施计划（Review 2）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED，可靠性判据 §3.1）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-006/local-gate-spike-draft.md（v1.2，APPROVED，本任务唯一权威方案）
  - project-context/tasks/TASK-006/spike-builder-handoff.md（十七字段交接包）
  - project-context/tasks/TASK-005A/release-qa-report.md（Run #28 证据）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/lib/mem0-client.ts
  - v2/app/src/app/api/chat/route.ts
  - v2/docker-compose.yml
doc_type: Builder 实施计划（Review 2 用；阶段 1 交付物）
task_id: TASK-006（内部 Spike：TASK-006-SPIKE-LOCAL-GATE）
spike_id: TASK-006-SPIKE-LOCAL-GATE
status: DRAFT_FOR_REVIEW_2（等待 Founder/Reviewer 批准；批准前不进入任何实测）
execution_mode: persistent_session（已确认）
assigned_role: Builder（长期会话）
branch: feature/task-006-local-gate-spike
plan_version: v1.0
author: Builder（TASK-006｜Builder｜本地相关性 Gate Spike）
date: 2026-08-12
```

> **本计划批准前禁止一切实测动作**：禁止预装检查执行、禁止写测量/验证脚本、禁止建 holdout、禁止测量或任何实测（交接包 §12 禁止 14 / DRAFT §7 禁止 10）。
> 本文件只做规划与设计；批准后按 §12 分步骤执行，每步落盘证据。

---

## 1. 当前事实与待验证假设

### 1.1 已核验事实（证据锚点）

| 事实 | 证据 |
|---|---|
| E004 缺陷仍存在：Run #28 天气话题召回无关 2 条（失眠 0.431、橘猫 0.360，允许 ≤1） | `release-qa-report.md` §5/§6；eval_runs.run_number=28 |
| E001 正向召回：失眠 0.660 + 橘猫 0.445（两条件均按"相关"计入，PASS） | `release-qa-report.md` §5；`eval-program-rules.ts:401-423` |
| 产品召回链路：mem0.search top5 → score ≥ 0.35 过滤 | `chat/route.ts:55-58`；`memory-config.ts` |
| mem0 检索分数来源：本地 fastembed `BAAI/bge-small-zh-v1.5` 向量相似度；候选机制与 mem0 是否冗余必须实证诊断 | `TASK-005A/draft.md` §2.1；`v2/mem0-server/main.py:40-44` |
| E004 程序判定：`max_irrelevant_recall ≤ 1`，关键词 猫/吉他/失眠/小橘 | `eval-program-rules.ts:425-446`；`002_eval.sql:104-112` |
| E001 程序判定：`recall_min_related ≥ 1`（related_keywords 含 猫/失眠 类目） | `eval-program-rules.ts:401-423`；`002_eval.sql:74-84` |
| 评测用户隔离格式：`eval-<runShort>-<case>-<rand>`，seed_chat 前置条件经 /api/chat→mem0.add 建种子 | `eval-runner.ts:64,158-191`；`eval-contracts.md` §1.3 |
| 本地组件：mem0-server（容器 v2-mem0-server，host 端口 8900）、PostgreSQL（v2-postgres，5432，库 ai_companion）、Qdrant（v2-qdrant，6333）、Node 现有依赖（pg 8.22 等）、fastembed 模型缓存 | `v2/docker-compose.yml`；`v2/app/package.json`；均为**待核验**状态，非既成事实 |
| 规划 PR #16 已合入 origin/main @ `0f2e3df`；实施分支 feature/task-006-local-gate-spike @ `2d9cc2d` 与远端同步、工作区干净（本次只读核验） | `git fetch origin main` + `git rev-parse` + `git status`（2026-08-12） |

### 1.2 待验证假设（Spike 要回答的问题）

| # | 假设 | 验证方式 | 若证伪 |
|---|---|---|---|
| H1 | 候选 1（本地词法/统计二次相关性 Gate）与 mem0 原始 score 非冗余（Spearman ρ < 0.9），且提供独立分离信号 | 校准集 3 轮测量计算 ρ 与双分离边际对比 | ρ ≥ 0.9 → 降级为冗余对照，不作为正式候选（不停止，继续候选 2） |
| H2 | 候选 1 的 0–1 连续分数能可靠分离 E004 无关候选与 E001 等正向候选（校准 F1 ≥ 0.9、分离边际 > 0.1） | 校准集 3 轮 F1/边际评估 | 校准不达标 → 该候选记录失败，继续候选 2（不停止） |
| H3 | 候选 2（本地主题类别 Gate）通过类别相容矩阵能编码"睡眠×宠物"类语义隐式关联，从而保住 E001 正向召回、滤掉 E004 无关召回 | 校准集 3 轮 F1/边际评估 + 冻结 holdout 一次性运行 | 校准不达标 → 记录失败；holdout 不达标 → 该候选失败（两个都失败才停止） |
| H4 | 冻结 holdout（多义词/他人属性/隐式关联/天气变体）上机制仍泛化（F1 ≥ 0.9、分离边际 > 0.1） | 四步冻结顺序后的一次性运行 | 停止条件 1/5 触发（流程性失效）或该候选失败（单候选） |
| H5 | 候选 Gate 增量 P95 ≤ 200ms、总预算 ≤ 1000ms、内存 ≤ 512MB、CPU ≤ 500ms | §9 延迟/资源测量 | 门不达标 → 该候选失败（如实记录） |

> **诚实预判（非结论）**：E001 的"失眠↔橘猫"正样本对与 E004 的"天气↔橘猫"负样本对在纯词法层面**都接近零重叠**（mem0 分数仅差 0.014），候选 1 的独立词法信号很可能无法同时满足两者（H2 证伪概率高）。这是候选 1 的设计风险，不是停止条件——按 DRAFT 语义"单个候选失败只记录失败、不停止"，候选 2 是分离能力的主要希望。本计划如实预判，实际结果以测量为准。

---

## 2. 目标 / 非目标

### 2.1 目标

1. 在**不接入产品路径、不外发任何用户数据、仅使用已预装本地组件**前提下，验证最多两个本地候选机制能否可靠分离 E004 无关召回与 E001 等正向召回；
2. 产出可复现证据：原始数据、脚本、冻结记录（时间戳/提交号/哈希）、延迟/资源/网络审计、Spike 报告；
3. 至少一个正式候选通过 DRAFT §8 全部 1–11 项 → 形成"存在可行候选"结论。

### 2.2 非目标（明确不做）

1. 不修改任何产品代码（v2/ 全部文件）、正式 8 Case、Schema、评测规则、治理文件；
2. 不进入 /api/chat 产品路径、不创建新 eval Run（不写 eval_runs/eval_results 等正式表）；
3. 不引入第三个候选、不调用外部模型、不做任何运行时下载/安装；
4. 不触碰 TASK-007 / TASK-005B / TASK-004；
5. Spike 通过 ≠ TASK-006 完成，不产生任何产品实现授权。

---

## 3. 依赖与前置条件（预装检查核验命令）

> 批准后执行；全部命令只读、零下载、零安装。任何一项缺失 → **立即停止**，按 DRAFT §9 停止条件 6 提交范围/依赖裁决，不得自行安装。

| # | 检查项 | 核验命令（批准后执行） | 通过标准 |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | `docker ps --format '{{.Names}} {{.Status}}' \| grep v2-mem0-server`；`curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8900/openapi.json` | 容器 Up；HTTP 200 |
| P2 | mem0-server 版本 | `docker exec v2-mem0-server python -c "import mem0;print(getattr(mem0,'__version__','n/a'))"` | 版本号记录到 preflight-check.md |
| P3 | PostgreSQL（ai_companion）运行中、loopback 可达、评测表存在 | `docker exec v2-postgres pg_isready -U postgres -d ai_companion`；`docker exec v2-postgres psql -U postgres -d ai_companion -tAc 'select count(*) from eval_cases'` | pg_isready 就绪；count ≥ 8（只读） |
| P4 | Node/npm 版本与现有依赖满足脚本运行（不新增依赖） | `node --version`；`npm --version`；`cd v2/app && node -e "const {Client}=require('pg');console.log('pg ok')"` | node ≥ 22（项目 test 脚本需 strip-types）；pg 可解析 |
| P5 | fastembed 模型缓存存在（BAAI/bge-small-zh-v1.5） | `docker exec v2-mem0-server sh -c 'ls ~/.cache/fastembed/BAAI/bge-small-zh-v1.5/ 2>/dev/null \|\| find / -maxdepth 6 -type d -name "bge-small-zh-v1.5" 2>/dev/null'` | 目录存在且含模型文件（model.onnx 等）。**禁止执行会触发下载的实例化命令** |
| P6 | 网络边界：脚本环境确认仅 loopback 可访问 | `env \| grep -iE '^(http\|https\|all\|no)_proxy' \|\| echo 'no proxy vars'`；脚本配置中所有目标 URL 为 127.0.0.1/::1/localhost | 记录环境代理变量状态；目标白名单仅 loopback |

记录方式：核验输出、版本号、路径、时间戳写入 `spike/preflight-check.md` 并随分支入库。

---

## 4. 修改文件清单（全部为 spike/ 新增，零产品改动）

> **不修改任何现有文件**。以下全部为批准后新建文件，位于 `project-context/tasks/TASK-006/spike/`（唯一证据落盘区）。

```text
spike/
├── implementation-plan.md        # 本文件（阶段 1 交付物）
├── preflight-check.md            # 阶段 2 步骤 S0 产物（预装检查记录）
├── holdout-freeze.md             # 步骤 S1 产物（holdout 冻结记录：时间戳/提交号/哈希）
├── holdout-definition.json       # 冻结的 holdout 场景定义（内容哈希对象；S1 锁定后不再改动）
├── theme-system.md               # 候选 2 主题体系（S5 撰写，S6 冻结最终版）
├── mechanism-freeze.md           # 步骤 S6 产物（机制冻结记录：版本/权重/矩阵/哈希）
├── spike-report.md               # 步骤 S10 产物（Spike 报告，含验收逐项对标）
├── scripts/                      # 测量/验证脚本（纯 Node ESM .mjs，零新增依赖）
│   ├── config.mjs                # 环境配置：loopback URL、路径、N、阈值常量（只读配置）
│   ├── lib/features.mjs          # 词法/统计特征（候选 1 信号 + 候选 2 lex 组件）
│   ├── lib/theme-engine.mjs      # 候选 2 主题分类 + 相容矩阵 + score 函数
│   ├── lib/metrics.mjs           # F1、分离边际、Spearman ρ、P50/95/99（纯实现）
│   ├── lib/mem0-api.mjs          # mem0 REST 只读客户端（search/getAll/delete，仅 loopback）
│   ├── lib/db-read.mjs           # PostgreSQL 只读查询（定位评测 user_id；pg 经 createRequire 复用 v2/app 依赖）
│   ├── lib/fetch-audit.mjs       # 全局 fetch 包装：记录每次调用的 URL，断言仅 loopback
│   ├── collect-calibration.mjs   # 校准集 3 轮采集（mem0.search → data/calibration/）
│   ├── label-calibration.mjs     # 关键词初判 + 人工复核脚手架 → data/labels/
│   ├── score-candidate.mjs       # 对采集样本计算候选 1/2 分数 → data/scores/
│   ├── freeze-holdout.mjs        # 对 holdout-definition.json 做哈希锁定 → holdout-freeze.md
│   ├── freeze-mechanism.mjs      # 对 theme-system.md + 权重做哈希锁定 → mechanism-freeze.md
│   ├── seed-holdout.mjs          # 按冻结定义 mem0.add 合成种子（仅 holdout 允许；S7 前执行）
│   ├── run-holdout.mjs           # 冻结机制对冻结 holdout 一次性运行（S7）
│   ├── cleanup-holdout.mjs       # 删除 holdout 种子并核验清零（S7 后立即执行）
│   ├── measure-latency.mjs       # 延迟/资源测量（预热 5、N≥30、基线/处理组/增量、P95、RSS/CPU）
│   └── network-audit.mjs         # 运行期网络审计 → data/audit/
└── data/                         # 原始数据（全部随分支入库）
    ├── calibration/round-{1,2,3}/  # 每轮每场景原始 JSON（query/results[id,memory,score]）
    ├── labels/                     # 标签与人工复核记录
    ├── scores/                     # 候选分数与指标中间结果
    ├── holdout/                    # holdout 一次性运行原始输出
    ├── latency/                    # 延迟/资源原始测量
    └── audit/                      # 网络审计日志
```

依赖说明：脚本运行于 worktree 根（Node ≥ 22），`pg` 通过 `createRequire` 指向 `v2/app` 复用现有依赖；**不安装任何包、不修改 v2/ 任何文件**。若 pg 解析失败 → 视为缺失依赖，停止并提交裁决。

---

## 5. 测量/验证脚本设计

### 5.1 数据流

```text
S0 预装检查（只读命令）                    → preflight-check.md
S1 holdout 定义写入 + 哈希冻结             → holdout-freeze.md + holdout-definition.json（commit）
S2 校准采集：DB 只读定位评测 user_id
   → mem0.search(query, top_k=5, 该 user)  → data/calibration/round-{1,2,3}/*.json
S3 标签：关键词初判 + 人工复核             → data/labels/
S4/S5 候选评分与校准：features → score → F1/边际/ρ
S6 机制冻结（哈希）                        → mechanism-freeze.md（commit）
S7 holdout 一次性运行（seed → run → cleanup）
S8 延迟/资源测量（S4/S5 后、机制冻结后对冻结机制测）
S9 网络/数据边界审计
S10 报告 + 全部证据 commit
```

### 5.2 校准集采集（S2）

- **数据源**：现有已完成 Run 的评测专用 user_id（`eval-<runShort>-<case>-<rand>`，合成数据，非真实用户）。
  - 只读查询：`SELECT er.case_id, er.eval_user_id, r.run_number FROM eval_results er JOIN eval_runs r ON er.run_id = r.id WHERE r.status='completed' AND er.eval_user_id IS NOT NULL AND er.case_id IN ('E001','E002','E003','E004','E005') ORDER BY r.run_number DESC LIMIT 15`（按 run 取前 3 个不同 run_number 作为 3 轮）。
  - **仅读取 eval_user_id / case_id / run_number**；不读取真实用户行、真实 traces、日志。
- **场景**：E001（query=又失眠了……）、E002（我最近开始学吉他了）、E003（我家猫叫什么来着）、E004（今天天气不错）、E005（我不是不喜欢你问，我只是不想每次都解释）——5 个校准场景，映射 8 Case 正向/对抗覆盖。
- **每轮**：对每个 (case, user)：`mem0.getAll(user)` 核验池非空（记录池大小）；`mem0.search(user, case.input_text, top_k=5)` 保存原始 JSON。
- **3 轮独立性**：优先取 3 个不同 run 的 user（池独立）；可用 run < 3 时，对可用池重复采集并在报告中**如实声明独立性局限**（样本量诚实声明，DRAFT §5.3.6）。可用 run = 0 或池全空 → **停止，提交数据源裁决**（等价 DRAFT §9 停止条件 6 的依赖缺失路径）。

### 5.3 标签规则（S3，DRAFT §5.3.2）

- **正样本**：与查询相关的候选；**负样本**：与查询无关的候选。
- **关键词初判**：沿用 Eval 程序语义——E001/E003 用 related_keywords（猫/失眠/小橘 类）；E004 用 irrelevant_keywords（猫/吉他/失眠/小橘）；初判结果写入标签文件。
- **人工复核**：Builder 逐条复核初判与语义（含"失眠↔橘猫半夜跑酷"类隐式关联的归属），复核理由记录在 `data/labels/`；标签文件含时间戳与复核人。
- 标签在**校准调参前**完成并随数据入库（与冻结纪律一致：标签先于机制调整）。

### 5.4 候选 1：本地词法/统计二次相关性 Gate

- **信号源（与 mem0 不共源）**：纯文本表面统计特征，不调用 mem0、不复用向量相似度、不依赖 bge 分数。
- **特征集（`lib/features.mjs`，纯 JS 实现，零分词依赖）**：
  1. 字符级 n-gram（n=1/2/3）Jaccard 重叠率（q vs m）；
  2. 共现字符二元组占比（交 / 并）；
  3. BM25 类统计评分（以校准语料为文档集合计算 IDF；纯实现）；
  4. 长度比特征（|m|/|q| 的对数）；
  5. 停用词过滤后的实义字符重叠率（内置极小通用停用字表）。
- **分数函数**：特征向量 → 权重线性组合 → sigmoid 映射到 (0,1)；权重在校准集上以网格/简单梯度调参（纯 JS 实现，无外部库）。决策阈值同为校准参数，随机制冻结。
- **非冗余诊断**：校准集上计算候选 1 分数与 mem0 原始 score 的 Spearman 秩相关 ρ（`lib/metrics.mjs`）。ρ ≥ 0.9 → 降级为冗余对照（仍报告，不参与验收）；ρ < 0.9 仅证明非冗余，候选 1 仍须通过全部质量/延迟/资源/泛化门。报告同时给出 ρ 与"非冗余信号分离增益"（候选分离边际 vs mem0 原始分数分离边际）。

### 5.5 候选 2：本地主题类别 Gate（可执行定义）

- **输入**：`q` + 候选记忆 `m`（mem0 score 仅只读背景，不参与判定）。
- **主题体系**（`theme-system.md`，S5 撰写）：类别清单 + 每类判定关键词/模式 + 类别相容矩阵。
  - 类别草案（沿用 DRAFT v1.2 §3 示例方向）：`{宠物, 健康/睡眠, 兴趣/技能, 情感关系, 天气/日常, 财务, 身份信息, 其他}`——最终以校准集 + 通用主题知识人工归纳为准；
  - **禁止使用 holdout 场景内容设计或调整体系/关键词/矩阵/权重**（DRAFT v1.2 §3 候选 2 + §5.3 步骤①）；
  - 类别判定词为通用主题词汇与模式，**禁止**写入"天气→猫/失眠/吉他/小橘"式具体配对（固定字面量触发停止条件 3）。
- **判定步骤**：① 对 q 分类（可多主题，取置信最高）；② 对 m 分类；③ 查相容矩阵得 `comp ∈ {0, 0.5, 1}`（1=同类/强相关，0.5=中性/弱相关，0=不相容）；④ 词法重叠 `lex ∈ [0,1]`（与候选 1 同源特征）。
- **输出**：`score = w1·comp + w2·lex`，w1/w2 初始 0.7/0.3；**仅在校准阶段（S5）可调整 w1/w2 与矩阵条目**；校准完成即冻结（S6），冻结后不得再改。
- **泛化要求**：对冻结 holdout 中未见过话题（多义词、他人属性、隐式关联）有效；固定关键词白/黑名单不视为解决方案。
- **风险提示（非结论）**：矩阵的核心假设是"类别级相容能编码 E001 的睡眠×宠物隐式关联，同时让天气×{宠物,健康,兴趣}=0"；8 Case 校准样本量小，矩阵调参空间与过拟合风险并存，holdout 泛化是最终检验。

### 5.6 指标计算（`lib/metrics.mjs`）

- **F1** = 2·P·R/(P+R)，对"保留/过滤"二分类（分数 ≥ 决策阈值 = 保留）；
- **分离边际** = 最低正例分 − 最高无关分；
- **Spearman ρ**：秩相关（纯排序实现）；
- **波动**：3 轮间 F1/边际的波动范围如实报告；实测波动 > 0.1 → 判据自动失效 → 触发停止条件 1（DRAFT §5.3.5）。

---

## 6. 候选评估顺序与理由

```text
S0 预装检查 → S1 holdout 数据冻结（步骤①）
→ S2/S3 校准集采集与标注（共用数据）
→ S4 候选 1：评分 + ρ 非冗余诊断 + 校准评估
→ S5 候选 2：theme-system 撰写 + 校准调参 + 校准评估（步骤②）
→ S6 机制冻结（步骤③）
→ S7 holdout 一次性运行（步骤④）
→ S8 延迟/资源 → S9 网络审计 → S10 报告
```

理由：

1. **holdout 冻结最早（S1）**：满足 DRAFT §5.3 四步顺序不可颠倒；holdout 内容锁定后才允许任何机制设计。
2. **候选 1 先于候选 2（S4 → S5）**：候选 1 纯词法、实现轻、先行产出 ρ 诊断（冗余降级早判）；其词法特征库同时是候选 2 的 lex 组件，先建可复用；候选 1 若校准失败只记录失败，不阻塞候选 2。
3. **候选 2 后行（S5）**：需要主题体系撰写与矩阵校准，设计工作量最大；其分离能力是 Spike 主要希望（见 §1.2 诚实预判）。
4. **延迟/资源测量在机制冻结后（S8）**：只对冻结机制测（保证测的就是最终提交的机制）；测量本身不改变机制。

---

## 7. 冻结记录文件结构

### 7.1 `holdout-freeze.md`（S1 生成）

```yaml
freeze_type: holdout
freeze_timestamp: <ISO8601>
git_commit: <提交号>
content_hash: <sha256(holdout-definition.json)>
scenario_count: 4
scenarios:
  - id: H1
    type: 多义词
    query: <冻结文本>
    seed_memories: [<冻结合成种子文本>]
    expected_labels: {relevant: [...], irrelevant: [...]}
  - id: H2
    type: 他人属性
    ...
  - id: H3
    type: 语义隐式关联
    ...
  - id: H4
    type: 天气变体泛化
    ...
note: holdout 内容不用于设计/调整任何候选机制（含候选 2 主题体系、关键词、矩阵、权重）
```

- 冻结对象为 `holdout-definition.json`（机器可读、唯一事实），`content_hash` 为其 sha256；冻结后文件不可修改（Reviewer 核对 Git 历史）。
- 本实施计划 §8.2 给出 holdout 场景**骨架**（类型/意图/标签结构，来自已批准的 DRAFT v1.2 困难负例类型）；**最终冻结文本**在 S1 写入并哈希锁定，二者以 `holdout-definition.json` 为准。

### 7.2 `mechanism-freeze.md`（S6 生成，每正式候选一份）

```yaml
freeze_type: mechanism
candidate: candidate-1 | candidate-2
version: v1.0
freeze_timestamp: <ISO8601>
git_commit: <提交号>
score_function_hash: <sha256(score 函数实现 + 参数)>
theme_system_hash: <sha256(theme-system.md)>   # 候选 2 必填；候选 1 记 n/a
parameters: {w1: ..., w2: ..., decision_threshold: ...}   # 候选 2 必填
calibration_summary: {rounds: 3, f1_per_round: [...], margin_per_round: [...], volatility: ...}
note: 冻结后不得再修改机制、矩阵与权重（DRAFT §5.3 步骤③）
```

### 7.3 `theme-system.md`（候选 2；S5 撰写、S6 冻结）

结构：类别清单（含每类判定关键词/模式）、相容矩阵（含初始值来源说明）、权重初始值与调参记录、泛化约束声明（未使用 holdout 内容；基于校准集 + 通用主题知识）。

### 7.4 Reviewer 核验接口

Builder 只提供冻结记录 + 提交历史（时间戳、提交号、哈希）；**核对结论由独立 Reviewer 写入其审查报告**，Builder 的 Spike 报告不得预写 Reviewer 核对结论（DRAFT v1.2 §0.1 修订 5 / §5.3.7）。

---

## 8. 校准与 holdout 场景设计

### 8.1 校准集（已批准范围，无新增设计）

5 场景 = 8 Case 中 E001/E002/E003/E004/E005（查询与种子文本来自正式 8 Case 合成种子，非新增内容）；数据经 S2 真实本地检索采集 3 轮。**校准集文本不参与 holdout 冻结定义，holdout 文本不参与校准调参。**

### 8.2 holdout 场景骨架（4 个；S1 冻结最终文本，S7 一次性运行）

| ID | 类型（DRAFT §5.3.3） | 场景意图 | 标签结构（骨架） |
|---|---|---|---|
| H1 | 多义词（"苹果"水果 vs 公司） | 同词异义：query 指向水果义，记忆含公司义（无关）与水果义（相关） | 相关 1 条 / 无关 1 条 |
| H2 | 他人属性（"朋友分手"） | 记忆关于他人（朋友），query 关于用户自身 → 他人记忆应判无关；query 提及朋友 → 相关 | 正/负各 ≥1 条 |
| H3 | 语义隐式关联（"失眠"与"橘猫半夜跑酷"） | 无表面词重叠的隐式因果关联应判相关；无关干扰记忆应判无关 | 相关 1 条 / 无关 1 条 |
| H4 | 天气变体泛化（新表达，非"今天天气不错"原文） | E004 对抗的泛化：新天气表达不得召回宠物/兴趣/健康类无关记忆 | 相关 0 条 / 无关 ≥2 条 |

- 每场景：全新评测专用 user（`eval-spike-<Hn>-<rand>`，合成种子经 mem0.add 写入，S7 运行后立即删除并核验清零）；
- 不写入正式 eval_cases、不修改正式 8 Case；holdout 内容在 S1 哈希冻结前**不用于任何机制设计**；
- H4 的种子记忆使用与校准集不同的具体内容（新宠物/兴趣/健康样本），避免字面量复用。

---

## 9. 延迟/资源测量方案（DRAFT §6.1/§6.2 落地）

`measure-latency.mjs`，对**每个正式候选**（冻结机制）执行：

| 口径项 | 落地 |
|---|---|
| 预热 | 机制函数先执行 5 次，结果丢弃 |
| 样本次数 | 每场景有效测量 N ≥ 30（场景 = E001、E004、H1、H3 至少 4 个；N 与理由写入报告；数据对齐 3 轮校准口径） |
| P95 | 有效样本升序排序取 `ceil(0.95 × N)` 位；报告 P50/P95/P99 |
| 进程边界 | 只计时候选机制函数调用本身（不含脚本启动、DB 连接、模型加载）；资源以子进程峰值 RSS 或运行前后差值记录 |
| 基线值 | 仅执行本地检索 `mem0.search(user, query, top_k=5)`；同一样本、同一检索执行 |
| 处理组 | 同一次本地检索 + 候选 Gate（复用基线检索输出） |
| 增量 | 处理组 − 基线（同一样本）；候选函数单独耗时另行报告为参考，**不得用作增量**（DRAFT v1.2 §0.1 修订 4） |
| 内存 | 逐次采样 `process.memoryUsage().rss` 取峰值（基线/处理组/增量分别记录） |
| CPU | 每次评估前后 `process.cpuUsage()` 差值（user+system），报告 P95 与峰值 |
| 失败/回退 | 每轮记录候选机制异常次数与回退行为；**keep-all 回退会恢复 E004 缺陷，不得表述为修复** |

通过门：增量 P95 ≤ 200ms；总预算（基线+Gate+探针）P95 ≤ 1000ms；峰值 RSS ≤ 512MB；单次 CPU ≤ 500ms。延迟门是 Spike 通过门，不是产品最终承诺。

---

## 10. 网络与数据边界审计设计

1. **fetch 包装**（`lib/fetch-audit.mjs`）：全局包装 fetch，每次调用记录 URL + 时间戳 + 结果码到 `data/audit/network-<ts>.log`；若目标 host ∉ {127.0.0.1, ::1, localhost} → **立即中止运行并报错**（零容忍）；
2. **运行期审计**：校准采集、holdout 运行、延迟测量全程在包装下执行，审计日志随证据入库；
3. **环境审计**：P6 记录代理环境变量状态；脚本配置 `config.mjs` 中所有目标 URL 硬编码为 loopback；
4. **数据边界**：仅合成评测数据；不读取/复制/落盘真实用户内容（不读 traces/conversations/users 真实行、不读日志真实输入）；holdout 种子 S7 后删除并 `mem0.getAll` 核验清零；
5. 审计结果与原始日志写入 `data/audit/`，作为 DRAFT §8 验收 8 的证据。

---

## 11. 验证设计（DRAFT §8 验收逐项对标）

| DRAFT §8 项 | 验证设计 | 证据产物 |
|---|---|---|
| 1 预装检查通过 | P1–P6 只读命令逐项核验 | preflight-check.md |
| 2 非冗余诊断 / 可执行定义核对 | 校准集 ρ；候选 2 定义字段齐全性核对（输入/体系来源/步骤/0–1 分数/冻结纪律） | data/scores/、报告 |
| 3 0–1 连续分数 + ≥3 轮测量 | 两候选均输出 0–1 分数；3 轮采集与评分，分布/边际/波动如实记录 | data/calibration、data/scores |
| 4 校准集 F1 ≥ 0.9 且边际 > 0.1 | 每候选各自评估（3 轮逐轮 + 合并） | data/scores/metrics.json |
| 5 冻结 holdout 一次性运行 | 四步顺序执行；一次性运行；运行后无继续调参提交（Reviewer 核对提交历史）；F1/边际逐项 | holdout-freeze.md、mechanism-freeze.md、data/holdout |
| 6 延迟门 | 增量 P95 ≤ 200ms、总预算 ≤ 1000ms | data/latency |
| 7 资源门 | 峰值 RSS ≤ 512MB、CPU ≤ 500ms | data/latency |
| 8 网络与数据边界 | fetch 包装审计 + 环境审计 + 种子清理核验 | data/audit |
| 9 零产品改动 | 分支 diff 相对 origin/main 仅含 project-context/tasks/TASK-006/ 文档与 spike/ 文件 | git diff --stat 记录 |
| 10 证据完整落盘 | 脚本 + 原始数据 + 标签复核 + 冻结记录（时间戳/提交号/哈希）+ 审计 + 失败尝试，全部入库 | spike/ 全目录 |
| 11 报告诚实 | 样本量声明、波动范围、失败记录、候选对比、ρ、增量口径、与 DRAFT §5.3.5 对标、"Spike 通过 ≠ TASK-006 完成"声明 | spike-report.md |

**回归证明**（回答"如何证明没有回归"）：E001/E003 正向场景在冻结机制下的 F1/边际逐轮报告（确保候选 Gate 不砍正向召回）；强约束（E006/E007/E008）不涉及——Spike 零产品改动，产品侧行为不受影响；"不回归"由 9 零产品改动 + 正向场景指标共同证明。

---

## 12. 分步骤执行顺序（批准后）

```text
S0  预装检查（P1–P6）→ preflight-check.md（任一缺失 → 停止，提交裁决）
S1  holdout 数据冻结（步骤①）：写入 holdout-definition.json → 哈希 → holdout-freeze.md → commit
S2  校准集采集：DB 只读定位 user_id → mem0.search 3 轮 → data/calibration/
S3  标注：关键词初判 + 人工复核 → data/labels/
S4  候选 1：评分 + ρ 诊断 + 校准评估（不达标 → 记录失败，继续 S5）
S5  候选 2：theme-system.md 撰写（仅校准集+通用知识）+ 校准调参（w1/w2/矩阵）+ 校准评估（不达标 → 记录失败）
S6  机制冻结（步骤③）：mechanism-freeze.md（哈希）→ commit
S7  holdout 一次性运行（步骤④）：seed-holdout → run-holdout → cleanup-holdout（删除并核验）
S8  延迟/资源测量（冻结机制）：预热 5、N≥30、基线/处理组/增量、RSS/CPU → data/latency
S9  网络/数据边界审计 → data/audit
S10 Spike 报告（验收逐项对标、诚实声明）→ spike-report.md → 全部证据 commit → 结构化实现报告 + 下一窗口唤醒卡
```

时间盒：自批准启动起 ≤ 5 个工作日（墙钟）或 ≤ 3 轮"测量—调整—复测"（先到者）；基线 Run 与最终验收 Run 不计入 3 轮（DRAFT §4）。

---

## 13. 风险、停止条件与 Change Request 条件

### 13.1 主要风险（含缓解）

| 风险 | 影响 | 缓解/处置 |
|---|---|---|
| 候选 1 词法信号无法分离低重叠正负对（§1.2 诚实预判） | H2 证伪 | 记录失败，继续候选 2（DRAFT 语义）；不硬凑特征 |
| 候选 2 矩阵在 8 Case 小样本上过拟合 | holdout 泛化失败 | 冻结纪律 + 一次性运行；失败如实记录；不回头调参 |
| 可用校准数据源不足（无已完成 Run 的 E001-E005 user 或池为空） | S2 无法采集 | **停止，提交数据源/依赖裁决**（DRAFT §9 停止条件 6 路径） |
| 本地组件缺失或 pg 解析失败 | 预装检查不通过 | **停止，提交范围/依赖裁决**；禁止安装 |
| mem0 检索波动 > 0.1 | 判据失效 | 触发停止条件 1，如实报告 |
| 非 loopback 访问被触发 | 边界破坏 | fetch 包装立即中止 + 上报（停止条件 7） |

### 13.2 停止条件（DRAFT §9 全量继承，任一满足即停止并提交 CR/返回 Founder）

1. 两个正式候选各自校准或 holdout 分离边际均 ≤ 0.1（或波动 > 0.1 判据失效），且无候选可拉开；
2. 修 E004 必然导致 E001 等正向召回明显退化；
3. 必须削弱测试/改判定规则/固定字面量硬编码才能变绿；
4. 需要超出批准范围的改动（含必须外发才能解决）；
5. 无法建立与校准数据独立的冻结 holdout 证据；
6. 本地组件未预装或需运行时下载/安装；
7. 发现用户数据外发路径或非本机网络访问；
8. 限时到期（5 工作日 / 3 轮）未收敛；
9. 两个正式候选都失败（单候选失败只记录，不停止）。

### 13.3 Change Request 条件

新增第三候选、修改允许/禁止范围、触碰产品代码/正式 8 Case/评测规则/治理文件、任何安装/下载、任何外发 → 立即停止并提交 CR，由 Founder 裁决。

---

## 14. 提交边界与证据落盘

- 唯一分支：`feature/task-006-local-gate-spike`；不合并、不部署、不 force push；
- 提交策略：每阶段（S0/S1/S3/S6/S7/S10）一个证据 commit，commit message 标注阶段与冻结事实（时间戳/哈希）；
- **不创建 PR**：Review 2 由 Founder 在本窗口审查；Review 3（代码与行为 Review）与合并裁决按交接包 §17 由独立 Reviewer 与 Founder 执行；
- 分支 diff 相对 origin/main 必须仅含 `project-context/tasks/TASK-006/` 文档与 `spike/` 文件（验收 9）；
- 全部证据（脚本 + 原始数据 + 报告 + 冻结记录 + 审计）随分支入库，可复现。

---

## 15. 明确未处理的后续事项

1. Spike 通过 ≠ TASK-006 完成；产品实现须另经新 Change Request + 实施计划 + Founder 批准（含准确率、严格墙钟延迟、资源、回滚、快照来源与盲测口径）；
2. 候选机制若可行，其产品化接线（是否/如何进入召回链路、回退策略、快照字段）不在本 Spike 范围；
3. TASK-007 / TASK-005B / 20 Case / TASK-004 重启等均不在本 Spike 范围，主线顺序不变。

---

## 16. 附录：预装检查命令清单（批准后执行）

```bash
# P1 mem0-server 运行中 + loopback 可达
docker ps --format '{{.Names}} {{.Status}}' | grep v2-mem0-server
curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8900/openapi.json

# P2 mem0 版本
docker exec v2-mem0-server python -c "import mem0;print(getattr(mem0,'__version__','n/a'))"

# P3 PostgreSQL + 评测表（只读）
docker exec v2-postgres pg_isready -U postgres -d ai_companion
docker exec v2-postgres psql -U postgres -d ai_companion -tAc 'select count(*) from eval_cases'

# P4 Node/npm + pg 依赖（不安装）
node --version && npm --version
cd v2/app && node -e "const {Client}=require('pg');console.log('pg ok')"

# P5 fastembed 模型缓存（只读，禁止实例化触发下载）
docker exec v2-mem0-server sh -c 'ls ~/.cache/fastembed/BAAI/bge-small-zh-v1.5/ 2>/dev/null || find / -maxdepth 6 -type d -name "bge-small-zh-v1.5" 2>/dev/null'

# P6 网络边界环境审计
env | grep -iE '^(http|https|all|no)_proxy' || echo 'no proxy vars'
```

> 执行人：Builder（批准后）；全部输出记录到 `spike/preflight-check.md`；任何一项缺失 → 停止并按 §13.2 停止条件 6 提交裁决。
