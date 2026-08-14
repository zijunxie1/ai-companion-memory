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
status: IMPLEMENTED（待独立 Review；未合并前不属于正式主线事实）
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
- `project-context/decision-register.md`：记录 Founder 已批准规则。

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

## Review 策略

全部规则修改完成后只做一次最终独立 Review，审查最终分支头。非结论性排版偏好不得触发重复审查；只有影响权限、批准边界、压缩恢复、交接完整性或规则互相矛盾的问题才要求修改。
