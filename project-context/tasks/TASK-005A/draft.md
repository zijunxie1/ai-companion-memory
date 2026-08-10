# TASK-005A｜Config Snapshot Completeness（修订版 v2.1）

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
  - project-context/tasks/TASK-003/draft-phase2-bplus.md
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
```

> 文档类型：任务 DRAFT（**APPROVED → IMPLEMENTED**——Founder 2026-08-11 批准 v2.1 与字段方案；执行模式已确认 HANDOFF REQUIRED；实现完成，等待 Review 3）
> 起草日期：2026-08-11（v2.1 修订同日；同日获 Founder 批准）
> 起草人：successor-chief-2026-08-10-01
> 状态：**IMPLEMENTED**（执行模式已确认 HANDOFF REQUIRED；实施计划 v1.1 已批准；实现完成于 feature/task-005a-config-snapshot，2026-08-11；等待独立 Reviewer Review 3）
> 依据：project-mainline-roadmap.md Phase 1 + 独立 Reviewer 结论（方向通过，v2.1 文字修订）+ Founder 批准
> 状态约束：TASK-004 保持 PAUSED；主线顺序 GOV-001 → 005A → 006 → 007 → 005B 不变

---

## 1. 任务目标

让每次评测 Run 都能回答"这次结果为什么是这样"：**从 UI / API 可完整追溯本次 Run 的模型、Prompt、阈值、策略与 Case 集配置，且每个值都有准确的状态（available / unavailable / not_applicable）与来源类型（observed / code / declared / derived）**。

本任务**只完善快照的证据能力，不改变任何评测行为**：不改阈值数值（0.35）、不改 top_k（5）、不改写入模式（async）、不改判定逻辑、不改 Gate、不改 schema、不改产品行为。

## 2. 现状（代码 + 运行事实，已交叉核验）

### 2.1 已存在的事实

- `captureConfigSnapshot()`（eval-config.ts）已实现，Run 创建时捕获并 JSONB 绑定到 `eval_runs.config_snapshot`（eval-db.ts:109）；`policy_version` / `case_set_version` 以独立字符串列写入（eval-db.ts:109-117）✅
- 诚实原则已内建：采集不到显式标 `unavailable`，无硬编码伪装 ✅
- `EvalConfig` 现有 **11 个正式字段**（eval-types.ts:6-18）：`chat_model`、`extract_model`、`embed_model`、`persona_prompt_hash`、`extract_prompt_hash`、`judge_rubric_version`、`recall_threshold`、`recall_top_k`、`write_mode`、`chatflow_version`、`case_set_version`
- 产品侧代码事实（chat/route.ts）：召回阈值 `MIN_SCORE = 0.35`（:55）、召回条数 `mem0.search(user_id, message, 5)`（:57）、写入模式 async（:122 `void (async () => ...)`）
- `JUDGE_RUBRIC_VERSION = "v1.0"` 常量已存在（eval-llm-judge.ts:12）；Judge 模型走 `env.JUDGE_MODEL`
- 外部运行事实（Founder/Reviewer 实测，2026-08-11；**以下仅为历史核验记录，不是快照字段来源**）：Dify 已发布工作流 3 个 LLM 节点均为 `deepseek-v4-flash`；Dify 工作流版本 `2026-07-26 01:02:55.290923`；mem0 实际抽取模型 `deepseek-v4-flash`；embedding `BAAI/bge-small-zh-v1.5`（该模型名仅为历史核验记录，**不得进入快照代码**；快照 embed_model 按最终定稿为 unavailable + reason）；Judge 模型 `deepseek-v4-flash`；Extract Prompt 内容 sha256 前 16 位 `875129e48a7b1ae3`；Judge Prompt 内容 sha256 前 16 位 `6bff2fcfcde01605`

### 2.2 现状缺口（本任务要解决）

| # | 缺口 | 现状证据 | 影响 |
|---|---|---|---|
| G1 | 快照"不可变"契约与实际不符 | `user_isolation` 在 Run 创建**后**由 eval-runner.ts:420 追加（`config_snapshot ||` 合并），且 catch 静默忽略失败 | "结果可解释"的前提（快照可信）被破坏；关键字段写失败无感知 |
| G2 | 字段名与语义不符 | `persona_prompt_hash` 实为用户 Persona 数据哈希（getUserPersona→hashContent）；`extract_prompt_hash` 实际读取 `EXTRACT_PROMPT_VERSION`（版本号冒充哈希） | 面试官/复盘误读快照含义 |
| G3 | 可解释值未采集 / 无来源分类 | 0.35、5、async 为代码事实却标 unavailable；无 observed/code/declared 区分 | 快照价值稀释 |
| G4 | judge_rubric_version 硬编码 | eval-config.ts:65 `"v1.0"` 与 eval-llm-judge.ts:12 常量脱节 | 版本升级后快照失真 |
| G5 | UI 平铺键值，无来源展示 | eval/page.tsx:430 `Object.entries` 平铺 | 无法区分来源/状态 |
| G6 | 结构演进无兼容测试 | 无旧/新/混存格式测试 | 演进破坏历史可读 |

## 3. 非目标（明确边界）

- ❌ **不创建"影子配置"**：不新增仅供快照读取、却不控制真实产品行为的 `EVAL_RECALL_THRESHOLD` / `EVAL_RECALL_TOP_K` / `EVAL_WRITE_MODE` env；0.35/5/async 必须来自产品与快照**共用的只读代码配置**，值不变
- ❌ 不修改任何评测阈值数值、Gate、判定逻辑、程序规则、schema（无迁移）
- ❌ 不修改产品行为（/api/chat 对外行为、mem0、Dify 配置）
- ❌ 不依赖 Dify 内部数据库结构采集值（Dify 普通应用接口不返回内部模型/工作流版本，属已知平台限制）
- ❌ 不把 declared 表述为 observed；不隐藏失败、不用 Mock 替代真实采集
- ❌ 不做持久化任务队列 / 指标自由配置（roadmap Phase 1 非目标）
- ❌ 不启动 TASK-006（E004 Gate）；TASK-004 保持 PAUSED

## 4. 推荐方案（单一方案，取代原 A/B/C）

### 4.1 来源分类标准（贯穿全快照）

每个快照字段带 `status` + 可选 `source_type`，语义分离：

| 字段 | 取值 | 含义 |
|---|---|---|
| `status` | `available` / `unavailable` / `not_applicable` | 该字段值是否可得（**不可用是一种状态，不是证据来源**） |
| `source_type` | `observed` / `code` / `declared` / `derived` | 证据来源分类（`unavailable`/`not_applicable` 时无 source_type，必须填 `reason`） |

source_type 枚举：

| source_type | 含义 | 示例 |
|---|---|---|
| `observed` | **从真实调用响应或运行证据获得** | 从真实调用响应/日志观测到的值 |
| `code` | **决定产品行为的共用代码配置** | 0.35、5、async、JUDGE_RUBRIC_VERSION 常量 |
| `declared` | 环境或部署声明 | env 声明、Dify 工作流人工登记、部署配置 |
| `derived` | 由真实数据或代码内容**计算**的哈希 | Persona 数据哈希、Prompt 内容哈希 |

> ⚠️ 语义红线：**不得把 declared 表述为 observed**。env 只能证明"程序将请求哪个模型"，不能证明外部服务实际执行了哪个模型；同理主应用读取到的 env 值不能自动证明独立容器（mem0/Dify）的实际配置，除非存在只读配置接口或共享同一版本化配置来源。

### 4.2 快照结构：顶层兼容 + `_snapshot_meta`

保持现有顶层原始值兼容（旧 Run 纯字符串/数值可读），新增元数据块：

```ts
type SnapshotFieldMeta = {
  status: "available" | "unavailable" | "not_applicable";
  source_type?: "observed" | "code" | "declared" | "derived"; // unavailable/not_applicable 时省略
  source_ref: string;   // 证据位置：文件:行、env 键、Dify 工作流、哈希来源
  reason?: string;      // unavailable / not_applicable 时必填
};

