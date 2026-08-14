# GOV-COMM-002｜Hermes Skill 与旧会话污染审计

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/agent-response-protocol.md
  - project-context/tasks/GOV-COMM-002/draft.md
task_id: GOV-COMM-002
audit_date: 2026-08-15
scope: 本机 Hermes 只读根因核验 + 两项可恢复归档 + Skill 写入审批
product_code_changed: false
```

## 先说结论

第二次 Reviewer 回复不是单纯措辞失误。Hermes 的系统提示要求“只要 Skill 部分相关就必须加载”，旧审查会话又加载了一个已被本项目历史反复扩写的全局治理 Skill；这个 Skill 的参考文件写死了“先说人话→启动回执表→验收矩阵→问题清单→过程合规→下一窗口卡”的旧输出结构。最终 Reviewer 会话虽未再次直接加载该 Skill，却通过旧会话搜索取回了先前审查片段，并把“3—5 句大白话 + 报告位置 + 必要短卡”判断为合规，导致技术词仍未翻译、Founder 未决定合并就提前出卡。

## 可观察证据

- 目标 Reviewer 会话：`20260815_062724_768cec`，模型 `deepseek-v4-flash`，可导出的会话记录包含工具调用、系统提示、最终回复和该模型保存的 `reasoning_content`；本审计不声称能读取任何未公开的模型内部思考；
- 该会话未调用 `skill_view`，但调用两次 `session_search`；第二次命中旧审查会话 `20260815_060754_2a2d74` 并注入其片段；
- 旧审查会话直接加载 `github-code-review`、`multi-agent-project-governance` 及后者的 `references/governance-pr-review-gate.md`；
- 目标会话保存的判断原文表明它计划“聊天只回 3—5 句大白话结论 + 报告位置 + 必要短卡”，说明它不是忘记规则，而是把“短技术话”和“提前短卡”错误解释成合规；
- 审计时 Hermes 共启用 134 项 Skill、禁用 0 项；Skill 索引固定注入约 14.7 KB。系统提示明确要求部分相关也必须加载，并鼓励复杂任务后保存或扩写 Skill；
- `multi-agent-project-governance` 为 103,894 字节、累计 212 次 patch，包含本项目具体任务、PR、提交和旧输出模板；`ai-eval-methodology` 为 74,473 字节、累计 98 次 patch，包含 TASK-006 具体指标、holdout 和实验历史。二者均不满足“跨任务通用、无项目私有事实”的长期 Skill 条件；
- `github-code-review` 与 `agent-session-handoff` 仍是可跨项目使用的通用 Skill，未发现足够证据支持删除或归档。

## 已执行的本机修正

1. 先创建 Curator 快照：`~/.hermes/skills/.curator_backups/2026-08-14T22-44-17Z`；
2. 可恢复归档 `multi-agent-project-governance` 至 `~/.hermes/skills/.archive/multi-agent-project-governance`；
3. 可恢复归档 `ai-eval-methodology` 至 `~/.hermes/skills/.archive/ai-eval-methodology`；
4. 设置 `skills.write_approval=true`。以后 Agent 对 Skill 的创建、修改、patch、删除和辅助文件写入都会先进入待审批区；
5. 未开启 `skills.guard_agent_created`：该开关只扫描危险关键词，不判断 Skill 是否一次性、过期或与项目规则冲突，不能解决本次根因；
6. 未关闭全部 Memory、旧会话搜索或所有 Skill：这些能力本身有用，本次只移除有直接证据的污染源，并用仓库规则限制其证据等级和输出用途。

## 验收口径

- 新 Hermes 会话的 `hermes skills list` 不再出现上述两项已归档 Skill；
- `hermes config get skills.write_approval` 返回 `true`；
- Reviewer 不把旧会话或全局 Skill 当作当前批准和回复模板；
- Reviewer 的 Founder 回复即使不懂 PR、分支、版本号、状态缩写，也能知道处境、实际影响、建议和唯一要决定的事；
- Founder 作出决定之前不出现下一张执行卡。
- 本轮定向复审使用新开的 Reviewer 窗口；旧窗口可能保留启动时 Skill 索引、AGENTS.md 和已注入会话片段的快照，不用于验证归档后的行为。
