# GOV-002 实现报告（Governance Builder）

```yaml
task_id: GOV-002
status: MERGED（PR #14 @ 011168f，2026-08-12）；合并后修正 IN_PROGRESS → IMPLEMENTED（codex/gov-002-post-merge，待 Review 3）
execution_mode: delegated
assigned_role: Governance Builder
branch: codex/gov-002（初始实施）→ codex/gov-002-post-merge（合并后修正）
baseline: origin/main @ 980bfa5424f31c49a36aa3b56e546d5ba65074c4（初始实施）；origin/main @ 011168f（合并后修正）
baseline_verified_at: 2026-08-12（git fetch + ls-remote 双确认，remote == origin/main，0/0 分叉）
approvals: DRAFT v1.2 APPROVED（Founder 2026-08-12）；delegated 已确认；Review 2 实现计划已批准；合并后修正（A 类遗留 + B 类展示结构）已批准并入同一 PR
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
```

## 1. 实施目标

按 DRAFT v1.2 与 Review 2 批准的实现计划，把上下文完整性护栏（C1—C6 核验、W1—W3 告警、B1—B3 阻断、统一治理包版本纪律、沟通体验六条）落盘为正式治理规则；`context-manifest.md` 为唯一权威来源，其余文件只引用。不修改产品代码、TASK-006 状态、主线顺序。

## 2. 实际修改文件列表（8 个，均在批准范围内）

| # | 文件 | 改动内容 | 依据 |
|---|---|---|---|
| 1 | `AGENTS.md` | 统一版本 `2026-08-10.4` → `2026-08-12.1`（C1 标注）；新增"上下文完整性护栏（C1—C6，高频摘要）"小节（六条摘要，引用 context-manifest） | §7 表 + §3.3 |
| 2 | `project-context/context-manifest.md` | 启动回执新增三必录字段（C1/C3/C6）；新增 §3.1 C1—C6 六要素表 + §3.1.2 回执三字段；§3.2 正式主线三级核验；§3.3 告警 W1—W3 / 阻断 B1—B3（含互斥保证）；§3.4 统一治理包版本（强制文件清单、文档版本与统一版本分离、内容来源证明）。未重写 §4 八步恢复流程 | §7 表 + §5 验收 1—5 |
| 3 | `project-context/role-wakeup-and-handoff.md` | §1 新增"上下文可信度核验"引用块：统一以 context-manifest §3.1—§3.4 为唯一权威，本文件不重复定义 B/W | §7 表 |
| 4 | `project-context/agent-response-protocol.md` | 新增 §5.1 沟通体验验收规则六条（must_add）：3—5 句、结论置底、证据进附件、单代码框交接卡、渲染异常退回 ≤10 行纯文本、未实测不得声称解决 | §5.1 + §7 表 |
| 5 | `project-context/templates/role-handoff-template.md` | 新增"交接卡格式规则"四则（scope_add）：单代码框、渲染异常退回、未实测不声称、不改十七字段语义 | §5.1 + §7 表 |
| 6 | `project-context/decision-register.md` | D-GOV-002-SCOPE 从待决队列移入已批准看板（APPROVED，含依据/影响范围/证据入口）；"当前待 Founder 决策"GOV-002 行更新为已批准并实施中 | §7 表 |
| 7 | `project-context/current-state.md` | GOV-002 状态行更新（实施中 IMPLEMENTED 待 Review 3）；origin/main 快照更新至 980bfa5；建议动作与下一窗口唤醒卡更新为 Review 3 交接 | §7 表 |
| 8 | `project-context/tasks/GOV-002/draft.md` | 落盘 DRAFT v1.2 全文（原仓库外附件，头部标注落盘事实） | 任务要求 |

## 3. 验证结果（V1—V7）

