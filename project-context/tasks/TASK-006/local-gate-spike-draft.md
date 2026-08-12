# TASK-006｜本地相关性 Gate Spike（独立 DRAFT v1.0）

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
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-005A/release-qa-report.md（Run #28 证据）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql（E001—E008 种子定义）
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/eval-program-rules.ts（E001/E004 程序判定）
  - v2/app/src/app/api/chat/route.ts（召回与写入产品路径）
doc_type: 任务 DRAFT（独立 Spike 草案；**未批准**——本文件不构成任何实施授权）
task_id: TASK-006（内部 Spike；不改变 TASK-006 状态）
spike_id: TASK-006-SPIKE-LOCAL-GATE
status: DRAFT（等待 Founder Review 1 裁决）
draft_version: v1.0（2026-08-12）
drafter: operational-chief-2026-08-12-01（执行 Chief）
draft_date: 2026-08-12
basis: D-T006-1（DRAFT v1.1 APPROVED）+ D-T006-ROUTE-B（路线 B APPROVED）+ D-T006-LOCAL-SPIKE（规划基础已获 Founder 同意，正式 DRAFT 待裁决）+ current-state.md（GOV-002 已合并，本地 Gate Spike 为下一项）
state_constraint: TASK-006 保持 APPROVED；TASK-004 保持 PAUSED；不启动 TASK-007 / TASK-005B；不修改产品代码、正式 8 Case、Schema、评测规则
```

---

## 1. 任务目标（一句话）

在**不接入产品路径、不外发任何用户数据**的前提下，用独立、限时的技术 Spike 验证 **最多两个本地候选机制**能否可靠分离 E004 场景的无关召回与 E001 等正向召回，为 TASK-006 后续 Change Request 与实施计划提供可复现的技术可行性证据。

> Spike 通过只代表"技术可行"，**不代表 TASK-006 完成**，不改变 TASK-006 的 APPROVED 状态；产品实现必须另经 Founder 批准的新 Change Request 与实施计划。

## 2. 背景与已核验事实（证据锚点）

| 事实 | 证据 |
|---|---|
| E004 缺陷仍存在：Run #28 天气话题召回无关 2 条（失眠 0.431、橘猫 0.360，允许 ≤1），AI 回复被污染 | `release-qa-report.md` §5/§6；eval_runs.run_number=28 |
| 简单阈值无法可靠分离正负候选（校准集与 holdout 分离边际均未达 TASK-006 DRAFT v1.1 可靠性门槛） | `route-b-decision.md` §2.1（D-T006-ROUTE-B 裁决依据） |
| 外部模型 Gate 不作为产品路线：隐私边界、严格墙钟延迟、失败回退、证据治理不满足产品化要求；仅保留为离线研究证据 | `route-b-decision.md` §3.1/§3.2；外部 Gate v6 最大墙钟 4063ms，超时 keep-all 回退会恢复 E004 缺陷 |
| 产品召回链路：mem0.search top5 → score ≥ 0.35 过滤 → 注入 Dify；`used_memory` 只含过滤后结果，不能支撑离线扫描 | `chat/route.ts:55-58`；`memory-config.ts`（RECALL_THRESHOLD=0.35 / RECALL_TOP_K=5 / WRITE_MODE=async，产品与快照共用） |
| E004 程序判定：`max_irrelevant_recall ≤ 1`，关键词 猫/吉他/失眠/小橘 | `eval-program-rules.ts:425-446`；`002_eval.sql:104-112` |
| E001 正向召回：`recall_min_related ≥ 1`（失眠 0.660 + 橘猫 0.445，Run #28 PASS） | `eval-program-rules.ts:401-423`；`release-qa-report.md` §5 |
| 强约束不得退化：E006 deletion、E007 safety、E008 privacy | `eval-policy-v1.md` §1；Run #28 全 PASS |
| 本地 embedding 已在本地部署：mem0-server 使用 fastembed（`BAAI/bge-small-zh-v1.5`，历史核验记录；本地推理，无外发） | `TASK-005A/draft.md` §2.1（历史核验记录，非快照字段来源） |
| 历史症状同源：2026-07-25 基线"天气不错→召回猫 37% + 吉他 36%" | `baseline-results.md` BC004（本问题长期存在） |

## 3. 候选机制（最多两个，本 Spike 内定义）

> 遵循路线 B：**不向外部模型或外部数据服务发送用户查询、Memory 内容或其他用户数据**。两个候选均为本地运行、无网络外发、不进入产品路径。Spike 期间不得扩展为第三个候选。

### 候选机制 1：本地向量二次相关性 Gate（重排过滤）

- **做法**：在本地 mem0 检索返回的候选（含 score）上，用本地部署的 embedding 模型（fastembed，本地推理）计算"查询 ↔ 候选记忆"的二次相关度，作为独立于 mem0 全局阈值的过滤/重排依据，验证能否把 E004 两类无关候选（失眠、橘猫）与 E001 相关候选（失眠、橘猫的**相关**查询）可靠分开；
- **为什么候选**：TASK-006 DRAFT §3.2 方向 B/D 的本地化子集；不依赖单一全局阈值，针对"查询主题相关性"而非全局相似度；
- **无外发核验**：Spike 脚本必须声明并验证不发起任何外部网络调用（见 §7 允许/禁止）。

### 候选机制 2：本地规则/类别主题 Gate

- **做法**：基于查询主题类别与记忆主题类别的本地规则判定（如话题类别归属 + 类别相容性），不依赖全局阈值，不硬编码"天气/猫/失眠/小橘"字面量（对未见过的话题/记忆必须有效）；
- **为什么候选**：TASK-006 DRAFT §3.2 方向 B 的规则子集；验证规则类方案是否足以分离，若不足则作为候选 1 的对照基线；
- **泛化要求**：规则必须对 holdout 中的未见过话题（多义词、他人属性、隐式关联等）有效，固定关键词白/黑名单不视为解决方案（触发停止条件 3）。

> 候选机制的选择、组合与评估顺序由 Spike Builder 在实施计划中给出，但**不得超出上述两个候选**；若 Spike 中证明需要第三个机制或外部模型，停止并提交 Change Request。

## 4. 限时（Timebox）

- **Spike 执行窗口**：自 Spike Builder 启动起 **≤ 5 个工作日**（墙钟），或 **≤ 3 轮"测量—调整—复测"迭代**（以先到者为准）；
- 时间盒到点即停止，不得无限调参；未收敛则按停止条件 8 处理；
- 基线测量 Run 与最终验收 Run 不计入 3 轮调整迭代（沿用 TASK-006 DRAFT v1.1 §6 口径）；
- 超过时间盒或迭代上限 → 停止 Spike，保留全部证据，返回 Chief/Founder 裁决。

## 5. 盲测 / Holdout 验证（泛化边界）

1. **校准集**：E004 对抗场景 + E001/E002/E003/E005 正向场景的真实检索样本（每条候选含 score），三轮重复采集（mem0 检索非确定性，**禁止单轮结论**）；
2. **标签规则**：正样本 = 与查询相关的候选；负样本 = 与查询无关的候选；关键词初判 + **人工复核**（复核记录写入测量文件）；
3. **Holdout 探测场景（3–5 个，不参与调参）**：真实检索、评测专用 user_id 建立种子记忆并检索、测量后清理；**不写入正式 eval_cases 种子、不修改正式 8 Case**；覆盖困难负例类型：多义词（"苹果"水果 vs 公司）、他人属性（"朋友分手"）、语义隐式关联（"失眠"与"橘猫半夜跑酷"）等；
4. **盲测纪律**：候选机制参数只在校准集上调整；holdout 结果在调参完成后一次性评估，Spike 报告必须说明 holdout 样本在调参前已冻结；
5. **可靠性判据（沿用 TASK-006 DRAFT v1.1 §3.1 定义）**：校准集与 holdout 验证集各自 **F1 ≥ 0.9 且分离边际 > 0.1**（F1 = 2·P·R/(P+R)；分离边际 = 最低正例分 − 最高无关分；若实测波动 > 0.1，判据自动失效并触发停止条件 1）；
6. **样本量诚实声明**：8 Case + holdout 样本量小，Spike 报告必须如实声明样本量与置信局限，不夸大；holdout 不可建立或验证证据与校准数据不独立 → 触发停止条件 5。

## 6. 延迟与资源门（严格墙钟，Spike 内实测）

| 门 | 要求 | 测量方式 |
|---|---|---|
| 新增延迟上限（P95） | **≤ 200ms**（每请求候选机制自身新增开销） | Spike 脚本内真实计时器，多轮取 P95；**不得把网络 timeout 当总截止时间** |
| 总预算上限（P95） | **≤ 1000ms**（候选机制 + 测量探针开销） | 同上 |
| 资源门（内存） | 峰值 **≤ 512MB** | 进程峰值 RSS 记录 |
| 资源门（CPU） | 单次评估 **≤ 500ms CPU**（或等效说明） | 计时 + CPU 时间记录 |
| 失败回退 | 记录候选机制失败率与回退行为；**keep-all 回退会恢复 E004 缺陷，不得表述为修复** | 每轮记录失败/回退次数 |
| 无外发验证 | 脚本运行期间**零外部网络调用** | 脚本内显式禁网或网络调用审计记录 |

> 延迟与资源门是本 Spike 的**通过门**，不是产品最终承诺；产品实现的延迟目标由后续 CR/实施计划另行裁决（路线 B 约束：不默认接受明显增加的用户等待时间，见 CHIEF-BOOTSTRAP §7 升级边界第 4 条）。

## 7. 允许 / 禁止范围

### ✅ 允许

1. 在 Spike 分支内新增**独立只读测量/验证脚本**：评测专用 user_id、真实本地 mem0 检索、本地 embedding 推理；不调用 mem0.add（holdout 场景的种子记忆除外，测量后清理）；不落库到正式表、不进入 /api/chat 产品路径；
2. 读取正式代码与契约作为只读输入（memory-config.ts、chat/route.ts、eval-program-rules.ts、002_eval.sql、eval-contracts.md 等）；
3. 证据落盘：脚本 + 原始数据 + 报告写入 `project-context/tasks/TASK-006/spike/`（随 Spike 分支入库，可复现）；
4. 使用本地已部署的 embedding 能力（fastembed 本地推理）；
5. 在获批的独立 Spike 分支上提交 Spike 过程与报告。

### ❌ 禁止

1. **修改产品代码**：`v2/` 下任何文件（含 memory-config.ts、chat/route.ts、eval-program-rules.ts）一律不动；
2. **修改正式 8 Case / Schema / 评测规则**：eval_cases 种子（002_eval.sql）、eval-policy、pass_criteria、判定逻辑、迁移全部不动；
3. **外发任何用户数据**：不向外部模型、外部数据服务或任何远端发送用户查询、Memory 内容或其他用户数据；不调用外部模型 API；
4. **不接入产品路径**：不把 Spike 机制写入 /api/chat 或任何产品行为；
5. **不触碰 TASK-007、TASK-005B、TASK-004**（TASK-004 保持 PAUSED，不重启删除拦截方案）；
6. **不修改治理文件**：current-state、decision-register、roadmap、AGENTS.md 等不在本 Spike 内改动；
7. **不接触生产密钥、不部署、不合并、不 force push**；
8. **禁止针对"天气/猫/失眠/小橘"等固定字面量硬编码过关**（固定关键词白名单/黑名单不视为解决方案）；
9. **不得以 Mock 替代最终真实验收**（验收必须是真实本地检索 + 真实推理的全链路执行）；
10. 历史 `feature/task-004-spike` 工作区（E:\正式作品 主检出）只记 W2（本地未同步），**禁止写入、同步或清理**。

## 8. 验收标准（Spike 通过门，全部满足才可提交"Spike 通过"结论）

1. 两个候选机制（或经确认的子集）均完成 **≥3 轮**真实本地检索测量，分数分布、分离边际与波动范围如实记录；
2. **校准集 F1 ≥ 0.9 且分离边际 > 0.1**（本 Spike 内定义，见 §5.5）；
3. **Holdout 验证集 F1 ≥ 0.9 且分离边际 > 0.1**（holdout 场景在调参前冻结，一次性评估；样本量与置信局限如实声明）；
4. **延迟门通过**：新增延迟 P95 ≤ 200ms、总预算 P95 ≤ 1000ms（严格墙钟实测）；
5. **资源门通过**：内存峰值 ≤ 512MB、CPU 单次 ≤ 500ms（或等效说明）；
6. **无外发验证通过**：脚本运行期间零外部网络调用（审计记录）；
7. **零产品改动**：Spike 分支 diff 不包含任何产品代码、正式 8 Case、Schema、评测规则或治理文件修改；
8. **证据完整落盘**：脚本、原始数据（含 score）、人工复核记录、盲测/holdout 结果、延迟/资源/无外发证据、失败尝试记录均写入 `project-context/tasks/TASK-006/spike/`；
9. **报告诚实**：Spike 报告包含样本量声明、波动范围、失败尝试、候选对比、与 TASK-006 DRAFT v1.1 §3.1 可靠性判据的对标，以及"Spike 通过 ≠ TASK-006 完成"的明确声明。

## 9. 停止条件（满足任一 → 停止 Spike，提交 Change Request / 返回 Founder，不得继续调参）

1. 正负候选**无法安全分离**：多轮测量后校准集或 holdout 分离边际 ≤ 0.1（或实测波动 > 0.1 使判据失效），且无候选机制可拉开；
2. 修复 E004 **必然导致 E001 等正向召回明显退化**；
3. **必须削弱测试、修改判定规则或针对固定字面量硬编码才能变绿**；
4. 需要**超出批准范围**的数据库、架构、第三方系统或外部模型改动（含证明必须外发用户数据才能解决）；
5. **无法建立与校准数据独立的 holdout 验证证据**；
6. 三轮策略实现/调整迭代内无法收敛到验收标准（基线测量与最终验收 Run 不计入）；
7. **发现任何用户数据外发路径**（Spike 机制实际发起外部调用）；
8. **限时到期**（5 个工作日或 3 轮迭代，先到者）仍未收敛。

## 10. 执行模式判断（预判——等待 Founder 批准 DRAFT 后经执行模式门确认）

```text
## 执行模式判断（Spike）

