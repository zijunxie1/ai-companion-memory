# GOV-COMM-001｜实现计划（implementation-plan.md v1.4）

> 合并后状态：本计划已执行，GOV-COMM-001 已 MERGED（`3412c3c`）。下方计划步骤和实施前事实保留其原始时点，不作为当前任务状态。

```yaml
task_id: GOV-COMM-001
status: APPROVED 并已执行（独立复审 REVIEW_APPROVED（0/0/0）后，任务已 MERGED）
execution_mode: delegated 临时委派（Founder 2026-08-12 已同意并执行）
branch: codex/gov-comm-001
worktree: E:/gov-comm-001-worktree
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-COMM-001/draft.md
implementation_baseline_ref: origin/main
implementation_baseline_commit: 42786dadaafd1d1c15e44d1998b646a426c65cdf（2026-08-12 核验；GOV-CHIEF-001 PR #11 合并后正式 main）
merge_commit: 3412c3c90ac73363b2d54998311bcd9ca39da10b（GOV-COMM-001 已 Rebase 合并）
baseline_contains: GOV-CHIEF-001 PR #11 已 Rebase 合并（执行/决策 Chief 拆分为正式治理事实）
baseline_verified_at: 2026-08-12
baseline_stop_condition: 若实施前 origin/main 前进或权威文件变化，必须从最新 origin/main 重新核验或更新本分支后再继续
precondition: ✅ 已满足（GOV-CHIEF-001 已完成、经独立 Review 并合入正式主线——PR #11 已合并）
approval_stage: 三项审批全部完成（2026-08-12）——① Review 1 ✅ 批准 DRAFT v1.2；② 执行模式 ✅ 同意 delegated；③ Review 2 ✅ 批准本计划 v1.4。执行阶段经三轮限定 CR 修复、最终独立复审 REVIEW_APPROVED（0/0/0）与 Founder 合并，现为 MERGED
review2_revision: v1.4（2026-08-12 四项打回意见修正：① 状态事实按真实 Git 校准、不声称已同步；② 三份规划文件纳入允许/V7/PR；③ L1 总长 3—5 句硬约束；④ 标题/版本/审批阶段统一。后续三轮 CR 修复为执行阶段修订）
```

---

## 1. 当前事实与待验证假设

### 1.1 已核验事实

- Git 事实（2026-08-12 核验）：origin/main = `42786da`，GOV-CHIEF-001 PR #11 已 Rebase 合并，执行/决策 Chief 拆分为正式治理事实；GOV-COMM-001 实施前置条件（GOV-CHIEF-001 完成、经独立复审 REVIEW_APPROVED、合入正式主线）已满足；
- **current-state.md 文件状态（未同步，待实施阶段校准）**：当前 current-state.md 仍记录旧状态——origin/main = `02efd2d`、GOV-CHIEF-001"尚未合并、待 Founder 合并裁决"（该文件在 PR #11 合并前生成，合入后未更新）。**冲突来源已明确**：current-state 记录与真实 Git 事实不一致；实施阶段将在允许范围内按真实 Git 事实校准 current-state，**校准完成前不得声称状态已同步**；
- implementation-plan v1.1 曾因 current-state 旧记录 + "禁止改 Git 事实表"冲突被暂不批准（历史）；v1.4 已修正修改边界（§4.6 允许按真实 Git 事实校正）并获 Review 2 批准（2026-08-12），实施已完成；
- 既有治理文件已含：先说人话（30 秒）、唤醒卡、启动回执、fixed 阅读顺序、回复合规自检；并已新增执行/决策 Chief 拆分规则（GOV-CHIEF-001）；
- 治理任务顺序已裁决（2026-08-12）：GOV-CHIEF-001 → GOV-COMM-001 → GOV-002（只确定 TASK-006 内部前置治理顺序，不改变产品任务顺序）；
- 本任务只做分级收敛与模板统一，不新建体系。

### 1.2 角色规则核对（GOV-CHIEF-001 合并后）

- 新正式规则：AGENTS.md 拆分执行 Chief / 决策 Chief，八类升级事项须形成升级卡交 Founder 人工转发（`role-wakeup-and-handoff.md` §5.1），Founder 仍为唯一最终审批人；
- 与 GOV-COMM-001 方案一致性：本方案不改角色权限、不涉及升级流程，只收敛回复格式与交接模板——**无冲突**；
- 本方案责任角色 = 执行 Chief（与 CHIEF-BOOTSTRAP `operational-chief-2026-08-12-01` 一致）；formalized_by = Governance Builder。

