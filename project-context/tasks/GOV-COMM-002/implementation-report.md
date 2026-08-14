# GOV-COMM-002｜实现报告

```yaml
task_id: GOV-COMM-002
status: IMPLEMENTED（第二次真实回复偏差修正完成，待定向复审）
branch: codex/gov-founder-alignment
interaction_stage: handoff
product_code_changed: false
database_changed: false
eval_changed: false
task_006_experiment_changed: false
```

## 解决结果

本变更把 Founder 对话和 Agent 执行交接拆成两个信息层：Founder 正文按问题难度提供足够判断的信息；执行所需的完整技术事实、内部判断和边界全部进入交接文件。首轮真实 Review 暴露“完整报告倒进聊天”，第一次修正解决了报告位置，却没有解决两件更根本的事：技术话缩短后仍不是小白能懂的话，审查通过也不等于 Founder 已批准合并。第二次真实回复再次失败后，现已把“实际含义必须讲明白”“决定前不出卡”“旧会话/全局 Skill 不能充当模板”写入全部相关入口，并清理本机两项有直接证据的项目污染 Skill。

## 实际修改

- `AGENTS.md`：新增两类受众、先讨论后交接、明确决定直接执行、密度自适应、现有能力核对和 Reviewer 两通道交付等高频硬规则；第二次修正补入“小白实际含义”“决定前不出卡”和 Skill/旧会话证据等级；统一治理版本升级至 `2026-08-15.3`；
- `agent-response-protocol.md`：重写为唯一回复规范，覆盖简单/复杂/交接密度、呈现形式、角色差异、刹车词、压缩纪律和 Reviewer 完整报告/Founder 短回复分流；
- `context-manifest.md`：恢复流程增加交互阶段与 Founder 批准边界，明确 Skill、Memory、旧会话和摘要只作线索，压缩后不重复确认已记录决定；
- `role-wakeup-and-handoff.md`：消除“Founder 复制完整十七字段”与“只复制短卡”的冲突，定义 Reviewer 证据交付通道，并禁止在下一步待决时提前出卡；
- `handoff-and-task-state-machine.md`：统一 L2 为 Founder 简述 + 短卡，完整十七字段只落盘；Reviewer 完整报告只发 PR Review / Comment；
- `CHIEF-BOOTSTRAP.md`：Chief 启动回复改为按难度控制密度；
- `role-handoff-template.md`：加入交互阶段和批准/未批准/待决边界；
- `current-state.md`：同步正式主线到 R3 收尾已合并事实，并登记本任务仍待独立 Review；
- `decision-register.md`：记录 Founder 对本治理修正的批准；
- `tasks/GOV-COMM-002/`：任务、实现证据与 Reviewer 交接。

本机 Hermes 运行环境另完成三项修正：创建可恢复 Skill 快照；归档包含项目私有事实与旧模板的 `multi-agent-project-governance`、`ai-eval-methodology`；开启 `skills.write_approval=true`。完整证据见 `hermes-skill-audit.md`。未归档通用代码审查/会话交接 Skill，未关闭 Memory 或旧会话搜索。

## 验证结果

2026-08-15 已完成静态一致性验证：

- 13 个必需治理/任务文件存在；
- 所有 Markdown 代码围栏成对；
- `AGENTS.md` 与 `current-state.md` 统一治理版本均为 `2026-08-15.3`；
- 两类受众、明确决定不二次确认、Founder 刹车词、压缩恢复和下游完整上下文规则均存在；
- “Founder 复制完整十七字段”旧冲突表述已清零；
- 批准 / 明确未批准 / 待决边界已进入交接规则和模板；
- diff 零 `v2/`、零 `eval/`、零 `project-context/tasks/TASK-006/`；
- `git diff --check` 通过；
- 十个行为场景已写入 `validation-scenarios.md`；场景 G 来自首轮 Reviewer 真实超长回复，场景 H/I/J 来自第二次回复与 Hermes 根因审计，待定向复审验证。

第二次真实回复偏差修正后的定向静态验证已通过：

- 13 个变更文件全部为治理 Markdown（12 个修改 + 1 个审计文件），全部代码围栏成对，`git diff --check` 通过；
- `AGENTS.md` 与 `current-state.md` 版本均为 `2026-08-15.3`；
- Reviewer 两通道、小白实际含义、决定前不出卡、旧会话/Skill 不覆盖仓库规则已进入全部必要入口；
- 本机已归档的两项 Skill 不再出现在启用清单，Skill 写入审批返回 `true`；
- Skill 固定索引从审计前 14,707 B 降至 14,465 B；未通过删除全部 Skill 或关闭 Memory 来换取通过；
- 零 `v2/`、零 `eval/`、零 `project-context/tasks/TASK-006/`、零产品源码改动。

## 已知边界

Markdown 规则无法数学上保证模型永不犯错，也不能自动唤醒休眠 Agent。实际保障来自：启动时加载 `AGENTS.md`、交接 required_reading、压缩后强制重读、完整交接文件和任务边界独立 Review。普通回复不增加逐条 Reviewer，避免再次把 Founder 变成人工流程搬运者。
