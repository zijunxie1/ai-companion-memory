# Project Context Manifest｜Agent 启动阅读清单

> 作用：定义所有 Agent 在开始工作、角色交接或上下文恢复时必须读取的项目事实。
>
> 本文件是阅读入口，不替代产品定义、任务说明和正式契约。
>
> **本文件是启动与恢复流程的唯一权威来源**（新窗口继承顺序、上下文压缩恢复流程、启动回执）；其他文件只引用本文件，不重复全文。

## 1. 新窗口继承流程（固定阅读顺序）

所有角色在新窗口/新会话/接手任务时，先按以下顺序完整阅读（**新窗口继承流程**）：

1. `AGENTS.md` — 权限、红线和工作门；
2. `project-context/context-manifest.md` — 本清单；
3. `project-context/CHIEF-BOOTSTRAP.md` — Chief 身份、继任关系和上岗核对；
4. `project-context/current-state.md` — 最近一次核验的项目状态；
5. `project-context/product.md` — 已批准的产品目标和成功标准；
6. `project-context/project-mainline-roadmap.md` — 主线顺序、角色边界和偏航恢复；
7. `project-context/handoff-and-task-state-machine.md` — 状态机和交接规则；
8. `project-context/agent-response-protocol.md` — Founder 对话/Agent 交接分离、回复密度和决策后直接交接规则（唯一权威）；
9. `project-context/role-wakeup-and-handoff.md` — 休眠窗口的人工唤醒和交接规则（交接卡结构唯一权威）；
10. `project-context/decision-register.md` — 已批准、待决和否决的重大决策；
11. 当前任务目录中的最新 DRAFT、裁决、交接包和 Review；
12. 当前任务涉及的正式契约、实现和测试。

新 Agent 不得向 Founder 重复整份技术背景：先按 `agent-response-protocol.md` 用与问题难度相称的大白话说明它将做什么、不会做什么，再提交启动回执。完整技术事实由 Agent 自己从交接文件读取，不倾倒给 Founder。

如果文件内容与 Git、代码、数据库或测试冲突，以“停止写操作并上报”为准，不自行选择一个版本继续。

## 2. 角色专项阅读

| 角色 | 除固定清单外必须读取 |
|---|---|
| Founder / CEO | Founder 摘要、决策看板；技术附录按需阅读 |
| 执行 Chief of Staff | `CHIEF-BOOTSTRAP.md`、当前状态、完整决策登记、产品目标、路线图、当前任务全部历史裁决；八类升级条件与升级卡结构（`role-wakeup-and-handoff.md` §5.1） |
| 决策 Chief of Staff | `CHIEF-BOOTSTRAP.md`、当前状态、完整决策登记、产品目标、路线图、升级卡结构与相关历史裁决；只裁决升级卡中的唯一问题 |
| Builder | 已批准任务、验收标准、允许/禁止范围、相关契约、原 Builder 交接和当前 diff |
| Reviewer | 已批准任务、契约、Builder 报告、完整 diff、测试与运行证据；不得只读 Builder 摘要 |
| UX / Design Reviewer | Design Spec、真实页面、用户评论、Browser 证据、数据来源说明 |
| Release / QA | 已合并 commit、迁移、环境变量、部署步骤、健康检查、回滚说明 |

## 3. 强制启动回执

新窗口、新任务、角色交接、上下文压缩后恢复或仓库状态变化后，Agent 的第一份实质性输出必须先以 `## 先说人话（30 秒）` 开头，再包含：

```text
## 启动回执

当前角色：
统一规则版本（C1，即 AGENTS.md 头部"规则版本"）：
已阅读：
当前权威主线：
核验后的正式主线提交（C3，远端头；本地 origin/main 仅在与远端头一致时记录）：
上下文来源声明（C6，本窗口实际读取来源：正式主线文件 / 远端 / 聊天）：
当前任务与状态：
当前交互阶段：讨论 / 已决定 / 交接或执行
Founder 已明确批准 / 未批准 / 待决：
当前分支 / Worktree / 工作区是否干净：
本窗口允许执行：
本窗口禁止执行：
已发现冲突或缺失：
结论：可以继续 / 必须停止并上报
```

新任或新窗口 Chief 的启动回执还必须包含：

```text
Chief 身份实例：
与前任会话的关系：继任 / 原窗口恢复 / 角色拆分（执行 Chief / 决策 Chief）
Chief 类型：执行 Chief（日常职责）/ 决策 Chief（八类升级裁决）
升级路由确认：遇到八类升级事项时形成升级卡，由 Founder 人工转发，不自动联系
继任核对状态：verifying / active
历史归因边界：不会把前任工作表述为自己亲历
```

启动回执不是形式证明。Agent 必须先做只读 Git/文件核对；不能只根据聊天摘要填写。