### 1.3 待验证假设

| # | 假设 | 验证方法 |
|---|---|---|
| A1 | 回复分级后 Founder 判断成本下降 | 实施后用 L1 模板样例人工验收（V1） |
| A2 | 交接卡自包含可减少重复提问 | 模拟新 Agent 只读交接卡回答问题（V2） |
| A3 | 单一权威来源可避免模板漂移 | grep 检查无重复全文（V5） |
| A4 | 交接卡在聊天中可一键复制 | 实际渲染检查（V9） |

## 2. 目标 / 非目标

- 目标：把回复分级、交接卡、继承与恢复流程收敛为三个唯一权威来源，并新建交接卡模板；实施后停在 IMPLEMENTED，经独立 Review 与 Founder 合并裁决。
- 非目标：见 DRAFT §3（不改产品代码、TASK-006、CHIEF-BOOTSTRAP 角色拆分、主线顺序、eval 契约、数据库、历史交接文件）。

## 3. 依赖与前置条件

- **前置（已全部满足）**：
  1. ✅ GOV-CHIEF-001 已完成、经独立 Review（REVIEW_APPROVED）并合入正式主线（PR #11 已合并）；
  2. ✅ codex/gov-comm-001 已快进至最新 origin/main（`42786da`）；
  3. ✅ 本计划（v1.4）已通过实现计划 Review 2（Founder 2026-08-12 批准），实施已完成；
- 依赖：`codex/gov-comm-001` 分支与 Worktree（已就绪，无无关改动，当前只有 3 个已授权、尚未跟踪的规划文件）；
- 不引入任何新依赖、插件或外部服务。

## 4. 拟修改文件与具体变更

> 实施范围 = **8 个现有治理文件修改（原计划 6 个 + CR1 授权 handoff-and-task-state-machine.md + 第三次限定修复授权 CHIEF-BOOTSTRAP.md） + 1 个新建模板 + 3 份 GOV-COMM-001 正式规划文件（draft / implementation-plan / handoff，随任务提交） + 2 份过程证据文件**（implementation-report.md、handoff-builder-to-reviewer.md），合计 14 个。全部变更仅限 DRAFT §10.1 允许列表。

### 4.1 `AGENTS.md` —— 精简引用层（现有文件）

**改什么**：保留红线、状态机、执行模式门、Reviewer 打回处理等高频强制规则；将"面向 Founder 的回复规范"一段改为**精简引用**：

- 保留：先说人话（30 秒）为第一部分的强制要求；
- 修改：详细分级（L1/L2/L3）不再在 AGENTS.md 展开，改为一行引用 → `project-context/agent-response-protocol.md`；
- 新增：明确"回复分级、交接卡、启动与恢复流程的唯一权威来源"三个文件名，作为全局指针。

**不改**：红线 #1—#11、状态机图、四个 Review 门、执行模式门、Reviewer 打回处理表、角色与权限表。

### 4.2 `project-context/agent-response-protocol.md` —— 回复格式唯一权威（现有文件）

**改什么**：

- 新增 §0 回复分级总览（L1 普通回复 / L2 普通交接 / L3 完整汇报 + 触发条件表）；
- 新增 §0.x 四个模板完整定义：
  - L1 普通确认模板（5 行五要素）；
  - L1 进度模板（正在解决什么 / 完成什么 / 还剩什么 / 是否偏离目标 / 当前风险 / 下一检查点 / Founder 是否需要参与）；
  - L3 Founder 决策模板（项目位置 → 出了什么问题 → 用户影响 → 当前做到哪 → 最多三个选项 → 明确推荐 → 不决定会阻塞什么）；
  - L3 异常模板（发生了什么 / 产品影响 / 是否丢数据 / 已停止动作 / 可选方案 / 推荐 / 需要的裁决）；
