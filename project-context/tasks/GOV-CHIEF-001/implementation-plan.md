# GOV-CHIEF-001｜实现计划（v1.1；v1.0 已批准 + 首轮 Review 修复附录）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-CHIEF-001/draft.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-006/route-b-decision.md
task_id: GOV-CHIEF-001
status: IMPLEMENTED（首轮 Review 打回项已修复，待独立复审）
plan_version: v1.1（v1.0 Founder 2026-08-12 批准；v1.1 只纳入 Founder 已批准的首轮 Review 修复范围扩展）
execution_mode: delegated（Founder 2026-08-12 确认）
branch: codex/gov-chief-001
baseline_ref: origin/main
baseline_commit: 02efd2d337380e2fc331901f52fd6a02886be149
approval_stage: 已完成（2026-08-12）——Review 1 批准 DRAFT v1.0、执行模式 delegated 已确认、Review 2 批准本计划 v1.0
implementation_authority: task_scoped_only（GOV-CHIEF-001 任务级实施授权生效；原六个正式治理文件 + Founder 批准的两个限定同步文件 + 任务本地证据；提交、推送、创建 PR、唤醒 Reviewer、合并仍需 Founder 另行授权）
scope_extension_authority: Founder 2026-08-12 批准首轮 Review 打回修复增加 project-mainline-roadmap.md 与 tasks/TASK-006/route-b-decision.md；仅同步角色边界和治理顺序
```

## 1. 实施目标

在不触碰产品实现和其他任务状态的前提下，把执行 Chief / 决策 Chief 的职责、升级边界、升级卡和非驻留事实写入正式治理入口，并校准 PR #10 合并后的项目状态。

## 2. 前置条件

开始实施前必须同时满足（2026-08-12 状态：全部已满足）：

1. Founder 批准 `draft.md`；—— ✅ 已批准（2026-08-12）；
2. Founder 确认 `delegated` 执行模式；—— ✅ 已确认（2026-08-12）；
3. Founder 批准本实现计划；—— ✅ 已批准（2026-08-12）；
4. `origin/main` 仍可核验为预期基线；若已前进，先停止并重做只读基线审计；—— 实施前必须重新核验；
5. 当前分支无无关改动。

## 3. 文件级变更计划

| 文件 | 计划修改 | 不修改 |
|---|---|---|
| `AGENTS.md` | 将 Chief 权限拆为执行 Chief / 决策 Chief；引用八类升级条件、升级卡和非驻留边界 | 产品红线、状态机、Builder/Reviewer/Release 权限 |
| `project-context/CHIEF-BOOTSTRAP.md` | 记录 `operational-chief-2026-08-12-01`；原 Chief 转为决策 Chief；说明继任/拆分关系和历史归因 | 不声称新角色自动驻留，不硬编码窗口 ID |
| `project-context/context-manifest.md` | 角色专项阅读表增加执行/决策 Chief；启动回执增加当前 Chief 类型和升级路由确认 | 固定阅读顺序、恢复红线 |
| `project-context/role-wakeup-and-handoff.md` | 增加八类升级触发、固定升级卡、Founder 人工路由和“执行 Chief 不自动联系决策 Chief” | 既有 Builder/Reviewer/Release 唤醒机制 |
| `project-context/current-state.md` | 校准 `origin/main`、PR #10、治理同步、Chief 拆分、治理任务顺序和下一步 | TASK-006 保持 APPROVED；E004、GOV-002 状态不变 |
| `project-context/decision-register.md` | 新增 `D-GOV-CHIEF-001`，记录角色拆分、升级边界、非驻留事实和治理顺序 | 不改既有产品决策结论 |
| `project-context/tasks/GOV-CHIEF-001/implementation-report.md` | 实际 diff、验证结果、已知限制、状态与回滚信息 | 不提前生成虚假通过结论 |
| `project-context/tasks/GOV-CHIEF-001/handoff-builder-to-reviewer.md` | 自包含 Reviewer 交接包和 required_reading | 不代替 Reviewer 下结论 |
| `project-context/project-mainline-roadmap.md` | 拆分执行 / 决策 Chief；普通事项与八类升级路由引用 §5.1；同步 TASK-006 内部治理顺序 | 不改变产品任务顺序、产品目标或任何验收标准 |
| `project-context/tasks/TASK-006/route-b-decision.md` | 同步 GOV-CHIEF-001 → GOV-COMM-001 → GOV-002 → 本地 Gate Spike 顺序 | 不改变路线 B 技术结论、TASK-006 状态、E004 验收或产品实现授权 |
| `project-context/tasks/GOV-CHIEF-001/recovery-startup-receipt-2026-08-12.md` | 记录当前修复 Builder 的完整恢复阅读与只读 Git 核验 | 不伪造原 Builder 历史启动回执 |

原计划默认不修改 roadmap；首轮 Review 已证明存在冲突，Founder 已明确批准上述限定范围扩展。除此之外仍须提交新的 Change Request。

## 4. 单一来源映射

| 主题 | 正文权威 | 其他文件处理 |
|---|---|---|
| 当前 Chief 身份和拆分关系 | `CHIEF-BOOTSTRAP.md` | AGENTS / manifest 只保留职责摘要和入口引用 |
| 升级条件和升级卡流程 | `role-wakeup-and-handoff.md` | AGENTS 只保留强制引用 |
| 当前 Git、任务和下一步 | `current-state.md` | 其他文件不复制动态快照 |
| 正式角色拆分决策 | `decision-register.md` | Bootstrap 和 current-state 引用决策 ID |

## 5. 实施顺序

1. 重新核验 HEAD、`origin/main`、跟踪关系、工作区和 PR #10；
2. 修改 `CHIEF-BOOTSTRAP.md`，先确定稳定身份与历史归因；
3. 修改 `role-wakeup-and-handoff.md`，写入升级条件和升级卡；
4. 修改 `AGENTS.md` 与 `context-manifest.md`，建立强制入口与角色专项阅读；
5. 校准 `current-state.md`；
6. 更新 `decision-register.md`；
7. 运行验证矩阵；
8. 生成实现报告与 Reviewer 交接文件；
9. 停在 IMPLEMENTED，等待 Founder 手动唤醒独立 Reviewer。

## 6. 验证矩阵

| ID | 验证 | 通过条件 |
|---|---|---|
| V1 | Git 基线 | HEAD / `origin/main` 与实施时记录一致；无无关 diff |
| V2 | 角色一致性 | AGENTS、Bootstrap、manifest、role-wakeup、current-state、decision-register、roadmap 对执行 Chief / 决策 Chief 的职责无冲突 |
| V3 | 八类升级条件 | 八项完整、顺序和含义一致；普通技术细节明确不升级 |
| V4 | 升级卡 | 九个固定字段齐全，结尾逐字一致 |
| V5 | 非驻留边界 | 不出现自动监听、自动接力、自动 Review 等误导表述 |
| V6 | 状态校准 | `current-state.md` 记录 `02efd2d`、PR #10 已完成和正确下一步 |
| V7 | 任务保护 | TASK-006 仍为 APPROVED，E004 仍未解决，GOV-002 仍未开始 |
| V8 | 范围保护 | 只修改原批准治理范围、任务本地证据，以及 Founder 新批准的 roadmap / route-b-decision 限定字段；产品代码、GOV-COMM-001、GOV-002 与 TASK-006 状态/验收零差异 |
| V9 | 身份稳定性 | 不硬编码窗口 ID；Founder 人工路由可执行 |
| V10 | 过程合规 | required_reading、实现报告和 Reviewer 交接齐全；原始 Builder 历史启动回执若无法独立核验必须如实保留，当前修复 Builder 另落 recovery receipt，不得冒充历史证据 |

## 7. 回滚

本任务只有 Markdown 治理变更，无代码、数据或迁移。未合并时放弃分支即可；已合并后的回滚使用一个可审查的反向治理 PR，不手工删除历史，不使用 force push。

## 8. 风险和停止条件

- 实施前主线前进：停止，重新核验并更新计划基线；
- 权威事实仍冲突：停止，形成执行 Chief 升级卡；
- 需要修改本计划列明范围之外的文件：停止，提交 Change Request；
- 需要改变产品目标、TASK-006 或治理顺序：停止，交 Founder / 决策 Chief；
- 独立 Reviewer 发现状态越界、角色权限扩大或自动化误写：BLOCKER。

## 9. Commit / PR 边界

- 一个任务分支：`codex/gov-chief-001`；
- 一个主要问题：Chief 角色拆分与相应状态校准；
- 预计一个治理 commit，或少量按治理文件分组的 commit；
- 一个 PR 指向 `main`；
- 不包含产品代码、GOV-COMM-001 实施或 GOV-002；
- 提交、推送和建 PR 必须另获 Founder 授权。

## 10. 本计划的实施授权状态（2026-08-12 更新）

- 本计划已获 Founder Review 2 批准（2026-08-12），实现计划 Review 2 已完成；
- **实施授权生效**：可修改原六个正式治理文件、两个已批准的限定同步文件及任务本地证据并完成验证；
- **仍待 Founder 另行授权**：提交、推送、创建 PR、唤醒 Reviewer、合并或部署；
- 实施完成后必须停在 IMPLEMENTED，提供实现报告和 Reviewer 交接文件，不得自行宣布 Review 完成。
