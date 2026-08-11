# GOV-COMM-001｜Founder 沟通、角色交接与上下文恢复规范（DRAFT v1.4）

> 合并后状态：本任务已 MERGED（`3412c3c`）。下方的方案、验收与执行权限保留其批准和实施时点；当前任务状态以前置元数据、§9 与 §19 为准。

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-006/route-b-decision.md
doc_type: 任务 DRAFT（Governance；三项审批、实施与独立复审均已完成；任务已 MERGED；v1.4 保留原方案与证据）
task_id: GOV-COMM-001
status: MERGED（Review 1 ✅ / 执行模式 ✅ / Review 2 ✅；独立复审 REVIEW_APPROVED（0/0/0）后已合入正式主线）
draft_version: v1.4（2026-08-12；v1.3 → v1.4：GOV-CHIEF-001 已合入正式主线，前置条件满足，基线更新至最新 main；后续三轮 CR 修复与证据同步均为执行阶段修订，方案本体未变）
draft_date: 2026-08-12
方案责任角色: 执行 Chief（任务方案的方向与批准责任归属执行 Chief；当前实例见 CHIEF-BOOTSTRAP.md）
formalized_by: Governance Builder（仅负责文件整理与落盘，不是任务方向的决策者）
approval_stage: 三项审批全部完成（2026-08-12）——① 任务方案 Review 1：✅ 批准 DRAFT v1.2；② 执行模式：✅ 同意 delegated；③ 实现计划 Review 2：✅ 批准 implementation-plan v1.4。执行阶段经三轮限定 CR 修复并获最终独立复审 REVIEW_APPROVED（0/0/0）；Founder 已合并，现为 MERGED
execution_authority: 已按 implementation-plan v1.4 完成实施（6→8 个治理文件 + 1 模板 + 3 规划 + 2 证据，合计 14 个）；合并事实已发生，后续只可按单独任务推进 GOV-002
implementation_baseline_ref: origin/main
implementation_baseline_commit: 42786dadaafd1d1c15e44d1998b646a426c65cdf
merge_commit: 3412c3c90ac73363b2d54998311bcd9ca39da10b
baseline_contains: GOV-CHIEF-001 PR #11 已 Rebase 合并（执行/决策 Chief 拆分为正式治理事实）
baseline_verified_at: 2026-08-12
baseline_note: `42786da` 是原实施基线；合并后正式主线事实以 `3412c3c` 为准
basis: TASK-006 前置治理；Founder 2026-08-12 授权起草 DRAFT 与 implementation-plan；PR #10 已合入的治理事实（TASK-006 APPROVED、路线 B APPROVED、D-RESP-001 APPROVED）
```

---

## 1. 任务目标

让 Founder 在**不整理技术上下文的前提下**，用最短时间判断四件事：项目正在做什么、哪个功能/策略/Bug 出了问题、当前处于哪个阶段、是否需要 Founder 决定。

具体手段：建立**回复分级规范**（普通回复 / 普通交接 / 完整汇报）、**自包含交接卡**、**新窗口继承流程**与**上下文压缩恢复流程**，并把这些规则落到治理文件的单一权威来源，避免多文件重复。

> 本任务只改沟通与交接规则，不改产品行为、不改 TASK-006、不重排主线。

---

## 1.1 裁决记录（2026-08-12，Founder 三项裁决）

### 1.1.1 动作 1｜任务方案 Review 1：批准 DRAFT v1.2

- GOV-COMM-001 DRAFT v1.2 已获 Founder 批准（2026-08-12）；
- 同时明确**治理任务顺序**：`GOV-CHIEF-001 角色拆分与状态校准 → GOV-COMM-001 沟通与交接规范 → GOV-002 上下文完整性护栏`；
- 该顺序**只确定 TASK-006 内部的前置治理顺序，不改变产品任务顺序**；
- **TASK-006 继续保持 APPROVED**，E004 仍未解决。

### 1.1.2 动作 2｜执行模式：同意 delegated（有前置条件）

- GOV-COMM-001 后续采用 **delegated 临时委派**；
- 但**不代表现在可以开始实施**；必须先满足前置条件：**GOV-CHIEF-001 已完成、经独立 Review 并合入正式主线**。

### 1.1.3 GOV-CHIEF-001 前置条件：已满足（2026-08-12 更新）

- GOV-CHIEF-001 已获 Founder 三项审批（DRAFT v1.0 / delegated / 实现计划 v1.0，2026-08-12），经实施与独立复审（REVIEW_APPROVED，0/0/0），**PR #11 已 Rebase 合并**（正式 main @ `42786da`）；
- 执行 Chief / 决策 Chief 拆分已成为**正式治理事实**；
- 因此 GOV-COMM-001 的实施前置条件**已满足**，本任务恢复规划并重新提交 Review 2；
- 本次恢复仅更新基线/前置/过期状态，不实施任何治理文件变更。

### 1.1.4 动作 3｜实现计划 Review 2：已批准（v1.4，2026-08-12）

- **历史原因（v1.1 暂不批准，Founder 裁决原文要点）**：当时 `current-state.md` 仍错误记录旧的正式主线版本（origin/main 记录为 `0762a17`，实际为 `02efd2d`），并把已经完成的治理同步列为下一步；implementation-plan v1.1 又规定不得修改 Git 事实表。按仓库红线，Builder 当时实施会立即因权威状态冲突而停止；
- 处理（已解决）：更新基线、前置条件和 current-state 修改边界后重新提交（v1.2 → v1.3 → v1.4），**Review 2 已于 2026-08-12 批准（v1.4），实施已完成（IMPLEMENTED，V1—V9 验证通过）**。

### 1.1.5 裁决后的下一步与禁止

**本次恢复只允许**：

1. 获取最新 origin/main 并将本分支快进到最新 main（已完成，基线 `42786da`）；
2. 更新三份规划文件的基线、前置条件和过期状态；
3. 重新提交实现计划 Review 2 审批卡；
4. 保持 GOV-COMM-001 为 APPROVED 但未进入实施；TASK-006 保持 APPROVED；GOV-002 不启动。

**当前禁止**：实施七项治理文件变更；修改 AGENTS.md 或其他正式沟通规则；提交、推送或创建 PR；唤醒 Reviewer；修改 TASK-006、产品代码、数据库或评测规则；合并或部署。

---

## 2. 当前问题（已核实）

| # | 问题 | 现状 | 用户影响 |
|---|---|---|---|
| P1 | Agent 回复信息过载 | 一次回复常包含完整决策看板、重复状态报告、技术附录、大量测试日志 | Founder 难以快速判断项目位置、当前问题、阶段和是否需要操作 |
| P2 | 交接依赖聊天记忆 | 交接内容散落在聊天中，未全部落盘为自包含交接包 | 新窗口/新 Agent 无法仅凭文件恢复上下文，Founder 被迫重新整理技术上下文 |
| P3 | 上下文压缩后恢复成本高 | 恢复流程存在但未统一收敛到单一权威文件，各文件描述不完全一致 | 压缩后 Agent 可能凭聊天摘要继续，违反"不依赖聊天记忆"原则 |

现有基础（已存在，不重复建设）：

- `agent-response-protocol.md` 已定义"先说人话（30 秒）"、决策看板、外部复核包、回复合规自检；
- `role-wakeup-and-handoff.md` 已定义唤醒卡与交接检查点；
- `context-manifest.md` 已定义固定阅读顺序与启动回执；
- `AGENTS.md` 已定义红线与状态机。

> 本任务是对上述既有规则做**分级收敛与模板统一**，不是从零新建一套沟通体系。

## 3. 非目标（明确不做）

- ❌ 不修改产品代码（v2/）、不修改 eval/ 契约或评测规则；
- ❌ 不修改数据库或迁移；
- ❌ 不修改 TASK-006（draft / route-b-decision / 状态）；
- ❌ 不设计或实现 GOV-002；
- ❌ 不修改 CHIEF-BOOTSTRAP.md 的角色拆分内容；
- ❌ 不重排产品主线（project-mainline-roadmap.md 主线顺序不变）；
- ❌ 不回写历史交接文件；
- ❌ 不引入依赖、插件或外部服务；
- ❌ 不自动联系、创建或唤醒其他角色；
- ❌ 不提交、推送、创建 PR、合并或部署（本阶段）；
- ❌ 不要求 Founder 自行整理技术上下文。

## 4. 回复分级设计

### 4.1 分级总览

| 级别 | 触发条件 | 向 Founder 展示 | 禁止展示 |
|---|---|---|---|
| L1 普通回复 | 常规进展、确认、小范围调整 | `## 先说人话（30 秒）` 3—5 句大白话 | 完整决策看板、技术附录、测试日志 |
| L2 普通交接 | 阶段完成需角色接力 | 先说人话 + 一张可直接复制的完整交接卡（渲染为单一代码框） | 重复状态报告、技术附录、重复解释"接下来会发生什么" |
| L3 完整汇报 | 任务/重要阶段完成、阻塞、需 Founder 决策、重大风险/范围变化/权威证据冲突 | 先说人话 + 完整项目状态 + 最多三个选项 + 明确推荐 | 无（技术证据必须保留在 Markdown 交接包/附录） |

