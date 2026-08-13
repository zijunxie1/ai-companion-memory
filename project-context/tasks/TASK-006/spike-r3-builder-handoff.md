# TASK-006｜第三轮「检索后相关性判断」对照 Spike — Builder 交接包

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
  - project-context/tasks/TASK-006/spike-r3-candidate-draft.md（v1.1，APPROVED，本任务唯一权威方案）
  - project-context/tasks/TASK-006/spike-r2-research.md（第二轮调研，方向依据）
  - project-context/tasks/TASK-006/spike-stop-cr.md（第一轮裁决，DECIDED-A）
  - project-context/tasks/TASK-006/spike-r2/（第二轮证据：preflight-check.md / model-facts.md / implementation-plan.md）
  - project-context/tasks/TASK-006/spike/（第一轮证据：失败根因 R1/R2）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
  - v2/migrations/002_eval.sql
  - v2/app/src/lib/memory-config.ts
  - v2/app/src/lib/mem0-client.ts
  - v2/app/src/lib/eval-program-rules.ts
  - v2/app/src/app/api/chat/route.ts
doc_type: Builder 交接包（执行模式 persistent_session）
task_id: TASK-006（内部第三轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R3）
status: APPROVED（DRAFT v1.1 已批准 + 规划 PR #19 已合入 origin/main @ 6660ca2 + 执行模式已确认）
execution_mode: persistent_session（HANDOFF REQUIRED）
assigned_role: Builder（长期会话）
assigned_session: TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike
branch: feature/task-006-r3-spike
handoff_by: operational-chief-2026-08-12-01（执行 Chief）
handoff_date: 2026-08-12
```

---

> ## ⛔ 当前执行入口（2026-08-13）
> **§18（阶段记录）与 §19（下一窗口唤醒卡）是本文件的当前唯一事实与执行入口。**
> §1—§17 为**历史首次唤醒快照**（Builder 首次唤醒时落盘），其中"方案 B 模型未批、方案 C 外部调用未批、首次唤醒仅提交 Review 2 实施计划"等描述已被 Founder 2026-08-13 裁决取代（见 §18），**不可作为当前执行依据**。
> **当前唯一下一步：S0.3 方案 C 连通检查——成功才进入 S1 冻结；失败只停 C，A/B 独立继续。**

## 1. 目标角色

长期 Builder（persistent_session；非驻留窗口，由 Founder 人工唤醒）。

## 2. 项目位置

P1 Alice Memory 作品集项目 → 主线 TASK-006（E004 无关召回 Gate）→ 第一轮 Spike 已停止（STOPPED/FAILED）→ 第二轮候选 A 因无 reranker 权重缓存只停候选 A、候选 B 暂停 → **第三轮「检索后相关性判断」对照 Spike（本交接包）**。

## 3. 本次唯一目标（首次唤醒）与长期会话总目标

- **首次唤醒唯一目标**：只提交 **Review 2 实施计划**——测量/验证脚本设计（三方案）、预装检查核验命令（共享/候选专属依赖区分）、**方案 B 模型事实报告要求**（§5.4 同第二轮：具体模型名称/版本/哈希/许可证/缓存来源/运行接口/资源需求）、三方案评估顺序、冻结记录文件结构、主实验与补充实验分表、延迟/资源/费用测量方案；
- **长期会话总目标**：按 `spike-r3-candidate-draft.md`（v1.1，APPROVED）执行第三轮对照 Spike，验证方案 A（零新增依赖基线）/ B（本地 Cross-Encoder 方向）/ C（外部大模型效果上限对照）在统一冻结样本与候选池上的相对表现，产出可复现证据与 Spike 报告；Spike 通过只代表"技术可行性与相对优劣已知"，不代表 TASK-006 完成；
- **Review 2 前禁止**：预装检查、确定方案 B 具体模型、下载或安装、写脚本、建立 holdout 及任何实测（DRAFT §7 禁止 + 本轮指令"继续禁止实验、下载模型和外部调用"）。

## 4. 为什么做

E004 缺陷仍存在（Run #28 天气话题召回无关记忆）。第一轮两候选均失败（词法不可分 R1 / 手工词表覆盖不足 R2）；第二轮候选 A 因本机无 reranker 权重缓存只停候选 A、候选 B 被 Founder 暂停。第三轮改为三方案对照：A 零新增依赖基线 / B 本地 Cross-Encoder 方向（模型未批）/ C 外部大模型效果上限对照（仅合成数据）。**效果优先，但效果/延迟/费用/隐私必须同时提供证据**；每轮仍先检索有限候选，检索后逐条判断相关性，允许最终返回零条。

## 5. 历史首次唤醒快照（已核验，2026-08-12；当前事实见 §18—§19）

- 权威主线：origin/main @ `6660ca2`（规划 PR #19 已合入；本实施分支即从该点创建）；
- 第三轮 DRAFT v1.1 = APPROVED（Founder 2026-08-12 批准；经 v1.0 打回五项修订：任务拆分 / REST 事实定级 / 主·补充实验分离 / 完成度分档 / 样本规模与措辞）；执行模式 = persistent_session 已确认；
- **REST 参数面（✅ 已核验项目事实）**：当前搜索接口只接收 user_id / query / limit，未开放 threshold / rerank（`mem0-client.ts:16-31`）；mem0 2.0.13 Python API 有 threshold/rerank 与 5 种 reranker（`main.py` / `factory.py`）；当前配置 `reranker=None`；**实验调用走容器内 Python API 直调或 Spike 分支内实验适配层**（待实测其行为），不能表述为"直接打开开关即可完成"；
- **方案 B 边界**：只批准"本地 Cross-Encoder 重排"方向，**不批准任何具体模型/权重**；本机无任何 reranker 权重缓存（第二轮 P5-A 已核验）；fastembed 0.8.0 `TextCrossEncoder` import ok 但无权重；候选 B-1（bge-reranker-base）/ B-2（bge-reranker-v2-m3）不得混为一谈；**任何下载/安装/替换权重均需 Founder 单独批准**；
- **方案 C 边界**：定位为效果上限对照，不代表获准生产；默认接口 = 现有 DeepSeek OpenAI 兼容（`deepseek-chat`）；**仅合成数据**；真实用户记忆是否外发属后续 Founder 决策；**外部调用需单独 Change Request + Founder 批准**；
- 第一轮失败根因：R1 词法不可分、R2 手工词表覆盖不足、R3 F1 高是"阈值选在重叠区"假象；
- 第二轮预装检查：共享依赖 P1–P6 通过（mem0-server 8100 / mem0 2.0.13 / PostgreSQL 8 Case / Node / fastembed embedding 缓存 / 网络边界）；候选 A 专属 P5-A 未发现 reranker 权重。

## 6. 已完成 / 未完成

已完成：调研（两份公开方案报告）、DRAFT v1.1 批准（五项打回修订）、执行模式确认、规划 PR #19 合入、实施分支 `feature/task-006-r3-spike` 创建（@ 6660ca2）。

未完成（长期会话全部工作，分阶段推进）：**阶段 1（首次唤醒）= 仅提交 Review 2 实施计划** → 批准后：S0 预装检查（共享/专属依赖）→ S0.5 方案 B 模型事实报告（候选 A 专属门）→ S1 holdout 冻结 → S2/S3 校准集核验与标注 → S4 主实验三方案评估（校准部分）→ S4.5 补充实验 Mem0 阈值端到端 → S5 机制冻结 → S6 holdout 一次性运行（后立即清理种子）→ S7 延迟/资源/费用测量（排除 holdout）→ S8 网络审计 → S9 Spike 报告。

## 7. 已批准决策

| ID | 决策 | 对 Builder 的含义 |
|---|---|---|
| D-T006-1 | TASK-006 E004 无关召回 Gate（DRAFT v1.1） | 目标：E004 无关召回降为 0，正向召回与强约束无回归；不改评测规则 |
| D-T006-ROUTE-B | 路线 B：不外发用户数据的本地/规则/检索路线 | 外部模型 Gate 不进入产品路径；方案 C 仅作离线效果上限对照（仅合成数据） |
| D-T006-R3-SPIKE | 第三轮对照 Spike DRAFT v1.1（APPROVED） | **本任务唯一权威方案**：三方案对照、主/补充实验分表、完成度分档、冻结候选池规模与类别分布、关键记忆防漏独立门、验收、停止条件、允许/禁止范围全部按此执行 |
| D-T006-R3-EXEC | 执行模式 | persistent_session（HANDOFF REQUIRED，Founder 2026-08-12 确认） |

## 8. 决策理由

外部模型 Gate 不满足隐私/延迟/回退要求（路线 B）；前两轮暴露 R1/R2/R3 根因；第三轮改为"同一冻结样本与候选池"三方案对照，主实验（固定候选池判断器对比）与补充实验（Mem0 阈值端到端）分表，避免结果混表；完成度分档防止 B/C 未授权时误称"完整通过"。

## 9. 已否决方案

- 外部模型相关性 Gate 接入产品路径（D-T006-ROUTE-B 否决为产品路线）；
- 第一轮候选 1（词法/统计）与候选 2（手工主题词表）——已冻结，不作本轮候选或调参对象；
- 补 H4 词表重跑 / 重跑冻结 holdout / 重启外部模型路线（Founder 裁决 A 禁止）；
- 第二轮候选 B（k-means）——Founder 暂停，不继续实验；
- MemoryGate（身份、数据、适配性证据不足，与"每轮先检索"前提不一致，不纳入）；
- "只下载 BGE-reranker-base"单点方案（Founder 不批准）；
- 预检索 Gate 作为主方案（本轮不采用）。

## 10. required_reading

见文件头部 YAML。**核心必读**：`spike-r3-candidate-draft.md`（v1.1）全文——含 §0.3 修订记录、§3/§4/§5 三方案定义、§6 主/补充实验分表与冻结候选池规模、§8 完成度分档、§9 停止条件、§11 后续决策门；`spike-r2-research.md`（方向依据）。

## 11. 允许执行

1. 在 Spike 分支新增**隔离测量/验证脚本**：评测专用 user_id、真实本地 mem0 检索（loopback）、容器内 Python API 直调或实验适配层、本地 embedding 推理与（方案 B 获下载授权后的）cross-encoder 重排推理、本地统计计算；只允许合成数据；可写入 holdout 合成种子（完成后清理）；
2. 读取正式代码、契约与第一/二轮证据作为只读输入；
3. 证据落盘：脚本 + 原始数据 + 冻结记录 + 审计写入 `project-context/tasks/TASK-006/spike-r3/`；
4. 使用经预装检查核验的本地组件；
5. 在 Spike 分支提交过程与报告；**先提交实施计划等待 Review 2**，再开始测量；
6. 方案 C 若进入实验，须先经 Founder 单独批准外部调用与数据外发政策（单独 Change Request）。

## 12. 禁止执行

1. 修改产品代码（v2/ 任何文件）、正式 8 Case、Schema、评测规则、治理文件；
2. 外发任何用户数据或访问非本机网络；调用外部模型 API（方案 C 未获单独批准前，一个外部调用都不发）；
3. 不接入产品路径；不触碰 TASK-007 / TASK-005B / TASK-004（保持 PAUSED）；
4. 不接触生产密钥、不部署、不合并、不 force push；
5. **禁止手工枚举主题词表 / 固定字面量硬编码**（"天气/猫/失眠/小橘"等）；
6. **禁止运行时下载模型、权重或依赖**；禁止安装未预装组件；**"只下载 BGE-reranker-base"单点方案不批准，任何下载须 Founder 单独批准**；
7. 禁止导入真实用户数据；
8. 不得以 Mock 替代最终真实验收；
9. 不得复用第一轮 holdout 原文（H1–H4）、第二轮骨架原文、E001–E005 原文作为 holdout 内容；
10. 不得重新启用第一轮已冻结机制调参；
11. 历史 `feature/task-004-spike` 工作区只记 W2，禁止写入、同步或清理；
12. **实施计划获批准前禁止任何实测**（预装检查、写脚本、建 holdout、测量）；
13. **方案 B 具体模型未获 Founder 批准前禁止下载/安装/替换权重**；方案 C 未获 Founder 批准前禁止任何外部调用；
14. **不得自行缩成单方案或跳过未授权方案**：B/C 未获授权只能形成部分证据，不得宣称第三轮完整通过，须返回 Founder；
15. 不得自行扩大候选机制范围（新增方案须 Change Request）；不得自行确认执行模式变更；
16. 不得预先写死 0.3/0.5/0.7 等公开项目阈值作为方案阈值；不沿用 P95>200ms 淘汰旧前提。

## 13. 具体步骤（阶段 1：首次唤醒）

1. 完整阅读 required_reading（以 `spike-r3-candidate-draft.md` v1.1 为核心）；
2. 只读核验：`git fetch origin main`、`git rev-parse`、`git log`、分支与工作区状态；确认实施分支从 `6660ca2` 派生、工作区干净；
3. 提交**启动回执**（身份/规则版本 C1/主线提交 C3/上下文来源 C6/可否继续）；
4. 输出 **Review 2 实施计划**（落盘 `project-context/tasks/TASK-006/spike-r3/implementation-plan.md`），内容含：测量/验证脚本设计、预装检查核验命令（共享/候选专属）、方案 B 模型事实报告要求、三方案评估顺序、主/补充实验分表、冻结记录文件结构、延迟/资源/费用测量方案、验收逐项对标、停止条件映射；
5. 阶段 1 到此停止，等待 Founder/Reviewer 批准实施计划；**不进入任何实测**。

## 14. 验收标准（长期会话总目标，按 DRAFT §8）

1. 预装检查通过（共享/候选专属逐项）；2. 主实验三方案在同一冻结候选池完成判断质量采集（分表）；3. 补充实验方案 A Mem0 阈值端到端采集（独立成表）；4. 每方案 F1/分离边际/零条准确率/误删率/保留数量；5. "关键相关记忆不得漏掉"独立门逐方案通过；6. 延迟/费用/外部调用比例/CPU/内存/磁盘逐方案实测，不预设淘汰阈值；7. 网络与数据边界（仅合成数据、零非授权外发、种子清理、docker diff 零产品改动）；8. 分支 diff 仅含 TASK-006 文档与 spike-r3/ 文件；9. 证据完整落盘；10. 报告诚实（样本量/波动/失败/ρ/增量口径/费用口径/📖与🔬区分/"Spike 通过≠TASK-006 完成"）；11. 回归证据（E001/E003 正向不退化）。

**完成度分档**：三方案均获授权并运行＝完整对比；B/C 未获授权或不可执行＝部分证据，不得宣称完整通过，返回 Founder 决定。

## 15. 停止条件（按 DRAFT §9）

候选级（只停对应方案/候选，其余继续）：1 分离边际 ≤0.1 或波动>0.1 判据失效；2 漏关键记忆独立门；3 必须削弱测试/手工词表/固定字面量才能变绿；4 候选专属依赖缺失（权重未缓存且未获下载授权）。

整轮红线（立即停止，提交 CR 返回 Founder）：5 数据外发/非授权网络访问；6 接触真实用户数据；7 冻结失效；8 时间盒到期（5 工作日/3 轮迭代）；9 需超批准范围改动；10 无任何方案可执行。

## 16. 完成后必须返回的材料

Spike 报告（验收逐项对标、诚实声明）、脚本 + 原始数据 + 冻结记录 + 审计 + 失败与不确定样本清单、governance-sync-summary.md（事实表 + 待决项建议，Builder 不直接改 current-state/decision-register）、结构化实现报告、下一窗口唤醒卡（独立 Reviewer）。

## 17. 下一张交接卡要求

阶段 1 完成（实施计划落盘）后，返回 Review 2 交接卡（目标角色 = Founder/Reviewer，附实施计划路径与 diff）；长期会话全部完成后，返回独立 Reviewer 交接卡（附完整证据与 Spike 报告）。

---

## 18. 阶段记录（2026-08-13）

- **已完成**：启动回执；Review 2 实施计划 v1.0 → v1.1；实施计划 v1.1 获 Founder 批准；S0 预装检查完成；方案 B 模型选择决策卡（D-T006-R3-B-MODEL）；方案 B-1 下载与核验完成（`model-facts.md`）；**S0.3 方案 C 连通检查通过**（`preflight-check.md` §S0.3）；
- **S0.3 连通检查结果**：`GET https://api.deepseek.com/v1/models` → **HTTP 200**，Bearer 认证通过，可用模型 `[deepseek-v4-flash, deepseek-v4-pro]`；1 次只读列表请求、费用 0 元、未发送任何评测/用户数据、仅访问白名单 `api.deepseek.com`；密钥全文未回显、未记录任何密钥特征（已按 Founder 要求清除）；
- **✅ 模型名已裁决（2026-08-13）**：Founder 批准方案 C 实验模型由 `deepseek-chat` 调整为 **`deepseek-v4-flash`**（仅限本次合成数据 Spike）；白名单/≤100 次/≤10 元/零真实数据不变；
- **三方案状态**：A（零依赖基线，可执行）✅；B-1（权重已下载核验，可执行）✅；C（连通检查通过 + 模型名已裁决 deepseek-v4-flash，可执行）✅；
- **下一步（S0.3 已通过）**：进入 **S1 冻结统一候选池与 holdout**（三方案共用，A/B/C 不得提前查看 holdout）；本轮不直接造题、不提前执行方案 C 正式实验；
- **冻结纪律（Founder 明确）**：S1 冻结统一测试题后，A/B/C 不得提前查看 holdout；
- **未完成**：S1 冻结候选池 + S2/S3 校准 + S4 主实验 + S4.5 补充实验 + S5 机制冻结 + S6 holdout 一次性运行并清理 + S7 延迟/资源/费用 + S8 网络审计 + S9 报告；
- **Git 状态**：需 commit + push（`preflight-check.md` S0.3 更新 + 交接文件更新）；
- **下一窗口**：Builder 本窗口继续（进入 S1 冻结，或返回 Founder 确认后继续）。

