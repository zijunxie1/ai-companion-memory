# GOV-COMM-001｜Builder → Reviewer 交接文件（handoff-builder-to-reviewer.md v1.3，历史快照）

> ⚠️ **历史快照，不可作为当前状态。** 本文件记录最终复审前的 Builder → Reviewer 交接；独立复审已通过，GOV-COMM-001 已 Rebase 合并进正式主线（`3412c3c`）。
> 下方交接包、步骤和状态保留其原始时点，不能再用于唤醒 Reviewer。

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
  - project-context/templates/role-handoff-template.md
  - project-context/tasks/GOV-COMM-001/draft.md
  - project-context/tasks/GOV-COMM-001/implementation-plan.md
  - project-context/tasks/GOV-COMM-001/implementation-report.md
task_id: GOV-COMM-001
status: 历史快照（当时为 IMPLEMENTED 待最终复审；当前任务已 MERGED）
handoff_from: Governance Builder
handoff_to: 独立 Reviewer
handoff_version: v1.3（2026-08-12；v1.2 → v1.3：第三次限定修复——CHIEF-BOOTSTRAP.md 一行 3—6 → 3—5 句）
handoff_date: 2026-08-12
branch: codex/gov-comm-001
baseline_commit: 42786dadaafd1d1c15e44d1998b646a426c65cdf
merge_commit: 3412c3c90ac73363b2d54998311bcd9ca39da10b
snapshot_status: 历史交接包（不可作为当前状态或再次发送）
cr_status: CHANGES_REQUESTED（首轮）→ CR1 → CHANGES_REQUESTED（二轮）→ CR2 → 第三次限定修复完成，待最终复审
```

---

## 1. 目标角色

独立 Reviewer（全新窗口，独立视角；不得沿用 Builder 结论）。

## 2. 项目位置

P1 Alice Memory 作品集项目，TASK-006（E004 无关召回）保持 APPROVED 未解决。当前执行 TASK-006 内部前置治理顺序第二项：GOV-COMM-001 沟通与交接规范（GOV-CHIEF-001 已合入，→ GOV-002 待后）。

## 3. 本次唯一目标

最终复审：确认第三次限定修复（CHIEF-BOOTSTRAP.md 执行 Chief 上岗流程第 3 条：3—6 句 → 3—5 句）已到位且未越界；全目录 3—6 残留为零（规则正文）；复验 CR1 五项、CR2 两项与原实施范围（V1—V9）。

## 4. 为什么做

Agent 回复经常一次输出大量内容，Founder 难以快速判断项目位置、问题、阶段和是否需要操作。本任务建立回复分级（普通回复 3—5 句 / 普通交接一张可复制交接卡 / 仅四类情况完整汇报）、自包含交接卡、新窗口继承与压缩恢复流程，并收敛到单一权威来源避免模板漂移。

## 5. 当前事实

- origin/main = `42786da`（GOV-CHIEF-001 PR #11 已 Rebase 合并，执行/决策 Chief 为正式治理事实）；
- GOV-COMM-001 三项审批全部通过（2026-08-12）：Review 1 批准 DRAFT v1.2、delegated、Review 2 批准 implementation-plan v1.4；
- 实施完成：**14 个文件**（8 个现有治理文件 + 1 个新模板 + 3 份正式规划文件 + 2 份过程证据文件）；V1—V9 验证全部通过；
- **三轮 Review**：CHANGES_REQUESTED（首轮五项 CR 修复完成）→ CHANGES_REQUESTED（二轮两项：§7 分级自检、V9 真实样例，已修复）→ 第三次限定修复（仅 CHIEF-BOOTSTRAP.md 一行 3—6 → 3—5 句，见 implementation-report v1.3 §5）；
- 唯一权威来源映射：回复格式 → `agent-response-protocol.md`；交接流程 → `role-wakeup-and-handoff.md`（模板 `templates/role-handoff-template.md`）；启动与恢复 → `context-manifest.md`；
- TASK-006 保持 APPROVED，E004 未解决；GOV-002 未开始；产品主线未改变。

## 6. 已完成和未完成

已完成（原实施）：AGENTS.md、CHIEF-BOOTSTRAP.md（第三次限定修复）、agent-response-protocol.md、context-manifest.md、current-state.md、decision-register.md、handoff-and-task-state-machine.md（CR1 授权）、role-wakeup-and-handoff.md 共 8 个现有治理文件；新建 templates/role-handoff-template.md（1 个）；同步 draft.md / implementation-plan.md / handoff-builder-plan-to-founder.md（3 份规划文件）；本文件与 implementation-report.md（2 份过程证据文件）。

已完成（第三次限定修复）：CHIEF-BOOTSTRAP.md 第 73 行（执行 Chief 上岗流程第 3 条）3—6 句 → 3—5 句；全目录 3—6 规则正文零残留（历史说明以"原 3—6 句已改"表述，明确为历史）。

已完成（CR2 修复）：agent-response-protocol §7 重写为分级自检（7.1 L1 / 7.2 L2 / 7.3 L3 / 7.4 总则），"先说人话"全文统一 3—5 句（原 3—6 句已改）；implementation-report v1.3 含 §6「V9 实际渲染样例」小节（完整 L2 交接卡代码框，单一可复制、无裸露 text）。

已完成（CR1 修复）：agent-response-protocol §2 限定 L3；handoff-and-task-state-machine §9 固定状态报告限定 L3（CR 额外授权文件）；AGENTS.md 固定状态报告段限定 L3（Founder 授权补完）；role-wakeup §4 改为发送包装说明；D-GOV-CHIEF-001 决策状态恢复 APPROVED；CHANGES_REQUESTED 与修复状态已记录。

未完成：提交/推送/PR/合并（未授权）；独立复审（等待 Founder 决定发送本文件）。

## 7. 已批准决策

- D-GOV-COMM-001：Founder 沟通、角色交接与上下文恢复规范（三项审批通过，2026-08-12）；
- D-GOV-CHIEF-001：执行/决策 Chief 角色拆分（已 MERGED）；
- D-T006-ROUTE-B：TASK-006 路线 B（不外发用户数据）；
- 治理顺序：GOV-CHIEF-001 → GOV-COMM-001 → GOV-002（只确定 TASK-006 内部前置治理顺序）。

## 8. 决策理由

回复分级降低 Founder 判断成本；交接卡自包含使新 Agent 不依赖旧聊天；单一权威来源避免多文件模板漂移；L1 总长 3—5 句硬约束防止回复再次膨胀；独立 Review 是完成和合并前必经步骤。

## 9. 已否决方案

- 多文件重复同一模板（否决：单一权威来源映射）；
- L1 展开七项完整状态（否决：七项仅 L3 使用）；
- 把 GOV-002 或产品改动混入本 PR（否决：一个 PR 一个主要问题）。

## 10. required_reading

见本文件头部 YAML required_reading（14 项 + GOV-COMM-001 任务文件）。

## 11. 允许执行

只读审查：读取任务文件、契约、完整 diff；输出 BLOCKER/MAJOR/MINOR 与明确结论。

## 12. 禁止执行

修改任何文件；产品实现；外部补测；任务状态变化；合并或部署；批准合并。

## 13. 具体步骤

1. 读取 required_reading 全部文件并做只读 Git 核验（HEAD/origin/main/分支/工作区）；
2. 对照 CR-2026-08-12-APPROVED 五项修复逐项检查（implementation-report.md v1.1 §3）；
3. 复验 draft.md §13 验收标准与 V1—V9 验证矩阵，重点复验 V1（L1 长度 + L3 边界）、V2（十七字段唯一结构）、V5（单一权威来源）、V9（实际渲染样例）；
4. 检查 AGENTS.md 固定状态报告段是否已补完（若未补完，作为遗留问题记录，不得当作已越界）；
5. 追溯过程合规：启动回执、required_reading、状态版本、决策登记、Founder 回复协议；
6. 输出 Review 结论（REVIEW_APPROVED / CHANGES_REQUESTED）。

## 14. 验收标准

见 draft.md §13（12 项）——重点：三个审批动作状态；变更落在允许列表（8 现有治理文件 + 1 模板 + 3 规划文件 + 2 过程证据文件，合计 14 个）；三个唯一权威来源映射一致无重复；L1 总长 3—5 句；交接卡十七字段自包含；普通交接渲染为单一可复制代码框；新窗口继承与压缩恢复流程落盘；产品代码与 TASK-006 零变化；current-state/decision-register 同步；Builder 停在 IMPLEMENTED。

## 15. 停止条件

- 发现状态越界、角色权限扩大或自动化误写 → BLOCKER；
- origin/main 前进或权威事实变化 → 停止并重新核验；
- 需要修改产品目标/TASK-006/治理顺序 → 停止交 Founder/决策 Chief。

## 16. 完成后必须返回的材料

Review 结论（BLOCKER/MAJOR/MINOR + 验收标准逐项结果 + 权限/安全结论 + 测试充分性 + 是否超范围 + 是否建议合并 + 剩余风险）；如需打回，指出原 Builder 修复范围。

## 17. 下一张交接卡要求

Review 完成后：REVIEW_APPROVED → 交 Founder 合并裁决；CHANGES_REQUESTED → 回原 Builder 修复；结论必须落盘为正式 Review 文件（不得只留在聊天）。

---

## 附：Founder 发送给 Reviewer 的唤醒卡（可复制）

```text
请审查 GOV-COMM-001（Founder 沟通、角色交接与上下文恢复规范）的治理文件变更。

审查范围：codex/gov-comm-001 分支（Worktree E:/gov-comm-001-worktree）
必读：AGENTS.md、context-manifest.md、CHIEF-BOOTSTRAP.md、current-state.md、
decision-register.md、role-wakeup-and-handoff.md、agent-response-protocol.md、
project-mainline-roadmap.md、templates/role-handoff-template.md、
GOV-COMM-001/（draft、implementation-plan、implementation-report、handoff-builder-to-reviewer）、
TASK-006/draft.md、TASK-006/route-b-decision.md

请先做只读 Git 核验并输出启动回执，然后对照验收标准逐项审查，重点检查：
- 回复分级 L1/L2/L3 与唯一权威来源映射是否一致、是否多文件重复模板；
- L1 普通回复是否总长 3—5 句（七项完整状态仅 L3）；
- 交接卡十七字段是否自包含、普通交接是否渲染为单一可复制代码框；
- current-state 是否与 Git 事实一致（origin/main = 42786da）；
- TASK-006 是否保持 APPROVED、E004 是否未解决；
- 产品代码与 TASK-006 是否零变化。

只审查，不修改文件；输出 BLOCKER/MAJOR/MINOR 结论。
```
