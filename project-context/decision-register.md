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
| D-T006-ROUTE-B | TASK-006 产品技术路线 | APPROVED | Founder 选择决策包路线 B：不把外部模型 Gate 接入用户产品路径，转为不外发用户查询、Memory 或其他用户数据的本地模型、规则或检索路线。外部 Gate 只保留为离线研究证据；临时实施计划 v1.4 与 CR-01 v1.2 未批准；TASK-006 保持 APPROVED。TASK-006 内部前置治理顺序 = GOV-CHIEF-001 → GOV-COMM-001 → GOV-002 → 本地 Gate Spike；该澄清不改变产品任务顺序或路线 B，Spike 通过后仍需新 CR、实施计划与 Founder 批准。**2026-08-14 展示阶段例外**：见 D-T006-SHOWCASE-EXCEPTION——作品集展示阶段临时取消真实数据外发限制，路线 B（本地不外发）仍是未来正式产品/多用户的目标路线 | TASK-006 / 隐私 / 延迟 / 主线顺序 | `tasks/TASK-006/route-b-decision.md`、`current-state.md`、`project-mainline-roadmap.md` Phase 2 |
| D-RESP-001 | Founder 友好回复与上下文恢复协议 | APPROVED（展示方式由 D-GOV-COMM-002 修订） | “先让 Founder 理解、事实/建议/批准分开、技术证据保留、启动回执与文件化记忆”继续生效；固定大模板、回复密度、讨论/交接分层和明确决定后的动作以 D-GOV-COMM-002 为准 | 全部 Agent | `agent-response-protocol.md`、`context-manifest.md`、D-GOV-COMM-002 |
| D-GOV-COMM-002 | Founder 对话与 Agent 执行交接分层修正 | APPROVED | Founder 2026-08-15 明确批准直接执行：给 Founder 的正文以小白能听懂、能够判断为目标，密度随事情难度变化；给后续 Agent 的完整交接可保留全部技术判断，确保不依赖旧聊天执行；讨论未对齐时禁止提前出卡，Founder 决定可唯一解释后直接执行/交接、不再二次确认；压缩后必须重读正式规则、当前任务/交接和批准边界，不能只凭摘要继续。两次真实 Review 回复又补充了三个已批准修正：**完整报告只进 PR；“小白能懂”必须解释技术结论对 Founder 的实际含义，不能只是缩短技术话；Reviewer 建议合并不等于 Founder 已批准合并，决定前不得提前给卡。** Founder 同时授权检查 Hermes 长期会话的 Skill 污染并直接修正：全局 Skill/Memory/旧会话只作线索，不能覆盖仓库规则或作为回复模板；项目一次性 Skill 退出后续注入；全局 Skill 写入须经批准。实现不动产品、数据库、评测或 TASK-006 实验证据；规则包在合并正式主线前仍须独立 Review | 全部 Agent | `tasks/GOV-COMM-002/draft.md`、`tasks/GOV-COMM-002/hermes-skill-audit.md`、`agent-response-protocol.md`、`context-manifest.md`、`role-wakeup-and-handoff.md`、`templates/role-handoff-template.md` |
| D-GOV-CHIEF-001 | 执行 Chief / 决策 Chief 角色拆分与状态校准 | APPROVED | Founder 于 2026-08-12 批准 GOV-CHIEF-001 DRAFT v1.0、同意 delegated、批准实现计划 v1.0；并批准 Reviewer 打回后的范围扩展，仅用于同步路线图与 TASK-006 路线裁决中的角色边界和治理顺序。原 Chief 转为决策 Chief（只处理八类升级事项），新实例 `operational-chief-2026-08-12-01` 为执行 Chief（日常职责）；八类升级条件与升级卡固定结构落盘于 `role-wakeup-and-handoff.md` §5.1；治理顺序 = GOV-CHIEF-001 → GOV-COMM-001 → GOV-002（只确定 TASK-006 内部前置治理顺序，不改变产品任务顺序）。任务执行事实：PR #11 已 Rebase 合并（`42786da`），执行完成（详见 `current-state.md` 与实现报告） | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-CHIEF-001/draft.md`、`tasks/GOV-CHIEF-001/implementation-plan.md`、`tasks/GOV-CHIEF-001/implementation-report.md`、`tasks/GOV-CHIEF-001/review-report.md`、`CHIEF-BOOTSTRAP.md`、`role-wakeup-and-handoff.md`、`project-mainline-roadmap.md`、`tasks/TASK-006/route-b-decision.md`、`current-state.md` |
| D-GOV-COMM-001 | Founder 沟通、角色交接与上下文恢复规范（回复分级 L1/L2/L3 + 自包含交接卡 + 继承/恢复流程） | APPROVED | Founder 2026-08-12 三项审批全部通过：Review 1 批准 DRAFT v1.2（治理顺序 GOV-CHIEF-001 → GOV-COMM-001 → GOV-002）、同意 delegated、Review 2 批准 implementation-plan v1.4（含两次打回修正：状态事实/提交范围/L1 长度/版本元数据 + 三处文字残留清理）。**唯一权威来源映射**：回复格式 → `agent-response-protocol.md`；交接流程与交接卡结构 → `role-wakeup-and-handoff.md`（模板 `templates/role-handoff-template.md`）；启动与恢复流程 → `context-manifest.md`。任务执行事实：14 文件完成、V1—V9 验证通过、最终独立复审 REVIEW_APPROVED（0/0/0）后，已 Rebase 合并进 `origin/main`（`3412c3c`）。决策状态保持 APPROVED；任务执行状态 = MERGED | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-COMM-001/draft.md`（v1.4）、`tasks/GOV-COMM-001/implementation-plan.md`（v1.4）、`tasks/GOV-COMM-001/review-report.md`、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`context-manifest.md`、`current-state.md` |
| D-GOV-002-SCOPE | 上下文完整性护栏的正式范围、阻断/告警规则和执行模式 | APPROVED | DRAFT v1.2 已获 Founder 批准（2026-08-12，附带沟通体验修订 must_add 5 条 + scope_add 2 文件）；执行模式 delegated 已确认；Review 2 实现计划已批准（2026-08-12）。范围：C1—C6 上下文核验、W1—W3 告警、B1—B3 阻断、统一治理包版本纪律，落盘于 `context-manifest.md` §3.1—§3.4；当时的沟通体验规则已落盘，现行展示/密度/交接规则由 D-GOV-COMM-002 修订并以 `agent-response-protocol.md` 当前版本为准。不修改产品代码、TASK-006 状态、主线顺序；不实现本地 Gate Spike。任务执行事实：PR #14 已 Rebase 合并（`011168f`，2026-08-12），任务状态 MERGED；决策状态保持 APPROVED。合并后修正见 D-GOV-002-POSTMERGE | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-002/draft.md`（v1.2）、`context-manifest.md`、`agent-response-protocol.md`、`templates/role-handoff-template.md`、`AGENTS.md`、`current-state.md` |
| D-GOV-002-POSTMERGE | GOV-002 合并后修正（A 类遗留 + B 类展示结构） | APPROVED | Founder 2026-08-12 授权补充修复并重新复审：PR #14 已合并（`011168f`）后，Review 3 遗留 6 项（MA1 + M1—M4 + 状态同步）与 B 类交接卡展示结构变更（§0.3/§3.1/templates 3 文件）并入同一 PR（PR #15，分支 `codex/gov-002-post-merge`）；统一治理版本升级至 **2026-08-12.2**；不拆 GOV-003。任务执行事实：**PR #15 已 Rebase 合并（`5de2714`，2026-08-12，MERGED）**，不再待复审 | 全部 Agent / TASK-006 前置治理 | `tasks/GOV-002/draft.md`（v1.2）、`tasks/GOV-002/implementation-report.md`（§9）、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`templates/role-handoff-template.md`、`context-manifest.md`、`current-state.md`、PR #15 |
| D-T006-LOCAL-SPIKE | TASK-006 本地相关性 Gate Spike（第一轮 STOPPED/FAILED；第二轮候选范围 DRAFT v1.2 APPROVED） | **APPROVED（第二轮）** | 第一轮：Spike STOPPED/FAILED（停止条件 9），Founder 裁决 A，收尾 PR #17 已合并（`b975302`）。**第二轮（2026-08-12）**：公开方案调研完成（`spike-r2-research.md`，4 方案：bge-reranker/ColBERT/RRF/sentence-transformers）；**Founder 批准 DRAFT v1.2 候选范围并附带 8 项约束**（§0.2 逐条落盘：候选 A 仅批"本地 cross-encoder 重排"方向、不批具体模型；"零新增依赖"改待核验；Review 2 须含模型事实报告；模型确认前禁运行候选 A；候选 A 权重缺失只停候选 A、候选 B 独立继续，仅无任何候选可执行才整轮停；停止条件 6/10 语义统一；"冻结早于候选设计"指早于 Builder 实现/参数/调优；许可证按模型卡记录）；**执行模式已确认**：HANDOFF REQUIRED / persistent_session；规划 PR（DRAFT+调研+决策登记+状态同步）待建，合并后从 origin/main 创建 `feature/task-006-r2-spike`；合并前不创建实施分支、不唤醒 Builder、不开始实验 | TASK-006 | `tasks/TASK-006/spike-r2-candidate-draft.md`（v1.2+§0.2/§11.1）、`tasks/TASK-006/spike-r2-research.md`、`tasks/TASK-006/spike-stop-cr.md`、`current-state.md` |
| D-T006-R3-SPIKE | TASK-006 第三轮「检索后相关性判断」对照 Spike（DRAFT v1.1） | **APPROVED（执行完毕，三方案候选级停止）** | Founder 2026-08-12 批准 DRAFT v1.1（经 v1.0 打回五项修订：任务拆分 / REST 事实定级 / 主·补充实验分离 / 完成度分档 / 样本规模与措辞）。方案 A 零新增依赖基线（mem0 2.0.13 阈值能力）/ 方案 B 本地 Cross-Encoder 重排（仅批方向，具体模型未批）/ 方案 C 外部大模型相关性裁判（效果上限对照，不代表获准生产）三方案对照；**主实验（固定候选池判断器对比）与补充实验（Mem0 阈值端到端召回）分离、分表不混表**；**完成度分档**：三方案均获授权并运行＝完整对比；B/C 未获授权或不可执行＝部分证据，不得宣称第三轮完整通过，返回 Founder；冻结候选池规模与类别分布（明确相关≥8 / 明确无关≥8 / 容易混淆≥8 / 应返回零条≥3 场景 / 关键记忆≥5，总≥30）；关键记忆防漏独立门；不沿用 P95>200ms 淘汰旧前提。批准后先落盘 + 单一规划 PR（**PR #19 已合并 @ `6660ca2`**）；规划合入后已单独提交执行模式判断（D-T006-R3-EXEC，persistent_session 已确认）。**执行结果（2026-08-14，已完毕）**：S1 候选池已冻结（32 对，SHA256 `70994185...`，校准 22 + holdout 10）；S2/S3 校准 + 方案 C 校准均完成——**方案 A 分离边际 -0.2323、方案 B -0.3794、方案 C -0.5667，三方案全部触发候选级停止**（DRAFT §9.1-1；方案 C 另波动 0.35 判据失效）；方案 B 独立门漏 3 个关键候选配对（涉及 2 条不同关键记忆 K1、K4）；holdout 10 对全程零读取/零运行。**本轮结论 = STOPPED / FAILED，形成部分证据**（三方案均不达标，非"完整对比通过"）；TASK-006 保持 APPROVED 不变，不写成完成。**Founder 2026-08-15 方向裁决见 D-T006-R4-DIRECTION** | TASK-006 | `tasks/TASK-006/spike-r3-candidate-draft.md`（v1.1）、PR #19、`tasks/TASK-006/spike-r3/calibration-result.md`（执行分支证据 `feature/task-006-r3-spike` @ `c3d73cc`，收尾分支从该锚点复制并逐字节核验一致） |
| D-T006-R3-EXEC | 第三轮 Spike 执行模式 | **APPROVED** | Founder 2026-08-12 确认：**HANDOFF REQUIRED —— 长期 Builder 会话（persistent_session）**；理由：技术 Spike 需多轮测量—调整、中途需 Founder 授权（模型下载/外部调用/数据外发）、三方案对照中间态信息量大、单次子 Agent 不可行。实施分支 `feature/task-006-r3-spike` 已创建并落盘 Builder 交接包 | TASK-006 | `tasks/TASK-006/spike-r3-builder-handoff.md`（执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main） |
| D-T006-R3-B-MODEL | 方案 B 具体模型与下载授权 | **APPROVED（仅 B-1）** | Founder 2026-08-13 裁决：**仅批准 B-1 `BAAI/bge-reranker-base`**。授权严格限定：固定版本 `2cfc18c9415c912f9d8155881c133215df768a70`；运行路径 FastEmbed 0.8.0 + ONNX Runtime；仅下载 onnx/model.onnx、tokenizer、config（≤1.2GB）；禁下载 safetensors/pytorch_model.bin/v2-m3/其他模型；禁装 torch/sentence-transformers 等新依赖；下载后只做本地加载 + 合成文本最小推理检查 + 更新 model-facts.md。**选 B-1 非因效果必然最好**（fastembed 0.8.0 与 mem0 2.0.13 唯一同时原生支持、零新增依赖、中文证据更实）；效果仍待 Spike 实测。v2-m3 暂不批准（需新增 sentence-transformers+torch、体积 2.27GB）。**下载核验已完成**（Builder 2026-08-13，实施分支 `feature/task-006-r3-spike` @ `007722e`）：模型卡预估 ONNX 约 1.04GB、实测 5 文件 1.13GB（≤1.2GB）、SHA-256 与 HF LFS oid 一致、最小推理 6 对合成文本方向正确、零产品代码改动 | TASK-006 / 方案 B | `tasks/TASK-006/spike-r3/b-model-selection-card.md`、`tasks/TASK-006/spike-r3/model-facts.md`（执行分支证据 `feature/task-006-r3-spike` @ `007722e`，未合入 main） |
| D-T006-R3-C-EXT | 方案 C 外部调用与数据外发政策 | **APPROVED（展示阶段例外；S0.3 通过；校准阶段运行已批准并执行完毕）** | Founder 2026-08-13 裁决：**有条件批准方案 C 外部调用**——现有 DeepSeek `deepseek-v4-flash`、整批单次判断、≤100 次调用、费用≤10 元、完整记录调用次数/延迟/费用/失败。**模型名补充裁决依据**：S0.3 连通检查确认容器实际配置和 API 可用列表均为 `deepseek-v4-flash`，且无 `deepseek-chat`；Founder 随后于 2026-08-13 明确批准将方案 C 实验模型从 `deepseek-chat` 调整为 `deepseek-v4-flash`，仅限本次合成数据 Spike，其余授权边界不变。正式执行证据见执行分支 `feature/task-006-r3-spike` @ `796a8ad` 的 `spike-r3/preflight-check.md`。**2026-08-14 展示阶段例外（D-T006-SHOWCASE-EXCEPTION）**：作品集展示阶段取消「仅合成数据」限制，允许方案 C 处理 Founder 自有真实查询与候选记忆；该例外不适用于未来正式产品或其他用户。外部调用仅限白名单 DeepSeek 地址，其余外部访问仍禁止。**S0.3 连通检查已通过**（Builder 2026-08-14：HTTP 200，可用模型 `deepseek-v4-flash`/`deepseek-v4-pro`，1 次只读列表请求）。**Founder 2026-08-14 批准方案 C 校准阶段运行**：允许原长期 Builder 使用 `deepseek-v4-flash` 对已冻结 22 个校准配对执行相关性判断并确定阈值；调用 ≤100 次、费用 ≤10 元、仅白名单 DeepSeek 地址；10 个 holdout 配对继续封存、不得读取或运行；若分离边际不达标或漏关键记忆，立即停止并报告。**执行结果（2026-08-14，已完毕）**：方案 C 校准完成——分离边际 **-0.5667**（≤0.1，触发候选级停止）+ 波动 **0.35**（>0.1，波动判据失效）；12 次调用（4 场景 × 3 轮，失败 1 次 parse_mismatch）；holdout 10 对零读取/零运行。方案 C 在展示阶段为效果对照，不代表获准进入正式生产 | TASK-006 / 方案 C / 隐私 / 费用 | `tasks/TASK-006/spike-r3/implementation-plan.md`（§P6/P5-B/S0.3）、`tasks/TASK-006/spike-r3/preflight-check.md`、`tasks/TASK-006/spike-r3/calibration-result.md`、`tasks/TASK-006/spike-r3/data/calibration/scheme-c-result.json`（执行分支证据 `feature/task-006-r3-spike` @ `c3d73cc`，收尾分支从该锚点复制并逐字节核验一致） |
| D-T006-R4-DIRECTION | TASK-006 第四轮方向（Founder 选择 A：上下文记忆可用性判断） | **APPROVED（仅方向与起草批准；D-1/D-3/D-4 待 R4 DRAFT 审查；D-2/D-5 尚未裁决）** | Founder 2026-08-15 选择 A，已批准：**①停止第三轮"孤立记忆打分 + 单一阈值"路线，保留第三轮失败证据；②转向"上下文记忆可用性判断"并允许单独起草独立 R4 DRAFT**（判断器同时看到当前问题、最近对话、候选记忆及其可能有用的背景，输出"使用 / 不使用 / 证据不足 + 理由"，不再只依赖单一分数）。**D-1（上下文条件相关）、D-3（使用/不使用/证据不足并说明理由）、D-4（透明记录与用户纠正的安全要求）为推荐方向，等待第四轮 DRAFT 审查，尚无明确 Founder 批准语句**；**D-2（记忆图谱）、D-5（混合策略）尚未裁决**。该裁决只批准方向与起草，不批准产品实现、Schema、关键依赖、新外部服务、延迟目标、旧 holdout 使用、验收削弱、提交、合并或部署；上述事项仍须后续单独审批。R4 必须使用独立文件和后续独立分支，不得进入本次 R3 收尾。旧 10 对 holdout 永久留作 R3 证据，不给 R4 使用；R4 必须重新设计校准集和新 holdout | TASK-006 / R4 方向 | `decision-register.md`（本卡）、`E:/project-handoffs/TASK-006-R3-to-R4-operational-chief-2026-08-15.md`（接管文档，尚未入 Git） |
| D-T006-SHOWCASE-EXCEPTION | 作品集展示阶段数据外发临时例外 | **APPROVED** | Founder 2026-08-14 采纳决策 Chief 对选项 A 的裁决：**作品集展示阶段取消真实查询和候选记忆的外发限制，允许外部大模型（DeepSeek 等已批准模型）处理 Founder 自有数据；该例外不适用于未来正式产品或其他用户**。后续产品化时，相关性判断模型优先部署在本机，恢复默认不外发（回到路线 B）。密钥保护、测试、Review、费用记录及合并部署权限不变。本轮仅授权执行 Chief 起草并落地纯治理同步（5 个治理文档 + 本决策卡）；**方案 C 的运行授权未包含在本裁决内，需另一次单独审批——该单独审批已于 2026-08-14 完成（校准阶段运行已批准，见 D-T006-R3-C-EXT）** | TASK-006 / 隐私 / 产品定位 / 主线顺序 | `decision-register.md`（本卡）、`tasks/TASK-006/route-b-decision.md`、`product.md`、`current-state.md`、`project-mainline-roadmap.md` |