## 19. 下一窗口唤醒卡（S0.3 已通过 → S1 冻结统一测试题）

先说人话（30 秒）：
方案 C 的模型名你已拍板用 deepseek-v4-flash，证据文件里的密钥特征也清干净了。现在三个方案（A 本地基线、B 本地重排、C 外部对照）都准备就绪。下一步就是造一套统一的测试题并冻结起来，三种方案共用同一套、谁也不许提前偷看，然后才开始校准和正式测试。

直接复制给下一个角色（≤10 行短卡）：

目标角色：Builder（本长期会话继续）
本次唯一目标：进入 S1 冻结统一候选池与 holdout（三方案共用，A/B/C 不得提前查看 holdout）
任务与交接文件路径：project-context/tasks/TASK-006/spike-r3/implementation-plan.md（§7 S1）；preflight-check.md（§S0.3 已通过，模型名已裁决）；model-facts.md（B 已就绪）
分支：feature/task-006-r3-spike（worktree E:/task-006-r3-spike-worktree）
允许执行：S1 冻结候选池/校准集/holdout（仅合成数据）
禁止执行：A/B/C 提前查看 holdout；真实用户数据；超授权外部调用（C 限 DeepSeek 白名单 deepseek-v4-flash、≤100 次/≤10 元）；本轮不提前执行方案 C 正式实验
验收：冻结候选池 ≥30 对（相关≥8/无关≥8/混淆≥8/零条≥3 场景/关键记忆≥5），哈希锁定，提交号+时间戳入库
停止条件：冻结失效或需超批准范围改动 → 停并上报
