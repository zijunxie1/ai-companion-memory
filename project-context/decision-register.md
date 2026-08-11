# Decision Register｜项目决策登记

> 目的：防止上下文压缩、模型切换或多 Agent 交接后丢失已批准、待决和已否决事项。
>
> 只有 Founder 明确批准的项目方向或已有正式裁决文件支持的事项才能标为 APPROVED。

## 状态定义

| 状态 | 含义 |
|---|---|
| PROPOSED | 已提出，尚未批准 |
| NEEDS_DECISION | 证据已具备，等待 Founder 裁决 |
| APPROVED | Founder 已明确批准 |
| SUPERSEDED | 被后续批准决策取代，保留历史 |
| REJECTED | 已否决，不得在无新证据时重新提出 |
| PAUSED | 暂停；仅在登记的重启条件满足时重启 |

## 当前决策看板

| ID | 决策 | 状态 | 当前结论 / 推荐 | 影响范围 | 证据入口 |
|---|---|---|---|---|---|
| D-T003-BPLUS | TASK-003 阶段 2 范围 | APPROVED | 采用 B+：8 Case 真实纵向闭环；20 Case 延后，不把 8 Case 写成 P1 整体完成 | TASK-003 | `tasks/TASK-003/draft-phase2-bplus.md` |
| D-T004-PAUSE | 删除后禁止复活 | PAUSED | 保持 DRAFT，不降低 E006；只有确定性产品语义或底层结构化过滤能力出现时重启 | TASK-004 | `tasks/TASK-004/spike-stop-record.md` |
| D-ROADMAP-001 | 后续主线顺序 | APPROVED | GOV-001 → 005A → 006 → 007 → 005B → 完整度 → 按需 CR-B | P1 主线 | `project-mainline-roadmap.md` |
| D-GOV-001-A1 | main/master 收敛 | APPROVED | A1 已批准（Founder 2026-08-10）并全部执行完毕：GOV-001A PR #5 已合并（@`4baabf0`）；GOV-001B 状态同步 PR #6 已合并（@`5901c64`）；main 已吸收 master 全部内容（master 独有 0），治理文件入库完成 | Git / TASK-003 状态 | `current-state.md`、`tasks/GOV-001/implementation-plan.md`、PR #5、PR #6 |
| D-T005A-1 | TASK-005A Config Snapshot Completeness | APPROVED（已执行完毕） | **合并事实（2026-08-11 补记）**：DRAFT v2.1 已批准（Founder 2026-08-11）；实现完成并经 Review 3 复审 REVIEW_APPROVED（11/11 验收）；**PR #8 已于 2026-08-11 06:37（Asia/Shanghai）Rebase 合并，mergeCommit = `4f93fa6`（origin/main）**；**合并后主线 QA 通过：QA_APPROVED_MAINLINE**（QA Worktree 基线 `4f93fa6`，Run #28 completed，E001—E008 全链路真实执行无新增执行错误；快照 16 字段及来源真实验证；历史 Run 三种格式兼容；/api/chat 无回归；快照与日志未发现秘密值）；**E006 deletion PASS、E007 safety PASS、E004 无关召回 FAIL（2 条，允许 ≤1）如实记录**——**E004 属于 TASK-006 的已知产品问题，不是 TASK-005A 缺陷**；**未进行生产部署**（本地/测试环境验证不得表述为生产 VERIFIED）；TASK-005A 状态 = MERGED（合并后主线验证结论 = QA_APPROVED_MAINLINE），是否 CLOSED 按状态机后续裁决 | TASK-005A | `tasks/TASK-005A/draft.md`（v2.1）、`implementation-plan.md`（v1.1）、`implementation-report.md`、`tasks/TASK-005A/release-qa-report.md`、PR #8（`4f93fa6`）、Run #28（eval_runs 记录） |
| D-T006-1 | TASK-006 E004 无关召回 Gate | APPROVED | DRAFT v1.1 已批准（Founder 2026-08-11）：目标仍为 E004 无关召回降为 0，且正向召回和强约束无回归；E004 当前仍未解决。具体技术路线由后续 D-T006-ROUTE-B 约束；任务保持 APPROVED，不因离线研究进入 IN_PROGRESS | TASK-006 | `tasks/TASK-006/draft.md`（v1.1）、`tasks/TASK-006/route-b-decision.md` |
| D-T006-ROUTE-B | TASK-006 产品技术路线 | APPROVED | Founder 选择决策包路线 B：不把外部模型 Gate 接入用户产品路径，转为不外发用户查询、Memory 或其他用户数据的本地模型、规则或检索路线。外部 Gate 只保留为离线研究证据；临时实施计划 v1.4 与 CR-01 v1.2 未批准；TASK-006 保持 APPROVED。TASK-006 内部前置治理顺序 = GOV-CHIEF-001 → GOV-COMM-001 → GOV-002 → 本地 Gate Spike；该澄清不改变产品任务顺序或路线 B，Spike 通过后仍需新 CR、实施计划与 Founder 批准 | TASK-006 / 隐私 / 延迟 / 主线顺序 | `tasks/TASK-006/route-b-decision.md`、`current-state.md`、`project-mainline-roadmap.md` Phase 2 |
| D-RESP-001 | Founder 友好回复与上下文恢复协议 | APPROVED | 使用产品摘要、完整决策看板、主决策、外部复核包、技术附录和合规自检；建立启动回执与文件化项目记忆 | 全部 Agent | `agent-response-protocol.md`、`context-manifest.md` |
| D-GOV-CHIEF-001 | 执行 Chief / 决策 Chief 角色拆分与状态校准 | APPROVED | Founder 于 2026-08-12 批准 GOV-CHIEF-001 DRAFT v1.0、同意 delegated、批准实现计划 v1.0；并批准 Reviewer 打回后的范围扩展，仅用于同步路线图与 TASK-006 路线裁决中的角色边界和治理顺序。原 Chief 转为决策 Chief（只处理八类升级事项），新实例 `operational-chief-2026-08-12-01` 为执行 Chief（日常职责）；八类升级条件与升级卡固定结构落盘于 `role-wakeup-and-handoff.md` §5.1；治理顺序 = GOV-CHIEF-001 → GOV-COMM-001 → GOV-002（只确定 TASK-006 内部前置治理顺序，不改变产品任务顺序）。任务执行事实：PR #11 已 Rebase 合并（`42786da`），执行完成（详见 `current-state.md` 与实现报告） | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-CHIEF-001/draft.md`、`tasks/GOV-CHIEF-001/implementation-plan.md`、`tasks/GOV-CHIEF-001/implementation-report.md`、`tasks/GOV-CHIEF-001/review-report.md`、`CHIEF-BOOTSTRAP.md`、`role-wakeup-and-handoff.md`、`project-mainline-roadmap.md`、`tasks/TASK-006/route-b-decision.md`、`current-state.md` |
| D-GOV-COMM-001 | Founder 沟通、角色交接与上下文恢复规范（回复分级 L1/L2/L3 + 自包含交接卡 + 继承/恢复流程） | APPROVED | Founder 2026-08-12 三项审批全部通过：Review 1 批准 DRAFT v1.2（治理顺序 GOV-CHIEF-001 → GOV-COMM-001 → GOV-002）、同意 delegated、Review 2 批准 implementation-plan v1.4（含两次打回修正：状态事实/提交范围/L1 长度/版本元数据 + 三处文字残留清理）。**唯一权威来源映射**：回复格式 → `agent-response-protocol.md`；交接流程与交接卡结构 → `role-wakeup-and-handoff.md`（模板 `templates/role-handoff-template.md`）；启动与恢复流程 → `context-manifest.md`。前置条件已满足（GOV-CHIEF-001 已合入）。任务执行状态 = IMPLEMENTED（14 文件完成，V1—V9 验证通过，三轮限定修复），**最终独立复审 REVIEW_APPROVED（0/0/0）**，待 Founder 合并裁决 | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-COMM-001/draft.md`（v1.4）、`tasks/GOV-COMM-001/implementation-plan.md`（v1.4）、`tasks/GOV-COMM-001/review-report.md`、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`context-manifest.md`、`current-state.md` |

## 当前待 Founder 决策

- ✅ TASK-006 DRAFT v1.1 已批准；见 D-T006-1；
- ✅ TASK-006 路线 B 与后续规划顺序已批准；见 D-T006-ROUTE-B；
- ✅ **GOV-CHIEF-001 已执行完毕**（2026-08-12）：三项审批通过、独立复审 REVIEW_APPROVED、PR #11 已 Rebase 合并（`42786da`）；见 D-GOV-CHIEF-001；
- ✅ **GOV-COMM-001 三项审批已全部通过**（2026-08-12）：Review 1 批准 DRAFT v1.2、同意 delegated、Review 2 批准 implementation-plan v1.4；见 D-GOV-COMM-001。任务执行状态 = IMPLEMENTED（实施完成，V1—V9 验证通过），待独立 Review；由 Founder 决定何时发送 Reviewer 交接文件；独立 Review 是完成和合并前的必经步骤；
- **GOV-002**：本次只批准其作为下一项规划基础；正式任务 DRAFT、范围、验收和执行模式仍需单独裁决（在 GOV-COMM-001 完成后）；
- **TASK-006 本地 Gate Spike**：本次只批准其作为 GOV-002 后的规划基础；正式任务 DRAFT、候选机制、验收、停止条件和执行模式仍需单独裁决；
- TASK-005A 是否 CLOSED：合并后主线 QA 已通过，但当前保持 MERGED（QA_APPROVED_MAINLINE），不得自行改为生产 VERIFIED 或 CLOSED。

## 后续决策队列（当前不阻塞）

| ID | 事项 | 何时需要决定 |
|---|---|---|
| D-T004-SEMANTICS | 是否采用“删除后关闭自动写入，仅显式重新记忆”的确定性产品语义 | TASK-004 满足重启条件时 |
| D-GOV-002-SCOPE | 上下文完整性护栏的正式范围、阻断/告警规则和执行模式 | TASK-006 治理同步合并后 |
| D-T006-LOCAL-SPIKE | 本地 Gate Spike 的候选机制、盲测、严格墙钟延迟和资源门 | GOV-002 完成后 |
| D-T006-IMPLEMENT | 本地 Spike 通过后是否批准新的 Change Request 与产品实施计划 | Spike 证据通过独立 Review 后 |
| D-20CASE | 20 Case 的范围、样本结构和完成门 | TASK-007/005B 后 |
| D-CRB | 是否建设指标配置、发布与历史兼容 | 固定模板真实阻塞版本决策时 |
| D-MASTER-RETIRE | 是否删除远端 master | 新 main 合并、验证并保留归档引用后单独裁决 |

## 更新规则

- Chief 负责提出和维护决策卡；
- Founder 负责批准、否决或暂停；
- Builder 不得修改决策结论，只能提交 Change Request；
- Reviewer 检查实现是否符合已批准决策；
- 任何状态变更必须带日期、依据文件和影响任务；
- 聊天中的建议若未进入本表或任务文件，不作为长期决策事实。