type SnapshotMeta = {
  schema_version: 2;
  fields: Record<string, SnapshotFieldMeta>;
};
```

- 快照对象 = 顶层原字段（值，保持字符串/数值）+ `_snapshot_meta: SnapshotMeta`
- **"值不进入 meta"可以，但"字段没有 meta"不可以**：`judge_rubric_version`、`case_set_version`、`policy_version` 的值仍保持顶层字符串 / 数据库独立列，**同时**必须在 `_snapshot_meta.fields` 中登记其来源说明（source_type/source_ref），与"全部字段有来源"的验收标准一致
- 渲染规则：顶层值 `String(v)` 兜底，旧快照无 meta 时按"未知来源"兼容展示，不报错

### 4.3 字段清单（v2.1 全量，不再凑"10 项"）

| 字段 | status / source_type（目标） | 变化 |
|---|---|---|
| `chat_model` | `declared`（Dify 内部，人工登记） | `.env.example` 声明 `CHAT_MODEL`（**optional / declared**，模板不填本机实际值）；未配置则 `unavailable`+reason |
| `extract_model` | `declared`（当前无运行接口证据） | 从 mem0 部署声明采集（`deepseek-v4-flash`）；**不得称 observed**，除非存在只读配置接口或共享版本化配置来源 |
| `embed_model` | **unavailable + reason（最终口径，Founder 2026-08-11 定稿）** | embedding 模型硬编码于 `v2/mem0-server/main.py:44`（fastembed，无 env 覆盖）；应用侧无只读运行接口、无共享版本化配置来源；**不新增仅供快照读取的 env**；不得在快照代码中裸硬编码模型名；不把仓库注释表述为运行时观测 |
| `persona_data_hash` | `derived` | **重命名**自 `persona_prompt_hash`（真实为用户 Persona JSON 内容哈希）；旧键兼容读 |
| `extract_prompt_hash` | `derived`（仅当从真实 Prompt 内容计算） | **保留字段名**，必须保存真实内容哈希（当前核验值 `875129e48a7b1ae3`）；**不得把当前哈希裸硬编码进快照代码**——若 Builder 无法从版本化共享源获得 Prompt 原文，标 `unavailable`+reason 并提交边界说明 |
| `extract_prompt_version` | 可选独立字段 | **可选**人工版本声明；版本号与内容哈希不得共用一个字段；无版本治理时可暂不增加 |
| `judge_model` | `code`（默认）/ `declared`（env 覆盖） | 新增：默认读代码常量（`deepseek-v4-flash`）为 `code`；若 `env.JUDGE_MODEL` 覆盖则为 `declared`；**不得称 observed**（env 只证明请求目标，不证明外部实际执行） |
| `judge_prompt_hash` | `derived` | 新增：JUDGE_SYSTEM_PROMPT 内容哈希（`6bff2fcfcde01605`），从真实代码内容计算 |
| `judge_rubric_version` | `code` | 复用 `JUDGE_RUBRIC_VERSION` 常量（eval-llm-judge.ts:12），禁止硬编码；值保持字符串/独立列，meta 登记来源 |
| `policy_version` | `code` | 独立列写库保持；与 `judge_rubric_version` 同源；meta 登记来源 |
| `recall_threshold` | `code` | **从共享代码配置读取 0.35**（chat/route.ts MIN_SCORE 提取为共享常量），不再标 unavailable |
| `recall_top_k` | `code` | **从共享代码配置读取 5**（mem0.search 参数提取为共享常量） |
| `write_mode` | `code` | **从共享代码配置读取 async**（chat/route.ts 写入路径提取为共享常量） |
| `chatflow_version` | `declared` | `.env.example` 声明 `CHATFLOW_VERSION`（**optional / declared**，模板不填实际值，登记 `2026-07-26 01:02:55.290923` 由部署方填写）；未配置则 unavailable+reason |
| `case_set_version` | `code` | 独立列写库保持（`8-case-v1`）；meta 登记来源 |
| `user_isolation` | `code` | **改为 Run 创建时一次性写入**（见 4.5） |
| `snapshot_schema_version` | `code` | 常量 2 |
| 程序规则版本 / 构建版本 | `code` | 必要时记录 eval-program-rules 版本或 commit（若实现成本低） |

> ⚠️ 字段重命名（`persona_prompt_hash`→`persona_data_hash`）必须带旧键兼容读取：旧 Run 快照仍可按旧键渲染，新快照写新键，UI 两者都认。`extract_prompt_hash` **保留原名**，仅纠正采集方式（真实内容哈希；`extract_prompt_version` 为可选独立字段，不得用版本字符串冒充 hash）。

### 4.4 共享只读配置（消除影子配置）

- 新建/扩展一个只读配置模块（如 `eval-config.ts` 内新增共享常量区，或独立 `eval-constants.ts`），集中定义：`RECALL_THRESHOLD = 0.35`、`RECALL_TOP_K = 5`、`WRITE_MODE = "async"`、`JUDGE_RUBRIC_VERSION`（从 eval-llm-judge.ts 导入）
- `chat/route.ts` 与快照采集**共用同一常量源**：改 `chat/route.ts` 从共享模块读取（值不变、行为不变，仅消除重复字面量）
- **禁止**新增 `EVAL_RECALL_*` / `EVAL_WRITE_MODE` 影子 env

### 4.5 不可变契约修正（user_isolation）

- **优先**：`user_isolation: "per_case"` 在 Run 创建时随快照**一次性写入**（`createEvalRun` 入参），删除 eval-runner.ts:420 的创建后追加与静默 catch
- 若实现上必须分阶段初始化：契约准确改为 **"初始化完成后不可变"**，并定义初始化失败行为（记录 `error` / 标记快照 incomplete，不得静默忽略）
- 该改动属于快照完整性修复，**不触碰判定逻辑**

### 4.6 UI 简化（Config 快照区）

只展示 4 列：**配置项 / 值 / 来源 / 状态或说明**。
- 来源列显示 `source_type`（**observed / code / declared / derived**；unavailable / not_applicable 只属于 status，不属 source_type）
- 状态列显示 status + reason（unavailable/not_applicable 时）
- **程序规则 / LLM Judge / 人工覆盖属于结果判定来源，不混入 Config 来源分类**（原 v1 草案此点删除）

### 4.7 版本联动与一致性测试

- `judge_rubric_version` 从 `JUDGE_RUBRIC_VERSION` 常量读取，**运行时不直接读 Markdown 文件**
- 新增测试：代码常量版本与 `eval-policy-v1.md` 头部版本声明一致（不一致即测试失败）

## 5. 拟修改文件与边界

| 文件 | 动作 | 性质 |
|---|---|---|
| `v2/app/src/lib/eval-config.ts` | 采集结构化 + `_snapshot_meta` + 共享常量区 | 代码 |
| `v2/app/src/lib/eval-types.ts` | EvalConfig 扩展 + SnapshotMeta/来源类型 | 代码 |
| `v2/app/src/lib/eval-runner.ts` | user_isolation 移入创建时写入；删除静默 catch（仅快照初始化，**不动判定**） | 代码 |
| `v2/app/src/lib/eval-db.ts` | createEvalRun 接受完整快照（含 user_isolation）；policy/case_set 字符串列保持 | 代码 |
| `v2/app/src/lib/eval-llm-judge.ts` | 确认 `JUDGE_RUBRIC_VERSION` 导出供共享引用 | 代码（如已导出则不改） |
| `v2/app/src/app/api/chat/route.ts` | 字面量 0.35 / 5 改为共享常量引用（**值不变**） | 代码（仅常量来源重构） |
| `v2/app/src/app/eval/page.tsx` | Config 区 4 列展示 + 旧键兼容 | 代码 |
| `v2/.env.example` | 声明 `CHAT_MODEL` / `CHATFLOW_VERSION`（**optional / declared 标注**，模板不填本机实际值或任何秘密） | 配置模板 |
| `eval/eval-contracts.md` | 快照结构（schema_version 2 + meta + 字段清单）契约更新 | 正式契约（同 PR） |
| `v2/app/src/lib/eval-config.test.ts` 等 | 见 §6 测试矩阵 | 测试 |
| `project-context/tasks/TASK-005A/` | 本 DRAFT + 实施报告 | 任务文件 |
| `project-context/current-state.md` | 状态随任务 PR 同步（不单独开状态 PR） | 治理文件 |

**边界（禁止）**：不改 `eval-program-rules.ts` 判定、不改 `eval_cases`/`eval_runs` schema（无迁移）、不改 mem0-server、不改 Dify 配置、不新增真实 `.env` 值到仓库。

## 6. 验收标准

1. 新 Run 从 UI / API 可追溯全部字段，每项带 `_snapshot_meta` 来源（status / source_type / source_ref / reason）；
2. **无影子配置**：0.35 / 5 / async 来自产品与快照共用只读配置，产品行为与数值不变；
3. UI Config 区仅 4 列（配置项/值/来源/状态或说明）；结果判定来源（程序/LLM/人工）不混入 Config 分类；
4. `judge_rubric_version` 复用代码常量；版本一致性测试通过（代码常量 vs eval-policy-v1.md）；
5. **全部字段（含 judge_rubric_version / case_set_version / policy_version）在 `_snapshot_meta.fields` 中有来源登记**；其值保持顶层字符串 / 独立列不变；
6. `user_isolation` 在 Run 创建时一次性写入（或契约明确定义"初始化完成后不可变"+失败行为）；不再有静默忽略的快照写入；
7. 真实采集链路**集成核验**（跑真实 8 Case Run，非纯 Mock）：Run 能完成、无新增执行错误、快照与来源证据完整；
8. 未修改阈值数值、判定规则或产品行为（diff 审查 + 集成核验双重确认）；
9. 不要求非确定性模型输出逐字/逐分一致（删除 v1 的"结果与基线完全一致"表述）；
10. 测试矩阵全绿：
    - 旧字符串格式快照可读；新 meta 格式可读；新旧混存可读；
    - 缺失字段；null；未知附加字段；`user_isolation` 存在性；
    - 未知 `schema_version`（不崩溃，标记未知）；
    - `policy_version` / `case_set_version` 仍按字符串写独立列；
    - 快照初始化后不再被静默修改（不可变断言）；
    - lint、tsc --noEmit、test、build 全部通过；
11. 契约（eval-contracts.md）、代码、测试在同一 PR。

## 7. 风险与停止条件

| 风险 | 等级 | 缓解 |
|---|---|---|
| chat/route.ts 常量重构引入行为漂移 | 中 | 值不变断言 + 集成核验（8 Case Run 行为一致） |
| user_isolation 初始化改动影响 Run 隔离 | 中 | 集成核验 + 现有并发互斥测试 |
| 字段重命名破坏旧 Run 渲染 | 中 | 旧键兼容读取 + 混存测试 |
| declared 值被误标 observed | 低 | source_type 枚举强制 + 代码审查 |
| UI 展示过度设计 | 低 | 固定 4 列，无新增交互 |

**停止条件**：若实现发现必须修改 schema、判定逻辑、阈值数值或产品行为才能达成目标 → 立即停止并提交 Change Request，不自行扩范围。

## 8. 执行模式判断（历史预判——已于 2026-08-11 经执行模式门确认并执行）

```text
任务复杂度：中等（多文件联调：代码 + 契约 + 测试 + UI + 集成核验）
是否需要用户中途决策：否（边界已由本 DRAFT + Reviewer 结论划定）
是否预计多轮实现—验证—调整：是（共享常量重构 + 快照结构 + 集成核验，至少 2-3 轮）
是否涉及高风险数据、权限或第三方服务：否（不触密钥、不改 schema）
推荐模式：HANDOFF REQUIRED — 长期 Builder 会话
建议会话名称：TASK-005A｜Builder｜Config Snapshot Completeness
任务分支：feature/task-005a-config-snapshot
```

> （历史说明）本判断为 DRAFT 阶段的预判；Founder 已于 2026-08-11 确认 HANDOFF REQUIRED 长期 Builder 会话并完成实现。

## 9. 裁决记录（Founder 2026-08-11 已批准）

1. ✅ **批准 TASK-005A DRAFT v2.1**，任务进入 APPROVED（执行模式门待确认）；
2. ✅ **字段方案批准**：`persona_prompt_hash`→`persona_data_hash`（兼容历史旧键）；保留 `extract_prompt_hash`（只保存真实 Prompt 内容哈希）；`extract_prompt_version` 仅作可选独立声明字段；
3. ✅ **CHAT_MODEL / CHATFLOW_VERSION 批准为 optional / declared** 配置项；未配置时必须显示 unavailable + reason，不得表述为 observed；
4. ✅ **授权修正**（已落盘，最终定稿）：embed_model 无共享版本化来源/只读运行接口 → **unavailable + reason**，不新增 env、不硬编码模型名（不再表述为 declared）；UI 来源枚举改为 observed/code/declared/derived（unavailable/not_applicable 只属 status）；
5. ✅ **执行模式**：Founder 已于 2026-08-11 确认 HANDOFF REQUIRED 长期 Builder 会话（本任务已按此执行，实现完成）。

## 10. 下一交接（历史预判——已执行完毕）

- （历史说明）原预判：执行模式确认后 → 唤醒 Builder（先交实施计划，再实现）；
- 实际执行：执行模式已于 2026-08-11 确认；实施计划 v1.1 已批准；实现完成于 feature/task-005a-config-snapshot（PR #8），当前等待 Review 3 第三轮复审。
