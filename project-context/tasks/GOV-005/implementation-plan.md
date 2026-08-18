# GOV-005｜Implementation Plan（实施计划）

```yaml
task_id: GOV-005
status: APPROVED
plan_version: v1.0
plan_date: 2026-08-19
planner: GOV-005 Builder
baseline: origin/main @ ece45fb（远端与本地一致，已三级核验）
unified_version_before: 2026-08-16.3
unified_version_after: 2026-08-19.1
execution_mode: persistent_session
interaction_stage: decided（本计划待 Founder 批准后进入执行）
```

---

## 1. 当前事实与待验证假设

### 1.1 已核验的正式主线事实（origin/main @ ece45fb）

- 远端 `origin/main` = `ece45fb`，本地 `origin/main` = `ece45fb`，**一致**；
- AGENTS.md 统一治理版本 = `2026-08-16.3`（GOV-COMM-004 已合并进 main；current-state.md 快照仍写"未合并"是 W1 滞后，非阻断）；
- 主线顺序已收敛为 `main`，`master` 为祖先归档引用；
- 主线任务顺序：GOV-001 → TASK-005A → TASK-006 → TASK-007 → TASK-005B → 完整度补齐 → 按需 CR-B；
- `project-atlas.md`、`prototypes/`（8765 静态设计母版）、`static-prototype-review-v2.1/` 均**不在 origin/main**（已用 `git ls-tree` 核验）。

### 1.2 已核验的任务状态事实

| 任务 | 状态（origin/main 权威来源） |
|---|---|
| TASK-001 | CLOSED |
| TASK-002 | CLOSED |
| TASK-003 | 阶段 2 MERGED（8 Case 真实 Eval 工具） |
| TASK-004 | DRAFT / PAUSED（删除复活，不降低 E006） |
| TASK-005A | MERGED（QA_APPROVED_MAINLINE，未生产部署） |
| TASK-006 | APPROVED（E004 未解决；R1/R2/R3 均 STOPPED/FAILED；R4 已完成两轮验证+收尾+独立审查但整体未通过，证据待正式保存） |
| TASK-007 | 未开始 |
| TASK-005B | 未开始 |
| 20 Case / 完整 Bad Case / 生产部署 | 未完成 |

### 1.3 R4 最新事实（来自指定证据，尚未全部进 main，标"待正式保存"）

- 已完成两轮真实验证（第一轮 60%、第二轮 56.7% 正确率）；
- 已完成判断标准修订（v2 四维检验 + 三档定义）；
- 已完成收尾（spike-r4-closeout.md）；
- 已通过独立证据审查（spike-r4-closeout-review-report.md：REVIEW_APPROVED，0 BLOCKER / 0 MAJOR / 1 MINOR）；
- 显式判断能减少无关记忆硬扯（第二轮公平基线 13/13 → 0/13）；
- 关键记忆仍会漏（id=5 猫毛过敏两轮均漏用）；
- 整体未通过；不启动第五轮；不接入聊天产品；E004 仍未解决；
- 当前阶段接受为 Demo 已知限制。

### 1.4 两套前端关系（已核验）

- **3000 端口** = 真实产品（聊天 / Memory / Trace / 真实 Eval / Case / Run / PostgreSQL / 真实接口）；
- **8765 端口** = TASK-003 V2.1 静态设计母版（视觉、信息层级、Before/After、Case Drawer、Trace 边界、Bad Case 管理参考）；
- 最终只保留 3000；TASK-007 吸收 8765 设计系统与关键交互；
- 8765 的固定数字、旧 Case 映射、假按钮、固定日期、历史结论**不得**写成真实产品事实。

---

## 2. 目标 / 非目标

见 `draft.md` §1/§2。核心目标：创建 `project-context/project-atlas.md`（索引 + 大白话翻译层），并接入正式上下文恢复导航。

---

## 3. 依赖与前置条件

- 正式主线已核验（完成）；
- required_reading 与指定证据已完整读取（完成）；
- 本计划经 Founder 批准后，才修改正式治理文件（待办）。

---

## 4. 拟修改文件与原因

| 文件 | 动作 | 原因 |
|---|---|---|
| `project-context/project-atlas.md` | **新建** | 核心交付物：P1 全貌地图（覆盖 draft §4 的 19 项） |
| `project-context/tasks/GOV-005/draft.md` | 已建 | 记录 Founder 已批准范围 |
| `project-context/tasks/GOV-005/implementation-plan.md` | 本文件 | 实施计划 |
| `project-context/tasks/GOV-005/implementation-report.md` | 完成后建 | 实施证据 |
| `project-context/tasks/GOV-005/reviewer-handoff.md` | 完成后建 | Reviewer 交接 |
| `project-context/context-manifest.md` | 修改 | 把 project-atlas 接入"新窗口继承流程"与压缩恢复导航（作为快速定位层，不替代权威） |
| `AGENTS.md` | 修改 | 加地图入口 + 升级统一治理版本 |
| `project-context/current-state.md` | 修改 | 状态快照同步（GOV-005 进行中、R4 最新结论、project-atlas 待合并） |
| `project-context/decision-register.md` | 修改 | 新增 GOV-005 决策卡 |

