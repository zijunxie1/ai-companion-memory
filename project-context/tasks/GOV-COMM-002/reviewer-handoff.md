# GOV-COMM-002｜独立 Reviewer 完整交接

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/templates/role-handoff-template.md
  - project-context/tasks/GOV-COMM-002/draft.md
  - project-context/tasks/GOV-COMM-002/implementation-report.md
  - project-context/tasks/GOV-COMM-002/validation-scenarios.md
task_id: GOV-COMM-002
status: IMPLEMENTED（首轮技术审查通过；交付通道修正后待定向复审）
interaction_stage: handoff
branch: codex/gov-founder-alignment
target_role: 独立 Reviewer
review_delivery_channel: PR #26 Review / Comment（已授权提交完整报告，不得修改分支）
```

## 1. 目标角色

独立 Reviewer，定向复审交付通道修正；不修改被审分支，但已明确授权向 PR #26 提交 Review / Comment。

## 2. 项目位置

P1 治理层 → Founder 沟通与角色交接修正 → 实施完成、尚未合并。

## 3. 本次唯一目标

只复核首轮 Review 后的定向修正是否到位：完整审查报告必须进 PR 审查页，Founder 聊天只留大白话结论、报告位置和短卡；同时确认修正未改变原已通过的批准边界、产品范围和压缩恢复规则。

## 4. 为什么做

首轮 Review 的技术结论正确，但回复本身把十项矩阵、六个场景矩阵、扫描记录和合规清单全部倾倒到 Founder 聊天。根因不是审查不完整，而是交接要求“返回完整报告”却没有指定存放通道，导致技术检查通过但 Founder 展示失败。

## 5. 当前事实

- 正式主线基线：`origin/main @ 45da940`；
- 实施分支：`codex/gov-founder-alignment`；
- 只修改治理 Markdown 和本任务文件；
- 首轮独立 Review 技术结论：REVIEW_APPROVED（0 BLOCKER / 0 MAJOR / 2 MINOR），但 Founder 交付形式失败；
- 修正基线：首轮被审分支头 `6841cb2`，复审时以 PR #26 当前最终 head 为准；
- 统一治理版本拟升级为 `2026-08-15.2`；
- 未修改产品、数据库、评测或 TASK-006 实验证据。

## 6. 已完成和未完成

已完成：首轮技术审查、Founder 交付失败根因定位、Reviewer 两通道规则、PR Review / Comment 授权、真实失败场景 G、术语一致性和静态验证。

未完成：交付通道定向复审、Founder 合并裁决、正式主线合并。

## 7. 已批准决策

- Founder 已明确批准：两类受众分层；密度按难度变化；下游必要判断完整落盘；明确决定后直接执行/出卡；压缩后重读；全部角色适用；直接实施本治理修正；针对首轮 Reviewer 超长回复修正交付通道并定向复审。
- Founder 明确未批准：产品代码、数据库、评测、TASK-006 新实验、自动合并或部署。
- 仍待 Founder 决定：独立 Review 通过后是否合并正式主线。
- 依据：2026-08-15 Founder 当前会话明确指令 + D-GOV-COMM-002。

## 8. 决策理由

Founder 正文和 Agent 执行交接服务不同受众，必须分层；规则要在启动、交接、压缩恢复三个入口重复形成最低保障，但详细规范只保留一个权威来源，避免规则漂移。

## 9. 已否决方案

- 所有回复固定展开七八项；
- 所有回复永远只写 3—5 句；
- Founder 复制完整十七字段长卡；
- Founder 明确选择后再发决定回执并二次确认；
- 只靠聊天承诺，不落盘规则；
- 为每条普通回复增加独立 Reviewer。
- 把完整审查报告直接倒进 Founder 聊天；
- 为了修回复形式而重做未受影响的全部技术审查。

## 10. required_reading

见文件头部 YAML。Reviewer 必须读取最终 diff，不得只看本交接摘要。

## 11. 允许执行

只读检查 `6841cb2..当前 PR head` 的定向 diff、规则引用、场景 G、版本和范围；向 PR #26 提交一份**合并前最终的完整 Review / Comment**，其中记录首轮技术结论与本次定向复审结果；聊天只返回大白话结论、PR 报告位置和短卡。

## 12. 禁止执行

不得修改分支文件、产生新提交、推送、合并、启动 R4、读取 holdout、改变 Founder 已批准规则或自行扩大任务范围。不得把完整 Review 报告发到 Founder 聊天。向 PR #26 提交 Review / Comment 是本次明确允许的证据交付，不视为修改分支。

## 13. 具体步骤

1. 从远端核对正式主线、PR #26 最终 head 与 `6841cb2..最终 head` 定向 diff；
2. 完整读取 required_reading，但只重复检查受定向修正影响的规则；
3. 对照 DRAFT 新增验收 11，推演 `validation-scenarios.md` 场景 G；
4. 确认 Reviewer “不改分支”与“可发 PR Review / Comment”不再冲突，无通道时会停止而非倒入聊天；
5. 确认统一版本 `2026-08-15.2`、术语和引用一致，diff 仍为纯治理范围；
6. 把合并前最终完整报告作为 Review / Comment 提交到 PR #26；
7. 在 Founder 聊天仅返回 3—5 句大白话结论、报告位置和 ≤10 行短卡，不复制完整报告。

## 14. 验收标准

本次以 `draft.md` 验收 11 和场景 G 为主，并做最小回归：完整报告有持久化通道；Founder 聊天不再容纳完整矩阵/日志/合规清单；Reviewer 权限不冲突；术语与版本一致；无范围扩大。未受影响的原十项/六场景结论可引用首轮证据，无需重做。

## 15. 停止条件

发现下列任一项立即给 CHANGES_REQUESTED：完整报告仍被要求返回 Founder 聊天；交接没有 PR Review / Comment 授权；“不修改分支”被误解为“不能提交 PR Review”；无通道时没有停止条件；规则版本不一致；或出现产品/TASK-006 实验改动。不要自行修复。

## 16. 完成后必须返回的材料

必须分开返回：

- **PR #26 Review / Comment**：合并前最终完整报告，包含首轮技术结论摘要、本次定向验收、场景 G、范围/版本、问题计数和 REVIEW_APPROVED / CHANGES_REQUESTED。
- **Founder 聊天**：3—5 句大白话结论 + “完整报告已提交到 PR #26” + 必要时的 ≤10 行短卡。不得附完整报告正文。

## 17. 下一张交接卡要求

REVIEW_APPROVED 后直接给 Founder 合并裁决短卡；CHANGES_REQUESTED 时给原治理实施窗口修复卡。不得要求 Founder 再次确认已经明确的流程规则。
