# GOV-002｜上下文完整性护栏（DRAFT v1.2）

> 状态：方案内容已获 Founder 批准（APPROVED，2026-08-12，附带沟通体验修订 must_add 5 条 + scope_add 2 文件）。
> 本文件已由 Governance Builder 落盘为 `project-context/tasks/GOV-002/draft.md`（2026-08-12，分支 `codex/gov-002`）；
> 内容以本文件及 Founder 批准裁决为准，实施范围以 §7 七文件落盘表与 Review 2 批准的实现计划为准。

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-006/route-b-decision.md
  - project-context/tasks/GOV-COMM-001/draft.md
doc_type: 任务 DRAFT（Founder 已批准；审批通过前不落盘、不执行）
task_id: GOV-002
status: APPROVED（DRAFT v1.2 规则内容）
draft_version: v1.2（2026-08-12；v1.1 + Founder Review 1 第二轮三项修订：
      ① 统一治理包版本 ② 正式主线三级核验语义 ③ 展示方式；
      批准时附带沟通体验修订：must_add 5 条 + scope_add agent-response-protocol.md / templates/role-handoff-template.md）
drafter: operational-chief-2026-08-12-01（执行 Chief）
draft_date: 2026-08-12
approval_status: APPROVED（Founder 2026-08-12；执行模式已确认 delegated）
implementation_authority: 待 Review 2 批准实现计划后生效
execution_mode: delegated 临时委派（Founder 已确认）
branch: codex/gov-002（待 Builder 从最新 origin/main 创建，建分支前重新核验远端正式主线头）
basis: D-GOV-002-SCOPE（触发条件"TASK-006 治理同步合并后"已满足）；
      context-manifest.md §4；role-wakeup-and-handoff.md §8；
      2026-08-12 执行 Chief 启动核验实证（见 §2.2）；Founder Review 1 两轮意见（2026-08-12）
state_constraint: TASK-006 保持 APPROVED；GOV-002 自身按状态机推进；
      主线顺序 GOV-001 → 005A → 006 → 007 → 005B 不变；不启动 TASK-007 / TASK-005B；
      本任务不包含 TASK-006 本地 Gate Spike（其后单独起草）
implementation_baseline_ref: origin/main
implementation_baseline_commit: 980bfa5424f31c49a36aa3b56e546d5ba65074c4（GOV-COMM-001 状态同步 PR #13 合并后；
      开始实施与审查前必须按 §3.1 C3 重新核验远端正式主线头，远端头变化即停止重新核验）
