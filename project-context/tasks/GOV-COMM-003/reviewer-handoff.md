# GOV-COMM-003｜Builder → Reviewer 交接文件（reviewer-handoff.md）

> 状态：IMPLEMENTED，待独立 Review。本文件为自包含 Reviewer 交接包；Founder 决定何时发送给独立 Reviewer。

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
  - project-context/templates/role-handoff-template.md
  - project-context/tasks/GOV-COMM-003/draft.md
  - project-context/tasks/GOV-COMM-003/validation-scenarios.md
  - project-context/tasks/GOV-COMM-003/implementation-report.md
task_id: GOV-COMM-003
status: IMPLEMENTED（待独立 Review）
handoff_from: Governance Builder
handoff_to: 独立 Reviewer
branch: codex/gov-founder-adaptive-response
baseline_commit: df5c2d9
interaction_stage: execution
founder_approval_date: 2026-08-15
review_delivery_channel: 对应 PR（允许向 PR 提交 Review / Comment 作为完整审查证据）
```

## 1. 目标角色

独立 Reviewer（全新窗口，独立视角；不得沿用 Builder 结论）。

## 2. 项目位置

P1「Alice Memory 留存优化」作品集仓库（`github.com/zijunxie1/ai-companion-memory`，默认分支 `main`）。TASK-006（E004 无关召回）保持 APPROVED；当前执行 TASK-006 内部前置治理的第三项 GOV-COMM-003（GOV-COMM-001 沟通规范、GOV-COMM-002 对话/交接分层均已合并）。

## 3. 本次唯一目标

审查 GOV-COMM-003「Founder 自适应回复与长方案审批翻译」的治理文件变更：复杂方案审批决策翻译、密度指导非机械格式、角色内容重点、启动回执紧凑，是否落盘正确、是否越界、是否建立与 L1/L2/L3 冲突的第二套分级。

## 4. 为什么做

真实复现：`20260815_085148_c8e1b6` 加载 2026-08-15.3 规则后，面对 336 行 R4 草案仍用浓缩技术话要求整体批准、没讲清代价/风险/未知、回执后重复技术摘要。证明现有规则缺「复杂审批决策翻译」强约束；但修复不是把所有回复压成 3—5 句。

## 5. 当前事实（已核验）

- origin/main = `df5c2d9`（GOV-COMM-002 PR #26 已 Rebase 合并，2026-08-15）；统一规则版本 2026-08-15.3；
- 本 PR 分支 `codex/gov-founder-adaptive-response`，独立 Worktree `E:/gov-founder-adaptive-response-worktree`，从 `df5c2d9` 创建；
- 修改：4 个治理文件（agent-response-protocol / context-manifest / current-state / decision-register）+ 新建 tasks/GOV-COMM-003/（4 文件）；AGENTS.md 版本升级为受保护写入，待 Founder 批准（同一 commit）；
- 零产品代码、零数据库、零评测、零 TASK-006 R4 草案/实验证据改动；
- 未修改 role-wakeup-and-handoff.md 与 templates/role-handoff-template.md（未发现真实重复或冲突）。

## 6. 已完成和未完成

已完成：agent-response-protocol.md（§1 密度指导非机械格式、§1.3 内容完整性、§1.5 决策翻译、§4 角色重点、§7 规则 8、§9 自检）、context-manifest.md（§3 回执紧凑）、current-state.md（基线 df5c2d9、GOV-COMM-002 MERGED、GOV-COMM-003 行）、decision-register.md（D-GOV-COMM-003）、tasks/GOV-COMM-003/ 4 文件。

未完成：AGENTS.md 版本升级（待 Founder 批准弹窗）；提交/推送/PR（待 AGENTS.md 完成后同一 commit）；独立 Review（本窗口职责之外）；合并（Founder 裁决）。

## 7. 已批准决策

- D-GOV-COMM-003（APPROVED，2026-08-15）：先修正 Hermes 回复规范再恢复 TASK-006 R4，无需二次确认；
- D-GOV-COMM-002（APPROVED → MERGED，PR #26）：Founder 对话/Agent 交接分层（本任务的上一治理任务，本任务在其基础上补决策翻译）；
- D-T006-R4-DIRECTION（APPROVED 仅方向与起草）：R4 上下文记忆可用性判断，D-1/D-3/D-4 待审查，D-2/D-5 未裁决。

## 8. 决策理由

失败场景证明「密度自适应」规则不足以触发复杂审批的决策翻译；需要明确的七项内容完整性 + 禁止审批话术。§1.5 作为 L3 细化（非新分级），不破坏已有 L1/L2/L3。

## 9. 已否决方案

- 把所有回复强制压缩为 3—5 句（否决：复杂审批会丢失取舍信息，Founder 无法安全决定）；
- 新建与 L1/L2/L3 并列的第二套分级系统（否决：会造成规则冲突，任务明确禁止）；
- 修改 role-wakeup / templates 统一措辞（未发现真实重复或冲突，不动）。

## 10. required_reading

见文件头部 YAML。核心必读：`agent-response-protocol.md`（§1.3/§1.5/§4）、`context-manifest.md`（§3）、`AGENTS.md`（版本 + 决策翻译高频规则）、`draft.md`（验收标准 11 项）、`validation-scenarios.md`（A—H 八类场景）。

## 11. 允许执行

只读审查：读取 required_reading、核对 diff、对照验收标准与八类场景；允许且要求向对应 PR 提交 Review / Comment 作为完整审查证据。

## 12. 禁止执行

不修改任何文件；不合并 PR；不启动 R4；不读取 holdout；不扩大审查范围到其他任务。

## 13. 具体步骤

1. 只读 Git 核验（远端 main 头 / PR head / 分支 / diff 文件清单）；
2. 对照 draft.md §验收标准 11 项逐项检查；
3. 对照 validation-scenarios.md A—H 八类场景走查规则覆盖；
4. 重点复验：§1.5 七项决策翻译是否完整且不强制七个标题；禁止审批话术是否落盘；§1 密度指导是否与 L1 的 3—5 句一致（不冲突）；启动回执紧凑是否削弱核验；旧规则冲突表述是否清零（current-state GOV-COMM-002 状态）；
5. 输出 REVIEW_APPROVED / CHANGES_REQUESTED（附逐项依据）。

## 14. 验收标准

见 draft.md §验收标准 11 项。重点：简单未过度展开、复杂未过度压缩、Founder 不读技术文件也能决定、技术交接完整、不机械列栏目、不提前出卡、压缩恢复仍有效、旧规则冲突表述清零、版本升级、零越界、不建第二套分级。

## 15. 停止条件

- 发现产品代码/Schema/评测/TASK-006 R4 草案被改动 → BLOCKER；
- 发现建立了与 L1/L2/L3 冲突的第二套分级 → BLOCKER；
- 发现 §1.5 强制七个标题（违反"内容完整性而非格式"）或删除了禁止审批话术 → MAJOR 以上；
- origin/main 前进或权威事实变化 → 停止重新核验。

## 16. 完成后必须返回的材料

Review 结论（REVIEW_APPROVED / CHANGES_REQUESTED + BLOCKER/MAJOR/MINOR 分级 + 验收标准逐项结果 + 八类场景走查 + 越界/安全结论 + 是否建议合并 + 剩余风险）。

## 17. 下一张交接卡要求

REVIEW_APPROVED → 交 Founder 合并裁决（不自动合并）；CHANGES_REQUESTED → 回原 Builder 修复（persistent_session，不得用新临时 Builder 替代）；结论必须落盘为正式 Review 文件。
