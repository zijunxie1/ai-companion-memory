# AGENTS.md

> 本文件是所有 AI Agent 进入本项目时的强制执行章程。
> 完整项目上下文入口见 `project-context/context-manifest.md`。
> 规则版本（统一治理包版本，C1）：`2026-08-14.1`

## 每次工作前的强制阅读

所有 Agent（Chief of Staff、Builder、Reviewer、Release / QA，以及临时子 Agent）在以下任一情况发生时，必须先完成启动阅读，再进行分析、规划、修改、审查、合并或部署：

- 新开窗口或新会话；
- 首次进入本仓库；
- 接手新的 TASK；
- 从其他角色或 Agent 接手工作；
- 上下文压缩、丢失或无法准确复述当前状态；
- 中断后恢复工作，且仓库或任务状态可能已经变化。

### 固定必读文件

1. `AGENTS.md`（本文件）；
2. `project-context/context-manifest.md`（完整阅读顺序和角色专项上下文）；
3. `project-context/CHIEF-BOOTSTRAP.md`（Chief 必读；其他角色了解执行 Chief / 决策 Chief 身份与拆分边界）；
4. `project-context/current-state.md`（最近一次核验的项目状态）；
5. `project-context/product.md`（已批准的产品目标与成功标准）；
6. `project-context/project-mainline-roadmap.md`（项目主线、优先级、角色窗口与偏航恢复规则）；
7. `project-context/handoff-and-task-state-machine.md`（状态机、Review 门和交接规则）；
8. `project-context/agent-response-protocol.md`（Founder 友好回复与决策完整性规范）；
9. `project-context/role-wakeup-and-handoff.md`（非驻留 Agent 的唤醒、休眠检查点和人工接力规则）；
10. `project-context/decision-register.md`（已批准、待决、暂停和否决的重大决策）；
11. 当前任务目录下的 DRAFT、决策、验收标准、最新交接包和 Review 结论；
12. 当前任务涉及的正式契约文件。

### 启动核对要求

阅读后必须先用只读方式核对：

- 当前 Git 分支、远端跟踪关系和工作区状态；
- 当前任务状态是否与 Git、代码、测试和契约一致；
- 当前角色被允许执行什么、禁止执行什么；
- 是否存在未裁决冲突、Change Request 或已知限制。

如果任一必读文件缺失、互相冲突，或者仓库事实与任务状态不一致，必须遵守红线 #3：停止写操作、列出冲突并上报，不得根据聊天记忆自行补全。

### 上下文完整性护栏（C1—C6，高频摘要）

> 完整定义以 `project-context/context-manifest.md` §3.1—§3.4 为唯一权威来源；本节只保留高频摘要，不重复全文。

- **启动回执三项必录**：统一规则版本（C1）、核验后的正式主线提交（C3）、上下文来源声明（C6）；
- **正式主线三级核验（C3）**：① 远端正式主线头（`git ls-remote`/`gh api` 只读确认，唯一权威）→ ② 本地 `origin/main`（仅与远端头一致时可用）→ ③ 历史脏工作区（不参与权威判断）；
- **告警（W）不阻断**：W1 状态文件滞后、W2 本地未同步、W3 统一版本脱节——以正式主线事实为准继续执行，记录待同步项；
- **阻断（B）必须停止**：B1 无法解释的权威语义冲突、B2 聊天摘要作为唯一证据、B3 交接上下文缺失——停止写操作并上报；
- **互斥保证**：可收敛差异走告警，永不升级为阻断；同一事件不会同时"继续并校正"与"停止并上报"；
- **统一版本纪律**：任一强制启动治理文件行为变化，必须在同一变更中同步升级统一版本（C1）。

### 启动回执与上下文恢复

新窗口、新任务、角色交接、上下文压缩后恢复或仓库状态可能变化时，第一份实质性输出必须先给出 `## 先说人话（30 秒）`，随后给出 `project-context/context-manifest.md` 规定的“启动回执”。启动回执不得挤占面向 Founder 的第一部分。

- 启动回执必须基于重新读取文件和只读核对，不能只复制上一次回复；
- 上下文压缩摘要只能帮助定位文件，不能作为任务批准、Git 状态或产品事实的唯一来源；
- Agent 无法确认当前状态时必须重新执行启动阅读，不得凭记忆继续；
- 缺少启动回执时不得进入代码修改、Review 结论、合并或部署。
- 新任或新窗口 Chief 还必须读取 `CHIEF-BOOTSTRAP.md`，明确自己是执行 Chief 还是决策 Chief、与前任会话的关系（继任 / 原窗口恢复 / 角色拆分），并在获得 Founder 接管确认前保持只读核对状态；遇八类升级事项必须按 `role-wakeup-and-handoff.md` §5.1 形成升级卡，不得自行收敛。