**不修改**：`agent-response-protocol.md`（回复协议与本任务无关）；`product.md`、`project-mainline-roadmap.md`（地图不改变产品定义与主线顺序，仅翻译现有事实）。

---

## 5. 治理行为变化与统一版本升级

### 5.1 行为变化判定

把 `project-atlas.md` 接入 `context-manifest.md` 的"新窗口继承流程 / 压缩恢复流程"作为**快速定位层**，属于启动/恢复流程的行为变化（新增导航入口）。按 `context-manifest.md` §3.4 统一版本纪律，必须在**同一变更**中升级统一治理版本。

### 5.2 版本升级方案

- 统一版本 `2026-08-16.3` → `2026-08-19.1`；
- 需要同步版本号的位置（已全文搜索确认）：
  - `AGENTS.md` 头部"规则版本（统一治理包版本，C1）"——唯一权威版本号位置；
  - `current-state.md` 头部"上下文规则版本"引用。
- 其余文件只引用"统一治理包版本"概念，不含具体版本号数字，无需逐个改。

### 5.3 受影响文件清单（将写入变更说明）

`AGENTS.md`、`project-context/context-manifest.md`、`project-context/current-state.md`、`project-context/decision-register.md`、`project-context/project-atlas.md`（新增）、`project-context/tasks/GOV-005/*`（新增）。

---

## 6. project-atlas.md 内容设计

### 6.1 结构（面向无技术背景 Founder 顺序可读）

1. 地图定位声明（索引 + 大白话翻译层，非权威，冲突以权威文件为准）；
2. 一句话：项目要做什么（作品集、证明 Memory 闭环）；
3. 目标用户与为什么聚焦中期/重度用户；
4. 核心问题（AI 失忆/误记/乱用如何破坏关系连续感）；
5. 完整产品闭环（聊天 → Memory 四能力 → Trace → Eval → Bad Case → 决策修复 → Before/After）；
6. 正式三层 Demo + 单列"作品集叙事层"（明确非第四层功能）；
7. 当前真实进度：四态分类表（已实现有证据 / 部分实现 / 已批准未实现 / 未来设想），每项链接证据；
8. R1—R4 决策时间线（每轮为什么停、证据支持/否决）；
9. 两套前端关系（3000 真实 vs 8765 设计母版）；
10. 后续顺序（TASK-007 → TASK-005B → 20 Case → 完整 Bad Case → 网站）；
11. 面试可展开的产品判断；
12. 当前 Demo 不能证明什么（诚实边界）；
13. 新窗口最短恢复入口。

### 6.2 四态分类原则

每个能力/任务明确标注四态之一，且"已实现"必须带证据锚点（正式文件路径 / 真实代码路径 / 合并记录 / 审查证据）。聊天摘要、未追踪文件不单独作证。

### 6.3 必须写的诚实边界（draft §5）

R4 已完成并审查但整体未通过；E004 未解决；TASK-006 不写成已解决；20 Case 不降级；TASK-007/005B 未开始；生产未部署；个人网站不在 P1；本地能跑≠上线；8765 与 R4 本地证据标"待正式保存"。

---

## 7. 分步骤实现顺序

1. 写 `project-context/project-atlas.md`（核心交付）；
2. 改 `context-manifest.md`：新窗口继承流程 + §4 压缩恢复流程加 project-atlas 快速定位引用；
3. 改 `AGENTS.md`：地图入口 + 统一版本 2026-08-16.3 → 2026-08-19.1；
4. 改 `current-state.md`：状态快照同步（主线 ece45fb、GOV-005 进行中、R4 结论、project-atlas 待合并、版本号引用）；
5. 改 `decision-register.md`：新增 D-GOV-005 决策卡；
6. 写 `implementation-report.md` 与 `reviewer-handoff.md`；
7. commit、push、建 PR。

---

## 8. 一致性检查（自检清单）

- [ ] 所有"已实现"均有证据锚点；
- [ ] 没有把 8765 静态设计、聊天设想、未来规划写成已实现；
- [ ] R4 结论准确（整体未通过、E004 未解决、不启动第五轮、待正式保存）；
- [ ] TASK-006 不写成问题已解决；20 Case 不降级；
- [ ] 两套前端关系准确；
- [ ] 三层 Demo 与作品集叙事层不混淆；
- [ ] 统一版本已在同一变更内一致升级（AGENTS.md + current-state.md 引用）；
- [ ] 文件导航与引用路径一致（仓库相对路径）；
- [ ] 未修改 agent-response-protocol.md、product.md、roadmap.md；
- [ ] 未触碰任何产品代码、依赖、Schema、评测规则、冻结数据。

---

## 9. 风险、停止条件与 Change Request 条件

- **风险 1**：把地图写成"新权威"，覆盖 current-state/decision-register → 通过定位声明 + 冲突回退条款防范；
- **风险 2**：把 R4 或 8765 未进主线的证据写成"已正式保存" → 明确标注"待正式保存"；
- **停止条件**：发现无法解释的权威冲突；Founder 未批准本计划；需超范围修改（提交 CR，不自行扩大）。

---

## 10. 预计形成的 commits / PR 边界

- 单一分支 `codex/gov-005-project-atlas`；
- 单一 PR，只解决 GOV-005 一个问题（项目全览地图 + 上下文恢复导航接入）；
- 不混入任何产品代码、其他任务或治理任务的改动。