若 Agent 无法从磁盘读到 `AGENTS.md` 当前规则版本，或回执版本与磁盘不一致，说明会话仍在使用旧规则快照：必须先显式重读，不能继续写操作。

## 3.1 上下文完整性护栏（C1—C6 核验）

> 本节与 §3.2/§3.3/§3.4 是**上下文可信度核验的唯一权威来源**；其他文件（含 `role-wakeup-and-handoff.md`、`AGENTS.md`）只引用本节，不重复定义。本任务（GOV-002）只补核验检查点，不重写 §4 八步恢复流程。

任何窗口（含新窗口、压缩恢复窗口）在以下情形都能可靠判断"我拿到的上下文是否可信、是否可以继续写操作"：

### 3.1.1 上下文要素（C1—C6）

| # | 上下文要素 | 权威来源 | 最小核验动作 |
|---|---|---|---|
| C1 | 规则版本 | **统一治理包版本**：`AGENTS.md` 头部"规则版本"（见 §3.4） | 核对统一版本是否随任一强制文件内容变更同步升级；脱节 → 告警 W3 |
| C2 | 角色身份 | `CHIEF-BOOTSTRAP.md`（以正式主线文件内容为准） | 声明角色实例与关系；本地旧版与主线不一致 → 告警 W2，以主线为准 |
| C3 | 当前主线 | **远端正式主线头**（只读远端查询确认，见 §3.2 三级核验） | 按 §3.2 三级核验；与 current-state 不一致 → 告警 W1 |
| C4 | 任务状态 | 任务文件头部 status + decision-register | 与 Git/PR 事实不一致且无法解释 → 阻断 B1 |
| C5 | 交接上下文 | required_reading 列表 + 交接卡 | 逐一核对已读；缺失 → 阻断 B3 |
| C6 | 上下文来源 | 本窗口实际读取来源（正式主线文件 / 远端 / 聊天） | 启动回执记录"上下文来源声明" |

### 3.1.2 启动回执三项必录字段（C1 / C3 / C6）

启动回执除既有字段外，**至少记录**：

1. 统一规则版本（C1）；
2. 核验后的正式主线提交（C3，远端头；本地 origin/main 仅在与远端头一致时记录为核验结果）；
3. 上下文来源声明（C6）。

## 3.2 正式主线三级核验（C3 展开）

| 层级 | 定义 | 核验动作 | 判定 |
|---|---|---|---|
| ① 远端正式主线头 | GitHub 远端 `main` 当前头部提交 | 只读远端查询确认（如 `git ls-remote origin main` 或 `gh api`） | 唯一权威基线 |
| ② 本地 `origin/main` | 本地缓存的远端跟踪引用，**可能过期** | 与远端头比对；不一致 → `git fetch` 后重比 | 仅当与远端头一致时才可作为正式文件内容来源 |
| ③ 历史脏工作区 | 主检出、旧分支、未跟踪文件 | 只触发告警 W2 | **不参与权威判断**；不推翻 ① |

- 若远端头提交**尚未存在于本地对象库**：停止读取旧文件，不在脏环境中猜测；在获授权的干净环境补齐对象后再核验；
- 本地 `origin/main` 与远端头不一致且无法 fetch 时：以远端头为准，将本地引用滞后记录为告警 W1。

## 3.3 告警与阻断规则（互斥）

**告警（W）——不阻断写操作，以正式主线事实为准继续执行，记录待同步/待修复项：**

| ID | 规则 | 触发条件 | 动作 |
|---|---|---|---|
| W1 | 状态文件滞后 | current-state 记录的主线提交与远端头/核验后 origin/main 不一致 | 以核验后主线提交为准执行，报告中注明状态文件待同步 |
| W2 | 本地未同步 | 本地检出/历史工作区文件与正式主线不同（仅证明本地未同步） | 以正式主线为准执行并注明来源；**不推翻已核验的主线事实，不参与权威判断** |
| W3 | 统一版本脱节 | 任一强制启动治理文件内容变更但统一版本未同步升级 | 记录为维护项，随本任务或后续治理任务修复 |

**阻断（B）——必须停止写操作，按 §4.1 恢复或上报：**

| ID | 规则 | 触发条件 | 动作 |
|---|---|---|---|
| B1 | 权威语义冲突 | 核验正式主线文件、任务文件、决策登记后，仍存在**无法解释**的互相冲突（AGENTS.md 红线 #3 语义） | 停止写操作，列出冲突并上报；不自行选择版本 |
| B2 | 聊天摘要作为唯一证据 | 仅凭聊天摘要声明"已批准 / 已合并 / 已实现"，无文件或 Git 证据 | 停止，要求文件/Git 证据 |
| B3 | 交接上下文缺失 | 交接卡缺失 required_reading，或必读文件未读 | 停止执行，先补齐阅读 |

