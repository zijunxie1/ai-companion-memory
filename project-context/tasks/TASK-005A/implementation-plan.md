# TASK-005A｜Config Snapshot Completeness — 实施计划（已批准版，v1.1）

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
  - project-context/tasks/TASK-005A/draft.md（v2.1）
  - project-context/tasks/TASK-003/draft-phase2-bplus.md
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
task_id: TASK-005A
status: APPROVED（Founder 2026-08-11 批准 v2.1；本计划已于 2026-08-11 经 Review 2 批准，按此实现并完成）
execution_mode: persistent_session（HANDOFF REQUIRED，Founder 已确认执行模式）
assigned_role: Builder
branch: feature/task-005a-config-snapshot（自 origin/main @ c242338 创建）
plan_version: v1.1（2026-08-11 修订；v1.0 同日首版，Founder 打回后修订）
```

> 本计划严格限定在 draft v2.1 已批准边界内：只完善快照证据能力，**不改阈值数值、不改 top_k、不改写入模式、不改判定逻辑、不改 Gate、不改 schema、不改产品行为**。

## 修订记录（v1.0 → v1.1，诚实过程记录）

Founder 独立检查打回后修订，修订内容如下：

1. **临时探查脚本**：本窗口在 v1.0 探查阶段创建了 2 个未跟踪脚本 `eval/spikes/t005a_hash_probe.py`、`eval/spikes/t005a_hash_probe2.py`（仅用于哈希验证，未修改任何产品代码）；已于 2026-08-11 按 Founder 指示删除，删除后 `eval/spikes/` 无残留。
2. **Judge Prompt 哈希首次探查错误**：v1.0 中 `JUDGE_SYSTEM_PROMPT` 的正则提取锚定了行尾 `\n`，在 CRLF 行尾下错位（反引号后为 `\r\n` 而非 `\n`），非贪婪匹配越过常量末尾，错误捕获 6625 字符，得出错误哈希 `c06d0a410632eabb`；该结论作废。
3. **修正后事实（已复核）**：精确提取（非贪婪至首个未转义反引号，不锚定行尾）→ 内容长度 **1734**，sha256 前 16 位 = **`6bff2fcfcde01605`**，与 DRAFT v2.1 §2.1 原核验值**一致**。
4. **修正后实施方案**：从 `eval-llm-judge.ts` 导出 `JUDGE_SYSTEM_PROMPT`，快照直接执行 `hashContent(JUDGE_SYSTEM_PROMPT)`；**不解析 TypeScript 源文件**；**不硬编码哈希值**。
5. **embed_model 保守方案（Founder 指示定稿）**：本任务**不新增** `MEM0_EMBED_MODEL` env；无共享版本化配置或运行接口时 `embed_model = unavailable + reason`；不硬编码模型名；不把仓库注释表述为运行时观测（详见 §1.4）。
6. **extract_prompt_hash 边界强化**：来源为 repository source（同一 git 仓库源码），不是运行容器 observed；`source_type = derived`；文件缺失或解析失败 → `unavailable + reason`，**不得使 Run 失败**；集成测试验证当前启动方式下路径可用（详见 §1.2）。
7. **required_reading 补齐**：新增 CHIEF-BOOTSTRAP.md / product.md / handoff-and-task-state-machine.md / agent-response-protocol.md / role-wakeup-and-handoff.md（与 draft v2.1 的 required_reading 对齐）。

> 更正 v1.0 回复表述：v1.0 曾声称"全程只读/未写一行代码"，不准确——探查期间创建过 2 个临时脚本（已删除）；准确表述为"未修改任何产品代码、未改任何评测行为"。

---

## 1. 当前事实与待验证假设

### 1.1 已核验代码事实（origin/main @ c242338，git show 逐行核对）

| 事实 | 证据 | 影响 |
|---|---|---|
| `captureConfigSnapshot()` 已实现，Run 创建时捕获并 JSONB 绑定 `eval_runs.config_snapshot` | `v2/app/src/lib/eval-config.ts:32-78`；`v2/app/src/app/api/eval/runs/route.ts:38-42` | 骨架存在，需结构化扩展 |
| `extract_prompt_hash` 错误读取 `EXTRACT_PROMPT_VERSION`（版本号冒充哈希，BLOCKER） | `eval-config.ts:63`；`.env.example` 无该变量 → 实际恒为 `unavailable` | 需改为真实内容哈希 |
| `persona_prompt_hash` 实为用户 Persona JSON 内容哈希 | `eval-config.ts:36-48`（`hashContent(JSON.stringify(persona))`） | 字段名误导，需重命名为 `persona_data_hash` + 旧键兼容 |
| `judge_rubric_version` 硬编码 `"v1.0"`，与常量脱节 | `eval-config.ts:65` vs `eval-llm-judge.ts:12`（`JUDGE_RUBRIC_VERSION = "v1.0"`，已 export） | 改为从常量导入 |
| 召回阈值/条数/写入模式为 `/api/chat` 字面量 | `v2/app/src/app/api/chat/route.ts:55`（`MIN_SCORE = 0.35`）、`:56`（`mem0.search(user_id, message, 5)`）、`:122`（`void (async () => ...)` 异步写入） | 提取为共享常量，值不变 |
| `user_isolation` 在 Run 创建**后**由 eval-runner 追加，且 catch 静默忽略 | `v2/app/src/lib/eval-runner.ts:416-424` | 破坏"快照不可变"，需移入创建时一次性写入 |
| `JUDGE_SYSTEM_PROMPT` 为代码常量，运行时原样作为 system message 发送 | `eval-llm-judge.ts:15`、`:269` | judge_prompt_hash 可从代码常量直接计算 |
| `JUDGE_MODEL` 默认值在 env.ts 代码中 | `v2/app/src/lib/env.ts:27`（`process.env.JUDGE_MODEL \|\| "deepseek-v4-flash"`）、`eval-llm-judge.ts:267` | judge_model = code（默认）/ declared（env 覆盖） |
| `policy_version` 列实际写入 `config.judge_rubric_version`（当前同为 "v1.0"） | `v2/app/src/lib/eval-db.ts:109-115`（createEvalRun） | 独立列保持，meta 登记来源，不改写逻辑 |
| UI Config 区 `Object.entries` 平铺键值，无来源/状态展示 | `v2/app/src/app/eval/page.tsx:430-437` | 改为 4 列展示 |
| 现有测试仅 `eval-program-rules.test.ts` | origin/main 树 | 新增快照/哈希/兼容测试 |
| 部署布局：Next.js 在宿主 `npm run dev`（cwd=v2/app），mem0-server 独立容器，二者同仓库检出 | `v2/docker-compose.yml:45-74`（mem0-server build context ./mem0-server）、`v2/start.sh:29-30` | 快照代码可经 `process.cwd()` 相对路径读到 mem0-server 源码 |

### 1.2 extract_prompt_hash 真实来源探查结论（本计划核心）

**探查过程**：`git grep EXTRACT_PROMPT` 定位到唯一真实来源为 `v2/mem0-server/main.py:107-117` 的 `MEMORY_EXTRACT_PROMPT` 常量（Python 隐式字符串拼接），mem0-server 经 `prompt=MEMORY_EXTRACT_PROMPT` 传入 mem0.add（main.py:127）。

**哈希实证**（对 origin/main 源码按 Python 求值规则计算，脚本已随探查清理）：

```text
按 Python 求值规则（隐式拼接 + \n 转义为真实换行）计算 MEMORY_EXTRACT_PROMPT：
  sha256 前 16 位 = 875129e48a7b1ae3   ← 与 draft v2.1 §2.1 外部核验值完全一致 ✅
  Prompt 长度 = 240 字符
