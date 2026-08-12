# TASK-006｜本地相关性 Gate Spike — Builder 交接包

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-006/local-gate-spike-draft.md（v1.2，APPROVED，本任务唯一权威方案）
  - project-context/tasks/TASK-005A/release-qa-report.md（Run #28 证据）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/app/api/chat/route.ts
doc_type: Builder 交接包（执行模式 persistent_session）
task_id: TASK-006（内部 Spike：TASK-006-SPIKE-LOCAL-GATE）
status: APPROVED（DRAFT v1.2 已批准 + 执行模式已确认 + 规划 PR #16 已合入 origin/main @ 0f2e3df）
execution_mode: persistent_session（HANDOFF REQUIRED）
assigned_role: Builder（长期会话）
assigned_session: TASK-006｜Builder｜本地相关性 Gate Spike
branch: feature/task-006-local-gate-spike
handoff_by: operational-chief-2026-08-12-01（执行 Chief）
handoff_date: 2026-08-12
```

---

## 1. 目标角色

长期 Builder（persistent_session；非驻留窗口，由 Founder 人工唤醒）。

## 2. 项目位置

P1 Alice Memory 作品集项目 → 主线 TASK-006（E004 无关召回 Gate）→ 内部前置治理（GOV-CHIEF-001/GOV-COMM-001/GOV-002 均已完成并合入）→ **TASK-006 本地相关性 Gate Spike（独立、限时、无外发、不接产品）**。

## 3. 本次唯一目标（首次唤醒）与长期会话总目标

- **长期会话总目标（本交接包完整范围）**：按 `local-gate-spike-draft.md`（v1.2，已批准）执行 TASK-006 本地相关性 Gate Spike——验证**最多两个本地候选机制**（候选 1 = 本地词法/统计二次相关性 Gate；候选 2 = 本地主题类别 Gate）能否可靠分离 E004 场景的无关召回与 E001 等正向召回，产出可复现证据与 Spike 报告。**Spike 通过只代表"技术可行"，不代表 TASK-006 完成；不接入产品路径。** 完整范围见本文件 §13–§16。
- **首次唤醒唯一目标**：只提交**实施计划（Review 2）**——测量/验证脚本设计、候选评估顺序、预装检查核验命令、冻结记录文件结构、延迟/资源测量方案。**实施计划获批准前，禁止预装检查、写脚本、建 holdout、测量或任何实测**（见 §13 步骤 2 与 §12 禁止 14）。

## 4. 为什么做

E004 缺陷仍存在（Run #28 天气话题召回无关 2 条，AI 回复被污染）。Founder 已裁决路线 B：不把外部模型 Gate 接入产品，转为验证**无用户数据外发的本地模型/规则/检索路线**。本 Spike 是 TASK-006 产品实现前的技术可行性验证；Spike 通过后仍需新的 Change Request 与实施计划并经 Founder 批准，才允许产品实现。

## 5. 当前事实（已核验）

- 权威主线：origin/main @ `0f2e3df`（PR #16 规划 DRAFT 已合入；本实施分支即从该点创建）；
- TASK-006 DRAFT v1.1 = APPROVED；路线 B（D-T006-ROUTE-B）= APPROVED；本地 Gate Spike（D-T006-LOCAL-SPIKE）= APPROVED（DRAFT v1.2，执行模式 persistent_session 已确认）；
- 产品召回链路：`chat/route.ts:55-58` mem0.search top5 → score ≥ 0.35 过滤；阈值/top_k/write_mode 来自 `memory-config.ts` 共享常量；
- E004 程序判定：`max_irrelevant_recall ≤ 1`（eval-program-rules.ts:425-446）；E001：`recall_min_related ≥ 1`；
- 本地组件：mem0-server、PostgreSQL（ai_companion）、Node 现有依赖、fastembed 模型缓存（BAAI/bge-small-zh-v1.5）——**均为"待核验"状态，不得视为既成事实**；由 Builder 按 DRAFT §5.4 预装检查逐项核验（`spike/preflight-check.md`）；**任何一项缺失立即停止，提交范围/依赖裁决，不得下载或安装**；
- 本 Spike 只允许合成评测数据 + 评测专用 user_id；禁止非本机网络；禁止运行时下载/安装。

## 6. 已完成 / 未完成

已完成：DRAFT v1.2 批准（两轮 CHANGES_REQUESTED 修订）、执行模式确认、规划 PR #16 合入、实施分支 `feature/task-006-local-gate-spike` 创建（基于 origin/main @ 0f2e3df）。

未完成（长期会话全部工作，分阶段推进）：**阶段 1（首次唤醒）= 仅提交实施计划供 Review 2** → 批准后阶段 2：预装检查 → 校准测量（≥3 轮）→ 冻结 holdout（四步顺序）→ 延迟/资源测量 → Spike 报告与证据落盘。**阶段 1 批准前不进入阶段 2 任何动作。**

## 7. 已批准决策

| ID | 决策 | 对 Builder 的含义 |
|---|---|---|
| D-T006-1 | TASK-006 E004 无关召回 Gate（DRAFT v1.1） | 目标：E004 无关召回降为 0，正向召回与强约束无回归；不改评测规则 |
| D-T006-ROUTE-B | 路线 B：不外发用户数据的本地/规则/检索路线 | 不接入外部模型 Gate；外部 Gate 仅离线研究证据；本 Spike 只验证本地机制 |
| D-T006-LOCAL-SPIKE | 本地 Gate Spike DRAFT v1.2 | **本任务唯一权威方案**：候选两机制、限时、冻结 holdout、延迟/资源门、验收、停止条件、允许/禁止范围全部按此执行 |

## 8. 决策理由

外部模型 Gate 有正向离线证据但隐私、严格墙钟延迟、失败回退与证据治理不满足产品化要求；简单阈值无法可靠分离正负候选；因此验证本地机制的技术可行性。

## 9. 已否决方案

- 外部模型相关性 Gate 接入产品路径（D-T006-ROUTE-B 否决为产品路线）；
- 简单阈值直接调参方案（校准/验证分离边际未达标，TASK-004/TASK-006 历史证伪）；
- 固定字面量（天气/猫/失眠/小橘）白名单/黑名单方案（禁止，DRAFT §7 禁止 8）。

## 10. required_reading

见文件头部 YAML。**核心必读**：`local-gate-spike-draft.md`（v1.2）全文——所有机制定义、冻结纪律、测量口径、验收、停止条件、允许/禁止范围均以该文件为唯一权威。

## 11. 允许执行

1. 在 Spike 分支新增**隔离测量/验证脚本**（非"独立只读"）：评测专用 user_id、真实本地 mem0 检索（loopback）、本地词法/统计特征计算；**只允许使用合成评测数据**；可在评测专用 user_id 下**写入 holdout 合成种子记忆**（用于建立冻结 holdout 场景），**完成后必须清理**；除 holdout 合成种子外**不得写任何正式数据**（不落库正式表、不写入正式 eval_cases、不进入 /api/chat）；
2. 读取正式代码与契约作为只读输入；
3. 证据落盘：脚本 + 原始数据 + 报告 + 冻结记录（`holdout-freeze.md` / `mechanism-freeze.md`，含时间戳/提交号/哈希）写入 `project-context/tasks/TASK-006/spike/`；
4. 使用**经预装检查核验通过**的本地组件（mem0-server / PostgreSQL / Node 现有依赖 / fastembed 缓存；核验方式见 §13 步骤 2/3，缺失即停止，不得下载或安装）；
5. 在 Spike 分支提交过程与报告；先提交实施计划等待 Review 2（实现计划 Review），再开始测量。

## 12. 禁止执行

1. 修改产品代码（v2/ 任何文件，含 memory-config.ts、chat/route.ts、eval-program-rules.ts）；
2. 修改正式 8 Case / Schema / 评测规则（002_eval.sql、eval-policy、pass_criteria、判定逻辑、迁移）；
3. 外发任何用户数据或访问非本机网络；调用外部模型 API；
4. 不接入产品路径；
5. 不触碰 TASK-007、TASK-005B、TASK-004（保持 PAUSED）；
6. 不修改治理文件（current-state、decision-register、roadmap、AGENTS.md 等）；
7. 不接触生产密钥、不部署、不合并、不 force push；
8. 禁止针对"天气/猫/失眠/小橘"等固定字面量硬编码过关；
9. 不得以 Mock 替代最终真实验收；
10. 禁止运行时下载模型、权重或依赖；禁止安装未预装组件；
11. 禁止导入真实用户数据（只允许合成评测数据）；
12. 历史 `feature/task-004-spike` 工作区（E:\正式作品 主检出）只记 W2，禁止写入、同步或清理；
13. 不得自行扩大候选机制范围（新增第三候选须 Change Request）；不得自行确认执行模式变更；
14. **实施计划获批准前，禁止任何实测动作**：禁止预装检查、禁止写测量/验证脚本、禁止建 holdout、禁止测量或实测（首次唤醒只提交实施计划，见 §3 与 §13 步骤 2）。

## 13. 具体步骤

1. **启动回执**：先读 required_reading，只读核验 Git/主线/任务状态，输出"先说人话（30 秒）"+ 启动回执；
2. **首次唤醒唯一动作——实施计划（Review 2）**：只提交实施计划（测量/验证脚本设计、候选评估顺序、预装检查核验命令、冻结记录文件结构、延迟/资源测量方案），等待 Founder/Reviewer 批准；**实施计划获批准前：禁止预装检查、禁止写脚本、禁止建 holdout、禁止测量或任何实测**（见 §12 禁止 14）；
3. **预装检查**（实施计划批准后）：按 DRAFT §5.4 核验清单逐项记录到 `spike/preflight-check.md`；缺失即停止，提交范围/依赖裁决，不得下载或安装；
4. **holdout 数据冻结（步骤①）**：定义 3–5 个 holdout 场景 + 标签 + 样本，锁定版本 + 哈希 → `spike/holdout-freeze.md`；holdout 内容不得用于设计/调整任何候选机制；
5. **校准调参（步骤②）**：仅在校准集（8 Case 场景）三轮测量；候选 1 计算 Spearman ρ（非冗余诊断）；候选 2 仅可调整 w1/w2 与相容矩阵；校准集 F1 ≥ 0.9 且分离边际 > 0.1；
6. **机制冻结（步骤③）**：候选机制版本 + 哈希 → `spike/mechanism-freeze.md`；冻结后不得再修改；
7. **holdout 一次性运行（步骤④）**：冻结机制对冻结 holdout 只运行一次；运行后禁止继续调参；
8. **延迟/资源测量**：按 DRAFT §6.1 口径（预热 5 次、样本 ≥30、P95 = ceil(0.95×N)、基线=仅检索、处理组=检索+Gate、增量=处理组−基线）；增量 P95 ≤ 200ms、总预算 ≤ 1000ms、内存 ≤ 512MB、CPU ≤ 500ms；
9. **网络/数据边界审计**：仅 loopback、零非本机调用、仅合成数据 → 记录证据；
10. **Spike 报告**：候选对比、ρ、失败候选完整记录、冻结记录、延迟/资源、样本量声明、与 DRAFT v1.2 验收逐项对标；**不得预写 Reviewer 核对结论**（Builder 只提供冻结记录与提交历史）；
11. **提交与交接**：证据全部入库到 `project-context/tasks/TASK-006/spike/`，提交 Spike 分支，输出结构化实现报告与下一窗口唤醒卡。

## 14. 验收标准（DRAFT v1.2 §8，至少一个正式候选通过全部 1–11 项即形成"存在可行候选"结论）

1. 预装检查通过；2. 候选 1 非冗余诊断 ρ<0.9（否则降级不参与）且候选 2 可执行定义核对；3. 每个正式候选 0–1 连续分数 + ≥3 轮测量；4. 校准集 F1 ≥ 0.9 且分离边际 > 0.1；5. 冻结 holdout 一次性运行 F1 ≥ 0.9 且分离边际 > 0.1；6. 延迟门（增量 P95 ≤ 200ms / 总预算 ≤ 1000ms）；7. 资源门（≤512MB / ≤500ms CPU）；8. 网络与数据边界；9. 零产品改动；10. 证据完整落盘；11. 报告诚实（含"Spike 通过 ≠ TASK-006 完成"声明）。

## 15. 停止条件（DRAFT v1.2 §9，满足任一 → 停止并提交 Change Request / 返回 Founder）

1. 所有正式候选都无法安全分离；2. 修 E004 必然导致 E001 明显退化；3. 必须削弱测试/改判定规则/硬编码才能变绿；4. 需要超出批准范围的改动（含必须外发才能解决）；5. 无法建立独立冻结 holdout 证据；6. 本地组件未预装或需运行时下载/安装；7. 发现用户数据外发路径或非本机网络访问；8. 限时到期（5 工作日或 3 轮迭代）；9. 两个正式候选都失败（单候选失败只记录）。

## 16. 完成后必须返回的材料（分阶段）

**阶段 1（首次唤醒）必须返回**：实施计划（Review 2 用：测量/验证脚本设计、候选评估顺序、预装检查核验命令、冻结记录文件结构、延迟/资源测量方案）。

**阶段 2（实施计划批准后）完成后必须返回**：1. `spike/preflight-check.md`；2. `spike/holdout-freeze.md` / `spike/mechanism-freeze.md`（含时间戳/提交号/哈希）；3. 测量脚本 + 原始数据；4. 延迟/资源/网络审计记录；5. Spike 报告（候选对比、ρ、失败记录、样本量声明、验收逐项对标）；6. 结构化实现报告（修改文件清单、diff、测试/测量结果、失败尝试、下一步建议）；7. 下一窗口唤醒卡。

## 17. 下一张交接卡要求

- **阶段 1 完成后**：Builder 提交实施计划 → Founder/Reviewer 执行 Review 2（实现计划 Review）；通过后**返回原长期 Builder 继续阶段 2**（预装检查 → 测量 → 冻结 holdout → 报告）；
- **阶段 2（Spike）完成后**：Builder → 独立 Reviewer（Review 3 代码与行为 Review，核验冻结记录/提交历史/验收逐项/零产品改动）；
- Reviewer 输出 REVIEW_APPROVED 或 CHANGES_REQUESTED 后：返回 Founder 裁决（Spike 是否通过、是否进入 TASK-006 新 CR 与实施计划）；
- 本交接包由 Founder 人工转发唤醒 Builder；Builder 完成后按角色交接规则返回。