## 当前待 Founder 决策

- ✅ TASK-006 DRAFT v1.1 已批准；见 D-T006-1；
- ✅ TASK-006 路线 B 与后续规划顺序已批准；**2026-08-14 展示阶段临时例外见 D-T006-SHOWCASE-EXCEPTION（路线 B 仍是未来产品化目标）**；见 D-T006-ROUTE-B；
- ✅ **GOV-CHIEF-001 已执行完毕**（2026-08-12）：三项审批通过、独立复审 REVIEW_APPROVED、PR #11 已 Rebase 合并（`42786da`）；见 D-GOV-CHIEF-001；
- ✅ **GOV-COMM-001 已执行完毕**（2026-08-12）：三项审批通过、独立复审 REVIEW_APPROVED（0/0/0）、已 Rebase 合并进 `origin/main`（`3412c3c`）；见 D-GOV-COMM-001；
- ✅ **GOV-002 已合并（含合并后修正 PR #15）**（2026-08-12）：DRAFT v1.2 已批准、delegated 已确认、Review 2 已批准；PR #14 已合并（`011168f`）；合并后修正 PR #15 已 Rebase 合并（`5de2714`，MERGED，不再待复审）；见 D-GOV-002-SCOPE 与 D-GOV-002-POSTMERGE；
- ✅ **TASK-006 本地 Gate Spike 已裁决**（2026-08-12）：DRAFT v1.2 已批准并执行，Spike 停止（STOPPED/FAILED，停止条件 9）；**Founder 裁决选项 A**（接受失败结论；禁止补 H4 词表/重跑冻结 holdout/重启外部模型路线）；收尾 PR 待建并交独立 Reviewer；见 D-T006-LOCAL-SPIKE 与 CR-T006-SPIKE-STOP-01；
- ✅ **TASK-006 第三轮「检索后相关性判断」对照 Spike DRAFT v1.1 已批准**（2026-08-12）：三方案对照、主/补充实验分离、完成度分档、样本规模与关键记忆防漏门；见 D-T006-R3-SPIKE；
- ✅ **第三轮执行模式已确认**（2026-08-12）：HANDOFF REQUIRED / persistent_session；见 D-T006-R3-EXEC；
- ✅ **方案 B 模型已批准 B-1 并下载核验完成**（2026-08-13）：仅 B-1 `bge-reranker-base` 固定版本 `2cfc18c`、预估 1.04GB／实测 1.13GB（≤1.2GB）、SHA-256 一致、最小推理通过；**S2/S3 校准中方案 B 分离边际 -0.3794，已候选级停止**；见 D-T006-R3-B-MODEL、D-T006-R3-SPIKE 执行进展；
- ✅ **方案 C 已授权、S0.3 连通检查已通过、模型修订为 deepseek-v4-flash、校准阶段运行已批准**（2026-08-13 授权 + 2026-08-14 修订/检查/校准授权）：DeepSeek `deepseek-v4-flash`、22 个校准配对、≤100 次/≤10 元、仅白名单 DeepSeek 地址、10 个 holdout 封存；**若分离边际不达标或漏关键记忆立即停止并报告**；A/B 已候选级停止，不得继续调参或缩小验收；见 D-T006-R3-C-EXT、D-T006-R3-SPIKE 执行进展；
- ✅ **作品集展示阶段数据外发临时例外已批准**（2026-08-14）：展示阶段允许外部模型处理 Founder 自有真实数据，未来产品化改回本地（路线 B）；方案 C 运行授权未包含在展示例外内，已于 2026-08-14 单独批准（校准阶段）；见 D-T006-SHOWCASE-EXCEPTION、D-T006-R3-C-EXT；
- ✅ **TASK-006 第三轮 Spike 已执行完毕，三方案候选级停止**（2026-08-14）：方案 A 分离边际 -0.2323、方案 B -0.3794、方案 C -0.5667 + 波动 0.35，全部触发候选级停止；本轮结论 = STOPPED / FAILED，形成部分证据；holdout 10 对零读取；见 D-T006-R3-SPIKE、D-T006-R3-C-EXT 执行结果；
- ✅ **Founder 2026-08-15 选择 A（R4 方向）**：已批准"停止孤立记忆打分 + 单一阈值路线"并"转向上下文记忆可用性判断 + 起草独立 R4 DRAFT"；**D-1/D-3/D-4 为推荐方向、待第四轮 DRAFT 审查；D-2/D-5 尚未裁决**；R4 独立分支、不得混入 R3 收尾；见 D-T006-R4-DIRECTION；
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
