# GOV-COMM-003｜Founder 自适应回复与长方案审批翻译

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/decision-register.md
  - project-context/templates/role-handoff-template.md
task_id: GOV-COMM-003
status: IMPLEMENTED（待独立 Review；未合并前不属于正式主线事实）
execution_mode: persistent_session
assigned_role: Governance Builder
branch: codex/gov-founder-adaptive-response
founder_approval_date: 2026-08-15
interaction_stage: execution
```

## Founder 已确认的问题

真实复现场景：Hermes 对话 `20260815_085148_c8e1b6` 已正确加载规则版本 `2026-08-15.3`，但面对 336 行 R4 草案等待 Founder 审批时，仍出现——

1. 先用浓缩技术话要求 Founder 批准整个草案；
2. 没有先讲清主要代价、失败风险和未知；
3. 启动回执后再次重复技术覆盖摘要。

这证明当前规则仍缺少“复杂审批必须先完成决策翻译”的强约束；但修复方向不是把所有回复强制压缩为 3—5 句，而是让密度随事情实际复杂度自适应。

## 已批准范围

Founder 2026-08-15 已明确批准（先完成本修正，再恢复 TASK-006 R4，无需二次确认）。修正内容：

1. **两类受众彻底分开**：给 Founder 以听懂、讨论和决定为目标，默认当技术小白、专业词必须翻译；给后续 Agent 以完整、准确执行为目标，写入任务/交接/实施报告或 PR Review。不得为让 Founder 回复变短而删除后续 Agent 所需技术上下文，也不得把 Agent 技术上下文倒进 Founder 聊天。
2. **回复密度自适应，不建新死模板**：简单事项通常 3—5 句或一个短段落；普通事项少量自然段、确有比较时才一张小表；复杂决策先 3—6 句大白话讲明核心处境，再用 2—4 个自然章节或最多一张小表完整解释方案、好处、坏处、风险、未知和推荐。句数/章节数是密度指导而非机械格式。
3. **复杂方案审批必须先完成决策翻译**：请求 Founder 批准长草案/复杂实现/重大方向时，Founder 正文必须让其不读技术文件也能理解——现在遇到什么、方案怎么解决、能/不能解决什么、主要好处与代价、最大风险或未知、为什么推荐（或不推荐）、当前只需决定什么。禁止“草案已覆盖全部要求请批准”“所有验收均通过请决定”、用浓缩技术话概括数百行文件后要求整体批准、把技术字段翻译后继续堆给 Founder。
4. **角色回复重点不同但不固定死模板**：Chief=处境/选择/取舍；Builder=原来哪里有问题/改后用户感受/故意没动什么/怎样证明有效/还需决定什么；Reviewer=能否继续还是打回/真风险/必须修什么/哪些只是小瑕疵/下一步怎么选。简单事情可合并成几句话。
5. **讨论与交接顺序**：未对齐只讨论不提前建任务/唤醒角色/输出执行卡；Founder 表示没听懂/理解偏/先别做/没对齐时立即停止并重新解释；决定可唯一解释时直接执行或直接给卡不再二次确认；完整技术交接写入文件并明确标记“给下一 Agent，Founder 不需要阅读”。
6. **启动回执不挤占 Founder 正文**：新窗口或压缩恢复仍必须完成正式核验；Founder 正文永远先出现；Founder 可见的启动回执保持紧凑，只呈现恢复身份和批准边界所必需信息；完整 Git/文件/命令/核验细节进入交接或实施报告。
7. **上下文压缩与旧记忆**：压缩后重新读取当前仓库正式规则、任务文件和批准边界；摘要/旧会话/Memory/Skill 只能定位线索；正式文件已准确记录决定时不得因压缩要求再确认；一次性任务经验不得重写成长久全局 Skill。

## 明确未批准

- 不修改产品代码、数据库、评测代码或 TASK-006 R4 草案、实验数据；
- 不修改 Hermes 全局 Skill、Memory、Session Review 或配置；
- 不启动第四轮，不读取 holdout，不引入模型/依赖/外部服务；
- 不合并 PR，不部署；
- 不建立与现有 L1/L2/L3 冲突的第二套分级系统；
- 不把所有回复强制压缩为 3—5 句（简单回复不被过度展开，复杂回复不被过度压缩）。

## 实施范围

本任务只修改以下治理入口：

- `AGENTS.md`：统一治理版本升级 + 决策翻译高频规则；
- `project-context/agent-response-protocol.md`：密度指导非机械格式、§1.5 复杂审批决策翻译、角色内容重点、禁止审批话术、自检项（回复格式唯一权威）；
- `project-context/context-manifest.md`：启动回执保持紧凑不挤占 Founder 正文（启动/恢复唯一权威）；
- `project-context/current-state.md`：同步基线 `df5c2d9`、GOV-COMM-002 MERGED、GOV-COMM-003 状态；
- `project-context/decision-register.md`：新增 D-GOV-COMM-003 决策卡；
- 本任务 DRAFT、实现报告、Reviewer 交接和验证场景。

`role-wakeup-and-handoff.md` 与 `templates/role-handoff-template.md` 只在发现真实重复或冲突时才修改——本次未发现，保持不动。

## 验收标准

1. 简单回复没有被过度展开（简单事项仍短段落、无大表、无决策看板）；
2. 复杂回复没有被过度压缩（复杂决策完整解释方案/好处/坏处/风险/未知/推荐）；
3. Founder 不读技术文件也能理解主要取舍并决定（决策翻译七项内容完整性）；
4. 技术交接仍然完整（下游判断、历史失败、已否决方案、未知假设不因 Founder 正文简化而丢失）；
5. 不机械列七八个栏目，也不聚合成文字墙；
6. 不在 Founder 决定前提前输出执行卡；
7. 压缩恢复后规则仍有效（恢复交互阶段与批准/未批准/待决边界）；
8. 旧规则和冲突表述清零（含 current-state 中 GOV-COMM-002 的过期“待定向复审”表述）；
9. 统一治理版本升级，所有强制入口无互相冲突的旧表述；
10. diff 零产品代码、零数据库、零评测、零 TASK-006 R4 草案/实验证据修改；
11. 不建立与 L1/L2/L3 冲突的第二套分级系统（§1.5 是 L3 的细化，不是新分级）。

## Review 策略

全部规则修改完成后只审查最终分支头，并对照 `validation-scenarios.md` 的 A—H 八类场景验证规则能否覆盖真实协作场景。Reviewer 完整报告提交到 PR Review / Comment；Founder 聊天只收大白话结论、真风险、建议和报告位置。