```

**结论与边界**：
1. **版本化共享源存在且可复现**：Prompt 原文在**同一 git 仓库**内（`v2/mem0-server/main.py`），draft 外部核验值即由此源计算，可复现 → `extract_prompt_hash` 可达到 `derived`（从真实 Prompt 内容计算），满足 draft §4.3 的第一分支。
2. **来源语义（严格限定）**：该哈希证明的是 **repository source（仓库版本化源码）中的 Prompt 内容**，**不是运行容器实际执行的 Prompt**（无只读配置接口）→ **不得标 observed**；`source_type = derived`，`source_ref = v2/mem0-server/main.py:107-117`；若部署容器与仓库不同步，实际执行可能不同——此边界在快照 reason 与契约中明示。
3. **采集机制（不硬编码、不使 Run 失败）**：`captureConfigSnapshot()` 在 Run 创建时读取 `../mem0-server/main.py`（相对 `process.cwd()` = v2/app），解析 `MEMORY_EXTRACT_PROMPT = ( ... )` 块（双引号字面量拼接 + 仅处理 `\n`/`\"`/`\\` 转义），拼出 Prompt 原文后 `hashContent()`。**该字段独立 try/catch**：读文件或解析失败 → 仅该字段 `unavailable + reason`，**Run 正常创建与执行，不得使 Run 失败**；不崩溃、不硬编码。
4. **集成测试要求**：验证当前启动方式（`npm run dev`，cwd=v2/app）下 `../mem0-server/main.py` 路径可读；若路径不可读，断言快照该字段为 `unavailable + reason` 且 Run 仍正常完成（两种结果都明确断言）。
5. **禁止项**：不得把 `875129e48a7b1ae3` 硬编码进快照代码；不得继续用 `EXTRACT_PROMPT_VERSION` 冒充 hash；不得为哈希新增 env（那会把 derived 降级为 declared 且违反"从来源计算"要求）。