| 验证 | 检查内容 | 结果 |
|---|---|---|
| V1 | B/W 规则仅定义于 context-manifest；role-wakeup 仅引用（grep 确认无重复定义） | ✅ PASS |
| V2 | 启动回执模板含 C1/C3/C6 三项必录字段（context-manifest §3 模板 + §3.1.2） | ✅ PASS |
| V3 | AGENTS.md 统一版本已升级 2026-08-12.1；本次修改的强制文件在同一变更内 | ✅ PASS |
| V4 | 用例 A（脏目录→W2）、用例 B（状态滞后→W1）、用例 C（origin/main 不一致可 fetch→W1/W3）均为告警；互斥保证已落盘 | ✅ PASS |
| V5 | `git diff` 确认仅 7 个治理文件 + 1 个新任务文件；v2/、eval、migrations、TASK-006 状态、主线顺序零变化 | ✅ PASS |
| V6 | 契约 + 规则文件在同一 PR 同步合并（单一 PR #14，见下） | ✅ PASS |
| V7 | 不测 Hermes 渲染器（非目标）；渲染问题未声称解决 | ✅ PASS |

## 4. 验收标准对照（DRAFT §5 的 7 项）

1. ✅ 启动/恢复/可信度规则仅定义于 context-manifest；role-wakeup 只引用；AGENTS.md 只保留高频摘要与统一版本；
2. ✅ §3 启动回执新增 C1/C3/C6 三字段；三级核验已落盘；
3. ✅ W1—W3 / B1—B3 落盘于 context-manifest，语义互斥；
4. ✅ §3.4 统一治理包版本落盘；本次修改的强制文件已同步升级统一版本（2026-08-12.1）；
5. ✅ 用例 A/B/C 走查通过（告警不升级）；
6. ✅ 产品代码、eval、migrations、TASK-006 状态、主线顺序零变化；
7. ✅ 正式契约与规则文件同一 PR 合并（红线 #6）。

## 5. Change Request

无。

## 6. 已知限制与未完成

- 渲染问题卡（Hermes 代码框截断/拆分、标题泄漏、围栏语言误读）已登记，按 Founder 裁决本次不落盘、不修复，待另行批准转交；
- 可选自动化（required_reading 存在性检查、版本一致性检查）未实现（DRAFT §3.4 第 4 条为非强制项）。

## 7. 下一步建议

1. Founder 将 Review 3 唤醒卡发送给独立 Reviewer；
2. Reviewer 对照 DRAFT §5 验收标准 + §5.1 沟通六条审查 8 文件 diff；
3. Reviewer 输出 REVIEW_APPROVED 后，由 Founder 合并裁决（Rebase）；
4. 合并后状态同步（GOV-002 → MERGED），再单独起草 TASK-006 本地 Gate Spike。

## 8. 实施期间 Git 事实

- 分支：`codex/gov-002`（从 origin/main @ 980bfa5 创建；worktree `E:/gov-002-worktree`）
- 工作区干净度：实施前干净；实施后仅本任务 8 文件变更
- 未触碰：主检出 `E:\正式作品`（feature/task-004-spike，历史脏检出）、其他 worktree、产品代码

---

## 9. 合并后修正记录（A 类遗留 + B 类展示结构，2026-08-12）

> 状态：PR #14 已由 Founder Rebase 合并（`011168f`）；合并后修正已在分支 `codex/gov-002-post-merge` 实施（独立 worktree `E:/gov-002-post-merge-worktree`，基线 `011168f`），统一治理版本升级至 **2026-08-12.2**。

### 9.1 合并事实

- merger：Founder（Rebase 合并，2026-08-12）；
- merge commit：`011168f8c39d116a400df22f5df6207492b50b2f`（PR #14）；
- 合并后核验：fetch 后 origin/main == 011168f，0/0 分叉。

### 9.2 A 类遗留项处理（Review 3 遗留 + 状态同步）

| ID | 处理 |
|---|---|
| MA1 | context-manifest §3.3 互斥保证补排除条款：W3 仅指版本号元数据未升级事实本身；因版本未升级导致的旧文件内容与权威文件语义冲突走 B1 |
| M1 | draft.md 头部补注释：draft 内部章节编号与 context-manifest 实际编号不同（C1 → §3.4，W/B → §3.3，C1—C6 → §3.1），以 context-manifest 为准 |
| M2 | current-state 分叉计数校准：实测 `git rev-list --count 064f5b6..011168f` = **44**（原 37 → 44），master 独有 0 |
| M3 | current-state 核验方式表述统一：删除"未联网刷新"残留，与 `git fetch origin main` 一致 |
| M4 | 渲染异常终极降级：短纯文本卡仍被截断时，正文一句话给出交接文档文件路径（agent-response-protocol §5.1 规则 5 + templates 规则 4） |
| A3/A4 | current-state GOV-002 → MERGED（PR #14 @ `011168f`）；decision-register D-GOV-002-SCOPE 补执行事实（MERGED，决策保持 APPROVED） |