- **L1 长度硬约束**：L1 普通回复（含进度更新）**总长度始终为 3—5 句**，只选择当前必要信息（五要素中的相关项）；七项完整状态（正在解决/完成/还剩/偏离/风险/检查点/参与）**仅在 L3 完整汇报中使用**，L1 不得展开为七项清单；
- 新增：L2 普通交接的**渲染要求**——交接卡必须渲染为单一、完整、可直接复制的代码框（`` ```text `` 开头、`` ``` `` 结尾，不显示纯语言标签，不拆分段）；
- 保留：现有"先说人话"第零层、决策看板、外部复核包、技术术语翻译、回复合规自检（作为 L3 完整汇报的完整结构）；
- 明确"普通回复不得额外输出完整决策看板/重复状态报告/技术附录/大量测试日志"。

**不改**：决策类型定义、外部复核包结构、合规自检清单、术语翻译规则。

### 4.3 `project-context/role-wakeup-and-handoff.md` —— 交接流程唯一权威（现有文件）

**改什么**：

- 新增/强化"交接卡结构"完整定义（DRAFT §5 十七项字段），说明这是**所有角色交接必须遵循的字段清单**；
- 明确普通交接（L2）只显示：先说人话 + 一张可复制交接卡，禁止附加重复状态报告/技术附录/重复解释；
- 明确 Reviewer 交接：独立 Review 是完成和合并前的**必经步骤**；Founder 决定**何时**把交接卡发送给 Reviewer，而非决定是否需要 Review；
- 保留并链接：唤醒卡模板（§4）、强制检查点（§3）；
- 明确交接卡模板文件位置 → `project-context/templates/role-handoff-template.md`。

**不改**：非驻留窗口基础事实、Founder 是流程触发者、各角色何时被唤醒表、自动化准确边界、Hermes 加载边界。

### 4.4 `project-context/context-manifest.md` —— 启动与恢复流程唯一权威（现有文件）

**改什么**：

- 强化 §1 固定阅读顺序为"新窗口继承流程"（AGENTS.md → context-manifest → current-state → 当前任务 draft → 最新交接文件 → 决策/契约/代码/测试）；
- 强化 §4 上下文压缩恢复流程为八步顺序（停止写操作 → 重读 AGENTS → manifest → current-state → 任务与交接包 → Git 只读核验 → 重新说明位置 → 无冲突继续）；
- 明确"聊天摘要只能用于定位文件，不能作为任务批准、Git 状态或正式决策的唯一证据"；
- 新增：新 Agent 不得向 Founder 重复整份背景，只需简短确认理解后直接执行。

**不改**：角色专项阅读表、启动回执字段、required_reading 规则、非驻留窗口说明。

### 4.5 `project-context/templates/role-handoff-template.md` —— 新建交接卡模板（新建文件）

**新建内容**：完整可复制的交接卡 Markdown 模板，含 DRAFT §5 全部十七项字段，供 Chief/Builder/Reviewer/Release 交接时直接复制填写。

### 4.6 `project-context/current-state.md` —— 状态同步（现有文件）

**改什么**：实施完成后更新本任务状态（GOV-COMM-001：APPROVED → IN_PROGRESS → IMPLEMENTED），记录分支/Worktree/基线。同步更新"当前建议动作"与"下一窗口唤醒卡"。

**修改边界（v1.2 修正，Founder Review 2 指出；v1.4 明确）**：允许按**最新 origin/main 重核验后的真实 Git 事实**校正 Git 事实表——包括 origin/main 实际 commit（v1.1 曾禁止修改 Git 事实表，与 current-state.md 旧记录冲突）。**冲突来源已明确**：current-state.md 当前仍记录 `02efd2d`/GOV-CHIEF-001"尚未合并"（PR #11 合入前快照），实施阶段将在允许范围内按真实 Git 事实校准；**校准完成前不得声称状态已同步**。校正必须：
- 只记录已发生事实（重核验后的 commit、分支、状态），不得提前写入未发生状态；
- 不得为通过验收而伪造来源或时间；
- 若与磁盘 Git 事实仍冲突则停止上报（红线 #3）。

**不改**：TASK-006 状态、产品主线顺序（若与磁盘事实冲突则停止上报）。

### 4.7 `project-context/decision-register.md` —— 决策登记（现有文件）

**改什么**：新增 D-GOV-COMM-001 决策卡（GOV-COMM-001 沟通规范 APPROVED + 三个唯一权威来源映射），仅记录已发生事实（Review 1/执行模式/Review 2 全部完成后才登记）。