### 4.2 L1 普通回复模板

```markdown
## 先说人话（30 秒）

我们现在在做：……
现在的问题是：……
这一步是在：修 Bug / 完善功能 / 调整策略 / 整理规则 / 只读检查。
当前进度：……
你现在需要：不用操作 / 只决定一件事。
```

**长度硬约束**：L1 普通回复（含进度更新）**总长度始终为 3—5 句**，只选择当前必要信息（五要素中的相关项，可不全部出现）；**七项完整状态（正在解决什么/完成什么/还剩什么/是否偏离目标/当前风险/下一检查点/Founder 是否需要参与）仅在 L3 完整汇报中使用，L1 不得展开为七项清单**。

其他约束：不含 commit SHA、文件路径、PR 编号、Worktree、Schema、状态机缩写、未解释英文术语。Founder 只读这一段就能判断是否需要操作。

### 4.3 L2 普通交接模板（含渲染要求）

**渲染要求（强制）**：普通交接中的交接卡必须在实际聊天回复中显示为**一个完整、可直接复制的代码框**——以三个反引号加 `text` 开头、三个反引号结尾，不得只显示语言标签而无代码框，不得拆成多个片段。Founder 应能一键复制整张卡片发送给下一角色。

> 下文演示中，为在 Markdown 文档内展示"含三个反引号的代码框"，外层使用**四个反引号**包裹。