### 1.3 judge_prompt_hash 探查结论（v1.1 修正版）

- **来源**：`JUDGE_SYSTEM_PROMPT` 代码常量（eval-llm-judge.ts:15，git 版本化），运行时原样作为 system message 发送（:269）。
- **复核实证（v1.1）**：精确提取（非贪婪匹配至首个未转义反引号，不锚定行尾）→ 内容长度 **1734**，sha256 前 16 位 = **`6bff2fcfcde01605`**，与 DRAFT v2.1 §2.1 原核验值**一致** ✅。
- **首次探查错误记录（诚实披露）**：v1.0 曾用正则 `JUDGE_SYSTEM_PROMPT = `(.*?)`\n`（锚定行尾 `\n`），在 CRLF 行尾下错位（反引号后为 `\r\n` 而非 `\n`），非贪婪匹配越过常量末尾，错误捕获 6625 字符，得出错误哈希 `c06d0a410632eabb`。该结论已作废，**本计划不再引用**。
- **实施方案**：从 `eval-llm-judge.ts` **导出** `JUDGE_SYSTEM_PROMPT`，快照直接执行 `hashContent(JUDGE_SYSTEM_PROMPT)`；**不解析 TypeScript 源文件**；**不硬编码哈希值**。
- **测试**：断言 `hashContent(JUDGE_SYSTEM_PROMPT) == 6bff2fcfcde01605`（固定护栏，Prompt 变更时必须同步更新）。

### 1.4 embed_model 探查结论（v1.1 保守方案，Founder 指示定稿）

- **事实**：embedding 模型 `BAAI/bge-small-zh-v1.5` 硬编码于 `v2/mem0-server/main.py:44`（fastembed，无 env 覆盖，docker-compose.yml:57-58 注释明确"不走环境变量"）；应用侧无只读配置接口；`.env.example` 无对应变量；当前不存在程序可读的部署声明。
- **决策（Founder 2026-08-11 指示）**：
  - 本任务**不新增** `MEM0_EMBED_MODEL`（或任何同类仅供快照读取的 env）；
  - 无共享版本化配置来源、无只读运行接口时，`embed_model = unavailable + reason`；
  - **不硬编码模型名**（`BAAI/bge-small-zh-v1.5` 不得进入快照代码）；
  - **不把仓库注释（如 docker-compose.yml:57-58 的说明）表述为运行时观测**。
- **reason 内容**：embedding 模型硬编码于 `v2/mem0-server/main.py:44`（fastembed），应用侧无只读运行接口、无共享版本化配置来源；本任务不新增仅供快照读取的 env；如未来需要登记部署事实，另行裁决。
- **后续项**：如未来出现只读配置接口或共享版本化来源，可升级为 declared/derived（不在本任务范围）。

### 1.5 待验证假设（实现期验证）

