# GOV-CHIEF-001｜执行 Chief → Founder 规划审批交接（历史规划快照）

> **历史快照说明**：本文件记录 2026-08-12 实施前的规划与三项审批，不再作为当前执行状态入口。当前任务状态以 `project-context/current-state.md` 为准，实际实施与验证以 `project-context/tasks/GOV-CHIEF-001/implementation-report.md` 为准。

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-CHIEF-001/draft.md
  - project-context/tasks/GOV-CHIEF-001/implementation-plan.md
task_id: GOV-CHIEF-001
document_status: HISTORICAL_PLANNING_SNAPSHOT
task_status_reference: project-context/current-state.md
handoff_from: Operational Chief
handoff_to: Founder
handoff_purpose: 记录 2026-08-12 实施前的规划审批；不用于判断当前是否已实施、Review 或合并
```

## 1. 项目位置

项目产品主线仍停在 TASK-006：E004 无关召回没有解决，TASK-006 保持 APPROVED。当前插入的是前置治理任务，用来先统一 Chief 角色边界和权威状态，之后才恢复 GOV-COMM-001，再进入 GOV-002。

## 2. 当时已完成（实施前历史快照）

- 在独立 Codex Worktree 中从 `origin/main @ 02efd2d` 创建 `codex/gov-chief-001`；
- 只读核验 PR #10 已合并；
- 新建任务 DRAFT v1.0；
- 新建实现计划 v1.0；
- 当时尚未修改正式治理文件；当前实际变更见 `implementation-report.md`；
- 未提交、推送、建 PR、唤醒 Reviewer、合并或部署。

## 3. 为什么这样设计

- 日常事项由执行 Chief 收敛，避免每个技术细节都打扰 Founder 或原 Chief；
- 八类重大事项保留给决策 Chief，防止执行窗口越权；
- Founder 负责人工复制升级卡，符合所有角色非驻留的真实运行方式；
- 不持久化具体窗口 ID，避免窗口变化后规则失效；
- 角色治理和沟通模板分成两个 PR，满足一个 PR 一个主要问题。

## 4. 当时仍未发生（不得作为当前状态读取）

- 角色拆分尚未进入正式主线；
- 当时 `current-state.md` 尚未校准；当前状态见该文件最新内容；
- GOV-COMM-001 仍在等待本任务合并；
- GOV-002 未开始；
- TASK-006 产品问题没有变化。

## 5. Founder 审批卡

```text
GOV-CHIEF-001｜规划审批

现在要批准的是角色治理方案，不是产品功能。

【动作 1｜任务方案 Review 1】
是否批准 draft.md v1.0：
- 执行 Chief 负责日常工作；
- 决策 Chief 只处理八类重大升级；
- Founder 人工转发固定升级卡；
- 所有角色继续保持非驻留；
- 校准 PR #10 合并后的项目状态；
- TASK-006 保持 APPROVED，E004 仍未解决。

【动作 2｜执行模式】
是否同意使用 delegated 临时 Governance Builder？

【动作 3｜实现计划 Review 2】
是否批准 implementation-plan.md v1.0，只修改六个正式治理文件，
并生成实现报告与 Reviewer 交接文件？

建议回复：
批准 GOV-CHIEF-001 DRAFT v1.0；同意 delegated；批准实现计划 v1.0。

批准后仍只授权 Builder 修改已列明的治理文件并完成验证；
提交、推送、创建 PR 和唤醒 Reviewer 仍需 Founder 后续单独授权。
```

## 6. 当时规划的下一步（已被后续实施与 Review 进度取代）

- ✅ 三项审批已完成：Review 1 批准 DRAFT v1.0；执行模式 delegated 已同意；Review 2 批准实现计划 v1.0；
- ✅ 当时实施授权生效；后续实际实施、首轮 Review 与修复进度见 `implementation-report.md` 和 `current-state.md`；
- 提交、推送、创建 PR、再次唤醒 Reviewer、合并或部署仍须按最新 Founder 授权执行；
- 本历史文件不再给出当前下一步。