````markdown
## 先说人话（30 秒）

项目现在走到：……
当前任务在解决：……
刚完成的是：……
接下来交给【角色】做：……

## 直接复制给下一个角色

```text
# 交接卡（完整字段见 §5）
目标角色：……
项目位置：……
本次唯一目标：……
……（其余字段按 §5 填写）
```
````

### 4.4 L3 完整汇报模板

```markdown
## 先说人话（30 秒）
## 项目 → 阶段 → 任务 → 当前角色位置
## 出了什么问题
## 用户影响
## 当前做到哪
## 需要 Founder 决定什么（最多三个选项 + 明确推荐）
## 不决定会阻塞什么
```

完整汇报仅限四类情况：整个任务或重要阶段完成；出现阻塞；需要 Founder 做决定；发现重大风险、范围变化或权威证据冲突。

## 5. 交接卡结构（自包含要求）

每张交接卡必须让新 Agent **不依赖旧聊天**即可开始，至少包含：

1. 目标角色；
2. 项目位置；
3. 本次唯一目标；
4. 为什么做；
5. 当前事实；
6. 已完成和未完成；
7. 已批准决策；
8. 决策理由；
9. 已否决方案；
10. required_reading；
11. 允许执行；
12. 禁止执行；
13. 具体步骤；
14. 验收标准；
15. 停止条件；
16. 完成后必须返回的材料；
17. 下一张交接卡要求。

> 完整模板落盘位置（实施阶段）：`project-context/templates/role-handoff-template.md`（新建）。

## 6. Markdown 交接包要求

