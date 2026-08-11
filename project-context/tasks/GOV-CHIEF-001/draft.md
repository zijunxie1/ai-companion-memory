# GOV-CHIEF-001｜执行 Chief / 决策 Chief 角色拆分与状态校准（DRAFT v1.0）

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
doc_type: 任务 DRAFT（Governance；Founder 2026-08-12 三项审批已通过；首轮 Review 打回范围扩展已获 Founder 批准并修复；独立复审 REVIEW_APPROVED）
task_id: GOV-CHIEF-001
status: REVIEW_APPROVED（独立复审通过，待 Founder 合并裁决；PR #11 已创建未合并）
draft_version: v1.0（2026-08-12；Founder 三项审批：Review 1 批准 DRAFT、同意 delegated、Review 2 批准实现计划 v1.0）
draft_date: 2026-08-12
owner: Operational Chief
branch: codex/gov-chief-001
worktree: C:/Users/admin/.codex/worktrees/e546/正式作品
baseline_ref: origin/main
baseline_commit: 02efd2d337380e2fc331901f52fd6a02886be149
execution_authority: task_scoped_only（GOV-CHIEF-001 任务级实施授权，2026-08-12 Founder 三项审批；提交、推送、创建 PR、唤醒 Reviewer、合并仍需 Founder 另行授权；CHIEF-BOOTSTRAP.md 不得写为通用授权）
authorization_basis: Founder 2026-08-12 明确批准 GOV-CHIEF-001 DRAFT v1.0、同意 delegated、批准实现计划 v1.0，并确认三项审批有效
scope_extension_authority: Founder 2026-08-12 在首轮 Reviewer CHANGES_REQUESTED 后明确要求“一起修复掉”；批准增加 project-mainline-roadmap.md 与 tasks/TASK-006/route-b-decision.md，仅同步角色边界和治理顺序
formal_effect: approved_2026-08-12（正式生效以合入正式主线为准）
```

## 1. 先说明这项任务解决什么

项目目前的治理文件只认识一个 Chief，但 Founder 已在聊天中把职责拆成两个层级：执行 Chief 负责日常推进，原 Chief 窗口只处理无法按既有决策收敛的重大裁决。

如果不落盘，后续 Builder、Reviewer、Release 或新 Chief 窗口仍会按旧的单一 Chief 规则工作；同时 `current-state.md` 还保留着 PR #10 合并前的旧主线和旧下一步，容易让新窗口重复已经完成的治理工作。

本任务只把角色边界和已经发生的 Git / 项目状态校准为可审查的治理事实，不改变产品目标、产品代码或 TASK-006 状态。

## 2. 已核验事实

| 事实 | 当前证据 |
|---|---|
| Founder 已在聊天中授权执行 Chief / 决策 Chief 拆分 | 当前 Founder 对话；尚未进入正式主线，不能单独作为跨会话长期事实 |
| 磁盘仍为单一 Chief 定义 | `AGENTS.md`、`CHIEF-BOOTSTRAP.md`、`context-manifest.md`、`role-wakeup-and-handoff.md` |
| 正式主线为 `02efd2d` | 本地 `origin/main`、当前 HEAD 与 GitHub PR #10 merge commit 一致 |
| PR #10 已 Rebase 合并 | GitHub PR #10：MERGED，2026-08-12 00:34:35（Asia/Shanghai） |
| `current-state.md` 仍记录旧主线 `0762a17` | `project-context/current-state.md` Git 事实表 |
| `current-state.md` 仍把四文件同步列为下一步 | `project-context/current-state.md` 当前建议动作 |
| TASK-006 保持 APPROVED，E004 未解决 | TASK-006 `draft.md`、`route-b-decision.md`、`decision-register.md` |
| GOV-COMM-001 已获 Founder Review 1 与 delegated 方向批准，但 Review 2 暂缓 | Founder 2026-08-12 裁决；规划文件仍只在 `codex/gov-comm-001` 工作区，未合入正式主线 |
| 治理顺序已由 Founder 在聊天中明确 | GOV-CHIEF-001 → GOV-COMM-001 → GOV-002；待本任务正式记录 |

## 3. 角色拆分

### 3.1 执行 Chief（Operational Chief）

建议实例名：`operational-chief-2026-08-12-01`。

负责日常 Chief 工作：

1. 只读核验磁盘、Git、任务、契约和证据；
2. 起草并收敛任务草案、验收标准和 Change Request；
3. 判断 `delegated` 或 `persistent_session` 执行模式并制作交接卡；
4. 在不改变产品目标的前提下拆解已批准方向；
5. 列出应更新的状态与决策字段；实际写入仍受任务权限和 Founder 授权约束；
6. 安排 Builder、Reviewer、Release 的人工唤醒顺序；
7. 普通技术细节由执行 Chief 按现有正式决策自行收敛，不升级。

执行 Chief 不得：改变产品目标、重排主线、合并主分支、部署、接触密钥，或自动联系其他休眠角色。

### 3.2 决策 Chief（Decision Chief）

由原 Chief 窗口承担。保留高一级裁决职责，只处理执行 Chief 无法根据正式决策、契约和证据自行收敛的问题。

- Founder 负责把“决策 Chief 升级卡”复制到原窗口；
- 执行 Chief不能自动联系、唤醒或假定决策 Chief 已看到升级内容；
- 不在治理文件中硬编码聊天窗口 ID。窗口 ID 可能变化，稳定识别方式为“角色 + Founder 人工路由”；
- 决策 Chief 只裁决升级卡中的唯一问题，不接管日常执行工作。

## 4. 必须升级的八类事项

执行 Chief 遇到以下任一情况时必须停止相关写操作，形成升级卡，不得自行收敛：

1. 改变产品目标、成功指标或用户承诺；
2. 对敏感数据出境、法律依据或隐私合规作实质裁决；
3. 重排主线，或绕过 TASK-006 启动 TASK-007 / TASK-005B；
4. 接受明显增加的用户等待时间或改变延迟目标；
5. 引入新的外部服务、关键依赖、架构、Schema 或权限边界；
6. 扩大任务范围或削弱验收护栏；
7. 穷尽只读核验后仍存在互相冲突的权威证据；
8. 暂停、放弃或重新定义 TASK-006。

普通实现细节、文件组织、测试补充、既有契约内的小型技术选择不得升级。

## 5. 决策 Chief 升级卡固定结构

每张升级卡必须只包含一个待裁决问题，并固定包含：

1. 唯一需要裁决的问题；
2. 对用户的影响；
3. 已验证事实与证据位置；
4. 未知或冲突；
5. 最多三个互斥选项；
6. 执行 Chief 的明确推荐及不利后果；
7. 不裁决会阻塞什么；
8. 可复制的 Founder 裁决语句；
9. 固定结尾：`请把本卡发送到原决策 Chief 窗口。`

## 6. 非驻留事实

执行 Chief、决策 Chief、Builder、Reviewer、Release 均为非驻留窗口：

- 只有 Founder 向对应任务/窗口发送消息后，该角色才开始工作；
- 角色之间不能自动联系、自动唤醒、自动 Review 或自动接力；
- 文件只用于恢复上下文，不会主动执行其中的规则；
- 任何回复不得把“规则已写入文件”表述为“系统已经自动执行规则”。

## 7. `current-state.md` 事实校准

实施时只校准已经发生或已被 Founder 明确裁决的事实：

| 字段 | 当前旧值 | 计划校准值 |
|---|---|---|
| `origin/main` | `0762a17` | `02efd2d`，含 PR #10 合并 |
| 四文件治理同步 | 仍列为下一步 | 已完成，PR #10 于 2026-08-12 00:34 合并 |
| Chief 角色 | 单一 Chief 实例 | 执行 Chief + 决策 Chief 的职责拆分 |
| 治理顺序 | 未记录当前裁决 | GOV-CHIEF-001 → GOV-COMM-001 → GOV-002 |
| 下一步 | 完成四文件治理同步 | GOV-CHIEF-001 独立 Review / Founder 合并；之后恢复 GOV-COMM-001 Review 2 |
| TASK-006 | APPROVED | 保持 APPROVED；E004 仍未解决 |
| GOV-002 | 未开始 | 保持未开始；待 GOV-COMM-001 完成后单独起草 |

## 8. 目标与非目标

### 8.1 目标

- 正式定义执行 Chief / 决策 Chief 的职责边界；
- 正式定义八类升级条件和固定升级卡；
- 重申所有角色非驻留、由 Founder 人工唤醒；
- 校准 PR #10 合并后的主线与下一步；
- 记录治理顺序，不改变产品任务顺序。

### 8.2 非目标

- 不修改产品代码、测试、数据库、Schema 或正式产品契约；
- 不修改 TASK-006 状态或宣称 E004 已解决；
- 不设计或实现 GOV-002；
- 不实施 GOV-COMM-001 的沟通模板；
- 不启动 TASK-007 / TASK-005B；
- 不硬编码聊天窗口 ID；
- 不自动唤醒任何其他角色；
- 本规划阶段不提交、推送、创建 PR、合并或部署。

## 9. 候选实施范围

任务方案与实现计划均获批后的原始范围为：

1. `AGENTS.md`；
2. `project-context/CHIEF-BOOTSTRAP.md`；
3. `project-context/context-manifest.md`；
4. `project-context/role-wakeup-and-handoff.md`；
5. `project-context/current-state.md`；
6. `project-context/decision-register.md`；
7. `project-context/tasks/GOV-CHIEF-001/` 下的任务、实施、Review 交接和证据文件。

首轮独立 Review 确认仅靠引用无法消除角色表和治理顺序冲突。Founder 已于 2026-08-12 批准该 Change Request，额外允许：

8. `project-context/project-mainline-roadmap.md`：只同步执行 / 决策 Chief 边界与 TASK-006 内部治理顺序；
9. `project-context/tasks/TASK-006/route-b-decision.md`：只同步同一内部治理顺序，并明确不改变路线 B、TASK-006 状态或验收。

该范围扩展不授权修改产品目标、产品任务顺序、路线 B 技术结论、TASK-006 状态、E004 验收标准或产品代码。

## 10. 验收标准

1. 六个治理文件对执行 Chief、决策 Chief、八类升级条件、升级卡和非驻留事实的引用一致；
2. `CHIEF-BOOTSTRAP.md` 明确原 Chief 转为决策 Chief、新实例为执行 Chief，以及聊天授权与正式落盘的区别；
3. 不写入易失效的窗口 ID；Founder 人工路由边界明确；
4. `current-state.md` 与 Git 事实一致：`origin/main = 02efd2d`、PR #10 已完成；
5. TASK-006 保持 APPROVED，E004 未解决；GOV-002 保持未开始；
6. 治理顺序记录为 GOV-CHIEF-001 → GOV-COMM-001 → GOV-002，不改变产品任务顺序；
7. 未混入 GOV-COMM-001 模板实现、GOV-002 设计或产品代码；
8. 一个分支、一个 PR、一个主要治理问题；
9. Builder 完成后停在 IMPLEMENTED，并提供实现报告和 Reviewer 交接包；
10. 独立 Reviewer 核对事实准确性、角色权限、状态未越界和是否误写自动化；
11. 缺少 required_reading 或启动回执至少为 MAJOR；错误状态、越权或削弱护栏为 BLOCKER。

## 11. 风险、停止条件与 Change Request

### 风险

- 角色拆分写成自动工作机制，造成 Founder 误以为有人持续监听；
- 把聊天授权提前写成已经合并生效；
- 状态校准时误改 TASK-006 或产品主线；
- 与 GOV-COMM-001 的沟通模板混入同一 PR。

### 停止条件

满足任一条件立即停止并上报：

1. `origin/main` 在实施前前进，当前基线不再有效；
2. 必读文件或 Git 事实存在无法只读收敛的冲突；
3. 需要修改产品目标、任务状态、产品代码或产品契约；
4. 需要把 GOV-COMM-001 或 GOV-002 内容塞入本 PR；
5. 需要扩大到上述已批准的九项范围之外的文件。

### Change Request 条件

- 需要改变八类升级条件或执行/决策 Chief 的权限边界；
- 需要新增外部服务、依赖、Schema 或权限；
- 需要改变治理任务或产品任务顺序；
- 需要修改上述已批准范围之外的文件。

## 12. 执行模式预判

```text
任务复杂度：中等（纯治理文档，但涉及跨文件一致性和权威状态校准）
是否需要实施中途决策：否
是否预计多轮实现—验证—调整：否
是否涉及数据、权限或第三方服务：否
推荐模式：delegated 临时委派 Governance Builder
原因：边界明确、没有产品代码、可通过 diff 和独立 Review 验证
```

执行模式必须在 Review 1 通过后由 Founder 单独确认；实现计划必须再经过 Review 2。

## 13. 当前授权与下一步（2026-08-12 三项审批后）

**已授权（Founder 2026-08-12）**：

- ✅ 批准 GOV-CHIEF-001 DRAFT v1.0（任务方案 Review 1）；
- ✅ 同意 delegated 临时 Governance Builder（执行模式）；
- ✅ 批准实现计划 v1.0（实现计划 Review 2）；
- ✅ 授权更新三份规划文件记录审批（本文件、implementation-plan.md、handoff-chief-to-founder.md）；
- ✅ 实施授权生效：可按实现计划修改六个正式治理文件并完成验证。

**仍待 Founder 另行授权**：提交、推送、创建 PR、唤醒 Reviewer、合并或部署。

**首轮 Review 后补充授权**：Founder 已批准增加 `project-mainline-roadmap.md` 与 `tasks/TASK-006/route-b-decision.md`，但只允许同步角色边界和治理顺序；原产品边界全部保持。

**当前下一步**：打回修复完成后停在 IMPLEMENTED → Founder 决定何时发送更新后的 Reviewer 交接卡 → 独立复审 → Founder 合并裁决。