> **互斥保证**：W1/W2/W3 的触发情形（可收敛的滞后、未同步、版本元数据缺失）**永不进入** B1；B1 只在 W1—W3 校正后仍无法解释时触发。同一事件不会同时出现"继续并校正"与"停止并上报"。
>
> **MA1 排除条款**：W3（版本脱节）仅指版本号元数据未升级这一事实本身；若因版本未升级导致旧文件内容与当前权威文件语义冲突，该内容差异走 B1 而非 W3。

## 3.4 统一治理包版本（C1 展开）

**定义**：`AGENTS.md` 头部的"规则版本"是**整个必读治理包的统一版本**，不是 AGENTS.md 单独版本。任一**强制启动治理文件**发生行为变化（规则、权限、流程、边界语义变化；纯文字修正除外），必须在**同一变更**中同步升级统一版本，并在变更说明中列出受影响文件。

**强制启动治理文件清单**（行为变化必须升级统一版本）：

| 文件 | 角色 |
|---|---|
| `AGENTS.md` | 承载统一版本号 + 高频规则摘要 |
| `project-context/context-manifest.md` | 启动/恢复/上下文可信度规则 |
| `project-context/CHIEF-BOOTSTRAP.md` | 角色身份与拆分边界 |
| `project-context/current-state.md` | 状态快照（行为变化=记录语义/核验方式变化；状态值更新不算） |
| `project-context/product.md` | 产品目标与成功标准 |
| `project-context/project-mainline-roadmap.md` | 主线与阶段门 |
| `project-context/handoff-and-task-state-machine.md` | 状态机与交接规则 |
| `project-context/agent-response-protocol.md` | Founder 回复协议 |
| `project-context/role-wakeup-and-handoff.md` | 唤醒与交接 |
| `project-context/decision-register.md` | 决策登记 |

**文档版本与统一版本分离**：各文件自身的版本字段（如 `draft_version`）保留，但仅作文档演进记录，**不能替代统一版本**。启动回执只记录统一版本（C1）。

**内容来源证明**：不引入"内容指纹"。**远端正式主线头提交**即为内容来源证明——同一提交下的文件内容由 Git 保证确定。

## 4. 上下文压缩与中断恢复

出现以下任一情况时，视为旧聊天记忆不再可靠：

- 系统提示上下文已压缩；
- Agent 无法准确复述当前任务、分支或最近裁决；
- 模型、窗口或角色发生切换；
- 距离上次活动较久，仓库可能被其他 Agent 修改；
- `current-state.md` 的 commit 或时间与仓库不匹配。

### 4.1 恢复流程（十步，按顺序执行）

发生压缩或记忆不确定时，**先停止写操作**，再按以下顺序恢复：

1. 停止写操作；
2. 重读 `AGENTS.md`；
3. 重读 `project-context/context-manifest.md`（本文件）；
4. 重读 `project-context/current-state.md`；
5. 重读当前任务和最新交接包，提取 Founder 已批准、未批准、待决和已否决内容；
6. 重新判断当前交互阶段：讨论 / 已决定 / 交接或执行；
7. 重做 Git 只读核验（分支 / HEAD / Worktree / 工作区）；
8. 按 `agent-response-protocol.md` 重新选择 L1 / L2 / L3 密度，并先用大白话说明当前工作；
9. 核对下游执行需要的完整判断是否已在交接文件中；
10. 无冲突后继续；若已有唯一明确的 Founder 决定，直接恢复执行，不得要求二次确认。

> **聊天摘要只能用于定位文件，不能作为任务批准、Git 状态或正式决策的唯一证据。** 若摘要写“Founder 已同意”但任务/交接/决策文件没有准确记录批准边界，必须停止并补证；若正式文件已经准确记录，则不得因压缩重新让 Founder 确认一遍。

## 4.2 非驻留窗口说明

本清单不会主动触发任何 Agent 阅读。Chief、Builder、Reviewer 和 Release 只有收到 Founder 消息后才会运行。每次角色交接必须使用 `role-wakeup-and-handoff.md` 的唤醒卡；下一角色收到卡片后再执行本清单。

## 5. 任务与交接文件的 required_reading

所有新建或实质修订的任务 DRAFT、Builder 交接包和 Reviewer 交接包，文件头部必须包含：

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/project-mainline-roadmap.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-XXX/draft.md
  - <本任务相关正式契约>
```

除 `required_reading` 外，交接文件正文必须按 `role-wakeup-and-handoff.md` §3.1 记录：当前交互阶段、Founder 已批准、明确未批准和仍待决内容。后续 Agent 不得只凭聊天短卡补猜这些边界。

Reviewer 发现 `required_reading` 缺失、启动回执缺失或读取版本过期时，应至少标记为 MAJOR；若已导致范围、权限或事实判断错误，应标记为 BLOCKER。
