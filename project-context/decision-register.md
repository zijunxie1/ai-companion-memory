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
| D-T006-1 | TASK-006 E004 无关召回 Gate | APPROVED | DRAFT v1.1 已批准（Founder 2026-08-11，任务方案 Review 通过，TASK-006 进入 APPROVED）：目标=E004 无关召回降为 0 且正向/强约束无回归；先测量再选方案（§3.1 可执行定义；holdout 泛化验证为默认必做验收）；不改评测判定规则；Gate 运行护栏（§3.3）；停止条件 6 条；执行模式门待确认（建议 HANDOFF REQUIRED）；暂不实现、不唤醒 Builder | TASK-006 | `tasks/TASK-006/draft.md`（v1.1）、`project-mainline-roadmap.md` Phase 2 |
| D-RESP-001 | Founder 友好回复与上下文恢复协议 | APPROVED | 使用产品摘要、完整决策看板、主决策、外部复核包、技术附录和合规自检；建立启动回执与文件化项目记忆 | 全部 Agent | `agent-response-protocol.md`、`context-manifest.md` |

## 当前待 Founder 决策

- ✅ TASK-006 DRAFT v1.1 已批准（Founder 2026-08-11，任务方案 Review 通过，TASK-006 进入 APPROVED）；见 D-T006-1；
- **TASK-006 执行模式门（当前主决策）**：确认执行方式（本窗口建议 HANDOFF REQUIRED 长期 Builder 会话）；
- **治理文件入库授权（当前主决策）**：6 改 2 新入库方案待 Founder 确认（commit/push/PR 授权）；
- TASK-005A 是否 CLOSED：合并后主线 QA 已通过，但按状态机 CLOSED 需在后续验证/裁决后确定，当前保持 MERGED（验证结论：QA_APPROVED_MAINLINE）。

## 后续决策队列（当前不阻塞）

| ID | 事项 | 何时需要决定 |
|---|---|---|
| D-T004-SEMANTICS | 是否采用“删除后关闭自动写入，仅显式重新记忆”的确定性产品语义 | TASK-004 满足重启条件时 |
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
