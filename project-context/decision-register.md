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
| D-GOV-COMM-001 | Founder 沟通、角色交接与上下文恢复规范（回复分级 L1/L2/L3 + 自包含交接卡 + 继承/恢复流程） | APPROVED | Founder 2026-08-12 三项审批全部通过：Review 1 批准 DRAFT v1.2（治理顺序 GOV-CHIEF-001 → GOV-COMM-001 → GOV-002）、同意 delegated、Review 2 批准 implementation-plan v1.4（含两次打回修正：状态事实/提交范围/L1 长度/版本元数据 + 三处文字残留清理）。**唯一权威来源映射**：回复格式 → `agent-response-protocol.md`；交接流程与交接卡结构 → `role-wakeup-and-handoff.md`（模板 `templates/role-handoff-template.md`）；启动与恢复流程 → `context-manifest.md`。任务执行事实：14 文件完成、V1—V9 验证通过、最终独立复审 REVIEW_APPROVED（0/0/0）后，已 Rebase 合并进 `origin/main`（`3412c3c`）。决策状态保持 APPROVED；任务执行状态 = MERGED | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-COMM-001/draft.md`（v1.4）、`tasks/GOV-COMM-001/implementation-plan.md`（v1.4）、`tasks/GOV-COMM-001/review-report.md`、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`context-manifest.md`、`current-state.md` |
| D-GOV-002-SCOPE | 上下文完整性护栏的正式范围、阻断/告警规则和执行模式 | APPROVED | DRAFT v1.2 已获 Founder 批准（2026-08-12，附带沟通体验修订 must_add 5 条 + scope_add 2 文件）；执行模式 delegated 已确认；Review 2 实现计划已批准（2026-08-12）。范围：C1—C6 上下文核验、W1—W3 告警、B1—B3 阻断、统一治理包版本纪律，落盘于 `context-manifest.md` §3.1—§3.4；沟通体验六条落盘于 `agent-response-protocol.md` §5.1 与 `templates/role-handoff-template.md`。不修改产品代码、TASK-006 状态、主线顺序；不实现本地 Gate Spike。任务执行事实：PR #14 已 Rebase 合并（`011168f`，2026-08-12），任务状态 MERGED；决策状态保持 APPROVED。合并后修正见 D-GOV-002-POSTMERGE | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-002/draft.md`（v1.2）、`context-manifest.md`、`agent-response-protocol.md`、`templates/role-handoff-template.md`、`AGENTS.md`、`current-state.md` |
| D-GOV-002-POSTMERGE | GOV-002 合并后修正（A 类遗留 + B 类展示结构） | APPROVED | Founder 2026-08-12 授权补充修复并重新复审：PR #14 已合并（`011168f`）后，Review 3 遗留 6 项（MA1 + M1—M4 + 状态同步）与 B 类交接卡展示结构变更（§0.3/§3.1/templates 3 文件）并入同一 PR（PR #15，分支 `codex/gov-002-post-merge`）；统一治理版本升级至 **2026-08-12.2**；不拆 GOV-003。任务执行事实：**PR #15 已 Rebase 合并（`5de2714`，2026-08-12，MERGED）**，不再待复审 | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-002/draft.md`（v1.2）、`tasks/GOV-002/implementation-report.md`（§9）、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`templates/role-handoff-template.md`、`context-manifest.md`、`current-state.md`、PR #15 |
| D-T006-LOCAL-SPIKE | TASK-006 本地相关性 Gate Spike（第一轮 STOPPED/FAILED；第二轮候选范围 DRAFT v1.2 APPROVED） | **APPROVED（第二轮）** | 第一轮：Spike STOPPED/FAILED（停止条件 9），Founder 裁决 A，收尾 PR #17 已合并（`b975302`）。**第二轮（2026-08-12）**：公开方案调研完成（`spike-r2-research.md`，4 方案：bge-reranker/ColBERT/RRF/sentence-transformers）；**Founder 批准 DRAFT v1.2 候选范围并附带 8 项约束**（§0.2 逐条落盘：候选 A 仅批"本地 cross-encoder 重排"方向、不批具体模型；"零新增依赖"改待核验；Review 2 须含模型事实报告；模型确认前禁运行候选 A；候选 A 权重缺失只停候选 A、候选 B 独立继续，仅无任何候选可执行才整轮停；停止条件 6/10 语义统一；"冻结早于候选设计"指早于 Builder 实现/参数/调优；许可证按模型卡记录）；**执行模式已确认**：HANDOFF REQUIRED / persistent_session；规划 PR（DRAFT+调研+决策登记+状态同步）待建，合并后从 origin/main 创建 `feature/task-006-r2-spike`；合并前不创建实施分支、不唤醒 Builder、不开始实验 | TASK-006 | `tasks/TASK-006/spike-r2-candidate-draft.md`（v1.2+§0.2/§11.1）、`tasks/TASK-006/spike-r2-research.md`、`tasks/TASK-006/spike-stop-cr.md`、`current-state.md` |
| D-T006-R3-SPIKE | TASK-006 第三轮「检索后相关性判断」对照 Spike（DRAFT v1.1） | **APPROVED** | Founder 2026-08-12 批准 DRAFT v1.1（经 v1.0 打回五项修订：任务拆分 / REST 事实定级 / 主·补充实验分离 / 完成度分档 / 样本规模与措辞）。方案 A 零新增依赖基线（mem0 2.0.13 阈值能力）/ 方案 B 本地 Cross-Encoder 重排（仅批方向，具体模型未批）/ 方案 C 外部大模型相关性裁判（效果上限对照，不代表获准生产）三方案对照；**主实验（固定候选池判断器对比）与补充实验（Mem0 阈值端到端召回）分离、分表不混表**；**完成度分档**：三方案均获授权并运行＝完整对比；B/C 未获授权或不可执行＝部分证据，不得宣称第三轮完整通过，返回 Founder；冻结候选池规模与类别分布（明确相关≥8 / 明确无关≥8 / 容易混淆≥8 / 应返回零条≥3 场景 / 关键记忆≥5，总≥30）；关键记忆防漏独立门；不沿用 P95>200ms 淘汰旧前提。批准后先落盘 + 单一规划 PR（**PR #19 已合并 @ `6660ca2`**）；规划合入后已单独提交执行模式判断（D-T006-R3-EXEC，persistent_session 已确认） | TASK-006 | `tasks/TASK-006/spike-r3-candidate-draft.md`（v1.1）、PR #19 |
| D-T006-R3-EXEC | 第三轮 Spike 执行模式 | **APPROVED** | Founder 2026-08-12 确认：**HANDOFF REQUIRED —— 长期 Builder 会话（persistent_session）**；理由：技术 Spike 需多轮测量—调整、中途需 Founder 授权（模型下载/外部调用/数据外发）、三方案对照中间态信息量大、单次子 Agent 不可行。实施分支 `feature/task-006-r3-spike` 已创建并落盘 Builder 交接包 | TASK-006 | `tasks/TASK-006/spike-r3-builder-handoff.md`（执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main） |
| D-T006-R3-B-MODEL | 方案 B 具体模型与下载授权 | **APPROVED（仅 B-1）** | Founder 2026-08-13 裁决：**仅批准 B-1 `BAAI/bge-reranker-base`**。授权严格限定：固定版本 `2cfc18c9415c912f9d8155881c133215df768a70`；运行路径 FastEmbed 0.8.0 + ONNX Runtime；仅下载 onnx/model.onnx、tokenizer、config（≤1.2GB）；禁下载 safetensors/pytorch_model.bin/v2-m3/其他模型；禁装 torch/sentence-transformers 等新依赖；下载后只做本地加载 + 合成文本最小推理检查 + 更新 model-facts.md。**选 B-1 非因效果必然最好**（fastembed 0.8.0 与 mem0 2.0.13 唯一同时原生支持、零新增依赖、中文证据更实）；效果仍待 Spike 实测。v2-m3 暂不批准（需新增 sentence-transformers+torch、体积 2.27GB）。**下载核验已完成**（Builder 2026-08-13，实施分支 `feature/task-006-r3-spike` @ `007722e`）：模型卡预估 ONNX 约 1.04GB、实测 5 文件 1.13GB（≤1.2GB）、SHA-256 与 HF LFS oid 一致、最小推理 6 对合成文本方向正确、零产品代码改动 | TASK-006 / 方案 B | `tasks/TASK-006/spike-r3/b-model-selection-card.md`、`tasks/TASK-006/spike-r3/model-facts.md`（执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main） |
| D-T006-R3-C-EXT | 方案 C 外部调用与数据外发政策 | **APPROVED（有条件，待 S0.3 连通检查）** | Founder 2026-08-13 裁决：**有条件批准方案 C 外部调用**——仅合成数据、现有 DeepSeek `deepseek-chat`、整批单次判断、≤100 次调用、费用≤10 元、零真实用户数据、完整记录调用次数/延迟/费用/失败。**真实用户记忆外发仍禁止**；外部调用仅限白名单 DeepSeek 地址，其余外部访问仍禁止（P6 修正为"默认禁外联，C 仅白名单放行 DeepSeek"）。**待 S0.3 连通检查**：通过后进入 S1，失败则只停 C（A/B 独立继续）。方案 C 仍为效果上限对照，不代表获准进入生产 | TASK-006 / 方案 C / 隐私 / 费用 | `tasks/TASK-006/spike-r3/implementation-plan.md`（§P6/P5-B/S0.3，执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main）、`tasks/TASK-006/spike-r3-builder-handoff.md`（执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main） |