| 假设 | 验证方式 |
|---|---|
| `process.cwd()` 在 Next.js 运行/测试环境下指向 v2/app，`../mem0-server/main.py` 可稳定解析 | 单元测试 + 集成核验（真实 Run；路径不可读时断言 unavailable 且 Run 正常） |
| Python 字面量解析器与 Python 求值结果一致 | fixture 测试（解析结果 == 240 字符原文，hash == 875129e48a7b1ae3） |
| `hashContent(JUDGE_SYSTEM_PROMPT)` 计算结果稳定 | 测试断言 == 6bff2fcfcde01605 |
| 共享常量重构后 /api/chat 行为不变 | 值不变断言 + 集成核验（真实 8 Case Run 无新增错误） |
| 旧快照（无 meta、字符串值）渲染兼容 | 兼容测试（旧/新/混存） |

## 2. 目标 / 非目标

**目标**（同 draft v2.1 §1）：新 Run 从 UI/API 可追溯全部配置字段，每项带 `status`（available/unavailable/not_applicable）+ `source_type`（observed/code/declared/derived）+ `source_ref`（+ `reason`），快照在 Run 创建时一次性固化、不可变，历史 Run 保持可读。

**非目标**（红线，同 draft §3）：
- ❌ 不改阈值数值（0.35）、top_k（5）、写入模式（async）、判定逻辑、Gate、程序规则、schema（无迁移）、产品行为；
- ❌ 不创建影子配置（`EVAL_RECALL_*`/`EVAL_WRITE_MODE`/`MEM0_EMBED_MODEL` 类仅供快照读取的假 env）；
- ❌ 不把 declared/derived 表述为 observed；不隐藏失败、不用 Mock 替代真实采集；
- ❌ 不裸硬编码任何哈希值、模型名、Prompt 内容；
- ❌ 不解析 TypeScript 源文件计算哈希（哈希一律从导出常量/真实数据计算）；
- ❌ 不依赖 Dify 内部数据库采集；不启动 TASK-006；TASK-004 保持 PAUSED；
- ❌ 不做持久化任务队列 / 指标自由配置。

## 3. 依赖与前置条件

| 依赖 | 状态 |
|---|---|
| origin/main @ `c242338`（含 TASK-003 阶段2 eval 代码 + GOV-001 治理文件） | ✅ 已核对 |
| 实现分支 `feature/task-005a-config-snapshot` 从 c242338 创建（新 worktree，避免污染现工作区） | **Founder 批准本计划后**才创建 |
| 3 个治理文件（current-state.md / decision-register.md / TASK-005A/）本地权威版在 gov-001c worktree | ✅ 已核对（均为本地未入库状态，随 PR 提交） |
| 无新 npm 依赖（crypto/fs 为 Node 内置） | ✅ 不引入未批准依赖 |
| 无数据库迁移（config_snapshot 为 JSONB 自由结构） | ✅ 不改 schema |

**前置确认项**：无（v1.0 的 DEV-1/DEV-2 已由 Founder 定稿/复核一致，见 §14 偏差汇总；剩余为流程门：Founder 批准本计划）。

## 4. 拟修改文件和原因