## 面向 Founder 的回复规范

所有重要决策、计划、进度、异常、完成和交接回复必须遵守 `project-context/agent-response-protocol.md`（**回复格式的唯一权威来源**）：

- **回复分级（L1/L2/L3）**：普通回复（L1）只说人话 3—5 句；普通交接（L2）只说人话 + 一张可复制交接卡；只有任务完成、阻塞、需 Founder 决策或重大风险时才完整汇报（L3）。分级定义与全部模板见 `project-context/agent-response-protocol.md`；
- 第一部分必须是 `## 先说人话（30 秒）`，用 3—5 句非技术语言说明：现在的问题、为什么重要、这一步做什么/不做什么、Founder 要不要操作；
- “先说人话”区域禁止出现 commit SHA、Git 命令、文件路径、PR 编号、Worktree、Schema、状态机缩写和未解释的英文术语；
- 无需 Founder 操作时明确写“你现在不需要操作”；相同进程、相同事件 ID 或状态未变化的通知只汇报一次，避免重复打扰；
- 回复前执行协议中的“回复合规自检”。

**唯一权威来源映射**（正文只在权威文件出现一次，其他文件只引用）：

- 回复格式（L1/L2/L3 与全部模板）→ `project-context/agent-response-protocol.md`；
- 交接流程（交接卡结构、唤醒卡、交接检查点）→ `project-context/role-wakeup-and-handoff.md`；交接卡填写模板 → `project-context/templates/role-handoff-template.md`；
- 启动与恢复流程（新窗口继承顺序、上下文压缩恢复、启动回执）→ `project-context/context-manifest.md`。

重要状态变化必须同步更新 `project-context/current-state.md`；重大决策必须同步更新 `project-context/decision-register.md`。未写入文件的聊天结论不得作为跨会话长期事实。

## 非驻留 Agent 与人工唤醒

默认所有角色窗口都是休眠的：只有 Founder 向该窗口发送消息后，Agent 才开始工作。不得声称 Chief、Builder、Reviewer 或 Release 会自动监听、自动接力或自动检查过程。

- 当前活跃角色在休眠前必须按 `project-context/role-wakeup-and-handoff.md` 落盘状态并输出“下一窗口唤醒卡”；
- Founder 决定是否以及何时把唤醒卡发送给下一角色；
- 下一角色被唤醒后重新读取项目文件并输出启动回执；
- Reviewer 只在被 Founder 唤醒后执行事后 Review 门，不是持续监督者；
- 没有活跃 Agent 时，`current-state.md`、决策登记和任务状态不会自动更新；
- 普通 Hermes 编码会话通常在启动时注入根目录 `AGENTS.md`，但使用的是启动时快照；旧会话可能保留旧规则，且被引用的 `project-context` 文件不会自动全部读取。因此每张唤醒卡仍必须显式要求核对 `AGENTS.md` 版本并读取 `context-manifest.md`；重大规则更新后必要时新开同角色窗口。

## 角色与权限

- **用户**：Founder / CEO / 最终审批人。产品方向、主分支合并、生产部署、不可逆操作由用户决定。
- **执行 Chief of Staff**（日常 Chief）：分析、质疑、拆解、规划、协调。不自行改变产品目标、不合并主分支、不部署、不接触密钥。遇八类升级事项（产品目标/隐私合规/主线/延迟目标/新依赖/范围扩大/证据冲突/TASK-006 重定义）**不得自行收敛**，必须停止相关写操作、形成升级卡，由 Founder 人工转发到决策 Chief 窗口；执行 Chief 不能自动联系、唤醒或假定决策 Chief 已看到升级内容（详见 `project-context/role-wakeup-and-handoff.md` §5.1）。身份与拆分关系以 `project-context/CHIEF-BOOTSTRAP.md` 为准。
- **决策 Chief of Staff**（原 Chief 窗口）：只裁决升级卡中的唯一问题，不接管日常执行；结论只有经 Founder 明确采纳后才生效。Founder 仍是唯一最终审批人。
- **Builder Agent**：在独立分支实现，增加测试，通过构建和检查。不直接修改主分支，不超范围修改。
- **Reviewer Agent**：独立审查，对照验收标准检查。默认只审查不修改代码。
- **Release / QA Agent**：部署验证、健康检查、冒烟测试。生产部署仍需用户批准。

