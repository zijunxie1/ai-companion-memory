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
status: IMPLEMENTED（待独立 Review）
interaction_stage: handoff
branch: codex/gov-founder-alignment
target_role: 独立 Reviewer
```

## 1. 目标角色

新独立 Reviewer，只审查不修改。

## 2. 项目位置

P1 治理层 → Founder 沟通与角色交接修正 → 实施完成、尚未合并。

## 3. 本次唯一目标

审查最终分支是否把 Founder 对话和 Agent 执行交接正确分层，并保证聊天压缩后仍能恢复批准边界和回复方式。

## 4. 为什么做

此前 Founder 在未听懂和未对齐时就收到复杂交接，简单问题也被机械展开；明确决定后仍被二次确认；短卡与完整十七字段规则互相冲突；压缩后可能只凭摘要继续。这会把 Founder 变成人工搬运者，并让偏差经 Builder/Reviewer 放大。

## 5. 当前事实

- 正式主线基线：`origin/main @ 45da940`；
- 实施分支：`codex/gov-founder-alignment`；
- 只修改治理 Markdown 和本任务文件；
- 统一治理版本拟升级为 `2026-08-15.1`；
- 未修改产品、数据库、评测或 TASK-006 实验证据。

## 6. 已完成和未完成

已完成：规则重写、冲突修正、压缩恢复、模板、任务与决策记录、静态一致性检查和场景验证材料。

未完成：独立 Review、Founder 合并裁决、正式主线合并。

## 7. 已批准决策

- Founder 已明确批准：两类受众分层；密度按难度变化；下游必要判断完整落盘；明确决定后直接执行/出卡；压缩后重读；全部角色适用；直接实施本治理修正。
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

## 10. required_reading

见文件头部 YAML。Reviewer 必须读取最终 diff，不得只看本交接摘要。

## 11. 允许执行

只读检查最终 diff、规则引用、任务范围、压缩恢复、场景覆盖和 Git 状态；输出正式 Review 报告与结论。

## 12. 禁止执行

不得修改文件、提交、推送、合并、启动 R4、读取 holdout、改变 Founder 已批准规则或自行扩大任务范围。

## 13. 具体步骤

1. 从远端核对正式主线和分支头；
2. 完整读取 required_reading 和最终 diff；
3. 对照 DRAFT 十项验收；
4. 检索旧冲突表述和规则版本残留；
5. 用 `validation-scenarios.md` 六个场景逐项推演；
6. 核对 diff 路径为治理范围；
7. 输出一次最终 Review 结论。

## 14. 验收标准

以 `draft.md` 十项验收为准。特别检查：明确决定是否直接执行、讨论阶段是否禁卡、Founder 简化是否不导致 Agent 上下文丢失、压缩后是否恢复批准边界、短卡/十七字段是否唯一且无冲突。

## 15. 停止条件

发现权限扩大、产品/TASK-006 实验改动、规则版本不一致、短卡/长卡仍冲突、压缩后可凭摘要继续、明确决定仍要求二次确认，立即给 CHANGES_REQUESTED；不要自行修复。

## 16. 完成后必须返回的材料

Review 报告、十项验收结果、六个场景结果、范围与版本结论、BLOCKER/MAJOR/MINOR/NOTE 计数、REVIEW_APPROVED 或 CHANGES_REQUESTED、给 Founder 的短卡。

## 17. 下一张交接卡要求

REVIEW_APPROVED 后直接给 Founder 合并裁决短卡；CHANGES_REQUESTED 时给原治理实施窗口修复卡。不得要求 Founder 再次确认已经明确的流程规则。