| 文件 | 动作 | 原因 |
|---|---|---|
| `v2/app/src/lib/eval-types.ts` | 修改 | 扩展 `EvalConfig`（新字段 + `user_isolation`）+ 新增 `SnapshotFieldMeta`/`SnapshotMeta`/`SourceType`/`StatusType` 类型 |
| `v2/app/src/lib/memory-config.ts` | **新建** | 共享只读配置：`RECALL_THRESHOLD = 0.35`、`RECALL_TOP_K = 5`、`WRITE_MODE = "async"`；chat/route.ts 与快照共用（消除重复字面量，值不变） |
| `v2/app/src/app/api/chat/route.ts` | 修改 | `:55/:56/:122` 字面量改为从 `memory-config.ts` 引用（**值不变，仅常量来源重构**） |
| `v2/app/src/lib/eval-llm-judge.ts` | 修改（小） | `JUDGE_RUBRIC_VERSION` 已 export ✅；补充 `export const JUDGE_SYSTEM_PROMPT`（供快照直接计算 judge_prompt_hash，**不解析源文件**） |
| `v2/app/src/lib/eval-config.ts` | 修改（核心） | 结构化采集：每字段 {value, status, source_type, source_ref, reason}；顶层值保持字符串/数值兼容；`_snapshot_meta` 块；extract prompt 文件解析（§1.2，独立 try/catch 不使 Run 失败）；`hashContent(JUDGE_SYSTEM_PROMPT)`；user_isolation 写入；judge_rubric_version 从常量导入 |
| `v2/app/src/lib/eval-db.ts` | 修改 | `createEvalRun` 接受完整快照（含 user_isolation），一次性 JSONB 写入（:107-118）；policy/case_set 独立字符串列保持 |
| `v2/app/src/lib/eval-runner.ts` | 修改 | **删除** :416-424 创建后追加 `user_isolation` 与静默 catch（不可变契约修正，不动判定） |
| `v2/app/src/app/eval/page.tsx` | 修改 | Config 区改 4 列（配置项/值/来源/状态或说明）；`_snapshot_meta` 渲染；旧快照（无 meta）按"未知来源"兼容展示 |
| `v2/.env.example` | 修改 | 仅声明 `CHAT_MODEL`/`CHATFLOW_VERSION`（**optional / declared**，模板不填值）；**不新增 MEM0_EMBED_MODEL**（v1.1 定稿） |
| `v2/app/src/lib/eval-config.test.ts` | **新建** | 哈希解析/来源分类/不可变断言测试 |
| `v2/app/src/lib/eval-snapshot-compat.test.ts` | **新建** | 快照格式兼容测试（旧/新/混存/缺失/未知 schema_version） |
| `eval/eval-contracts.md` | 修改 | 快照结构契约更新：schema_version 2、`_snapshot_meta`、字段清单、来源分类标准（正式契约同 PR） |
| `project-context/tasks/TASK-005A/` | 新增 | 本实施计划 + 后续实现报告（draft.md 一并随 PR 入库） |
| `project-context/current-state.md`、`decision-register.md` | 修改 | 状态随任务 PR 同步（不单独开状态 PR） |

**边界（禁止）**：不改 `eval-program-rules.ts` 判定；不改 `eval_cases`/`eval_runs` schema；不改 mem0-server；不改 Dify 配置；不新增真实 `.env` 值到仓库；不提交密钥。

## 5. 数据流、状态流和错误路径

### 5.1 数据流（Run 创建）

```text
POST /api/eval/runs
  → captureConfigSnapshot(caseSetVersion)
      ├─ 读共享常量（memory-config.ts）：recall_threshold / recall_top_k / write_mode
      ├─ 读代码常量：judge_rubric_version（eval-llm-judge.ts）、judge_model 默认（env.ts）
      ├─ 计算哈希：persona_data_hash（users 表 JSON，已有逻辑）；
      │            extract_prompt_hash（读 ../mem0-server/main.py 解析，独立 try/catch）；
      │            judge_prompt_hash（hashContent(JUDGE_SYSTEM_PROMPT)，导出常量直接引用）
      ├─ 读 env（declared）：extract_model（MEM0_LLM_MODEL）、chat_model（CHAT_MODEL）、chatflow_version（CHATFLOW_VERSION）
      ├─ 常量/不可用（code / unavailable+reason）：embed_model（无来源，unavailable+reason）、
      │    case_set_version、user_isolation="per_case"、snapshot_schema_version=2
      └─ 组装：顶层原始值 + _snapshot_meta（schema_version 2 + fields 全量来源登记）
  → createEvalRun(快照)   # 一次性 JSONB 写入 config_snapshot + policy/case_set 独立列
  → executeEvalRun(runId)  # 后台执行（已删除 user_isolation 追加）
```

### 5.2 状态流

- 字段状态：`available`（值可得）/ `unavailable`（采集失败，必须带 reason + 最后核验位置）/ `not_applicable`（本字段对当前 Run 不适用，必须带 reason）。`unavailable`/`not_applicable` 时**省略 source_type**（红线：不可用是状态，不是证据来源）。
- source_type 枚举：`observed`（真实调用响应/运行证据——本任务**无任何字段标 observed**，诚实边界）/ `code`（共用代码配置）/ `declared`（env/部署声明）/ `derived`（由真实数据或代码内容计算的哈希）。

### 5.3 错误路径