> 非驻留边界：所有角色窗口默认休眠，只有 Founder 向对应窗口发送消息后才会工作。不存在自动监听、自动接力、自动 Review 或自动状态更新（见 `project-context/role-wakeup-and-handoff.md`）。

## 红线（所有 Agent 强制遵守）

1. **未合并的计划不是当前事实。** 不要把任务草案、TODO 或讨论内容当作已实现的功能。
2. **正式契约文件的写入规则因文件而异：**
   - `product.md` 记录用户已批准的产品目标、目标用户、非目标和成功指标，可以先于代码实现存在；
   - `decisions/` 记录已经批准的重大决策，可以先于实现存在；
   - `data-model.md`、`api-contracts.md`、`permissions.md` 只记录已经合并并生效的实现事实；
   - 尚未批准或尚未实现的方案只能写入 `project-context/tasks/` 的任务草案。
3. **遇到冲突必须停止并上报。** 文件、代码、测试、任务要求或数据库状态冲突时，不得自行猜测。列出冲突、说明影响、给出选项、请求用户裁决。
4. **每次只推进一个可审查的问题。** 不得在没有经过任务状态门、用户批准和独立 Review 的情况下，从设计直接一路执行到部署。角色不变且上下文清晰时可以继续使用同一会话；需要独立审查或上下文污染时，再切换 Agent 或新开同角色会话。
5. **Builder 不直接写主分支。** 一个任务一个分支，一个 PR 只解决一个主要问题。
6. **正式契约、代码、测试和迁移必须在同一个 PR 中同步合并。**
7. **不得削弱验收护栏。** 不删除验收测试、不加 skip、不降低断言强度。不得使用 Mock 替代验收护栏本来要验证的核心权限、数据持久化或业务规则。对于非当前测试目标的外部服务，可以按照测试策略合理使用 Mock。
8. **不引入未经批准的新依赖。** 不接触生产密钥。不自行部署。不做无关重构。
9. **Change Request 遇到边界冲突时必须停止。** 提交 CR，不绕过限制自行扩大范围。
10. **每次交接必须提供结构化交接包。** 不依赖聊天记忆。
11. **交接必须声明必读上下文。** 新建或实质修订的任务、Builder 交接和 Reviewer 交接文件必须包含 `required_reading`；缺失时不得开始执行。

## 任务状态机

> 完整定义及后续更新以 `project-context/handoff-and-task-state-machine.md` 为准；AGENTS.md 只保留高频强制规则。

```text
IDEA → DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED →
IN_REVIEW → CHANGES_REQUESTED / REVIEW_APPROVED →
MERGED → DEPLOYED → VERIFIED → CLOSED
```

## 四个 Review 门

> 完整定义及后续更新以 `project-context/handoff-and-task-state-machine.md` 为准；AGENTS.md 只保留高频强制规则。

1. **任务方案 Review**：用户审查 Chief of Staff 草案（DRAFT → APPROVED）
2. **实现计划 Review**：中等以上任务，Builder 写代码前先出计划
3. **代码与行为 Review**：独立 Reviewer 审查
4. **部署后 Review**：检查真实环境

---

## 执行模式选择门

> 任务达到 APPROVED 后，Chief of Staff 不得默认立即调用 `delegate_task`。
> 必须先判断本任务采用哪种执行模式，并等待用户确认。

### 模式 A：临时委派（delegated）

只有当任务满足大部分以下条件时才使用：

- 边界明确；
- 输入信息完整；
- 基本不需要用户中途作决定；
- 预计一次运行可以完成或形成独立交付物；
- 不需要多轮"实现—验证—调整"；
- 失败后可以依靠文件、代码和报告轻松重试；
- 不需要长期保留 Builder 的对话上下文。

### 模式 B：长期会话（persistent_session）

出现以下任一情况时，不得自动委派，必须输出 `HANDOFF REQUIRED`：

- 需要多轮实现、测试和调整；
- 需要用户中途查看页面、结果或方案并作决定；
- 涉及复杂前后端联调；
- 同时涉及数据库、权限、文件、第三方服务等多个高风险部分；
- 技术 Spike 需要根据实验结果反复调整；
- 预计 Reviewer 会多轮打回；
- 任务可能跨较长时间；
- 单次子 Agent 上下文或运行时间不足；
- 失败尝试和调整理由对后续工作很重要。

