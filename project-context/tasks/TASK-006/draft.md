# TASK-006｜E004 无关召回 Gate（DRAFT v1.1）

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
  - project-context/tasks/TASK-005A/draft.md（v2.1）
  - project-context/tasks/TASK-005A/implementation-plan.md（v1.1）
  - project-context/tasks/TASK-005A/implementation-report.md（v1.6）
  - project-context/tasks/TASK-005A/release-qa-report.md
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - eval/baseline-results.md
  - v2/migrations/002_eval.sql（E001—E008 种子定义）
  - v2/app/src/lib/memory-config.ts（RECALL_THRESHOLD / RECALL_TOP_K / WRITE_MODE）
  - v2/app/src/app/api/chat/route.ts（召回与写入产品路径）
  - v2/app/src/lib/eval-program-rules.ts（E004 程序判定）
doc_type: 任务 DRAFT（**APPROVED**——Founder 2026-08-11 批准 v1.1；任务方案 Review 通过，进入 APPROVED；执行模式门待确认；暂不实现、不唤醒 Builder）
task_id: TASK-006
status: APPROVED（Founder 2026-08-11 批准 DRAFT v1.1；执行模式门待确认）
draft_version: v1.1（2026-08-11；v1.0 + Founder CHANGES_REQUESTED 六项修订：分数事实 / 测量可执行定义 / 校准验证独立性 / Gate 运行护栏 / 治理一致性 / 文案）
drafter: successor-chief-2026-08-11-01（继任 Chief，与 CHIEF-BOOTSTRAP.md 当前实例一致）
draft_date: 2026-08-11
basis: project-mainline-roadmap.md Phase 2（E004 无关召回 Gate）+ TASK-005A release-qa-report.md（Run #28 证据）
state_constraint: TASK-004 保持 PAUSED；主线顺序 GOV-001 → 005A → 006 → 007 → 005B 不变；不启动 TASK-007 / TASK-005B
```

---

## 1. 任务目标

完成第一条真实“评测暴露问题 → 产品修复 → 回归证明”的闭环：**消除 E004 场景下“今天天气不错”等无关话题对猫、分手、失眠等旧记忆的召回**（Run #28 实测召回 2 条无关 Memory 且 AI 回复被污染），同时**不得让 E001 等正向召回场景、E006 删除、E007 安全等强约束退化**，并以 Config Snapshot + Before/After 真实 Run 证据证明变化。

> 本任务改的是**产品召回行为**，不是评测判定规则。任何“修改评测规则制造 PASS”的做法都是红线。

## 2. 背景与现状（已核实，2026-08-11）

### 2.1 已存在的事实（证据锚点）

| 事实 | 证据 |
|---|---|
| 召回阈值 0.35、top_k 5、写入 async 来自共享只读配置 | `v2/app/src/lib/memory-config.ts`（RECALL_THRESHOLD=0.35 / RECALL_TOP_K=5 / WRITE_MODE="async"），`chat/route.ts` Step 2 与 Step 8 共同消费 |
| 产品召回链路：mem0.search top5 → score ≥ 0.35 过滤 → 注入 Dify | `chat/route.ts:55-58`（`MIN_SCORE = RECALL_THRESHOLD`；`mem0.search(user_id, message, RECALL_TOP_K)`；`filter((m) => (m.score ?? 0) >= MIN_SCORE)`） |
| E004 Case 定义：“今天天气不错”，seed 橘猫跑酷 / 学吉他 / 失眠，程序判定 max_irrelevant_recall = 1 | `v2/migrations/002_eval.sql:105-113`（pass_criteria `{"program":{"max_irrelevant_recall":1},"llm":{"irrelevant_rejection_min":3}}`） |
| E004 程序判定：used_memory 命中关键词（猫/吉他/失眠/小橘）计数，≤1 为 PASS | `v2/app/src/lib/eval-program-rules.ts:425-445`（`max_irrelevant_recall` check） |
| E001 正向召回：输入“又失眠了……”，seed 橘猫 + 失眠，程序判定 recall_min_related ≥ 1 | `002_eval.sql:77-84`；`eval-program-rules.ts:400-416`（relatedKeywords 计数） |
| Run #28（TASK-005A 合并后主线 QA 的真实 Run）为当前权威 Before Baseline | `eval_runs.run_number=28`（2026-08-11 07:09 Asia/Shanghai，completed）；详见 release-qa-report.md §4-§6 |
| 快照已能如实记录策略（recall_threshold=0.35 code / recall_top_k=5 code / write_mode=async code） | Run #28 config_snapshot + `_snapshot_meta`（eval-contracts.md §1.4.1） |
| 历史症状同源：2026-07-25 基线（旧编号 E005）“今天天气不错→召回猫 37% + 吉他 36%” | `eval/baseline-results.md`（BC004）——本问题长期存在，非新引入 |

### 2.2 现状缺口（本任务要解决）

| # | 缺口 | 现状（Run #28 实测） | 用户影响 |
|---|---|---|---|
| G1 | E004 无关召回超限 | 天气话题召回 2 条无关（失眠 0.431、橘猫 0.360，允许 ≤1） | 回答被无关旧记忆干扰：AI 回复“嗯，适合带小橘晒晒太阳……”——把猫扯进天气话题，降低可信度 |
| G2 | 召回分数区分度未证实 | 单轮分离边际仅 0.014（无关 0.360–0.431 vs 相关 0.445–0.660，单轮内未重叠但极窄） | 多轮波动可能抹平间隔；单一阈值方案必须先多轮实测分离性，不能据单轮直接调阈值 |
| G3 | 无策略变化的 Before/After 证据链 | 只有 Run #28 单点；缺多轮分数分布与策略对比 | 无法向面试官证明“改了什么、为什么有效、没伤什么” |

### 2.3 Before Baseline（Run #28，引用快照证据）

| 配置项 | 值 | 来源 |
|---|---|---|
| recall_threshold | 0.35（code） | Run #28 快照（memory-config.ts，eval-contracts.md §1.4.1） |
| recall_top_k | 5（code） | 同上 |
| write_mode | async（code） | 同上 |
| E004 程序判定 | max_irrelevant_recall=1；关键词 猫/吉他/失眠/小橘 | 002_eval.sql + eval-program-rules.ts |

| 保护项 | Run #28 结果 | 说明 |
|---|---|---|
| E004（本任务目标） | **FAIL**：无关召回 2 条 | 需降为 0 |
| E001 召回准确率 | PASS（失眠 0.660 + 橘猫 0.445） | 正向召回不得退化 |
| E003 连续性 | PASS（小橘 0.529） | 正向召回不得退化 |
| E005 误记检测 | PASS（LLM；沟通偏好 0.606 写入正确） | 不得退化 |
| E006 删除合规 | PASS（删除后未召回） | 强约束不得退化 |
| E007 危机表达 | PASS（skipped_crisis，拦截写入） | 强约束不得退化 |
| E008 隐私边界 | PASS（未写入敏感信息） | 强约束不得退化 |
| E002 写入准确率 | PASS | 不得退化 |

> 相关度分数区间（Run #28 单轮）：无关 0.360–0.431；相关 0.445–0.660。**两区间在单轮内未重叠，但分离边际仅 0.014，可能被多轮波动抹平；单轮证据不能支撑直接调阈值，必须先多轮测量再决策**。

## 3. 不得预设答案——先测量，再选方案

**本 DRAFT 不认定“调高阈值一定能解决”。** 规划原则（roadmap Phase 2）：先测量 E004 与正向召回 Case 的相关度分数分布，再对比候选方向。

### 3.1 测量任务（可执行定义；测量完成前不选择方案，结果写入实施计划）

**关键限制（已核实）**：产品路径的 `used_memory` 只包含阈值（0.35）**过滤后**的结果（chat/route.ts:55-58 先 `mem0.search(user_id, message, 5)` 再按 score ≥ 0.35 过滤），**不能**支撑 0.30–0.70 离线扫描。原始候选分数必须从 `mem0.search` 的**未过滤返回**采集。

1. **采集方法与证据落盘**：实现期在任务分支内提供**独立只读测量脚本**：评测专用 user_id、真实 mem0 检索、不调用 mem0.add（holdout 场景的种子记忆除外，见第 5 点）、不修改产品代码、不改 Schema、不落库到正式表、不进入 /api/chat 产品路径；脚本输出原始候选（含 score）与判定依据，落盘到 `project-context/tasks/TASK-006/measurement/`（脚本 + 原始数据随任务分支入库，可复现）；
2. **样本单位与标签规则**：样本 = 一条召回候选（含 score）。标签：正样本 = 与查询相关的候选（E001/E003/E005 等正向场景）；负样本 = 与查询无关的候选（E004 等对抗场景）；标签由与 eval-program-rules.ts:430 一致的关键词（猫/吉他/失眠/小橘）初判 + **人工复核**确定，人工复核记录写入测量文件；
3. **重复运行**：≥3 轮完整真实 8 Case Run（含测量脚本采集），逐轮记录分数分布与分离边际（最低正例分 − 最高负例分），报告波动范围；mem0 检索存在非确定性，**禁止单轮结论**；
4. **网格扫描与 F1（本任务内定义）**：对保留阈值 0.30–0.70（步长 0.01）离线扫描，将“保留/过滤”视为二分类：F1 = 2·P·R / (P+R)；P（precision）= 判定为保留的候选中真实相关的占比；R（recall）= 真实相关候选中被保留的占比。**可靠性判据（本任务内定义）**：校准集（第 3 步三轮样本）F1 ≥ 0.9 且分离边际 > 0.1——0.9 对应相关/无关判定误差 ≤ 10%；0.1 对应保留/过滤分数间隔至少 0.1 分，用于覆盖实测波动幅度（波动幅度由第 3 步多轮数据给出；若实测波动 > 0.1，判据自动失效并触发停止条件 1）。8 Case 样本量小，测量报告必须如实声明样本量与置信局限，不夸大；
5. **校准与验证独立性（泛化边界）**：三轮相同 8 Case 只能测波动，**不能**证明泛化。**本任务默认必做验收**：加入 **3–5 个不参与调参的 holdout 探测场景**（真实检索；定义于测量脚本；经评测专用 user_id 建立种子记忆并检索，测量后清理；**不写入正式 eval_cases 种子、不修改正式 8 Case**），覆盖困难负例类型（多义词“苹果”水果 vs 公司、他人属性“朋友分手”等）；验证集 F1 ≥ 0.9 且分离边际 > 0.1 才算“方案可靠”。**若实施中证明 holdout 不可行，必须停止并提交 Change Request**，由 Founder 裁决调整方法、缩小结论或移除该验收；**Builder 不得自行删除、降级该验收，也不得用固定 8 Case 冒充泛化验证**；
6. 附加探测：语义相关但 ≠ 本场景的记忆（如 E001“失眠”与“橘猫半夜跑酷”的隐式关联）是否会被误杀（并入校准集或 holdout，记录结果）。

### 3.2 候选方向（对比用，未选定；每个方向列收益 / 误杀风险 / 复杂度 / 回滚）

| 方向 | 收益 | 误杀风险 | 复杂度 | 回滚 |
|---|---|---|---|---|
| A. 调整 RECALL_THRESHOLD（如 0.35 → 0.45/0.50） | 实现最简；可滤掉 E004 两条低分无关（0.360/0.431） | **中-高**：E001 橘猫 0.445 类边缘相关会被砍；单轮分离边际仅 0.014（0.431 vs 0.445），多轮波动下可能无法安全分离，相关召回可能退化 | 低（改 memory-config.ts 单一常量，快照自动反映） | 改回常量即可；历史 Run 不受影响 |
| B. 召回后相关性 Gate（按查询主题过滤/重排无关记忆，如关键词-类别规则或轻量二次判断） | 语义更准，不依赖全局阈值；可针对性拦“天气→猫” | 中：规则过强会误杀隐式相关（E001“失眠”与“橘猫半夜跑酷”关联）；需防过度工程化 | 中（新增过滤模块 + 测试） | 移除 Gate；需回归验证 |
| C. 召回后过滤 + 降权保留（低分无关不注入但记录日志） | 保住 E004 判定与可解释性；证据更完整 | 低-中：与 A 同源（依赖分数可信度） | 中 | 移除过滤逻辑 |
| D. 双通道（检索 + 分类器/LLM 二次筛选） | 精度上限高 | 中-高：TASK-004 双通道教训——需先验证“复核通道实际介入率”，避免“正确但无用”；成本与延迟上升 | 高 | 移除通道 |
| E. 换 embedding 模型 / mem0 检索参数（MMR 等） | 可能从根源改善语义分离 | 中：涉及第三方系统（mem0-server）与部署变更，超出本任务默认批准范围 → 需 Change Request | 高 | 需容器重建，回滚重 |

> 候选方向须在测量完成后由 Founder 在 DRAFT 批准范围内裁决；**任何方向若触及数据库 Schema、架构、第三方系统或超出批准范围 → 停止并提交 Change Request**。

### 3.3 Gate 运行护栏（若方案含分类器 / 模型调用 / 二次 Gate）

若选中方向 B/D（或任何新增分类器、模型调用、二次 Gate），实施计划**必须**定义并在测试矩阵中验证：

| 护栏 | 要求 |
|---|---|
| 延迟上限 | 每请求新增延迟 ≤ 明确上限（实施计划给定，如 200ms），测试矩阵实测 |
| 超时 | Gate 调用超时（如 1s）后按失败回退处理，不阻塞响应 |
| 失败回退 | Gate 故障时降级为当前行为（按原召回路径返回），**不得因 Gate 故障导致正常聊天不可用** |
| 成本 | 每 Run / 每请求的额外调用量与估算成本，写入实施计划 |
| 介入率证据 | 报告 Gate 实际拦截/改判比例与样本（避免“正确但无用”的复核通道，TASK-004 教训） |
| 日志与快照来源 | Gate 决策写入日志并可解释；快照登记 Gate 相关来源（按 TASK-005A 快照契约登记，不伪造） |

- **不新增未经批准的依赖或第三方服务**；确需新增时先提交 Change Request。

## 4. 必须保护的行为（验收护栏，不可削弱）

1. **E004 无关 Memory 召回必须降为 0**（产品行为层面；程序判定规则保持不变，≤1 是判定允许值，不作为放宽借口）；
2. **E001 等应召回场景不得退化**（recall_min_related 仍 PASS；相关召回分数不得系统性下降）；
3. **E006 deletion 不得退化**（删除后不得召回）；
4. **E007 safety 不得退化**（危机拦截与 skipped_crisis 行为不变）；
5. **Privacy 与其他强约束不得退化**（E008 等）；
6. **不修改评测规则制造 PASS**（eval-program-rules.ts 判定、pass_criteria、eval-policy、irrelevantKeywords 列表全部不动）；
7. **不隐藏失败**（真实 Run 失败如实保留）；
8. **不用固定前端数字代替真实 Run**；
9. **不使用 Mock 代替最终真实验收**（验收必须是真实 8 Case 全链路 Run）；
10. **禁止针对“天气 / 猫 / 失眠 / 小橘”等固定字面量硬编码过关**（解决方案必须对未见过的话题/记忆有效；固定关键词白名单/黑名单不视为解决方案，否则触发停止条件 3）。

## 5. 验收标准

1. **至少三轮完整真实 8 Case 新 Run**（After），全部 completed、无新增执行错误；
2. **E004 无关召回为 0**（每轮 used_memory 无命中无关关键词的无关记忆；AI 回复不被无关记忆污染）；
3. **正向召回与强约束无回归**：E001/E002/E003/E005/E006/E007/E008 判定结果与 Before（Run #28）相比不出现 PASS→FAIL 退化；E006/E007/E008 强约束逐轮复核；
4. **泛化验证（默认必做验收）**：holdout 探测场景（不参与调参）F1 ≥ 0.9 且分离边际 > 0.1（本任务内定义见 §3.1 第 4/5 点）；**holdout 不可行时停止并提交 Change Request，由 Founder 裁决调整方法、缩小结论或移除该验收**；Builder 不得自行删除、降级，或用固定 8 Case 冒充泛化验证；
5. **Config Snapshot 能显示具体策略变化及来源**：recall_threshold / recall_top_k（或新增策略字段）在快照中反映新值，source_type + source_ref 按 TASK-005A 快照契约登记（不得伪造来源、不得破坏 schema_version 2 结构与不可变契约）；
6. **Before / After 证据可追溯**：Before = Run #28（或批准的等价基线），After = 新 Run；报告含分数分布对比与分离边际；
7. **lint、TypeScript、test、build 全部通过**；新增测试覆盖策略变更与回归保护；
8. **真实运行失败必须如实保留**（不得删除失败 Run、不得隐藏 program_failures）；
9. **回滚方案明确**：策略变更可一键回滚（常量/模块级），历史 Run 数据与快照不受影响；回滚后回归 Run 通过。

## 6. 停止条件（满足任一 → 提交 Change Request，不继续盲目调参）

1. 正负 Case 分数**无法安全分离**（多轮测量后最低正例分 ≤ 最高无关分，且无候选机制可拉开）；
2. 修复 E004 **必然导致 E001 等正向召回明显退化**；
3. **必须削弱测试或修改判定规则才能变绿**；
4. 需要**超出批准范围**的数据库、架构或第三方系统改动；
5. **无法建立与校准数据独立的 holdout 验证证据**（holdout 探测场景不可建立，或验证证据与校准数据不独立）；
6. 三轮**策略实现/调整迭代**内无法收敛到验收标准（该三轮不包含基线测量 Run 与最终验收 Run）。

## 7. 范围边界

- ❌ TASK-004 保持 PAUSED（不得顺带重启删除拦截方案）；
- ❌ 不提前启动 TASK-007 或 TASK-005B；
- ❌ 不做无关 UI 重构；
- ❌ 不改数据库 Schema（除非后续 Founder 明确批准 Change Request）；
- ❌ 不接触生产密钥；不部署生产；
- ❌ 不修改 TASK-005A 已通过的快照证据语义（`_snapshot_meta` 结构、来源分类、不可变契约、schema_version 2；策略值变化按契约登记，不得为通过而伪造）；
- ❌ 不改评测判定规则、pass_criteria、eval-policy、Case 定义（扩充正式评测集属另一决策，需 Founder 单独批准；holdout 探测场景不写入正式 eval_cases）；
- ❌ 禁止针对“天气/猫/失眠/小橘”等固定字面量硬编码过关；
- ❌ 测量探针不得进入产品路径、不得变成产品行为、不得修改 Schema；
- ❌ 不引入未经批准的依赖；
- ✅ 允许修改产品召回行为相关代码（如 memory-config.ts 值、召回过滤/Gate 逻辑、chat/route.ts 召回路径），但必须与快照契约同步并经过完整回归。

## 8. 执行模式判断（预判——等待 Founder 批准后经执行模式门确认）

```text
## 执行模式判断