- 技术证据、文件、决策理由和下一步全部进入 Markdown 交接包（落盘到 `project-context/tasks/` 或任务目录），不留在聊天；
- 交接包头部必须含 `required_reading`（AGENTS.md 红线 #11）；
- 交接包必须自包含：新 Agent 只读交接包 + required_reading 即可开始，不依赖聊天记忆；
- 聊天结论未落盘前不构成跨会话长期事实（AGENTS.md 既有规则，本任务强化执行）；
- 普通交接场景只输出一张交接卡，不输出多份重复材料。

## 7. 新窗口继承流程（固定读取顺序）

新窗口/新会话/接手任务时固定按顺序读取：

```text
AGENTS.md
→ project-context/context-manifest.md
→ project-context/current-state.md
→ 当前任务 draft.md
→ 最新交接文件
→ 相关决策、契约、代码和测试
```

新 Agent 不得向 Founder 重复整份背景，只需简短确认理解（先说人话 + 启动回执），然后直接执行。

## 8. 上下文压缩恢复流程

发生压缩或记忆不确定时，按顺序执行：

```text
停止写操作
→ 重读 AGENTS.md
→ 重读 context-manifest.md
→ 重读 current-state.md
→ 重读当前任务和最新交接包
→ 重做 Git 只读核验（分支/HEAD/Worktree/工作区）
→ 重新说明当前项目位置和工作
→ 无冲突后继续
```

聊天摘要只能用于定位文件，不能作为任务批准、Git 状态或正式决策的唯一证据。

## 9. 任务状态流（正式状态机）

本任务严格走正式状态机，Builder 不得自行跳过或宣布后续阶段：

```text
DRAFT（本文件）
→ APPROVED（Founder 任务方案 Review 1 批准本 DRAFT）
→ IN_PROGRESS（Founder 确认执行模式后，Builder 实施）
→ IMPLEMENTED（规则修改完成；Builder 停止，不得自行宣布 Review 完成）
→ IN_REVIEW（独立 Reviewer 审查）
→ REVIEW_APPROVED（Reviewer 通过；仍由 Founder 决定是否合并）
→ MERGED（Founder 合并裁决后）
```

- 当前状态：**MERGED**；Review 1 ✅ / 执行模式 ✅ / Review 2 ✅、独立复审 REVIEW_APPROVED（0/0/0）与 Founder 合并均已完成；
- 原 Builder 已在 IMPLEMENTED 停止，独立 Review 已完成；本任务不再需要 Reviewer 唤醒。
- 后续工作只能单独起草 GOV-002；不得把 GOV-002 或产品实现混入本任务。

## 10. 允许和禁止修改文件

### 10.1 允许修改（实施范围，本阶段只规划不修改）

| 类别 | 文件 | 说明 |
|---|---|---|
| 现有治理文件（6 个） | `AGENTS.md` | 引用收敛：保留高频红线，回复规范改为指向唯一权威 |
| | `project-context/agent-response-protocol.md` | **回复格式唯一权威**：L1/L2/L3 分级与全部模板 |
| | `project-context/role-wakeup-and-handoff.md` | **交接流程唯一权威**：交接卡结构、唤醒卡、交接检查点 |
| | `project-context/context-manifest.md` | **启动与恢复流程唯一权威**：新窗口继承顺序、压缩恢复流程、启动回执 |
| | `project-context/current-state.md` | 本任务状态同步（实施完成后） |
| | `project-context/decision-register.md` | 登记本任务决策（D-GOV-COMM-001） |
| 新建（1 个） | `project-context/templates/role-handoff-template.md` | 交接卡完整模板（供所有角色复制填写） |
| 任务过程证据文件（允许在任务目录生成） | `project-context/tasks/GOV-COMM-001/implementation-report.md` | 实施完成后 Builder 提交的实现报告 |
| | `project-context/tasks/GOV-COMM-001/<交给 Reviewer 的正式交接文件>` | 实施完成、交独立 Review 前的正式交接包 |
| GOV-COMM-001 正式规划文件（随任务提交） | `project-context/tasks/GOV-COMM-001/draft.md` | 本任务 DRAFT（v1.4）——随实施提交、纳入 V7 与 PR |
| | `project-context/tasks/GOV-COMM-001/implementation-plan.md` | 本任务实现计划（v1.4）——随实施提交 |
| | `project-context/tasks/GOV-COMM-001/handoff-builder-plan-to-founder.md` | 本任务规划交接包（v1.4）——随实施提交 |