baseline_contains: GOV-CHIEF-001（PR #11）、GOV-COMM-001（PR #12）、GOV-COMM-001 状态同步（PR #13）
baseline_verified_at: 2026-08-12
```

---

## 1. 任务目标

建立**上下文完整性护栏**：把"项目事实如何被读取、被复用、被当作权威"从依赖自觉，变成有明确范围、明确告警/阻断规则、明确执行方式的治理规则。任何窗口（含新窗口、压缩恢复窗口）在以下情形都能可靠判断"我拿到的上下文是否可信、是否可以继续写操作"：

1. 规则版本与内容脱节（改规则却没升级统一版本号，旧会话误以为规则未变）；
2. 启动快照过期（会话启动时注入的 AGENTS.md 是快照，运行期间规则更新后旧会话继续用缓存版本）；
3. 状态文件落后于真实 Git 事实（current-state.md 只会在角色被唤醒时更新）；
4. 聊天摘要被误当正式证据（压缩后被当作批准、状态或决策的唯一依据）；
5. 本地工作区与正式主线不一致（历史分支、未同步文件被误当权威）。

**核心原则**：凡能由正式主线事实明确解释并收敛的差异（状态滞后、本地未同步、版本号未随改升级）一律是**告警**，Agent 以正式主线事实为准继续执行并记录待同步事项；只有核验正式主线、任务文件与决策登记后**仍无法解释的语义冲突**才触发**阻断**。同一事件不得同时触发"继续并校正"和"停止并上报"。

**本任务只改治理规则与检查点定义，不修改产品代码、不修改 TASK-006 状态、不实现本地 Gate Spike。**

## 2. 背景与现状（已核验，2026-08-12）

### 2.1 已有基础

| 事实 | 证据 |
|---|---|
| 上下文压缩与中断恢复已有八步恢复流程 | context-manifest.md §4.1 |
| "聊天摘要只能用于定位文件，不能作为任务批准、Git 状态或正式决策的唯一证据"已有声明 | context-manifest.md §4.1 |
| Hermes 启动时注入 AGENTS.md 是启动快照，运行期间修改规则旧会话可能继续使用缓存版本 | role-wakeup-and-handoff.md §8 |
| 启动回执必须包含 AGENTS 规则版本、分支、Worktree、工作区状态 | context-manifest.md §3 |
| 交接卡必须包含 required_reading | role-wakeup-and-handoff.md §4 |

### 2.2 执行 Chief 2026-08-12 启动核验实证（本任务事实依据）

| # | 缺口 | 实证 | 分类 |
|---|---|---|---|
| G1 | 规则版本号未随内容升级 | 磁盘与 origin/main 的 AGENTS.md 版本号均为 `2026-08-10.4`，内容已不同（远端含执行/决策 Chief 拆分） | 告警 W3 + 本任务修复项 |
| G2 | 本地工作区是历史脏检出 | `E:\正式作品` 停在 `feature/task-004-spike`，治理文件为旧版残留 | 告警 W2（不参与权威判断） |
| G3 | 状态文件落后于 Git 事实 | current-state 记载的 origin/main 与实测一度不一致（4baabf0 → 3412c3c → 980bfa5） | 告警 W1（以远端头为准） |
| G4 | 聊天摘要边界只声明、无检查点 | context-manifest §4.1 有声明，启动回执无"上下文来源"字段 | 本任务新增 C6 字段 |

### 2.3 触发条件已满足

- D-GOV-002-SCOPE 触发条件"TASK-006 治理同步合并后"已满足（PR #11/#12/#13 均已合并）；
- 治理顺序：GOV-CHIEF-001 → GOV-COMM-001 → **GOV-002** → 本地 Gate Spike（Founder 已批准）。

## 3. 方案

### 3.1 护栏范围（六要素，统一定义于 context-manifest.md）

| # | 上下文要素 | 权威来源 | 最小核验动作 |
|---|---|---|---|
| C1 | 规则版本 | **统一治理包版本**：`AGENTS.md` 头部"规则版本"（见 §3.3） | 核对统一版本是否随任一强制文件内容变更同步升级；脱节 → 告警 W3 |
| C2 | 角色身份 | `CHIEF-BOOTSTRAP.md`（以正式主线文件内容为准） | 声明角色实例与关系；本地旧版与主线不一致 → 告警 W2，以主线为准 |
| C3 | 当前主线 | **远端正式主线头**（只读远端查询确认，见下方三级核验） | 见"正式主线三级核验"；与 current-state 不一致 → 告警 W1 |
| C4 | 任务状态 | 任务文件头部 status + decision-register | 与 Git/PR 事实不一致且无法解释 → 阻断 B1 |
| C5 | 交接上下文 | required_reading 列表 + 交接卡 | 逐一核对已读；缺失 → 阻断 B3 |
| C6 | 上下文来源 | 本窗口实际读取来源（正式主线文件 / 远端 / 聊天） | 启动回执记录"上下文来源声明"（覆盖 G4） |

**正式主线三级核验（C3 展开）**：

| 层级 | 定义 | 核验动作 | 判定 |
|---|---|---|---|
| ① 远端正式主线头 | GitHub 远端 `main` 当前头部提交 | 只读远端查询确认（如 `git ls-remote origin main` 或 `gh api`） | 唯一权威基线 |
| ② 本地 `origin/main` | 本地缓存的远端跟踪引用，**可能过期** | 与远端头比对；不一致 → `git fetch` 后重比 | 仅当与远端头一致时才可作为正式文件内容来源 |
| ③ 历史脏工作区 | 主检出、旧分支、未跟踪文件 | 只触发告警 W2 | **不参与权威判断**；不推翻 ① |

- 若远端头提交**尚未存在于本地对象库**：停止读取旧文件，不在脏环境中猜测；在获授权的干净环境补齐对象后再核验；
- 本地 `origin/main` 与远端头不一致且无法 fetch 时：以远端头为准，将本地引用滞后记录为告警 W1。

### 3.2 告警与阻断规则（互斥；统一定义于 context-manifest.md，role-wakeup 仅引用）

**告警（W）——不阻断写操作，以正式主线事实为准继续执行，记录待同步/待修复项：**

| ID | 规则 | 触发条件 | 动作 |
|---|---|---|---|
| W1 | 状态文件滞后 | current-state 记录的主线提交与远端头/核验后 origin/main 不一致 | 以核验后主线提交为准执行，报告中注明状态文件待同步 |
| W2 | 本地未同步 | 本地检出/历史工作区文件与正式主线不同（仅证明本地未同步） | 以正式主线为准执行并注明来源；**不推翻已核验的主线事实，不参与权威判断** |
| W3 | 统一版本脱节 | 任一强制启动治理文件内容变更但统一版本未同步升级 | 记录为维护项，随本任务或后续治理任务修复 |

**阻断（B）——必须停止写操作，按 context-manifest §4.1 恢复或上报：**

| ID | 规则 | 触发条件 | 动作 |
|---|---|---|---|
| B1 | 权威语义冲突 | 核验正式主线文件、任务文件、决策登记后，仍存在**无法解释**的互相冲突（红线 #3 语义） | 停止写操作，列出冲突并上报；不自行选择版本 |
| B2 | 聊天摘要作为唯一证据 | 仅凭聊天摘要声明"已批准 / 已合并 / 已实现"，无文件或 Git 证据 | 停止，要求文件/Git 证据 |
| B3 | 交接上下文缺失 | 交接卡缺失 required_reading，或必读文件未读 | 停止执行，先补齐阅读 |

> **互斥保证**：W1/W2/W3 的触发情形（可收敛的滞后、未同步、版本元数据缺失）**永不进入** B1；B1 只在 W1—W3 校正后仍无法解释时触发。同一事件不会同时出现"继续并校正"与"停止并上报"。

### 3.3 统一治理包版本（可验收）

**定义**：`AGENTS.md` 头部的"规则版本"（当前 `2026-08-10.4`）是**整个必读治理包的统一版本**，不是 AGENTS.md 单独版本。任一**强制启动治理文件**发生行为变化（规则、权限、流程、边界语义变化；纯文字修正除外），必须在**同一变更**中同步升级统一版本，并在变更说明中列出受影响文件。

**强制启动治理文件清单**（行为变化必须升级统一版本）：

| 文件 | 角色 |
|---|---|
| `AGENTS.md` | 承载统一版本号 + 高频规则摘要 |
| `project-context/context-manifest.md` | 启动/恢复/上下文可信度规则（本任务写入） |
| `project-context/CHIEF-BOOTSTRAP.md` | 角色身份与拆分边界 |
| `project-context/current-state.md` | 状态快照（行为变化=记录语义/核验方式变化；状态值更新不算） |
| `project-context/product.md` | 产品目标与成功标准 |
| `project-context/project-mainline-roadmap.md` | 主线与阶段门 |
| `project-context/handoff-and-task-state-machine.md` | 状态机与交接规则 |
| `project-context/agent-response-protocol.md` | Founder 回复协议 |
| `project-context/role-wakeup-and-handoff.md` | 唤醒与交接 |
| `project-context/decision-register.md` | 决策登记 |

**文档版本与统一版本分离**：各文件自身的版本字段（如 `draft_version`）保留，但仅作文档演进记录，**不能替代统一版本**。启动回执只记录统一版本（C1）。

**内容来源证明**：不引入"内容指纹"。**远端正式主线头提交**即为内容来源证明——同一提交下的文件内容由 Git 保证确定。启动回执至少记录三项：

1. 统一规则版本（C1）；
2. 核验后的正式主线提交（远端头；本地 origin/main 仅在与远端头一致时记录为核验结果）（C3）；
3. 上下文来源声明（C6）。

### 3.4 执行模式（护栏怎么生效）

1. **强制检查点**：把 C1—C6 核验并入现有启动回执（context-manifest §3 字段扩充）；
2. **单一权威来源**：启动、恢复与上下文可信度规则统一定义在 `context-manifest.md`；`role-wakeup-and-handoff.md` 只引用；`AGENTS.md` 只保留高频摘要与统一版本；
3. **统一版本纪律**：任一强制文件行为变化必须同步升级统一版本（修复 G1）；
4. **可选自动化**（不强制，避免范围扩大）：required_reading 文件存在性检查、统一版本与变更记录一致性检查，可作为后续脚本。

## 4. 非目标

- ❌ 不实现 TASK-006 本地 Gate Spike（其后单独起草、单独批准）；
- ❌ 不建设自动化监控/告警系统（护栏以人工检查点为主，自动化仅可选附加）；
- ❌ 不修改产品代码、Schema、权限或外部依赖；
- ❌ 不重排主线、不改变 TASK-006/007/005B 状态；
- ❌ 不把护栏扩展为"持续监督"（所有角色仍为非驻留窗口）；
- ❌ 不引入"内容指纹"或任何哈希比对机制（来源证明用正式主线提交）；
- ❌ 不修复 Hermes 渲染器/技能模板的 `markdown` 围栏缺陷（另建独立问题处理，不并入本任务）。

## 5. 验收标准（可判断）

1. 启动、恢复与上下文可信度规则**仅**定义于 `context-manifest.md`；`role-wakeup-and-handoff.md` 只引用、不重复定义 B/W 规则；`AGENTS.md` 只保留高频摘要与统一版本；
2. `context-manifest.md` §3 启动回执新增三项必录字段：统一规则版本（C1）、核验后的正式主线提交（C3）、上下文来源声明（C6）；并落盘"正式主线三级核验"（远端头 / 本地 origin/main / 脏工作区）；
3. 告警 W1—W3 与阻断 B1—B3 落盘于 context-manifest.md，语义互斥（同一事件不会同时触发告警与阻断）；
4. §3.3 统一治理包版本落盘：任一强制启动治理文件行为变化必须在同一变更升级统一版本；本次实施中被修改的强制文件随统一版本同步升级；
5. 验收用例（权威事实可收敛时必须是告警，不得成为升级/阻断事项）：
   - **用例 A（告警 W2）**：历史脏目录与正式主线内容不同 → 判定"本地未同步"，以正式主线为准，不升级；
   - **用例 B（告警 W1）**：状态文件落后于已合并的 Git 事实 → 判定"状态滞后"，以核验后主线提交为准，不升级；
   - **用例 C（告警 W1/W3）**：本地 `origin/main` 与远端头不一致但可 fetch → fetch 后以远端头为准，记录滞后与待同步，不阻断；
6. 产品代码（v2/）、eval、migrations、TASK-006 任务状态、主线顺序零变化；
7. 正式契约、规则文件、测试（如有）在同一 PR 中同步合并（红线 #6）。

### 5.1 沟通体验验收规则（Founder 批准时附加 must_add，必须落盘）

1. 普通回复仅 3—5 句大白话；
2. 结论、Founder 下一步操作和交接卡必须位于消息底部；
3. 完整证据、日志和长文件清单放入附件，不在聊天正文展开；
4. 交接卡优先使用一个可完整显示、可一次复制的代码框；
5. 如果 Hermes 出现内容截断、代码框拆分、符号外泄或无法复制，必须自动退回不超过 10 行的短纯文本卡；
6. 未在 Hermes 中实际验证成功，不得声称"渲染问题已解决"。

落盘位置：`project-context/agent-response-protocol.md`（回复与附件规则）+ `project-context/templates/role-handoff-template.md`（交接卡格式规则）。

## 6. 风险、停止条件和 Change Request 条件

### 风险

| 风险 | 缓解 |
|---|---|
| 启动回执字段增多导致回复冗长 | 字段并入现有回执，用简短枚举；详细规则引用文件 |
| 阻断过严导致频繁误停 | 阻断仅 3 类，且以"无法解释的语义冲突"为前提；可收敛差异走告警 |
| 统一版本纪律落地不齐 | 本任务先定义强制文件清单与升级动作；清单外文件随改随升 |
| 远端头与本地对象库不一致导致读取中断 | 三级核验已定义：对象缺失时停止读取，在获授权干净环境补齐 |
| 与 GOV-COMM-001 恢复流程重复/冲突 | GOV-002 只补"上下文可信度核验"，不重写八步恢复流程；冲突时以 context-manifest 为准并打回 Chief |

### 停止条件

- 实施前重新核验远端正式主线头后，基线事实影响本任务范围（基线重核）；
- 护栏规则与 GOV-COMM-001 / GOV-CHIEF-001 已合入规则发生不可调和冲突；
- 修改需要触及产品目标、主线顺序、TASK-006 状态或本地 Spike 设计。

### Change Request 条件

- 需要建设自动化监控/告警工具（超出护栏定义）；
- 需要修改八步恢复流程的既有顺序或语义；
- 需要新增外部服务、Schema 或权限边界；
- 需要修复 Hermes 渲染器/技能模板缺陷（另建独立问题）。

## 7. 与既有治理文件的关系（单一权威来源）

| 文件 | 本任务写入 | 不写入 |
|---|---|---|
| `context-manifest.md` | **唯一权威**：C1—C6 核验、W1—W3、B1—B3、统一版本纪律、回执三项必录字段、三级核验 | 不重写八步恢复流程 |
| `role-wakeup-and-handoff.md` | 仅引用 context-manifest 护栏规则；§5.1 升级流程引用护栏 | 不重复定义 B/W 规则 |
| `AGENTS.md` | 高频摘要（启动必读、冲突停止上报）+ **统一版本升级**（本次 2026-08-10.4 → 新版本） | 不展开完整规则 |
| `agent-response-protocol.md` | **沟通体验验收规则 5.1 六条落盘**（scope_add） | 不改变决策流程 |
| `templates/role-handoff-template.md` | **交接卡格式规则落盘**（scope_add：单个可复制代码框、渲染异常退回 ≤10 行纯文本） | 不改变十七字段语义 |
| `decision-register.md` | D-GOV-002-SCOPE 状态更新 | 不新增产品决策 |
| `current-state.md` | GOV-002 状态行更新 | 不改变 TASK-006 状态 |

## 8. 执行模式判断（已确认）

- 执行模式：**delegated 临时委派**（Founder 2026-08-12 确认）；
- 分支：`codex/gov-002`（从最新 origin/main 创建，建分支前重新核验远端正式主线头）；
- 实施前必须经过实现计划 Review（Review 2）；
- Review 2 批准前，Builder 不得修改任何文件。

## 9. 下一交接路径

```text
Chief（DRAFT v1.2 已批准）→ Builder 提交实现计划（Review 2）→ Founder 审批
→ Governance Builder（独立 worktree + 实施 + PR）
→ 独立 Reviewer（Review 3）→ Founder 合并裁决
→ 合并后状态同步 → 再单独起草 TASK-006 本地 Gate Spike
```

## 10. 固定状态报告

```text
## 当前任务状态
GOV-002：APPROVED（DRAFT v1.2；执行模式 delegated 已确认；等待 Review 2 实现计划）

## 当前负责人
执行 Chief（operational-chief-2026-08-12-01）→ Builder（实现计划）

## 当前阶段是否完成
否（实现计划 Review 2 未提交/未批准）

## 完成依据
方案 APPROVED + 执行模式 delegated 已确认

## 下一交接对象
Founder（Review 2 审批）→ Builder（实施）

## 交接前仍缺少什么
Builder 简短实现计划（目标、7 文件改动点、沟通规则落盘位置、验证、风险）

## 建议动作
Builder 基于本附件产出实现计划，停止后交 Founder Review 2
```
