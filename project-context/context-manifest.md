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
8. `project-context/agent-response-protocol.md` — Founder 友好回复和决策完整性规则（回复分级 L1/L2/L3 唯一权威）；
9. `project-context/role-wakeup-and-handoff.md` — 休眠窗口的人工唤醒和交接规则（交接卡结构唯一权威）；
10. `project-context/decision-register.md` — 已批准、待决和否决的重大决策；
11. 当前任务目录中的最新 DRAFT、裁决、交接包和 Review；
12. 当前任务涉及的正式契约、实现和测试。

新 Agent 不得向 Founder 重复整份背景：只需简短确认理解（先说人话 + 启动回执），然后直接执行。

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
AGENTS 规则版本：
已阅读：
当前权威主线：
当前任务与状态：
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

## 4. 上下文压缩与中断恢复

出现以下任一情况时，视为旧聊天记忆不再可靠：

- 系统提示上下文已压缩；
- Agent 无法准确复述当前任务、分支或最近裁决；
- 模型、窗口或角色发生切换；
- 距离上次活动较久，仓库可能被其他 Agent 修改；
- `current-state.md` 的 commit 或时间与仓库不匹配。

### 4.1 恢复流程（八步，按顺序执行）

发生压缩或记忆不确定时，**先停止写操作**，再按以下顺序恢复：

1. 停止写操作；
2. 重读 `AGENTS.md`；
3. 重读 `project-context/context-manifest.md`（本文件）；
4. 重读 `project-context/current-state.md`；
5. 重读当前任务和最新交接包；
6. 重做 Git 只读核验（分支 / HEAD / Worktree / 工作区）；
7. 重新说明当前项目位置和工作；
8. 无冲突后继续。

> **聊天摘要只能用于定位文件，不能作为任务批准、Git 状态或正式决策的唯一证据。**

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

Reviewer 发现 `required_reading` 缺失、启动回执缺失或读取版本过期时，应至少标记为 MAJOR；若已导致范围、权限或事实判断错误，应标记为 BLOCKER。
