# GOV-001A｜集成 PR 准备 — Builder 实施计划（修订版）

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

> 交接角色：Chief of Staff → Git Builder（临时委派）
> 批准范围：**仅 GOV-001A｜集成 PR 准备**（Founder 2026-08-10 批准）
> 不包含：GOV-001B（状态同步 PR，第一张 PR 合并后单独执行）
> 分支基线：origin/main@855f16b（GitHub 默认分支）
> 禁止：修改正式 main/master、删除 master、混入未跟踪文件、启动 TASK-005A/006

---

## 1. 任务目标（本阶段只做这些）

1. 使用**独立 Worktree**（不在当前脏工作区切分支）
2. 从 `origin/main@855f16b` 创建集成分支
3. 将 `origin/master@064f5b6` 合并到集成分支（保留两边历史）
4. 对 3 个冲突文件做**语义解决**（禁止整文件盲选 ours/theirs）
5. 运行验证（npm/tsc/lint/test/build，均在 `v2/app` 目录）
6. 推送集成分支 + 创建 PR
7. **创建 PR 后停止**，等待独立 Reviewer 和 Founder 合并裁决

## 2. 非目标

- ❌ 不执行状态同步（TASK-003 标 MERGED 是 GOV-001B，独立执行）
- ❌ 不 cherry-pick 29 个提交（11 个补丁等价，重复应用）
- ❌ 不 force push
- ❌ 不删除 origin/master
- ❌ 不把未跟踪文件混入 PR
- ❌ 不启动任何产品代码任务（TASK-005A/006）

## 3. 冲突文件清单（预检确认，merge-tree --write-tree）

| 文件 | 冲突类型 |
|---|---|
| `project-context/tasks/TASK-003/draft-phase2-bplus.md` | add/add |
| `project-context/tasks/TASK-003/draft.md` | add/add |
| `v2/app/src/app/api/chat/route.ts` | content |

## 4. 执行步骤

```bash
# ── 0. 前置：确认远程引用最新 ──
git fetch origin
# 确认: origin/main = 855f16b, origin/master = 064f5b6

# ── 1. 独立 Worktree（不在主工作区切分支）──
git worktree add ../gov-001-worktree -b gov-001/integration origin/main
# 注意：../gov-001-worktree 为仓库外独立目录

# ── 2. 合并 origin/master（保留两边历史）──
cd ../gov-001-worktree
git merge origin/master
# 预期 3 个冲突文件（见 §3）

# ── 3. 语义解决 3 个冲突 ──
# 3.1 draft-phase2-bplus.md / draft.md（add/add）
#     两版同源；以内容更新、状态标记正确的版本为准，逐段合并
# 3.2 chat/route.ts（content）
#     master 侧含 CR-A 危机拦截 + CR-C 终态协议；
#     合并后必须保留：containsCrisis() → skipped_crisis、
#                     finalizeTraceWrite 终态协议（pending→completed/failed）、
#                     异步写入不阻塞响应
# 每个文件解决后：git add <file>，冲突解决报告记录逐项决策

# ── 4. 验证（均在 v2/app 目录）──
cd v2/app
npm run lint
npx tsc --noEmit
npm test
npm run build

# ── 5. 提交合并结果 ──
cd ../   # 回 worktree 根
git add -A   # 仅 worktree 内；worktree 只有受控文件
git commit -m "merge: GOV-001 集成 origin/master@064f5b6 到 main 基线（语义解决 3 冲突）"

# ── 6. 推送 + 创建 PR ──
git push -u origin gov-001/integration
gh pr create --base main --head gov-001/integration \
  --title "GOV-001A: 主线收敛 — 集成 origin/master（TASK-003 阶段2 全量）" \
  --body "<冲突解决报告摘要 + 验证结果>"

# ── 7. 停止。等待 Reviewer + Founder 裁决 ──
```

## 5. 验证标准

| 检查 | 命令 | 通过条件 |
|---|---|---|
| 追溯性 | `git merge-base --is-ancestor 855f16b gov-001/integration` | exit 0 |
| 追溯性 | `git merge-base --is-ancestor 064f5b6 gov-001/integration` | exit 0 |
| 追溯性 | `git merge-base --is-ancestor ef3edb2 gov-001/integration` | exit 0（TASK-002） |
| 追溯性 | `git merge-base --is-ancestor 0403107 gov-001/integration` | exit 0（TASK-003 复审） |
| 终态协议 | grep containsCrisis / finalizeTraceWrite chat/route.ts | 均存在 |
| 契约 | `ls v2/migrations/` | 002_eval.sql + 003_eval_fixes.sql |
| 契约 | eval/eval-contracts.md | eval_cases/runs/results 齐全 |
| 代码质量 | lint / tsc / test / build | 全过 |

## 6. 无 force push 证据（三重验证，不用 reflog grep 作为唯一证据）

1. **命令记录**：执行日志完整保留（无 `push --force` / `push -f` / `reset --hard`）
2. **远端 SHA 前后核对**：push 前后记录 `git ls-remote origin gov-001/integration`，
   新分支无旧引用可覆盖；origin/main、origin/master SHA 全程不变
3. **PR 审计**：PR diff 仅含预期合并内容，无 11 个补丁等价提交重复应用

## 7. Change Request 条件（遇到即停止，报告 Chief）

- 出现第 4 个冲突文件
- chat/route.ts 合并后测试失败且无法在语义范围内修复
- 需要修改 main/master 或删除 master
- 需要 force push
- 任何超出 GOV-001A 范围的操作

## 8. Builder 完成后输出

1. 冲突解决报告（3 文件逐项：基线/选择/理由）
2. lint/tsc/test/build 结果
3. 追溯性验证输出（4 条 merge-base）
4. 远端 SHA 前后核对记录
5. PR 链接
6. 固定状态报告
7. **Reviewer 唤醒卡**（交给 Chief 安排独立 Reviewer）

## 9. 交接路径

```
Chief → Git Builder（GOV-001A 执行）→ 独立 Reviewer → Founder 裁决合并
→ [合并后] GOV-001B 状态同步 PR → Founder 批准 master 退役（单独裁决）
```

## 10. 固定状态报告模板（Builder 必须输出）

```text
## 当前任务状态
GOV-001A：IN_PROGRESS → 完成（PR 已创建，等待裁决）

## 当前负责人
Git Builder（临时委派）

## 当前阶段是否完成
是（仅 GOV-001A；GOV-001B 未开始）

## 完成依据
（冲突解决报告 + 验证结果 + PR 链接）

## 下一交接对象
独立 Reviewer → Founder

## 交接前仍缺少什么
Reviewer 审查 + Founder 合并裁决

## 建议动作
Chief 安排独立 Reviewer
```