## 当前待 Founder 决策

- ✅ TASK-006 DRAFT v1.1 已批准；见 D-T006-1；
- ✅ TASK-006 路线 B 与后续规划顺序已批准；见 D-T006-ROUTE-B；
- ✅ **GOV-CHIEF-001 已执行完毕**（2026-08-12）：三项审批通过、独立复审 REVIEW_APPROVED、PR #11 已 Rebase 合并（`42786da`）；见 D-GOV-CHIEF-001；
- ✅ **GOV-COMM-001 已执行完毕**（2026-08-12）：三项审批通过、独立复审 REVIEW_APPROVED（0/0/0）、已 Rebase 合并进 `origin/main`（`3412c3c`）；见 D-GOV-COMM-001；
- ✅ **GOV-002 已合并（含合并后修正 PR #15）**（2026-08-12）：DRAFT v1.2 已批准、delegated 已确认、Review 2 已批准；PR #14 已合并（`011168f`）；合并后修正 PR #15 已 Rebase 合并（`5de2714`，MERGED，不再待复审）；见 D-GOV-002-SCOPE 与 D-GOV-002-POSTMERGE；
- ✅ **TASK-006 本地 Gate Spike 已裁决**（2026-08-12）：DRAFT v1.2 已批准并执行，Spike 停止（STOPPED/FAILED，停止条件 9）；**Founder 裁决选项 A**（接受失败结论；禁止补 H4 词表/重跑冻结 holdout/重启外部模型路线）；收尾 PR 待建并交独立 Reviewer；见 D-T006-LOCAL-SPIKE 与 CR-T006-SPIKE-STOP-01；
- ✅ **TASK-006 第三轮「检索后相关性判断」对照 Spike DRAFT v1.1 已批准**（2026-08-12）：三方案对照、主/补充实验分离、完成度分档、样本规模与关键记忆防漏门；见 D-T006-R3-SPIKE；
- ✅ **第三轮执行模式已确认**（2026-08-12）：HANDOFF REQUIRED / persistent_session；见 D-T006-R3-EXEC；
- ✅ **方案 B 模型已批准 B-1 并下载核验完成**（2026-08-13）：仅 B-1 `bge-reranker-base` 固定版本 `2cfc18c`、预估 1.04GB／实测 1.13GB（≤1.2GB）、SHA-256 一致、最小推理通过；见 D-T006-R3-B-MODEL；
- ✅ **方案 C 已授权、待 S0.3 连通检查**（2026-08-13）：仅合成数据、DeepSeek、≤100 次/≤10 元、零真实数据；真实用户记忆外发仍禁止；通过后进入 S1，失败只停 C；见 D-T006-R3-C-EXT；
- TASK-005A 是否 CLOSED：合并后主线 QA 已通过，但当前保持 MERGED（QA_APPROVED_MAINLINE），不得自行改为生产 VERIFIED 或 CLOSED。

## 后续决策队列（当前不阻塞）

| ID | 事项 | 何时需要决定 |
|---|---|---|
| D-T004-SEMANTICS | 是否采用"删除后关闭自动写入，仅显式重新记忆"的确定性产品语义 | TASK-004 满足重启条件时 |
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
