# TASK-006｜路线 B 技术路线裁决（Founder APPROVED）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-005A/release-qa-report.md
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
decision_id: D-T006-ROUTE-B
task_id: TASK-006
decision_status: APPROVED
route_selected_at: 2026-08-11
formal_landing_authorized_at: 2026-08-12
approved_by: Founder
decision_route: no-outbound local / rule / retrieval approach
task_status_after_decision: APPROVED
implementation_authority: none
mainline_order_changed: false
```

## 1. 裁决内容

Founder 已选择 TASK-006 决策包中的**路线 B**：不把外部模型相关性 Gate 接入用户产品路径，转为验证**不向外部模型或外部数据服务发送用户查询、Memory 内容或其他用户数据**的本地模型、规则或检索技术路线。

> 命名澄清：本文件的“路线 B”来自 2026-08-11 的产品/隐私/延迟决策包，含义是“无用户数据外发的本地、规则或检索路线”；它不等同于 `draft.md` §3.2 候选方向表中的单个“方向 B”。

该裁决只确定技术路线和后续工作顺序，不代表已经选定具体算法，不构成产品实现授权，也不构成任何法律合规结论。

## 2. 裁决依据与证据边界

已核验的证据支持以下结论：

1. 简单相关度阈值无法可靠分离正负候选；校准集与 holdout 的分离边际均未达到 TASK-006 DRAFT v1.1 的可靠性门槛；
2. 外部模型 Gate 的离线分类结果为正向技术证据，但它没有进入产品代码或真实聊天路径；
3. 外部 Gate v6 的最大墙钟耗时为 4063ms，不能表述为“通过 4000ms”；网络请求 timeout 也不等于严格的总截止时间；
4. 超时或调用失败时的 keep-all 回退会恢复当前 E004 无关召回问题，因此“Gate 不让聊天失败”不等于“E004 仍被修复”；
5. BL-2 分数低于产品 0.35 粗筛阈值，不进入 Gate，不能计入产品可见的 Gate 分类指标；有效盲测样本仍很小；
6. 临时成本报告中的 token 数字与原始 JSON 不完全一致；离线脚本还存在版本标题、默认参数和覆盖输出风险；
7. 当前正式敏感数据程序规则只覆盖有限类别，不能支撑 Chief 自行认定健康、未成年人、宗教、性取向、地址或生物特征等类别可以外发；
8. 外部 Gate 的低成本证据不抵消隐私、延迟、失败回退和证据治理风险。

证据来源分层：

- 正式项目事实：`project-context/tasks/TASK-006/draft.md`、TASK-005A Release / QA、Eval 契约与正式代码；
- 临时研究证据：`E:\task-006-measurement-tmp\` 下的测量、Gate、盲测、成本和脚本材料；
- Reviewer 第四轮意见未发现正式入库报告，只能标记为聊天/临时证据，不能写成正式 Review 状态。

## 3. 立即生效的约束

1. 外部模型 Gate 仅保留为离线研究证据，不作为当前产品路线；
2. `E:\task-006-measurement-tmp\implementation-plan.md` v1.4 未批准、未入库，不得执行；
3. `E:\task-006-measurement-tmp\TASK-006-E004GATE-CR-01.md` v1.2 仍为 DRAFT，未获实施授权；
4. 默认关闭或仅离线可用的能力不得写成产品问题已经解决；
5. TASK-006 保持 `APPROVED`，不得因本裁决改为 `IN_PROGRESS`、`IMPLEMENTED` 或完成；
6. E004 无关召回缺陷仍存在；未写产品代码，未创建 TASK-006 实施 Worktree；
7. TASK-007、TASK-005B 不启动；主线顺序保持不变；
8. 不调用外部模型补测，不读取或打印密钥，不自行给出法律合规结论。

## 4. 后续工作顺序

Founder 已批准以下规划顺序：

```text
TASK-006 当前事实同步
→ GOV-002 上下文完整性护栏
→ TASK-006 本地相关性 Gate Spike
```

- **当前事实同步**：只校准治理文件，不修改产品；
- **GOV-002**：作为候选治理任务单独起草、批准、分支和 Review，不在本次治理同步中顺带实现；
- **本地 Gate Spike**：作为独立、限时、无用户数据外发的技术验证，最多验证两个候选机制，不接入产品路径。

本地 Spike 通过只代表“技术可行”，不代表 TASK-006 完成。若要进入产品实现，Chief 必须根据 Spike 证据重新起草 Change Request 与实施计划，明确准确率、严格墙钟延迟、资源、回滚、快照来源和盲测口径，再由 Founder 单独批准。

若 Spike 失败或证据不足，由 Chief 返回 Founder 重新裁决暂停 TASK-006、调整产品范围或重排主线；任何重排都不得默认发生。

## 5. 本文件不授权的事项

- 不授权修改产品代码、测试、迁移、Eval 判定或正式产品契约；
- 不授权创建 TASK-006 产品实施 Worktree；
- 不授权提交、推送、合并或部署任何产品变更；
- 不授权启动 GOV-002、本地 Gate Spike、TASK-007 或 TASK-005B；
- 不授权把外部 Gate 的离线效果写成用户已经获得改善；
- 不授权改变 TASK-006 或其他任务状态。