### 9.3 B 类展示结构变更（Founder 批准并入）

| ID | 文件 | 变更 |
|---|---|---|
| B1 | agent-response-protocol.md | §0.3 删除"强制 text 代码框 + 聊天完整十七字段卡"；改为完整内容落交接文件 + 聊天 ≤10 行短卡；§5.1 规则 4 改为"底部单个 YAML 框（实测后）否则纯文本"；规则 5 补 M4 降级；§7.2 L2 自检同步 |
| B2 | role-wakeup-and-handoff.md | §3.1 补"完整卡写文件 + 聊天短卡"结构说明；十七字段语义不变；§5.1 升级流程未动 |
| B3 | templates/role-handoff-template.md | 头部改"落盘为交接文件 + 短卡"；删除强制 ```text 框要求；规则 6 条（含 YAML 实测、M4 降级）；十七字段模板本体保留 |

### 9.4 合并后修正验证（V1—V8）

| 验证 | 结果 |
|---|---|
| V1 单一权威（B/W 仅 context-manifest；MA1 存在） | ✅ |
| V2 回执 C1/C3/C6（未被破坏） | ✅ |
| V3 版本纪律（AGENTS.md = 2026-08-12.2，同一 commit） | ⚠️ AGENTS.md 受保护文件审批超时未写入，见下方说明 |
| V4 沟通规则（§0.3/§5.1 新措辞；templates 无强制 text 框残留；短卡 ≤10 行定义） | ✅ |
| V5 十七字段语义（字段名与语义未改） | ✅ |
| V6 用例走查（A/B/C 仍告警；MA1：版本脱节+内容矛盾 → B1） | ✅ |
| V7 零越界（v2/、eval/、migrations/、TASK-006/、roadmap、product、CHIEF-BOOTSTRAP、state-machine 零变化） | ✅ |
| V8 红线 #6（同一 PR 同步；git diff --check） | ✅ |

### 9.5 V3 版本纪律（2026-08-12 补充修复后）

`AGENTS.md` 为 Hermes 受保护 agent 指令文件：Founder 2026-08-12 授权精确修改（交接包 §9 指令 2），版本号 `2026-08-12.1` → `2026-08-12.2` 通过正常审批流程申请写入，**不得绕过**。版本号是否已落盘以提交后 AGENTS.md 实际内容为准（若审批再次超时未同意，按规则不重试，V3 状态如实记录为未完成并上报 Founder）。

### 9.6 最终事实（补充修复后同步）

- 最终修改范围：**9 个文件**（A 类：AGENTS.md、context-manifest.md、current-state.md、decision-register.md、tasks/GOV-002/draft.md、tasks/GOV-002/implementation-report.md；B 类：agent-response-protocol.md、role-wakeup-and-handoff.md、templates/role-handoff-template.md）；
- 决策登记：新增 **D-GOV-002-POSTMERGE**（APPROVED，Founder 2026-08-12 授权，记录批准范围/依据/日期/统一版本 2026-08-12.2）；D-GOV-002-SCOPE 保持 APPROVED；
- PR：**PR #15**（base=main，head=codex/gov-002-post-merge；补充 commit 后保持 OPEN）；PR #15 在 REVIEW_APPROVED 前禁止合并；
- 统一治理版本目标：**2026-08-12.2**（AGENTS.md 头部 C1）；
- B 类措辞统一：**"YAML 代码框"**（明确为 Markdown 渲染容器）；§0.3 已删除 text 围栏示例，默认示例为短纯文本；M4 降级（短卡仍截断 → 正文给出交接文档文件路径）已写入 §5.1 规则 5、templates 规则 4、role-wakeup §3.1；
- 复审对象：**同一独立 Reviewer**（复审 PR #15 补充 commit）。