**不改**：现有决策卡结论。

### 4.8 任务目录过程证据文件（新建，随任务交付）

| 文件 | 内容 | 何时生成 |
|---|---|---|
| `project-context/tasks/GOV-COMM-001/implementation-report.md` | 实施完成报告：实际修改清单、diff、V1—V9 验证结果、已知限制 | 实施完成、停在 IMPLEMENTED 时 |
| `project-context/tasks/GOV-COMM-001/<交给 Reviewer 的正式交接文件>` | 正式 Review 交接包（required_reading + 验收标准 + 完整 diff + 验证证据） | IMPLEMENTED 后、Founder 决定唤醒 Reviewer 时 |

## 5. 单一权威来源映射（防重复核心设计）

| 内容 | 唯一权威 | 其他文件行为 |
|---|---|---|
| 回复格式（L1/L2/L3 + 全部模板 + 渲染要求） | `agent-response-protocol.md` | AGENTS.md 只一行引用 |
| 交接流程 + 交接卡结构 + Reviewer 交接规则 | `role-wakeup-and-handoff.md` | 交接文档引用模板文件 |
| 交接卡填写模板 | `templates/role-handoff-template.md` | 被复制使用，不重复定义 |
| 启动与恢复流程 | `context-manifest.md` | AGENTS.md / 唤醒卡只引用 |
| 高频红线与状态机 | `AGENTS.md` | 保持精简 |

**避免重复的机制**：

- 规则正文只出现在权威文件；其他文件用 `见 project-context/<file>` 引用；
- 交接卡字段清单只定义一次（role-wakeup），模板文件只落一次（templates），所有交接文档复制模板而非重写字段；
- 实施后执行 V5 grep 检查确认无重复全文。

## 6. 数据流、状态流和错误路径

- 回复流：Agent 判断场景（L1/L2/L3）→ 按唯一权威模板输出 → 无需 Founder 操作时明确"你现在不需要操作"；
- 交接流：当前窗口休眠 → 按交接卡模板落盘交接包 → 输出 L2 简短说明 + 一张可复制交接卡（渲染为单一代码框）→ Founder 决定何时发送给下一角色；
- Review 流：Builder 停在 IMPLEMENTED → 生成实现报告与 Review 交接文件 → Founder 决定何时唤醒 Reviewer → Reviewer 执行 IN_REVIEW → 结论交 Founder 合并裁决；
- 恢复流：上下文压缩 → 八步恢复流程 → 重做 Git 只读核验 → 启动回执 → 继续；
- 错误路径：任何文件冲突 → 红线 #3 停止上报；任何需要超范围修改 → Change Request。

## 7. 契约、Schema、权限和兼容性影响

- 无代码、无 Schema、无数据库变更；
- 无权限变更（不改变 Founder 最终审批权、不扩大默认写权限）；
- 兼容性：既有"先说人话"、唤醒卡、启动回执等规则保留语义，只收敛表述与位置。

## 8. 分步骤实现顺序

1. 复核 origin/main 最新状态（若基线前进则停止上报）；
2. 修改 `agent-response-protocol.md`（回复分级 + 模板 + 渲染要求）；
3. 修改 `role-wakeup-and-handoff.md`（交接卡结构 + L2 规则 + Reviewer 交接规则）；
4. 修改 `context-manifest.md`（继承 + 恢复流程）；
5. 新建 `templates/role-handoff-template.md`；
6. 修改 `AGENTS.md`（精简引用）；
7. 实施 V1—V5、V9 验证矩阵自检；
8. 更新 `current-state.md`（按 §4.6 修正后的边界：允许按最新 origin/main 校正 Git 事实表）与 `decision-register.md`（状态同步，仅记录已发生事实）；
9. 生成 `implementation-report.md`，任务停在 **IMPLEMENTED**，输出 diff 并停止——**不自行宣布 Review 完成**；
10. Founder 决定何时把 Review 交接文件发送给独立 Reviewer。

## 9. 验证矩阵（如何验证）