| 场景 | 行为 |
|---|---|
| `mem0-server/main.py` 读取失败 / 解析失败 / 出现未知转义 | **仅** `extract_prompt_hash` = unavailable + reason；**Run 正常创建与执行，不使 Run 失败** |
| `getUserPersona` 异常 | `persona_data_hash` = unavailable + reason（现有逻辑保持） |
| 快照组装后 DB 写入失败 | Run 创建失败，API 返回 500（**不再静默忽略**；eval-runner 的静默 catch 已删除） |
| 旧快照无 `_snapshot_meta` | UI 按"未知来源"兼容渲染，不报错 |
| `_snapshot_meta.schema_version` 未知 | UI 标记"未知快照版本"，兼容渲染，不崩溃 |

## 6. 契约、Schema、权限和兼容性影响

- **Schema**：无迁移。`config_snapshot` JSONB 自由结构可容纳 `_snapshot_meta`；`policy_version`/`case_set_version` 独立字符串列保持。
- **契约**：`eval/eval-contracts.md` 增加 §快照结构（schema_version 2 + `_snapshot_meta` + 字段清单 + 来源分类标准）；与 draft v2.1 §4.2/§4.3 对齐。
- **权限**：无新接口、无新表、无权限变化。快照仍仅评测后台只读展示。
- **兼容性**：
  - 旧 Run 快照（纯字符串/数值、无 meta）→ 按旧键渲染 + "未知来源"；`persona_prompt_hash` 旧键兼容读取（新快照写 `persona_data_hash`，UI 两者都认）；
  - `extract_prompt_hash` 字段名**保留**（仅纠正采集方式）；不再读取 `EXTRACT_PROMPT_VERSION`（该变量实际不存在于 .env.example，当前值恒为 unavailable，行为只变好不变坏）；
  - 新字段（judge_model/judge_prompt_hash/user_isolation/snapshot_schema_version）对旧 UI 无破坏（Object.entries 平铺逻辑改为 4 列后仍能渲染任意快照对象）。

## 7. 分步骤实现顺序

1. **类型层**：eval-types.ts 扩展（SnapshotMeta/SourceType/StatusType + EvalConfig 新字段）；
2. **共享常量**：新建 memory-config.ts；chat/route.ts 引用（值不变）；立即跑产品路径测试确认无行为漂移；
3. **常量导出**：eval-llm-judge.ts export `JUDGE_SYSTEM_PROMPT`；
4. **采集层**：eval-config.ts 重构（结构化 + meta + extract prompt 解析（独立 try/catch）+ judge hash（导出常量直接计算）+ user_isolation）；
5. **持久化**：eval-db.ts createEvalRun 完整快照；
6. **不可变修正**：eval-runner.ts 删除 user_isolation 追加块（:416-424）；
7. **UI**：page.tsx 4 列渲染 + 旧键/旧格式兼容；
8. **模板声明**：.env.example 增加 CHAT_MODEL / CHATFLOW_VERSION（**不含 MEM0_EMBED_MODEL**）；
9. **测试 + 契约**：新增两个测试文件；更新 eval-contracts.md；
10. **质量门 + 集成核验**：lint → tsc --noEmit → test → build；跑真实 8 Case Run 核验快照完整性与无新增错误；更新 3 个治理文件；提交 PR。

## 8. 测试矩阵