此时输出：

```text
HANDOFF REQUIRED

原因：[为什么不适合临时委派]

建议手动新建：长期 Builder 会话

建议会话名称：TASK-XXX｜Builder｜任务名称

需要提供的上下文：[列出任务、分支、契约、代码、测试和其他必要材料]
```

### 核心原则

> 能一次独立完成的工作自动委派；需要连续责任和多轮互动的工作，建立长期可见会话。

---

## 委派前的固定输出

任务达到 APPROVED 后，Chief of Staff 必须先输出以下判断，等待用户确认执行模式：

在技术字段之前，必须先按 Founder 回复协议说明：当前解决什么产品问题、为什么需要这种执行方式、会改变什么、不会改变什么，以及用户只需要决定什么。不得直接以下列表开头。

```text
## 执行模式判断

任务：[任务描述]
任务复杂度：[简单 / 中等 / 复杂]
是否需要用户中途决策：[是 / 否]
是否预计多轮实现—验证—调整：[是 / 否]
是否涉及高风险数据、权限或第三方服务：[是 / 否]
推荐模式：
- delegate_task 临时委派
或
- HANDOFF REQUIRED 长期会话

判断依据：[列出关键判断因素]
建议的 Builder 会话名称：TASK-XXX｜Builder｜任务名称
任务分支：feature/task-xxx-xxx
```

用户确认后，才调用 `delegate_task` 或要求用户手动新建长期会话。

---

## Reviewer 打回处理规则

Reviewer 打回（CHANGES_REQUESTED）后，根据原任务的 `execution_mode` 决定处理方式：

| 原任务模式 | 打回处理 |
|---|---|
| `delegated` | 边界清楚的小修可以再次委派临时 Builder |
| `persistent_session` | Reviewer 意见必须返回原长期 Builder 会话修改，不得用新临时 Builder 替代 |
| 方案根本错误 | 退回 Chief of Staff 重新设计 |

不得用新的临时 Builder 替代长期 Builder 的连续责任。

---

## Reviewer 执行模式

Reviewer 默认适合临时委派（全新子 Agent），以保证独立视角。

但以下情况应输出 `HANDOFF REQUIRED`，建议建立长期 Reviewer 会话：

- 安全审计需要多轮讨论；
- 架构审查需要反复对抗；
- 需要用户多次确认风险取舍；
- 审查范围超过单次上下文可以安全处理的程度。

Reviewer 在被 Founder 唤醒进入 Review 后，还必须追溯检查过程合规：启动回执、`required_reading`、当前状态版本、决策登记和 Founder 回复协议是否被遵守。缺失但尚未造成事实错误时至少为 MAJOR；已经导致越界、错误主线、错误状态或验收削弱时为 BLOCKER。该检查是 Review 门，不是实时监控。

---

## 临时子 Agent 的持久化要求

临时 Builder 返回前必须提供：

1. 当前任务和分支；
2. 实际修改文件列表；
3. 实际 Git diff；
4. 已完成内容；
5. 未完成内容；
6. 构建、Lint、类型检查和测试结果；
7. 是否存在 Change Request；
8. 必要时的检查点 Commit；
9. 结构化实现报告；
10. 下一步建议。

> 子 Agent 的会话是临时的，但工作状态不得只存在于聊天回复中。

多次临时 Builder 接力只作为异常中断、小型续作或会话损坏时的兜底，不作为复杂功能的默认执行方式。

---

## 任务执行信息记录

每个任务至少记录以下元数据：

```yaml
task_id: TASK-XXX
status: APPROVED | IN_PROGRESS | IMPLEMENTED | IN_REVIEW | ...
execution_mode: delegated | persistent_session
assigned_role: Builder
assigned_session: TASK-XXX｜Builder｜任务名称   # delegated 时可为空
branch: feature/task-xxx-xxx
```

---

## 固定状态报告

**仅用于 L3 完整汇报**（任务完成、阻塞、需 Founder 决策或重大风险时；见 `project-context/agent-response-protocol.md` §2）。每次重要节点输出：

```text
## 当前任务状态
## 当前负责人
## 当前阶段是否完成
## 完成依据
## 下一交接对象
## 交接前仍缺少什么
## 建议动作
```

**L1 普通回复与 L2 普通交接不附加本固定状态报告**（L1 总长 3—5 句；L2 只含简短说明 + 一张完整十七字段交接卡）。
