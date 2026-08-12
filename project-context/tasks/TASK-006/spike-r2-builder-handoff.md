# TASK-006｜第二轮本地相关性 Gate Spike — Builder 交接包

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
  - project-context/tasks/TASK-006/spike-r2-candidate-draft.md（v1.2，APPROVED + 8 项批准约束 + PR #18 修订，本任务唯一权威方案）
  - project-context/tasks/TASK-006/spike-r2-research.md（调研报告，方向依据）
  - project-context/tasks/TASK-006/spike-stop-cr.md（第一轮裁决，DECIDED-A）
  - project-context/tasks/TASK-006/spike/（第一轮证据：失败根因 R1 词法不可分 / R2 手工词表覆盖不足）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/app/api/chat/route.ts
doc_type: Builder 交接包（执行模式 persistent_session）
task_id: TASK-006（内部第二轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R2）
status: APPROVED（DRAFT v1.2 已批准 + 8 项约束 + 规划 PR #18 已合入 origin/main @ 9ab87f2 + 执行模式已确认）
execution_mode: persistent_session（HANDOFF REQUIRED）
assigned_role: Builder（长期会话）
assigned_session: TASK-006｜Builder｜第二轮本地相关性 Gate Spike
branch: feature/task-006-r2-spike
handoff_by: operational-chief-2026-08-12-01（执行 Chief）
handoff_date: 2026-08-12
```

---

## 1. 目标角色

长期 Builder（persistent_session；非驻留窗口，由 Founder 人工唤醒）。

## 2. 项目位置

P1 Alice Memory 作品集项目 → 主线 TASK-006（E004 无关召回 Gate）→ 第一轮 Spike 已停止（STOPPED/FAILED，收尾 PR #17）→ **第二轮本地相关性 Gate Spike（候选范围已批准，本交接包）**。

## 3. 本次唯一目标（首次唤醒）与长期会话总目标

- **首次唤醒唯一目标**：只提交 **Review 2 实施计划**——测量/验证脚本设计（候选 A cross-encoder 重排 + 候选 B k-means 聚类）、预装检查核验命令（共享/专属依赖区分）、**模型事实报告要求**（§5.4：候选 A 具体模型名称/版本/哈希/许可证/缓存来源/运行接口/资源需求）、候选评估顺序、冻结记录文件结构、延迟/资源测量方案；
- **长期会话总目标**：按 `spike-r2-candidate-draft.md`（v1.2 + 8 项批准约束）执行第二轮 Spike，验证候选 A/B 能否可靠分离 E004 无关召回与 E001 等正向召回，产出可复现证据与 Spike 报告；Spike 通过只代表"技术可行"，不代表 TASK-006 完成；
- **Review 2 前禁止**：预装检查、确定候选 A 模型、下载或安装、写脚本、建立 holdout 及任何实测（DRAFT §7 禁止 13/14 + 批准约束 4）。

## 4. 为什么做

E004 缺陷仍存在（Run #28 天气话题召回无关记忆）。第一轮两候选均失败（词法不可分 R1 / 手工词表覆盖不足 R2），Founder 裁决 A 接受失败并指示第二轮针对根因提出新机制。第二轮候选：A = 本地 cross-encoder 相关性重排方向（具体模型待预装检查后确认）；B = embedding 校准集原型聚类 k-means。Spike 通过后仍需新 CR 与实施计划并经 Founder 批准才允许产品实现。

## 5. 当前事实（已核验）

- 权威主线：origin/main @ `9ab87f2`（PR #18 规划已合入；本实施分支即从该点创建）；
- 第二轮 DRAFT v1.2 = APPROVED（Founder 8 项批准约束 §0.2 逐条落盘；PR #18 CHANGES_REQUESTED 修订已合入：调研报告删除"零新增依赖"既成事实、§5.4 共享/专属依赖区分、§9 候选级 vs 整轮红线）；执行模式 = persistent_session 已确认；
- 候选 A：只批准"本地 cross-encoder 重排"**方向**，**未批准任何具体模型/权重**；fastembed 接口与 reranker 权重是否可用/已缓存 = **待预装检查核验**；模型事实报告经 Founder/决策 Chief 确认前不得运行候选 A、不得下载/安装/替换权重；
- 候选 B：k-means 原型聚类（单一方法）；输入仅 (a) 8 Case 种子文本 + (b) 第一轮校准样本；不使用通用知识/未批准语料/人工词表/下载模型；
- 第一轮失败根因：R1 词法不可分（E001 相关对与 E004 无关对记忆文本几乎相同）；R2 手工词表覆盖不足（"下雨"未收录 → 信号归零）；
- 本地组件：mem0-server、PostgreSQL（ai_companion）、Node 现有依赖、fastembed embedding 缓存——均为**待核验**状态（共享依赖）；reranker 权重为候选 A 专属待核验项。

## 6. 已完成 / 未完成

已完成：调研（4 方案）、DRAFT v1.2 批准（8 约束 + PR #18 修订）、执行模式确认、规划 PR #18 合入、实施分支 `feature/task-006-r2-spike` 创建（@ 9ab87f2）。

未完成（长期会话全部工作，分阶段推进）：**阶段 1（首次唤醒）= 仅提交 Review 2 实施计划** → 批准后阶段 2：预装检查（共享/专属依赖）→ 模型事实报告（候选 A 专属）→ holdout 冻结 → 校准 3 轮 → 候选 A/B 评估 → 机制冻结 → holdout 一次性运行 → 延迟/资源测量 → 网络审计 → Spike 报告。

## 7. 已批准决策

| ID | 决策 | 对 Builder 的含义 |
|---|---|---|
| D-T006-1 | TASK-006 E004 无关召回 Gate（DRAFT v1.1） | 目标：E004 无关召回降为 0，正向召回与强约束无回归；不改评测规则 |
| D-T006-ROUTE-B | 路线 B：不外发用户数据的本地/规则/检索路线 | 不接入外部模型 Gate；本 Spike 只验证本地机制 |
| D-T006-LOCAL-SPIKE | 第二轮候选范围 DRAFT v1.2（8 项批准约束） | **本任务唯一权威方案**：候选 A/B 方向、限时、冻结纪律、延迟/资源门、验收、停止条件、允许/禁止范围全部按此执行 |

## 8. 决策理由

外部模型 Gate 不满足隐私/延迟/回退要求；第一轮两候选失败暴露 R1（词法不可分）与 R2（手工词表覆盖不足）；调研确认 cross-encoder 重排（候选 A）与数据驱动聚类（候选 B）为可行方向；Founder 批准候选范围并附加 8 项边界约束（不预选模型、待核验、单候选/整轮停止分离等）。

## 9. 已否决方案

- 外部模型相关性 Gate 接入产品路径（D-T006-ROUTE-B 否决为产品路线）；
- 第一轮候选 1（词法/统计）与候选 2（手工主题词表）——已冻结，不作第二轮候选或调参对象（DRAFT §7 禁止 11）；
- 补 H4 词表重跑 / 重跑冻结 holdout / 重启外部模型路线（Founder 裁决 A 禁止）；
- ColBERT（需新 checkpoint/索引，违反"仅已预装"）与 RRF（融合层非词表替代）不作为候选 B 第二实现（调研结论）。

## 10. required_reading

见文件头部 YAML。**核心必读**：`spike-r2-candidate-draft.md`（v1.2）全文——含 §0.2 批准 8 项约束、§3 候选定义、§5 冻结纪律、§5.4 预装检查（共享/专属）、§9 停止条件（候选级 vs 整轮红线）；`spike-r2-research.md`（方向依据）。

## 11. 允许执行

1. 在 Spike 分支新增**隔离测量/验证脚本**：评测专用 user_id、真实本地 mem0 检索（loopback）、本地 embedding 推理与 cross-encoder 重排推理（**仅限预装检查核验通过的缓存权重**）、本地统计/聚类计算；只允许合成数据；可写入 holdout 合成种子（完成后清理）；
2. 读取正式代码、契约与第一轮证据作为只读输入；
3. 证据落盘：脚本 + 原始数据 + 冻结记录 + 审计写入 `project-context/tasks/TASK-006/spike-r2/`；
4. 使用经预装检查核验的本地组件；
5. 在 Spike 分支提交过程与报告；**先提交实施计划等待 Review 2**，再开始测量。

## 12. 禁止执行

1. 修改产品代码（v2/ 任何文件）、正式 8 Case、Schema、评测规则、治理文件；
2. 外发任何用户数据或访问非本机网络；调用外部模型 API；
3. 不接入产品路径；不触碰 TASK-007 / TASK-005B / TASK-004（保持 PAUSED）；
4. 不接触生产密钥、不部署、不合并、不 force push；
5. **禁止手工枚举主题词表**（候选 B 必须数据驱动）；禁止针对"天气/猫/失眠/小橘"等固定字面量硬编码；
6. 禁止运行时下载模型、权重或依赖；禁止安装未预装组件；
7. 禁止导入真实用户数据；
8. 不得以 Mock 替代最终真实验收；
9. 不得复用第一轮冻结 holdout 的具体文本（H1–H4 原文）；
10. 不得重新启用第一轮已冻结机制调参；
11. 历史 `feature/task-004-spike` 工作区只记 W2，禁止写入、同步或清理；
12. **实施计划获批准前禁止任何实测**（预装检查、写脚本、建 holdout、测量）；
13. **候选 A 具体模型未获确认前禁止运行**：在 §5.4 模型事实报告（模型名称/版本/哈希/许可证/缓存来源/运行接口/资源需求）经 Founder/决策 Chief 确认前，不得运行候选 A、不得下载/安装/替换权重；候选 B 不受此限（不依赖未确认模型）；
14. 不得自行扩大候选机制范围（新增第三候选须 Change Request）；不得自行确认执行模式变更。

## 13. 具体步骤（分阶段）

**阶段 1（首次唤醒，Review 2）**：
1. **启动回执**：先读 required_reading，只读核验 Git/主线/任务状态，输出"先说人话（30 秒）"+ 启动回执；
2. **实施计划（Review 2）**：只提交实施计划（测量/验证脚本设计、候选评估顺序、预装检查核验命令【共享/专属依赖区分】、**模型事实报告要求**、冻结记录文件结构、延迟/资源测量方案），等待 Founder/Reviewer 批准；**批准前禁止预装检查、确定候选 A 模型、下载或安装、写脚本、建立 holdout 及任何实测**。

**阶段 2（实施计划批准后）**：
3. **预装检查**：按 DRAFT §5.4 区分共享依赖（P1–P4/P6）与候选 A 专属依赖（P5 reranker 权重）；共享依赖缺失致两候选均不可执行 → 整轮停止（§9.2 第 10 条）；候选 A 专属缺失 → 只停候选 A（§9.1 第 4 条），候选 B 独立继续；结果写入 `spike-r2/preflight-check.md`；
4. **模型事实报告**（候选 A 专属，§5.4）：预装检查后产出 `spike-r2/model-facts.md`（模型名称/版本/哈希/许可证按模型卡/缓存来源/运行接口/资源需求）→ 交 Founder/决策 Chief 确认后才可运行候选 A；
5. **holdout 数据冻结（步骤①）**：3–5 个场景（多义词/他人属性/隐式关联/未见过表达泛化【新天气表达新文本，禁止复用 H4 原文】），锁定版本 + 哈希 → `spike-r2/holdout-freeze.md`；holdout 内容不得用于设计/调整任何候选机制（早于 Builder 实现/参数/调优设计）；
6. **校准调参（步骤②）**：仅在校准集（E001–E005 场景）三轮测量；候选 A 计算 Spearman ρ（非冗余诊断）+ 冗余降级自检（实现非单一余弦）；候选 B 调整 k 与阈值（仅校准集）；校准集 F1 ≥ 0.9 且分离边际 > 0.1；
7. **机制冻结（步骤③）**：候选机制版本 + 哈希 → `spike-r2/mechanism-freeze.md`；冻结后不得再修改；
8. **holdout 一次性运行（步骤④）**：冻结机制对冻结 holdout 只运行一次；运行后禁止继续调参；
9. **延迟/资源测量**：DRAFT §6 口径（预热 5 次、样本 ≥30、P95 = ceil(0.95×N)、基线=仅检索、处理组=检索+Gate、增量=处理组−基线）；增量 P95 ≤ 200ms、总预算 ≤ 1000ms、内存 ≤ 512MB、CPU ≤ 500ms；
10. **网络/数据边界审计**：仅 loopback、零非本机调用、仅合成数据、种子清理核验 → 记录证据；
11. **Spike 报告**：候选对比、ρ、失败候选完整记录、冻结记录、延迟/资源、样本量声明、与 DRAFT v1.2 验收逐项对标；不得预写 Reviewer 核对结论；
12. **提交与交接**：证据全部入库 `spike-r2/`，提交 Spike 分支，输出结构化实现报告与下一窗口唤醒卡。

## 14. 验收标准（DRAFT v1.2 §8；至少一个正式候选通过全部适用门 + 统一门即形成"存在可行候选"结论）

1. 预装检查通过（共享/专属依赖分别判定）；2. 各候选适用门独立（候选 A：非冗余诊断 ρ<0.9 + 冗余降级自检；候选 B：数据驱动定义核对）；3. 每个正式候选 0–1 连续分数 + ≥3 轮测量；4. 校准集 F1 ≥ 0.9 且分离边际 > 0.1（每候选分别）；5. 冻结 holdout 一次性运行 F1 ≥ 0.9 且分离边际 > 0.1；6. 延迟门（增量 P95 ≤ 200ms / 总预算 ≤ 1000ms）；7. 资源门（≤512MB / ≤500ms CPU）；8. 网络与数据边界（loopback-only + 合成数据 + 种子清理）；9. 零产品改动；10. 证据完整落盘（含 holdout 隔离审计证据）；11. 报告诚实（含"Spike 通过 ≠ TASK-006 完成"声明）。

## 15. 停止条件（DRAFT v1.2 §9，PR #18 修订版）

**候选级（只停对应候选，另一候选继续）**：① 候选质量不达标（分离边际 ≤ 0.1 或波动 > 0.1）；② 正向召回退化；③ 必须削弱测试/改判定规则/手工枚举词表/硬编码才能变绿；④ 候选专属依赖缺失（候选 A reranker 权重未缓存 → 只停候选 A）。

**整轮立即停止红线**：⑤ 数据外发/非本机网络访问；⑥ 接触或落盘真实用户数据；⑦ 冻结失效（holdout 不可建/不独立/纪律破坏）；⑧ 时间盒到期（5 工作日 / 3 轮）；⑨ 超批准范围改动；⑩ 没有任何正式候选可执行（共享依赖缺失致两候选均不可执行，或候选级停止后无剩余候选）→ 整轮停止，提交 CR 由 Founder 裁决。

## 16. 完成后必须返回的材料（分阶段）

**阶段 1（首次唤醒）必须返回**：实施计划（Review 2 用：脚本设计、候选评估顺序、预装检查命令【共享/专属】、模型事实报告要求、冻结记录结构、延迟/资源测量方案）。

**阶段 2（实施计划批准后）完成后必须返回**：1. `spike-r2/preflight-check.md`；2. `spike-r2/model-facts.md`（候选 A，经 Founder/决策 Chief 确认）；3. `spike-r2/holdout-freeze.md` / `spike-r2/mechanism-freeze.md`（时间戳/提交号/哈希）；4. 测量脚本 + 原始数据；5. 延迟/资源/网络审计记录；6. Spike 报告（候选对比、ρ、失败记录、样本量声明、验收逐项对标）；7. 结构化实现报告；8. 下一窗口唤醒卡。

## 17. 下一张交接卡要求

- **阶段 1 完成后**：Builder 提交实施计划 → Founder/Reviewer 执行 Review 2；通过后返回原长期 Builder 继续阶段 2；
- **阶段 2（Spike）完成后**：Builder → 独立 Reviewer（Review 3：核验冻结记录/提交历史/模型事实报告/验收逐项/零产品改动）；
- Reviewer 输出结论后返回 Founder 裁决（Spike 是否通过、是否进入 TASK-006 新 CR 与实施计划）；
- 本交接包由 Founder 人工转发唤醒 Builder；Builder 完成后按角色交接规则返回。

---

## 18. 启动核验记录与窗口回复约束（Builder 窗口，2026-08-12）

**本轮启动核验（完整版落盘于此；聊天不再展开）**：
- 身份：TASK-006｜Builder｜第二轮本地相关性 Gate Spike（第二轮 Builder，新干净窗口；本窗口固定身份，不切换 Chief/Reviewer）
- 统一规则版本（C1）：2026-08-12.2（worktree AGENTS.md 头部实测）
- 正式主线（C3）：origin/main @ `9ab87f2`（`git ls-remote origin main` 实测 = 本地 origin/main；master `064f5b6` 已并入 main 归档）
- 上下文来源（C6）：正式主线文件（worktree `E:\task-006-r2-spike-worktree`）+ 远端 ls-remote/rev-parse + 任务目录文件；未依赖聊天摘要
- 分支/工作区：`feature/task-006-r2-spike` @ `e9a9de0`（`dcb7646..e9a9de0` 已推送 origin），worktree 干净
- 允许：仅修正 required_reading 漏列 product.md（已完成）；提交/推送 spike 分支
- 禁止：预装检查、确定候选 A 模型、下载安装、写脚本、建 holdout、任何实测、改产品代码、合并
- 告警：W1 current-state.md 主线记录（`011168f`）滞后于实测 `9ab87f2`（Chief 待同步）；W2 历史 feature/task-004-spike 脏工作区未触碰
- 结论：可以继续（阶段 1 收尾，等待 Review 2）；Founder 批准前不进入阶段 2
- **补记（2026-08-12，聚焦修复卡核验）**：分支推进至 `eadc042`（已推送 origin，HEAD=origin）；提交仅改 `spike-r2/implementation-plan.md`（10 处 21+/17-），核心 = S7 质量测试不清理 → S8 延迟/资源测量（holdout 种子仍在）→ S8b 清理核验清零；§5.1/§6/§9.2/§10/§11/§11.3/§12/§13/§15 顺序链一致，无旧时序残留；未改 DRAFT 范围/候选机制/禁止清单/预装检查/模型事实要求；未预装、未实测、未选模型、未建 holdout；待决 = 聚焦 Reviewer 复审顺序一致性
- **补记 2（2026-08-12，Founder 撤销指令）**：撤销 S8 复用冻结测试场景设计——S7 只运行一次冻结质量测试且运行后立即清理核验清零；S8 延迟/资源测量改用校准场景 E001–E005 或独立性能合成场景，不读取冻结 holdout；S8b 阶段删除，§4/§5.1/§6/§9.2/§10/§11/§11.3/§12/§13/§15 已同步修订；候选与验收范围未改；未预装、未实测、未选模型、未建 holdout；待决 = 同一聚焦 Reviewer 复审
- **补记 3（2026-08-12，Review 2 批准 + S0 授权）**：Review 2 已批准，实施计划生效（分支 `5e9e839`，HEAD=origin）；Founder 授权执行 S0 只读预装检查（共享 P1–P4/P5-S/P6 + 候选 A 专属 P5-A/P5-A2；禁止实例化触发下载），P5-A 通过时产出 model-facts.md 交 Founder/决策 Chief 确认候选 A 模型；候选 B 保持独立可执行，本次不开始实验；禁止下载/安装/替换权重、运行候选 A、写脚本、建 holdout、任何实测

**窗口回复约束（Founder 2026-08-12 指令，本窗口强制）**：
1. 本窗口固定身份 TASK-006 第二轮 Builder，不得切换为 Chief 或 Reviewer；
2. 启动核验完整版写入本交接文件，聊天只报告：身份、正式基线、是否可继续；
3. 阶段完成回复只允许：3 句大白话 + 底部最多 6 个 Markdown 项目符号（每符号一行，≤500 字总长）；
4. 整条回复不超过 500 字；每行只写一个字段，不展开文件清单、Git 证据或合规自检；
5. 需要执行 Chief 接手时只生成短卡，由 Founder 转发；本窗口不自行切换角色。
