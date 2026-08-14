# GOV-COMM-002｜Founder 对话与 Agent 执行交接分层修正

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/templates/role-handoff-template.md
task_id: GOV-COMM-002
status: IMPLEMENTED（两次真实回复偏差均已定位并修正；待定向复审；未合并前不属于正式主线事实）
execution_mode: persistent_session
assigned_role: Governance Builder
branch: codex/gov-founder-alignment
founder_approval_date: 2026-08-15
interaction_stage: execution
```

## Founder 已确认的问题

此前流程把 Founder 对话和 Agent 执行交接混在一起：Founder 在尚未听懂、尚未对齐时就收到复杂卡片并被迫人工搬运；简单问题也被机械拆成多段清单；Founder 已明确选择后还被要求二次确认；聊天压缩后，新 Agent 可能只凭摘要继续，丢失批准边界。

## 已批准范围

Founder 2026-08-15 已明确批准直接执行以下协作修正：

- 给 Founder 的正文以“小白能听懂并能判断”为目标；给后续 Agent 的交接以“完整、准确、不丢上下文”为目标；
- 回复密度按问题难度自适应：简单事项短说，真正复杂的事项才展开；不得机械拆成七八个栏目，也不得聚合成文字墙；
- 内部判断不必全部展示给 Founder，但凡下游执行需要的内容必须进入完整交接文件；
- Founder 的选择可唯一解释后，直接输出执行卡或继续执行，不再二次确认；
- 上下文压缩后必须重新读取正式规则、当前任务/交接和批准边界，不能只凭摘要继续；
- 规则必须适用于 Chief、Builder、Reviewer、Release / QA 和临时 Agent。
- “小白能懂”必须让没有项目背景的人知道现在的处境、实际影响、建议和自己只要决定什么，不能把技术词缩短后冒充大白话；
- Reviewer 的“审查通过/建议合并”不等于 Founder 已批准合并；下一步仍待决定时不得提前给执行卡；
- Hermes 的全局 Skill、Memory、旧会话和压缩摘要只作定位线索，不得覆盖仓库正式规则或直接充当本次输出模板；一次性项目 Skill 在任务结束后退出后续注入，全局 Skill 写入必须经过批准。

## 明确未批准

- 不修改产品代码、数据库、评测逻辑或 TASK-006 实验；
- 不启动 R4，不读取旧 holdout，不引入模型、依赖或外部服务；
- 不自动合并正式主线，不部署；
- 不为每条普通回复新增 Reviewer 或形式审查；
- 不以“保证模型永不犯错”作虚假承诺。

## 实施范围

本任务只修改以下治理入口：

- `AGENTS.md`：高频硬规则与统一治理版本；
- `project-context/agent-response-protocol.md`：两类受众、密度自适应、明确决定直接执行；
- `project-context/context-manifest.md`：压缩恢复与批准边界恢复；
- `project-context/role-wakeup-and-handoff.md`：短卡/完整交接唯一分工；
- `project-context/handoff-and-task-state-machine.md`：修正交接展示引用；
- `project-context/CHIEF-BOOTSTRAP.md`：Chief 启动表达密度；
- `project-context/templates/role-handoff-template.md`：交互阶段与批准/未批准/待决边界；
- `project-context/current-state.md`：同步 R3 已合并事实、治理版本和本任务审查入口，避免压缩恢复读取旧状态；
- 本任务 DRAFT、实现报告和 Reviewer 交接；
- 本任务 Hermes Skill 污染审计；
- `project-context/decision-register.md`：记录 Founder 已批准规则。

本机 Hermes 配置与 Skill 归档属于本任务已获批准的运行环境修正，不进入产品代码：对已确认包含项目私有事实和旧回复模板的两项一次性 Skill 先备份后归档，并开启全局 Skill 写入审批。通用代码审查与会话交接 Skill 不做无证据清理。

## 验收标准

1. Founder 对话与 Agent 执行交接在唯一规则中明确分层；
2. 简单、一般决策、复杂事项和交接分别有密度规则，但不强制 Founder 阅读固定大模板；
3. Founder 明确决定后直接执行/交接，只有真实歧义才澄清；
4. Founder 表示未听懂、未对齐或先别做时，所有 Agent 立即停止推进；
5. 完整十七字段只写交接文件，Founder 只复制 ≤10 行短卡，所有规则引用一致；
6. 下游需要的内部判断、历史失败、已否决方案和未知假设不得因 Founder 正文简化而丢失；
7. 压缩恢复必须恢复交互阶段以及批准、未批准、待决边界；正式决定已准确记录时不得二次确认；
8. Chief 在提出新系统/实验/依赖前先核对已有设计、实现、实际接线、运行和测试证据；
9. 统一治理版本升级，所有强制入口无互相冲突的旧表述；
10. diff 零产品代码、零数据库、零评测、零 TASK-006 实验证据修改。
11. Reviewer 完整报告提交到 PR Review / Comment；Founder 聊天只包含大白话结论、真正风险、建议和报告位置，不再倾倒完整矩阵、扫描或过程清单；仅当下一步已获 Founder 批准时才附必要短卡。
12. Reviewer 必须把审查结论翻译成实际含义；若 Founder 尚未决定合并/返修/部署，回复只请求这一个决定且不附下一张卡；
13. 全局 Skill、Memory、旧会话或压缩摘要不得充当正式事实、批准证据或回复模板；项目一次性 Skill 已退出本机后续提示注入，后续 Skill 写入须经批准。

## Review 策略

全部规则修改完成后只审查最终分支头。首轮 Review 的技术结论已通过，但完整报告被倾倒到 Founder 聊天；第一次修正后，第二次回复仍把技术话缩短后称为大白话，并在 Founder 尚未决定合并时提前给卡。Founder 已授权定位可观察的判断路径、清理一次性 Skill、补齐规则并再次定向复审；未受影响的产品范围和原技术验收无需重做。