| # | 测试 | 断言 |
|---|---|---|
| T1 | extract prompt 解析器 | 解析结果 == Python 求值原文（fixture：240 字符）；`hashContent` == `875129e48a7b1ae3`（回归护栏，改 Prompt 必改此值） |
| T2 | judge prompt 哈希 | `hashContent(JUDGE_SYSTEM_PROMPT)` == `6bff2fcfcde01605`（固定护栏，改 Prompt 必改此值） |
| T3 | 版本一致性 | `JUDGE_RUBRIC_VERSION`（代码常量）== eval-policy-v1.md 头部版本声明；不一致即失败（draft §4.7） |
| T4 | 旧格式快照可读 | 纯字符串/数值快照渲染不崩溃，来源显示"未知" |
| T5 | 新 meta 格式可读 | schema_version 2 + fields 全量来源登记 |
| T6 | 新旧混存可读 | 部分字段有 meta、部分无 |
| T7 | 缺失字段 / null / 未知附加字段 | 不崩溃，未知附加字段展示 |
| T8 | `user_isolation` 存在性 | 新快照含 `user_isolation: "per_case"` |
| T9 | 未知 schema_version | 不崩溃，标记"未知快照版本" |
| T10 | policy/case_set 独立列 | 仍按字符串写 `policy_version`/`case_set_version` 列（createEvalRun 行为断言） |
| T11 | 不可变断言 | 快照初始化后不被静默修改（eval-runner 中不再出现 `config_snapshot \|\|` 追加） |
| T12 | 来源分类正确性 | 无字段被标 observed；unavailable 必带 reason；derived 仅限哈希字段；embed_model = unavailable + reason |
| T13 | extract prompt 路径可用性（集成） | 当前启动方式（npm run dev，cwd=v2/app）下 `../mem0-server/main.py` 可读 → 快照为 derived 值；**若不可读 → 该字段 unavailable + reason 且 Run 正常完成**（两分支都断言） |
| T14 | 集成核验 | 真实 8 Case Run 完成、无新增执行错误、快照与来源证据完整（非 Mock） |
| T15 | lint / tsc --noEmit / test / build | 全绿 |

## 9. Browser / 运行验收步骤

1. `bash start.sh` 启动（mem0 + postgres + qdrant + Next.js）；
2. 打开 `http://localhost:3000/eval`，触发新 Run（真实 8 Case）；
3. Run 完成后展开"Config 快照（本次 Run 绑定，不可变）"：
   - 全部字段可见，**4 列**（配置项/值/来源/状态或说明）；
   - `extract_prompt_hash` 值 = `875129e48a7b1ae3`，来源 = derived，说明含 source_ref（mem0-server/main.py:107-117）与"仓库源码来源、非容器观测"边界披露；
   - `judge_prompt_hash` 值 = `6bff2fcfcde01605`，来源 = derived，source_ref = eval-llm-judge.ts:15；
   - `recall_threshold` = 0.35 / `recall_top_k` = 5 / `write_mode` = async，来源 = code；
   - `judge_rubric_version` / `case_set_version` / `policy_version` 在 meta 中有来源登记；
   - `user_isolation` = per_case，随快照一次性写入；
   - `embed_model` = unavailable + reason（v1.1 定稿；不新增 env、不硬编码模型名）；
   - chat_model / chatflow_version 未配置时显示 unavailable + reason（若本机 .env 未登记）；
4. 打开历史旧 Run 详情：不报错，来源列显示"未知来源"；
5. `/api/eval/runs` API 返回的 `config_snapshot` 含 `_snapshot_meta` 块；
6. 确认 /api/chat 行为与数值无变化（diff 审查 + Run 结果与基线无系统性偏差）。

## 10. 回滚与恢复方案

- 无数据库迁移 → 回滚 = revert 合并 commit 即可，历史 Run 数据不受影响（config_snapshot 旧结构仍在）；
- 共享常量重构若发现行为漂移：先 revert chat/route.ts 改动，单独评估；
- 集成核验发现异常 → 停在当前 commit，提交实现报告说明，不强行合并；
- 分支与 PR 全程独立，不触碰 main/master；不 force push。

## 11. 风险、停止条件和 Change Request 条件

| 风险 | 等级 | 缓解 |
|---|---|---|
| extract prompt 文件解析脆弱（Python 字面量格式变化） | 中 | 解析器只认稳定格式；失败即 unavailable（**不使 Run 失败**）；fixture 测试锁格式 |
| 路径耦合（`../mem0-server/main.py` 部署布局变化） | 中 | 开发布局固定（start.sh）；文件缺失即 unavailable + reason（Run 正常）；集成测试断言两分支；契约记录边界 |
| chat/route.ts 常量重构引入行为漂移 | 中 | 值不变断言 + 集成核验（8 Case Run 行为一致） |
| user_isolation 初始化改动影响 Run 隔离 | 中 | 集成核验 + 现有互斥/隔离机制不变 |
| 字段重命名破坏旧 Run 渲染 | 中 | 旧键兼容读取 + 混存测试 |
| declared/derived 值被误标 observed | 低 | 本任务无任何字段标 observed；source_ref 显式标注；代码审查 |
| UI 展示过度设计 | 低 | 固定 4 列，无新增交互 |