任务：TASK-006 本地相关性 Gate Spike（独立、限时、无外发、不接产品）
任务复杂度：中等（技术 Spike 需多轮测量—调整；不涉及产品代码与 Schema）
是否需要用户中途决策：是（测量结果出来后需裁决候选机制取舍；任何外发/扩范围需裁决）
是否预计多轮实现—验证—调整：是（先测量分布 → 机制调整 → 复测，预计 3+ 轮）
是否涉及高风险数据、权限或第三方服务：否（无外发、不触密钥、不接产品；本地 embedding）
推荐模式：HANDOFF REQUIRED —— 长期 Builder 会话
建议会话名称：TASK-006｜Builder｜本地相关性 Gate Spike
任务分支：feature/task-006-local-gate-spike（Spike 实施时从 origin/main 新建；本 DRAFT 分支 feature/task-006-local-gate-spike-draft 仅承载本 DRAFT）
判断依据：技术 Spike 需要根据实验结果反复调整；需要用户中途查看测量结果并作决定；
          失败尝试与调整理由对后续 TASK-006 决策重要；单次子 Agent 上下文不足
```

> 本窗口只提出建议；执行模式必须等待 Founder 批准 DRAFT 后单独确认。

## 11. 待 Founder 裁决事项（Review 1）

1. **是否批准本 Spike DRAFT**（候选机制两个、限时 5 工作日/3 轮、延迟 P95 ≤ 200ms / 总预算 ≤ 1000ms、资源 ≤ 512MB、校准+holdout 双 F1 ≥ 0.9 且分离边际 > 0.1、证据落盘 `TASK-006/spike/`）；
2. **候选机制范围**：候选 1（本地向量二次相关性 Gate）+ 候选 2（本地规则/类别主题 Gate）是否同意；
3. **执行模式**：HANDOFF REQUIRED 长期 Builder 会话是否同意（批准后单独确认）；
4. **Spike 分支**：批准后从 origin/main 新建 `feature/task-006-local-gate-spike`，本 DRAFT 分支合并或关闭方式。

## 12. 下一交接

- Founder 批准 DRAFT（Review 1）→ 执行模式门确认 → 唤醒长期 Builder 会话（先交实施计划，含测量脚本设计与候选评估顺序，再执行）；
- 本窗口在 Founder 裁决前停止，不自行进入实施计划或 Builder 阶段。
