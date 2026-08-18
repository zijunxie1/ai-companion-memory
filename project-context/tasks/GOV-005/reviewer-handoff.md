# GOV-005｜Reviewer Handoff（交接独立 Reviewer）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/agent-response-protocol.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-005/draft.md
  - project-context/tasks/GOV-005/implementation-plan.md
  - project-context/tasks/GOV-005/implementation-report.md
  - project-context/project-atlas.md
doc_type: Reviewer 交接包
task_id: GOV-005
status: IMPLEMENTED（Builder 声称实现完成，待独立 Review）
branch: codex/gov-005-project-atlas
worktree: E:/gov-005-project-atlas-worktree
interaction_stage: handoff
target_role: Reviewer（独立审查，默认不修改被审分支）
```

---

## 1. 本次唯一目标

审查 GOV-005「P1 项目全览地图与上下文恢复」的实施：新增 `project-context/project-atlas.md`（索引 + 大白话翻译层，非权威）并接入上下文恢复导航、同步状态/决策/统一版本，是否准确、无越界、无事实错误、无版本脱节。

## 2. 当前事实（基线）

- 正式主线 `origin/main @ ece45fb`（远端与本地一致，三级核验通过）；
- 统一治理版本 `2026-08-16.3` → 本分支升级 `2026-08-19.1`（未合并，待 Review）；
- GOV-COMM-004 已合并进 main（AGENTS.md 版本 16.3 生效）；
- TASK-006 保持 APPROVED；E004 未解决；R4 已完成两轮验证 + 收尾 + 独立证据审查但整体未通过（证据在 `codex/task-006-context-wiring` 分支 worktree，尚未全部进 main，标「待正式保存」）。

## 3. 已完成 / 未完成

**已完成**：
- `project-atlas.md` 13 节地图（覆盖 draft §4 全部 19 项）；
- `context-manifest.md` 两处导航引用；
- `AGENTS.md` 地图入口 + 版本升级；
- `current-state.md` 状态快照同步；
- `decision-register.md` 新增 D-GOV-005 决策卡；
- GOV-005 任务四件套（draft / implementation-plan / implementation-report / reviewer-handoff）。

**未完成**（本任务不涉及，如实保留）：E004 修复、TASK-007、TASK-005B、20 Case、完整 Bad Case、生产部署。

## 4. 已批准决策与理由

- Founder 2026-08-19 明确批准 GOV-005 按实施计划执行（见 D-GOV-005 决策卡、`tasks/GOV-005/draft.md`）；
- 批准范围：新增地图、接入导航、升级统一版本、commit/push/建 PR；
- 明确禁止：改产品代码/Dify/数据库/Schema/依赖/评测规则/冻结数据、启动 TASK-007/005B、部署、合并、唤醒其他角色。

## 5. 已否决方案

- 无。R1—R4 的历史否决属 TASK-006，不在本任务范围；地图仅如实翻译。

## 6. 允许 / 禁止（Reviewer）

**允许**：只读审查；按交接授权向 PR 提交 Review / Comment 作为完整审查证据（不修改被审分支）。
**禁止**：修改被审分支任何文件；把完整验收矩阵/日志倾倒到 Founder 聊天；代替 Founder 决定合并。

## 7. 验收标准（对照 draft §10）

1. 新 Agent 只读地图即可理解项目全貌和当前阶段；
2. 地图不替代正式权威文件；
3. 所有能力明确属于四种状态之一；
4. R4 最新结论准确；
5. TASK-006 不被写成问题已解决；
6. 20 Case 不被降级；
7. 两套前端关系准确；
8. 设计母版和 R4 本地证据的「待正式保存」风险明确；
9. 正式三层 Demo 与作品集叙事层没有混淆；
10. TASK-007 与后续路线清楚；
11. 回复协议未被无关修改；
12. 若恢复阅读规则改变，治理版本已完整同步；
13. 没有产品代码、实验、依赖或冻结证据变化；
14. PR 只解决 GOV-005 一个问题。

## 8. 停止条件（Reviewer）

- 发现无法解释的权威冲突、越界修改、验收削弱或版本脱节 → CHANGES_REQUESTED 或 BLOCKER；
- 下一步（合并/返修）仍待 Founder 决定时，只讲明白并请求决定，不提前出卡。

## 9. 证据位置

- 地图：`project-context/project-atlas.md`
- 计划与报告：`project-context/tasks/GOV-005/`
- R4 证据：`E:/task-006-context-wiring-worktree/project-context/tasks/TASK-006/spike-r4-*.md`
- 设计母版审查：`E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/REVIEW-REPORT-RECHECK.md`

## 10. 首次回复要求

先完成内部启动核验，再按 `agent-response-protocol.md` 向 Founder 讲人话（3—5 句：能否继续、真风险、必须修什么、小瑕疵、建议怎么选）；完整审查报告提交到 PR Review / Comment；只有 Founder 明确要求时才展示启动回执。