**停止条件**：实现中发现必须修改 schema、判定逻辑、阈值数值或产品行为才能达成目标 → 立即停止并提交 Change Request。
**CR 条件**：新增超出草案范围的 env/表/接口/依赖；与 Founder 已定稿决策不一致时先停再报。

## 12. 预计形成的 commits / PR 边界

- **分支**：`feature/task-005a-config-snapshot`（自 origin/main @ c242338，新 worktree `E:/task-005a-worktree`；**Founder 批准后创建**）；
- **commits（按逻辑分块）**：
  1. `types: 快照 meta/来源类型扩展（eval-types.ts）`
  2. `refactor: 召回常量提取为共享配置（memory-config.ts + chat/route.ts，值不变）`
  3. `feat: 快照结构化采集 + 真实内容哈希（eval-config.ts + eval-llm-judge.ts 导出）`
  4. `fix: user_isolation 随创建一次性写入，删除静默追加（eval-db.ts + eval-runner.ts）`
  5. `feat: Config 区 4 列 UI + 旧键兼容（eval/page.tsx）`
  6. `docs: .env.example optional/declared 声明（CHAT_MODEL / CHATFLOW_VERSION）`
  7. `test: 快照/哈希/兼容/版本一致性测试 + eval-contracts.md 契约更新`
  8. `docs: 治理文件同步（current-state.md / decision-register.md / TASK-005A 任务文件）`
- **PR**：单一 PR（代码 + 测试 + 契约 + 治理文件同 PR，红线 #6）；PR 描述含探查证据、集成核验结果、偏差说明；不提交密钥/真实 .env；合并由 Founder 执行（Rebase）。

## 13. 明确未处理的后续事项

1. **embed_model 部署登记**：本任务不新增 env、固定 `unavailable + reason`；如未来出现只读配置接口或共享版本化来源，可另行裁决升级（不在本任务范围）；
2. **程序规则版本 / 构建版本字段**：draft 标"必要时记录"，本计划不实现（范围纪律），列为后续事项；
3. **`eval/llm-judge.md` 未入库**（独立发现：磁盘存在但不在 origin/main 树）——不属本任务范围，记录备查；
4. **TASK-006（E004 Gate）不启动**；TASK-004 保持 PAUSED；
5. **`extract_prompt_version` 可选字段暂不增加**（无版本治理，draft 允许"暂不增加"），契约中说明；已删除 `EXTRACT_PROMPT_VERSION` 误用。

## 14. 偏差汇总（v1.1 更新）

| # | 偏差 | 草案原文 | 本计划（v1.1） | 状态 |
|---|---|---|---|---|
| DEV-1 | embed_model 采集机制 | "从部署声明采集（BAAI/bge-small-zh-v1.5）" | **保守方案（Founder 指示定稿）**：不新增 env；无共享版本化来源/只读接口 → `unavailable + reason`；不硬编码模型名；不把仓库注释当观测 | ✅ 已定稿，无待决 |
| DEV-2 | judge_prompt_hash 外部值 | "sha256 前 16 位 6bff2fcfcde01605" | **已复核一致**：精确提取 JUDGE_SYSTEM_PROMPT（1734 字符）→ 6bff2fcfcde01605；v1.0 的错误哈希 c06d0a410632eabb 作废；方案 = 导出常量直接计算，不解析源文件，不硬编码 | ✅ 已复核，无待决 |
| DEV-3 | extract_prompt_hash 机制 | "derived（仅当从真实 Prompt 内容计算）…若无法从版本化共享源获得原文则 unavailable" | **已实证可从仓库版本化源（mem0-server/main.py）运行时计算**，达 derived；来源严格限定为 repository source（非容器 observed）；失败 → unavailable + reason 且不使 Run 失败 | 知悉（实现按此） |
| DEV-4 | `extract_prompt_version` 字段 | "无版本治理时可暂不增加" | 不增加，删除 EXTRACT_PROMPT_VERSION 误用 | 知悉 |

> 本计划未修改 draft v2.1 的目标、验收标准、边界与红线；v1.0 → v1.1 修订均为纠正错误事实与按 Founder 指示定稿，不改变任务范围。
