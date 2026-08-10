# GOV-001 治理修正方案（Chief 落盘版）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/GOV-001/implementation-plan.md
```

> 文档类型：治理修正方案（已批准并执行；GOV-001A PR #5 与 GOV-001B PR #6 均已合并，本方案随 GOV-001B 落盘入库）
> 日期：2026-08-10
> 依据：context-manifest.md §5（required_reading）+ current-state.md（权威状态）+ decision-register.md（决策登记）
> 修正范围：仅治理文档，不修改产品代码、不合并、不部署

---

## 修正项 1：权威状态文件过期（MAJOR）

### 现状
- `current-state.md`：GOV-001 写 "DRAFT / 待 Founder 明确执行裁决 / 尚未执行"
- `decision-register.md`：D-GOV-001-A1 = NEEDS_DECISION

### 事实（2026-08-10 已发生）
- Founder 已批准方案 A1（GOV-001 方向 A 修订版）
- Founder 已批准 GOV-001A 临时委派
- Git Builder 已执行 GOV-001A：PR #5 已创建（mergeable，5365b18）
- 独立核实：追溯性 ×4 通过、无 force push、终态协议完整

### 修正动作
1. `current-state.md` GOV-001 行改为：
   `GOV-001A：IN_PROGRESS→IMPLEMENTED（PR #5 已创建，待独立 Reviewer 复审 + Founder 合并裁决）；GOV-001B（状态同步）未执行`
2. `decision-register.md` D-GOV-001-A1 状态改为 `APPROVED`（Founder 2026-08-10 批准 A1 + GOV-001A 临时委派），结论追加：PR #5 已创建，待合并
3. 更新"当前阻断"第 1 条：main/master 未收敛 → 收敛进行中（PR #5 待合并）【历史执行动作，2026-08-11 PR #5 已合并，该动作已由实际合并取代】

## 修正项 2：GOV-001 计划缺 required_reading（MAJOR）

### 现状
`implementation-plan.md` 头部无 required_reading YAML；`project-context/tasks/GOV-001/` 未跟踪。

### 修正动作
1. `implementation-plan.md` 头部补 required_reading：

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/project-mainline-roadmap.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-001/governance-fix-plan.md
  - project-context/tasks/TASK-003/draft-phase2-bplus.md
```

2. 纳入 git 跟踪：`project-context/tasks/GOV-001/` 全部文件（在 GOV-001B 状态同步 PR 或独立治理 PR 中提交，不混入主线收敛 PR #5）

## 修正项 3：TASK-003 下一交接顺序错误（MAJOR）

### 现状
`TASK-003/draft.md` 第 22 行：`next: 用户合并裁决 → [合并后] 新独立 Reviewer 四项复审 → 用户合并`

### 问题
四项复审（文档一致性/无无关文件/契约覆盖/可安全合并）已由 GOV-001 流程完成；TASK-003 的正确下一交接是主线收敛后的状态同步，不是再走一次 Reviewer。

### 修正动作
改为：`next: GOV-001A PR #5 合并 → GOV-001B 状态同步（TASK-003 标 MERGED，不 CLOSED）→ 后续任务`

## 修正项 4：AGENTS.md 与治理文件未跟踪（补充）

### 现状
`AGENTS.md`（v2026-08-10.4，M 状态）及 7 个新治理文件（context-manifest/current-state/decision-register/project-mainline-roadmap/agent-response-protocol/role-wakeup-and-handoff/CHIEF-BOOTSTRAP）全部未跟踪。

### 修正动作
- 在 GOV-001B 状态同步 PR 中一并纳入跟踪（或单独治理 PR，由 Founder 裁决）
- 不混入主线收敛 PR #5

## 执行顺序建议

```text
1. Reviewer 复审本方案 → Founder 批准
2. Founder 合并 PR #5（主线收敛）
3. GOV-001B：状态同步 PR（TASK-003 → MERGED + 本方案修正项 1-4 一并落盘）
4. Founder 单独裁决 master 退役
```

## 禁止事项（本方案不授权）

- ❌ 不修改产品代码（chat route / eval / migrations）
- ❌ 不合并 PR #5（合并权在 Founder）
- ❌ 不删除 master
- ❌ 不 force push
- ❌ 不在 PR #5 中混入治理文件
