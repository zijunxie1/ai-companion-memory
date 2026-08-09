# TASK-003 合并收尾｜Builder 交接包（Chief 正式版）

> 交接角色：Chief of Staff → Builder（原长期会话 20260809_074526_e4cf10）
> 交接类型：任务交接（收尾，不新增产品功能）
> 任务状态：REVIEW_APPROVED → 合并准备
> 分支：feature/task-003-eval-run-slice
> 日期：2026-08-09

---

## 1. 任务目标

1. 把 TASK-003 阶段 2 的 Review 文档、Chief 裁决、交接文档纳入 Git 版本管理
2. 更新 TASK-003 状态与任务元数据（阶段 2 完成，**P1 不得标记 CLOSED**）
3. 原 draft.md 标注"已被 B+ 修正/部分取代"
4. 补充 Eval 数据模型、API、Run 状态契约文档
5. 输出干净的合并 diff 和实现报告

## 2. 非目标

- ❌ 不新增任何产品功能
- ❌ 不修改评测判定规则、数据库 Schema
- ❌ 不做 V2 设计收敛（那是 TASK-007）
- ❌ 不修复 E004（那是 TASK-006）
- ❌ 不部署、不合并、不推送 master

## 3. 验收标准（全部满足才算完成）

| # | 验收项 | 判定方法 |
|---|---|---|
| 1 | review-report-final.md、Chief 决策、reviewer-handoff-round3/4/5 已提交 | git log 可见 |
| 2 | TASK-003 元数据更新（阶段 2 完成、P1 未 CLOSED） | 检查 draft 文件 |
| 3 | 原 draft.md 有"已被 B+ 修正/部分取代"标记 | grep 可见 |
| 4 | Eval 数据模型/API/Run 状态契约文档已补充 | 文件存在且完整 |
| 5 | 无 Chrome profile、批量文本、无关截图被提交 | git status 检查 |
| 6 | 功能分支已推送 | git push 完成 |
| 7 | 合并 diff 干净（只含 26 个业务文件） | git diff master...分支 |
| 8 | 实现报告已输出（含状态报告格式） | 报告存在 |

## 4. 允许修改范围

- `project-context/tasks/TASK-003/` 下的文档
- `v2/migrations/`（仅新增契约文档，不改已应用迁移）
- `eval/` 下文档
- 分支上的业务代码**只允许文档级注释**，不允许功能改动

## 5. 禁止修改范围

- ❌ 主分支（master/main）
- ❌ 评测判定逻辑（eval-program-rules / eval-runner / eval-llm-judge）
- ❌ 数据库迁移文件（002/003 已应用）
- ❌ V2 产品链路（/api/chat、mem0、Dify Chatflow）
- ❌ `C:\Users\admin\Documents\作品1` 静态原型

## 6. 相关正式契约

| 契约 | 位置 | 用途 |
|---|---|---|
| 方案 B+ 草案 | `project-context/tasks/TASK-003/draft-phase2-bplus.md` | 阶段 2 范围定义 |
| 原任务草案 | `project-context/tasks/TASK-003/draft.md` | 需标注被取代 |
| Chief 第三轮裁决 | CR-A/CR-C 批准 | 安全策略依据 |
| 本次合并裁决 | 六项裁决 | 合并边界 |
| 执行章程 | `AGENTS.md` | 角色权限红线 |
| 状态机 | `project-context/handoff-and-task-state-machine.md` | 状态定义 |

## 7. 拟议变化（收尾会产生的提交）

```
docs: TASK-003 阶段2 收尾 — Review 报告与 Chief 裁决归档
docs: TASK-003 原草案标注 B+ 取代标记
docs: Eval 数据模型与 Run 状态契约
（预计 2-3 个 docs commit，无代码功能变更）
```

## 8. 必须运行的检查

```bash
git status --short          # 不应出现 V3-workspace/batch 文本等
git diff --cached --name-only
grep -c "已被 B+ 修正" project-context/tasks/TASK-003/draft.md
git log --oneline feature/task-003-eval-run-slice -5
git diff master...feature/task-003-eval-run-slice --stat
```

## 9. Change Request 条件

Builder 遇到以下情况必须停止并提交 CR：

- 发现需要修改数据库迁移才能完成契约文档 → CR
- 发现分支代码与文档不一致需要改代码 → CR
- 发现收尾工作超出文档范围 → CR
- 无法在允许范围内安全完成 → CR

## 10. Builder 完成后的固定状态报告（必须输出）

```text
## 当前任务状态
## 当前负责人
## 当前阶段是否完成
## 完成依据
## 下一交接对象
## 交接前仍缺少什么
## 建议动作
```

## 11. 下一交接对象与复审标准

收尾完成后 → **新独立 Reviewer**，只审四项：

| 复审项 | 通过标准 |
|---|---|
| 文档与代码一致性 | 契约文档描述的表/API/状态与代码实际一致 |
| 无关文件检查 | 无 Chrome profile、批量文本、无关截图进入提交 |
| 契约覆盖 | 新增表（3）、API（5）、状态机（running/completed/failed + 终态四态）全覆盖 |
| 可安全合并 | diff 干净、无代码功能变化、可 Rebase and merge |

**Reviewer 输出 APPROVE 后 → 交用户决定合并。Builder/Reviewer/Chief 均不得自动合并。**

## 12. 交接路径

```
Chief（已裁决）
  → Builder（原会话，执行收尾）          ← 本交接
  → 新独立 Reviewer（四项复审）
  → 用户（决定合并，唯一有权合并的人）
  → [合并后] TASK-004/005/006/007 按序排期
```