> 任务过程证据文件（实现报告、Reviewer 交接文件）与三份正式规划文件均为任务交付的组成部分，不得遗漏；三份规划文件必须纳入允许修改、V7 验证和 PR 文件清单。

### 10.2 禁止修改（本任务全程）

- ❌ `CHIEF-BOOTSTRAP.md`（角色拆分内容）；
- ❌ `project-context/tasks/TASK-006/*`；
- ❌ `project-context/tasks/GOV-001/*` 及历史交接文件；
- ❌ `project-context/project-mainline-roadmap.md` 主线顺序；
- ❌ `v2/` 产品代码、`eval/` 契约、数据库迁移；
- ❌ 任何依赖/插件/外部服务配置。

## 11. 任务顺序与关联任务（Founder 2026-08-12 已裁决）

- **治理任务顺序（已批准）**：`GOV-CHIEF-001 角色拆分与状态校准 → GOV-COMM-001 沟通与交接规范 → GOV-002 上下文完整性护栏`；
- **该顺序只确定 TASK-006 内部的前置治理顺序，不改变产品任务顺序**；产品主线 `GOV-001 → TASK-005A → TASK-006 → TASK-007 → TASK-005B` 保持不变；
- **与 GOV-CHIEF-001 的关系**：GOV-COMM-001 的实施前置条件（GOV-CHIEF-001 已完成、经独立 Review 并合入正式主线）**已满足**——PR #11 已合并，执行/决策 Chief 拆分为正式治理事实；GOV-COMM-001 的实施将基于最新 main（`42786da`）执行；
- **与 GOV-002 的关系**：GOV-002（上下文完整性护栏）尚未起草正式 DRAFT。GOV-COMM-001 不实现 GOV-002；按已裁决顺序，GOV-002 在 GOV-COMM-001 之后；
- **与主线的关系**：已批准产品主线无 GOV-COMM-001 / GOV-CHIEF-001 / GOV-002 插槽；三者均为 TASK-006 内部前置治理任务，**不重排产品主线**；
- 本任务完成不改变任何其他任务状态（TASK-006 保持 APPROVED）。

## 12. 单一权威来源映射

| 内容 | 唯一权威文件 | 其他文件行为 |
|---|---|---|
| 回复格式（L1/L2/L3、全部模板） | `agent-response-protocol.md` | 其他文件只引用，不重复全文 |
| 交接流程（交接卡结构、唤醒卡、交接检查点） | `role-wakeup-and-handoff.md` | 其他文件只引用 |
| 交接卡填写模板 | `templates/role-handoff-template.md` | 被交接文档引用/复制使用 |
| 启动与恢复流程（新窗口继承、压缩恢复、启动回执） | `context-manifest.md` | 其他文件只引用 |
| 高频红线与状态机 | `AGENTS.md` | 保持精简，指向上述权威文件 |

> 目标：任何一条规则只有一个权威出处；其他文件通过引用避免重复，杜绝多文件模板漂移。

## 13. 验收标准

