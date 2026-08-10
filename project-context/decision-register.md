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
| D-GOV-001-A1 | main/master 收敛 | APPROVED | A1 已批准（Founder 2026-08-10）并全部执行完毕：GOV-001A PR #5 已合并（@`4baabf0`，2026-08-11）；GOV-001B 状态同步 PR #6 已合并（@`5901c64`，2026-08-11）；main 已吸收 master 全部内容（master 独有 0），治理文件入库完成 | Git / TASK-003 状态 | `current-state.md`、`tasks/GOV-001/implementation-plan.md`、PR #5、PR #6 |
| D-T005A-1 | TASK-005A Config Snapshot Completeness | APPROVED | DRAFT v2.1 已批准（Founder 2026-08-11）：字段方案（persona_prompt_hash→persona_data_hash 兼容旧键、保留 extract_prompt_hash 真实内容哈希、extract_prompt_version 可选独立字段）；CHAT_MODEL/CHATFLOW_VERSION 为 optional/declared；embed_model 无共享版本化来源/只读运行接口 → **unavailable + reason**，不新增 env（Founder 2026-08-11 定稿，非 declared）；UI 来源枚举 observed/code/declared/derived；不改阈值/判定/schema/产品行为。实施计划 v1.1 已批准（Review 2 通过），实现已完成（IMPLEMENTED，2026-08-11）| TASK-005A | `tasks/TASK-005A/draft.md`（v2.1）、`implementation-plan.md`（v1.1）、`project-mainline-roadmap.md` Phase 1 |
| D-RESP-001 | Founder 友好回复与上下文恢复协议 | APPROVED | 使用产品摘要、完整决策看板、主决策、外部复核包、技术附录和合规自检；建立启动回执与文件化项目记忆 | 全部 Agent | `agent-response-protocol.md`、`context-manifest.md` |

## 当前待 Founder 决策

（无 —— D-GOV-001-A1 已批准并全部执行完毕（PR #5 / PR #6 / PR #7 已合并）；D-T005A-1 已批准（2026-08-11）；TASK-005A 执行模式已确认（HANDOFF REQUIRED）并完成实现；当前待决为 Review 3 结果与合并裁决，属流程门，不阻塞主线审批。）

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