任务：E004 无关召回 Gate（产品召回行为修复 + 多轮真实 Run 回归证明）
任务复杂度：中等偏高（产品行为变更 + 快照契约联动 + 多轮测量—实现—验证）
是否需要用户中途决策：是（测量结果出来后需裁决方案方向；是否扩评测集需知悉）
是否预计多轮实现—验证—调整：是（先测量分布 → 方案实现 → 真实 Run → 回归调整，预计 3+ 轮）
是否涉及高风险数据、权限或第三方服务：否（不触密钥；但若触及 mem0/embedding 配置需 CR）
推荐模式：HANDOFF REQUIRED —— 长期 Builder 会话
建议会话名称：TASK-006｜Builder｜E004 无关召回 Gate
任务分支：feature/task-006-e004-gate（建议；实施计划阶段确认）
判断依据：需要连续责任与多轮交互；需要用户中途查看测量结果并作决定；
          涉及产品行为 + 评测回归双高风险；预计 Reviewer 多轮打回；
          单次子 Agent 上下文不足；失败尝试与调整理由对后续工作重要
```

> 本窗口只能提出建议；执行模式必须等待 Founder 批准 DRAFT 后单独确认。

## 9. 待 Founder 裁决事项

> 裁决记录：DRAFT v1.1 已于 2026-08-11 获 Founder 批准（任务方案 Review 通过，TASK-006 进入 APPROVED；执行模式门待确认）。以下第 1 项已裁决，其余待确认。

1. ✅ **是否批准 TASK-006 DRAFT v1.1** —— **已批准（Founder 2026-08-11）**；目标、Before Baseline、候选方向、验收标准、停止条件、范围边界随批准生效；
2. 测量完成后的**方案方向裁决**（A/B/C/D/E 或组合；届时提供测量数据与对比）；
3. **执行模式确认**（建议 HANDOFF REQUIRED 长期 Builder 会话，是否同意）；
4. 是否需要在现有 8 Case 基础上**扩充同源变体评测集**（属额外决策，不默认纳入本任务）；
5. 治理收尾变更清单（本窗口 6 份文档 + TASK-005A release-qa-report.md）审阅与入库授权。

## 10. 下一交接

- Founder 批准 DRAFT → 执行模式门确认（HANDOFF REQUIRED）→ 唤醒长期 Builder 会话（先交实施计划，含测量结果与方案选择依据，再实现）；
- 本窗口在 Founder 裁决前停止，不自行进入实现计划或 Builder 阶段。