1. 三个审批动作状态：Review 1 ✅ 已批准（DRAFT v1.2）；执行模式 ✅ 已同意（delegated）；Review 2 ✅ 已批准（implementation-plan v1.4）——实施、独立复审与 Founder 合并均已完成，任务为 MERGED；
2. 实施完成后，全部变更落在 §10.1 允许列表内（8 个现有治理文件 + 1 个新模板 + 3 份正式规划文件 + 2 份过程证据文件，合计 14 个）；
3. `agent-response-protocol.md` 成为回复格式唯一权威，`role-wakeup-and-handoff.md` 成为交接流程唯一权威，`context-manifest.md` 成为启动/恢复流程唯一权威；各文件互相引用一致，无重复全文模板；
4. 普通回复模板（L1）3—5 句可说人话，不含技术术语（用模板校验样例验证）；
5. 交接卡模板字段完整（§5 十七项），新 Agent 只读交接卡 + required_reading 即可开始（用模拟样例验证）；
6. 普通交接在聊天中渲染为单一、完整、可直接复制的代码框（` ```text ` 开头/结尾），并已做实际渲染检查；
7. 新窗口继承流程与上下文压缩恢复流程已在 `context-manifest.md` 明确落盘；
8. **产品代码与 TASK-006 零变化**：git diff 证明 v2/、eval/、migrations/、tasks/TASK-006/ 无任何变更；
9. current-state.md 与 decision-register.md 完成本任务状态同步；
10. 不引入任何新依赖、插件或外部服务；
11. 任务走正式状态机：Builder 停在 IMPLEMENTED，独立 Review 为必经步骤，Founder 决定合并；
12. 全部变更在单一 PR 中可审查（本任务无代码/测试变更，PR 内仅治理文件）。

## 14. 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| 多文件重复同一模板导致漂移 | 高 | 单一权威来源映射 + 验证矩阵检查"无重复全文" |
| 规则过严导致 Agent 省略必要信息 | 中 | L3 完整汇报四类触发条件兜底；启动回执强制 |
| 新规则未被执行（Markdown 无法强制） | 中 | AGENTS.md 引用 + Reviewer 追溯检查 + 启动回执 |
| 普通交接卡不完整，新 Agent 仍需问 Founder | 中 | 十七字段模板 + 自包含验证样例 |
| 交接卡渲染失败（只显示语言标签/拆分） | 中 | V9 实际渲染检查加入验证矩阵 |
| 治理顺序裁决未落盘或被误用为产品主线变化 | 中 | §1.1/§11 已记录裁决（只确定 TASK-006 内部前置治理顺序，不改变产品任务顺序），Reviewer 追溯检查 |
| 修改治理文件与既有规则冲突 | 中 | 红线 #3：冲突停止上报 |
| 误改禁止文件（TASK-006/产品代码） | 高 | 验证矩阵 + 禁止列表 + 独立 Review |

## 15. 停止条件与 Change Request 条件

### 15.1 停止条件（满足任一 → 停止并上报 Founder，不自行扩大范围）

1. 需要修改 CHIEF-BOOTSTRAP.md 角色拆分、TASK-006、产品代码、eval 契约、数据库或主线顺序；
2. 需要设计/实现 GOV-002 或引入外部服务/依赖；
3. 需要自动联系、创建或唤醒其他角色（实施阶段必须由 Founder 决定何时发交接卡给 Reviewer）；
4. 实施前 origin/main 前进导致基线失效（需重新核验）；
5. 权威主线、任务状态或必读文件与现状冲突（红线 #3）。

### 15.2 Change Request 条件

- 需要修改 §10.1 允许列表之外的文件；
- 需要改变 §4 回复分级设计或 §5 交接卡结构（影响面超出本任务范围）；
- 需要新增权限、依赖或外部服务；
- 需要重排主线或修改 TASK-006。

## 16. 历史执行权限（2026-08-12 恢复规划后）

Founder 2026-08-12 授权边界（含恢复规划授权）：

- ✅ 允许获取最新 origin/main 并将 codex/gov-comm-001 快进至最新 main（已完成：`42786da`）；
- ✅ 允许保留并更新三份 GOV-COMM-001 规划文件（draft / implementation-plan / handoff），删除过期表述，基线更新为最新 main，重新提交 Review 2；
- ✅ 允许核对新角色规则（执行/决策 Chief）与方案一致性；
- ❌ 不授权实施七项治理文件变更（Review 2 未批准）；
- ❌ 不授权提交、推送、创建 PR、合并或部署；
- ❌ 不授权唤醒 Reviewer；
- ❌ 不授权修改 AGENTS.md 或其他正式沟通规则、TASK-006、产品代码、数据库、评测规则或 GOV-002。

## 17. 验证矩阵（实施后由 Builder/Reviewer 执行）

| # | 验证项 | 方法 | 通过标准 |
|---|---|---|---|
| V1 | 普通回复足够短 | 用 L1 模板样例逐条比对 | 总长 3—5 句、无技术术语、只含当前必要信息；七项完整状态未在 L1 展开 |
| V2 | 交接卡自包含 | 用 §5 十七字段清单逐项核对模板；模拟新 Agent 只读交接卡回答问题 | 全部字段可填写、无"问 Founder"缺口 |
| V3 | 新窗口不依赖旧聊天 | 检查继承流程完整落盘 + 启动回执要求 + required_reading 机制 | 顺序完整、可执行 |
| V4 | 上下文压缩后能恢复 | 检查恢复流程八步完整落盘（§8） | 步骤完整、含 Git 只读核验 |
| V5 | 单一权威来源无重复 | grep 对比四个权威文件：同一规则只出现一次全文，其余为引用 | 无重复全文 |
| V6 | 产品代码和 TASK-006 无变化 | git diff 限定路径：v2/、eval/、migrations/、tasks/TASK-006/ 零差异 | 零差异 |
| V7 | 允许列表内修改 | git diff 文件清单 ⊆ §10.1 允许列表（含任务目录过程证据文件） | 文件清单一致 |
| V8 | 状态同步 | current-state.md / decision-register.md 已记录本任务；实施阶段停在 IMPLEMENTED 并在独立复审后合并 | 记录正确、状态合规 |
| V9 | 交接卡实际渲染 | 在实际聊天平台发送 L2 样例，检查渲染结果 | 显示为单一完整代码框（` ```text ` 开头/结尾），可一键整体复制，不只显示语言标签 |

