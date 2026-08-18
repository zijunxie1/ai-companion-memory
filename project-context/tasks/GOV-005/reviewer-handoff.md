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
status: MERGED（PR #30 @ `b2b955b`；复审 REVIEW_APPROVED 后已合并）
branch: codex/gov-005-project-atlas
worktree: E:/gov-005-project-atlas-worktree
interaction_stage: handoff
target_role: Reviewer（独立审查，默认不修改被审分支）
```

---

## 1. 目标角色

原 GOV-005 独立 Reviewer（同一 Reviewer 复审，保持独立审查视角，不修改被审分支）。

## 2. 项目位置

仓库 `E:\正式作品`；本任务独立 Worktree `E:/gov-005-project-atlas-worktree`；分支 `codex/gov-005-project-atlas`；PR #30。

## 3. 本次唯一目标

审查 GOV-005「P1 项目全览地图与上下文恢复」的实施：新增 `project-context/project-atlas.md`（索引 + 大白话翻译层，非权威）并接入上下文恢复导航、同步状态/决策/统一版本，是否准确、无越界、无事实错误、无版本脱节。

## 4. 为什么做

项目经过一年多推进，任务、决策、失败路线大量累积，但没有一张"无技术背景读者 + 新窗口"都能一眼看懂全貌的地图，每次换窗口/压缩恢复都要重翻技术文件，易看错状态。地图作为「导读 + 大白话翻译层」，接入启动/恢复导航，减少误判；但不替代任何权威文件。

## 5. 当前事实（基线）

- 正式主线 `origin/main @ ece45fb`（远端与本地一致，三级核验通过）；
- 统一治理版本 `2026-08-16.3` → 本分支升级 `2026-08-19.1`（未合并，待 Review）；
- GOV-COMM-004 已合并进 main（PR #28 @ `517bc80`，2026-08-16）；
- TASK-006 保持 APPROVED；E004 未解决；R4 已完成两轮验证 + 收尾 + 独立证据审查但整体未通过（证据在 `codex/task-006-context-wiring` 分支 worktree，尚未全部进 main，标「待正式保存」）。

## 6. 已完成和未完成

**已完成**：
- `project-atlas.md` 13 节地图（覆盖 draft §4 全部 19 项）；
- `context-manifest.md` 两处导航引用（§1 新窗口继承 + §4.1 压缩恢复）；
- `AGENTS.md` 地图入口 + 版本升级；
- `current-state.md` 状态快照同步（含 GOV-COMM-004 已合并、GOV-005 状态对齐）；
- `decision-register.md` 新增 D-GOV-005 决策卡 + 修正 D-GOV-COMM-004 执行状态；
- GOV-005 任务四件套（draft / implementation-plan / implementation-report / reviewer-handoff）。

**未完成**（本任务不涉及，如实保留）：E004 修复、TASK-007、TASK-005B、20 Case、完整 Bad Case、生产部署。

## 7. 已批准决策

- Founder 2026-08-19 明确批准 GOV-005 按实施计划执行（见 D-GOV-005 决策卡、`tasks/GOV-005/draft.md`）；
- 批准范围：新增地图、接入导航、升级统一版本、commit/push/建 PR；
- 明确禁止：改产品代码/Dify/数据库/Schema/依赖/评测规则/冻结数据、启动 TASK-007/005B、部署、合并、唤醒其他角色。

## 8. 决策理由

项目治理长期反复修"谁以什么事实继续工作"的基础问题；全览地图是压缩恢复与角色交接的第一道防误判护栏，属治理任务而非产品任务，故不触碰产品、评测或实验证据。

## 9. 已否决方案

- 无（本任务内）。R1—R4 的历史否决属 TASK-006，地图仅如实翻译，不在本任务重新裁决。

## 10. required_reading

见文件头部 YAML `required_reading`（14 项）。

## 11. 允许执行

只读审查；按交接授权向 PR 提交 Review / Comment 作为完整审查证据（不修改被审分支）。

## 12. 禁止执行

修改被审分支任何文件；把完整验收矩阵/日志倾倒到 Founder 聊天；代替 Founder 决定合并；自行唤醒其他角色。

## 13. 具体步骤

1. 完成内部启动核验（三项必录：统一版本 C1 / 主线提交 C3 / 上下文来源 C6）；
2. 读取 required_reading + PR #30 diff；
3. 逐项对照 draft §10 验收标准（14 项）；
4. 交叉核验地图事实与 `current-state.md`、`decision-register.md`、Git、R4 证据、设计母版审查证据；
5. 检查范围合规（无产品代码/依赖/Schema/评测/冻结数据变化）、版本一致性；
6. 输出明确结论（REVIEW_APPROVED / CHANGES_REQUESTED，含 BLOCKER/MAJOR/MINOR 分级）；
7. 完整报告提交 PR Review / Comment；Founder 聊天只给 3—5 句大白话结论。

## 14. 验收标准

1. 新 Agent 只读地图即可理解项目全貌和当前阶段；
2. 地图不替代正式权威文件；
3. 所有能力明确属于四种状态之一；
4. R4 最新结论准确（含"内部信号 ≠ 产品效果"口径）；
5. TASK-006 不被写成问题已解决；
6. 20 Case 不被降级（归入正式未完成缺口，非"未来设想"）；
7. 两套前端关系准确；
8. 设计母版和 R4 本地证据的「待正式保存」风险明确；
9. 三层 Demo 蓝图与作品集叙事层不混淆、实现状态逐项标注；
10. TASK-007 与后续路线清楚（正式任务不写成设想）；
11. 回复协议未被无关修改；
12. 恢复阅读规则改变时治理版本已完整同步；
13. 没有产品代码、实验、依赖或冻结证据变化；
14. PR 只解决 GOV-005 一个问题。

## 15. 停止条件

发现无法解释的权威冲突、越界修改、验收削弱或版本脱节 → CHANGES_REQUESTED 或 BLOCKER；下一步（合并/返修）仍待 Founder 决定时，只讲明白并请求决定，不提前出卡。

## 16. 完成后必须返回的材料

- 审查结论（REVIEW_APPROVED / CHANGES_REQUESTED）+ BLOCKER/MAJOR/MINOR 分级；
- 14 项验收逐项结果；
- 范围与安全结论、版本一致性结论、测试充分性；
- 剩余风险与是否建议合并；
- 完整报告提交到 PR #30 的 Review / Comment。

## 17. 下一张交接卡要求

- 若 REVIEW_APPROVED：不自动合并，下一步由 Founder 裁决是否合并（此时不出卡）；
- 若 CHANGES_REQUESTED：交回原 GOV-005 Builder 修复，附问题清单与证据位置。

---

## 证据位置

- 地图：`project-context/project-atlas.md`
- 计划与报告：`project-context/tasks/GOV-005/`
- R4 证据：`E:/task-006-context-wiring-worktree/project-context/tasks/TASK-006/spike-r4-*.md`
- 设计母版审查：`E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/REVIEW-REPORT-RECHECK.md`

## 首次回复要求

先完成内部启动核验，再按 `agent-response-protocol.md` 向 Founder 讲人话（3—5 句：能否继续、真风险、必须修什么、小瑕疵、建议怎么选）；完整审查报告提交到 PR Review / Comment；只有 Founder 明确要求时才展示启动回执。