| # | 验证项 | 方法 | 通过标准 |
|---|---|---|---|
| V1 | 普通回复足够短 | 用 L1 模板样例逐条比对 | 总长 3—5 句、无技术术语、只含当前必要信息；七项完整状态未在 L1 展开 |
| V2 | 交接卡自包含 | 十七字段清单逐项核对模板 + 模拟新 Agent 只读回答 | 全部字段可填写、无"问 Founder"缺口 |
| V3 | 新窗口不依赖旧聊天 | 检查继承流程落盘 + 启动回执 + required_reading | 顺序完整、可执行 |
| V4 | 上下文压缩后能恢复 | 检查八步恢复流程落盘 | 步骤完整、含 Git 只读核验 |
| V5 | 无重复全文模板 | grep 四个权威文件比对关键段落 | 同一规则仅出现一次全文 |
| V6 | 产品代码与 TASK-006 零变化 | `git diff --stat origin/main...HEAD` + 限定路径检查 | v2/、eval/、migrations/、tasks/TASK-006/ 零差异 |
| V7 | 修改范围 ⊆ 允许列表 | `git diff --name-only` 对照 §4 | 文件清单一致（含任务目录过程证据文件 + 3 份 GOV-COMM-001 规划文件） |
| V8 | 状态同步 | 读取 current-state / decision-register | 仅记录已发生事实；任务停在 IMPLEMENTED |
| V9 | 交接卡实际渲染 | 在实际聊天平台发送 L2 样例 | 单一完整代码框（`` ```text `` 开头/结尾）、可一键整体复制、不只显示语言标签 |

## 10. 回滚方案

- 本任务纯治理文档变更，无代码/数据迁移；
- 回滚 = `git revert` 单一 PR 的 merge commit（或删除未合并分支）；
- 若实施中发现既有规则被破坏（如"先说人话"语义丢失），立即停止并恢复该文件原内容；
- 历史交接文件、TASK-006、产品代码不在变更范围，天然无回滚风险。

## 11. 风险、停止条件和 Change Request 条件

- 风险：见 DRAFT §14；
- 停止条件：见 DRAFT §15.1（基线前进、超范围、冲突、需自动唤醒等）；
- Change Request 条件：见 DRAFT §15.2（修改允许列表外文件、改变分级/交接卡结构、新增权限/依赖、重排主线）。

## 12. 预计 commit 和 PR 边界

- 本计划的实施、独立复审与 Founder 合并均已完成；正式主线合并提交为 `3412c3c`；
- **实施已完成**：本计划通过 Review 2（前置条件已满足）后执行完毕，原任务已由 IMPLEMENTED → REVIEW_APPROVED → MERGED；
- 实施阶段：**单个 commit**（或按文件逻辑分组的小 commit）承载全部治理变更：
  - 8 个现有治理文件：`AGENTS.md`、`CHIEF-BOOTSTRAP.md`、`agent-response-protocol.md`、`role-wakeup-and-handoff.md`、`context-manifest.md`、`current-state.md`、`decision-register.md`、`handoff-and-task-state-machine.md`；
  - 1 个新建模板：`templates/role-handoff-template.md`；
  - **3 份 GOV-COMM-001 正式规划文件**：`project-context/tasks/GOV-COMM-001/draft.md`、`implementation-plan.md`、`handoff-builder-plan-to-founder.md`（随任务提交，纳入 V7 与 PR）；
  - 任务目录过程证据文件：`implementation-report.md`、Review 交接文件；
- **单个 PR**（`codex/gov-comm-001` → `main`）：
  - 仅治理文件 + GOV-COMM-001 任务目录（规划文件 + 过程证据文件）；
  - 无产品代码、无 TASK-006、无 eval 契约、无数据库；
  - PR 描述含 V1—V9 验证结果 + diff 统计；
- 合并方式：Rebase 合并（项目惯例），由 Founder 决定合并时机；
- 不包含：任何产品代码、TASK-006 相关文件、GOV-002、历史交接文件回写。

## 13. 明确未处理的后续事项

- **GOV-CHIEF-001**：✅ 前置已完成（PR #11 合并，执行/决策 Chief 为正式治理事实）；
- GOV-002（上下文完整性护栏）：另行起草 DRAFT、分支、PR、Review，在 GOV-COMM-001 之后；
- 交接卡模板的落地使用：本任务只建立模板文件，各角色从下一个任务开始按模板执行；
- 独立 Review：已完成并通过；本计划作为历史实施计划保留，不再等待 Reviewer。