## 18. 历史执行模式判断（当时预判；现已确认、执行并合并）

```text
任务：GOV-COMM-001 Founder 沟通、角色交接与上下文恢复规范
任务复杂度：中等（治理文件修改，无产品代码）
是否需要用户中途决策：否（实施过程不需要；审批动作按三个门分开执行）
是否预计多轮实现—验证—调整：否（文档修改 + 验证矩阵，一次可完成）
是否涉及高风险数据、权限或第三方服务：否
推荐模式：delegated 临时委派（边界明确、输入完整、失败可重试）
任务分支：codex/gov-comm-001（已创建，Worktree E:/gov-comm-001-worktree）
判断依据：任务边界明确（§10 允许/禁止列表）；实施过程不需要用户中途决策；
          文档修改可依靠文件重试；验证矩阵客观可执行
```

> 执行模式已由 Founder **单独确认**（2026-08-12，动作 2）：同意 delegated，但实施须先满足 GOV-CHIEF-001 前置条件，并待 Review 2 批准。

## 19. 下一交接

- 本任务已完成独立复审并 **MERGED**（`3412c3c`）；本段保留审批与实施历史。
- 审批状态：Review 1 ✅ 已批准（DRAFT v1.2）；执行模式 ✅ 已同意（delegated）；Review 2 ✅ 已批准（implementation-plan v1.4）；独立复审 ✅ REVIEW_APPROVED（0/0/0）；
- 实施已完成（14 个文件）并已合入正式主线；
- 下一步：单独起草 GOV-002 DRAFT；不得把 GOV-002 内容回写到本任务。

---

## 附：Founder 审批卡（2026-08-12，三项审批已完成）

```text
## GOV-COMM-001 审批状态（2026-08-12）

【动作 1｜任务方案 Review 1】✅ 已批准（DRAFT v1.2）
【动作 2｜执行模式】✅ 已同意 delegated
【前置条件】✅ 已满足（GOV-CHIEF-001 PR #11 已合并；正式 main = 42786da）
【动作 3｜实现计划 Review 2】✅ 已批准（implementation-plan v1.4）

实施已完成：14 个文件（8 个现有治理文件 + 1 个新模板 + 3 份正式规划文件
+ 2 份过程证据文件），V1—V9 验证通过；经三轮限定 CR 修复。

历史节点结束后，GOV-COMM-001 已于 `3412c3c` 合入正式主线；当前后续事项为单独起草 GOV-002。
```
