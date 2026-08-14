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
  - project-context/tasks/GOV-COMM-002/hermes-skill-audit.md
  - project-context/tasks/GOV-COMM-002/implementation-report.md
  - project-context/tasks/GOV-COMM-002/validation-scenarios.md
task_id: GOV-COMM-002
status: IMPLEMENTED（两次真实回复偏差已修正；待第三次定向复审）
interaction_stage: handoff
branch: codex/gov-founder-alignment
target_role: 新开独立 Reviewer 窗口（不得复用前两次 Reviewer 会话）
review_delivery_channel: PR #26 Review / Comment（已授权提交完整报告，不得修改分支）
```

## 1. 目标角色

新开独立 Reviewer 窗口，定向复审“小白实际含义、决定前不出卡、旧 Skill/旧会话隔离”修正；不得复用前两次 Reviewer 会话，因为旧窗口可能保留启动时快照。Reviewer 不修改被审分支，但已明确授权向 PR #26 提交 Review / Comment。

## 2. 项目位置

P1 治理层 → Founder 沟通与角色交接修正 → 实施完成、尚未合并。

## 3. 本次唯一目标

只复核第二次真实 Reviewer 回复暴露的偏差是否到位：聊天不能只是缩短技术话，必须让小白知道处境、实际影响、建议和唯一要决定的事；Founder 尚未决定合并时不得提前附合并卡；旧会话、全局 Skill、Memory 和摘要不能覆盖仓库规则或成为输出模板。同时确认两项污染 Skill 已退出本机后续注入，修正未改变产品范围。

## 4. 为什么做

首轮 Review 的技术结论正确，但把完整矩阵倾倒到 Founder 聊天。第一次修正指定报告进 PR 后，第二次 Reviewer 确实缩短了回复，却仍使用“交付通道、版本一致、范围合规、停止条件”等技术表达，并在“是否合并仍待 Founder 决定”时直接附合并卡。根因审计还发现：Hermes 强制加载部分相关 Skill；旧会话曾加载一个含本项目具体事实和旧输出结构的全局治理 Skill；最终会话又通过 `session_search` 取回旧审查片段，进而把“短技术话 + 必要短卡”误判为合规。

## 5. 当前事实

- 正式主线基线：`origin/main @ 45da940`；
- 实施分支：`codex/gov-founder-alignment`；
- 只修改治理 Markdown 和本任务文件；
- 前两次独立 Review 技术结论均通过，但 Founder 交付形式先后失败；
- 本轮修正基线：第二次被审分支头 `e225347`，复审时以 PR #26 当前最终 head 为准；
- 统一治理版本拟升级为 `2026-08-15.3`；
- 本机 Hermes 已先备份后可恢复归档 `multi-agent-project-governance`、`ai-eval-methodology`，并开启 `skills.write_approval=true`；
- 未修改产品、数据库、评测或 TASK-006 实验证据。

## 6. 已完成和未完成

已完成：两次真实回复偏差复盘、目标会话可观察判断路径核验、Skill 注入与旧会话搜索根因定位、两项一次性 Skill 可恢复归档、Skill 写入审批、规则与场景 H/I/J 修正。

未完成：本轮定向复审、Founder 合并裁决、正式主线合并。

## 7. 已批准决策

- Founder 已明确批准：原两类受众/密度/压缩恢复规则；针对第二次 Reviewer 回复检查实际判断路径；无其他错误时直接修正并再次复审；项目一次性 Skill 任务结束后退出后续注入；本轮执行“小白实际含义、决定前不出卡、旧 Skill/会话隔离”和本机 Skill 写入审批。
- Founder 明确未批准：产品代码、数据库、评测、TASK-006 新实验、自动合并或部署。
- 仍待 Founder 决定：独立 Review 通过后是否合并正式主线。
- 依据：2026-08-15 Founder 当前会话明确指令 + D-GOV-COMM-002。

## 8. 决策理由

短并不等于白。Founder 正文必须翻译技术结论的实际含义；Reviewer 完成审查只结束当前阶段，不能代替 Founder 批准下一阶段。全局 Skill 和旧会话可能包含有用线索，但没有当前仓库的事实权威，尤其不能把过期输出模板重新带回来。

## 9. 已否决方案

- 所有回复固定展开七八项；
- 所有回复永远只写 3—5 句；
- Founder 复制完整十七字段长卡；
- Founder 明确选择后再发决定回执并二次确认；
- 只靠聊天承诺，不落盘规则；
- 为每条普通回复增加独立 Reviewer。
- 把完整审查报告直接倒进 Founder 聊天；
- 为了修回复形式而重做未受影响的全部技术审查。
- 删除全部 Skill、关闭全部 Memory 或旧会话搜索；
- 只改 Reviewer 提示词而不处理已确认的项目污染 Skill；
- 把“审查通过”继续当成“Founder 已同意合并”。

## 10. required_reading

见文件头部 YAML。Reviewer 必须读取最终 diff，不得只看本交接摘要。

## 11. 允许执行

只读检查 `e225347..当前 PR head` 的定向 diff、规则引用、场景 H/I/J、Hermes 审计证据、版本和范围；向 PR #26 提交一份**合并前最终的完整 Review / Comment**。聊天只返回真正的小白说明和 PR 报告位置；因为是否合并仍待 Founder 决定，本次不得附合并短卡。

## 12. 禁止执行

不得修改分支文件、产生新提交、推送、合并、启动 R4、读取 holdout、改变 Founder 已批准规则或自行扩大任务范围。不得把完整 Review 报告发到 Founder 聊天。向 PR #26 提交 Review / Comment 是本次明确允许的证据交付，不视为修改分支。

## 13. 具体步骤

1. 从远端核对正式主线、PR #26 最终 head 与 `e225347..最终 head` 定向 diff；
2. 确认这是归档两项污染 Skill 后启动的新窗口；完整读取 required_reading，但只重复检查受定向修正影响的规则；
3. 对照 DRAFT 验收 12/13，逐条推演场景 H/I/J；不得只扫描关键词，必须写出一个小白即使不懂 PR、版本、分支和状态缩写也能判断的示例回复；
4. 核对 `hermes-skill-audit.md` 的会话路径、Skill 归档、启用清单和 `skills.write_approval=true`；不要声称能读取未公开思考；
5. 确认统一版本 `2026-08-15.3`、术语和引用一致，diff 仍为纯治理范围；
6. 把合并前最终完整报告作为 Review / Comment 提交到 PR #26；
7. 在 Founder 聊天只用 3—5 句说明“这次修的是什么、检查后能不能正式采用、还剩什么真实风险、建议是否合并、Founder 只需决定什么”，给报告位置；**不附任何短卡**。

## 14. 验收标准

本次以 `draft.md` 验收 12/13 和场景 H/I/J 为主，并最小回归场景 G：短不等于白；阶段完成不等于下一步获批；旧 Skill/会话不覆盖仓库；两项一次性 Skill 已退出启用清单；写入审批已开启；术语与版本一致；无范围扩大。未受影响的原技术验收可引用前两次证据，无需重做。

## 15. 停止条件

发现下列任一项立即给 CHANGES_REQUESTED：Founder 仍需懂技术状态词才能判断；等待合并决定时仍要求附卡；旧 Skill/会话仍可覆盖仓库规则；两项目标 Skill仍在启用清单；Skill 写入可静默落盘；规则版本不一致；或出现产品/TASK-006 实验改动。不要自行修复。

## 16. 完成后必须返回的材料

必须分开返回：

- **PR #26 Review / Comment**：合并前最终完整报告，包含前两次结论摘要、本次定向验收、场景 H/I/J、Hermes 审计、范围/版本、问题计数和 REVIEW_APPROVED / CHANGES_REQUESTED。
- **Founder 聊天**：3—5 句真正面向小白的处境、影响、建议、唯一待决事项 + “完整报告已提交到 PR #26”。不得附完整报告正文或任何短卡。

## 17. 下一张交接卡要求

REVIEW_APPROVED 后先停在 Founder 合并决定，不附卡；Founder 明确说“合并”后，才直接给负责执行合并的窗口短卡，不二次确认。CHANGES_REQUESTED 时先用小白话说明必须修什么和实际影响；只有修正动作已获批准时才给原治理实施窗口修复卡。
