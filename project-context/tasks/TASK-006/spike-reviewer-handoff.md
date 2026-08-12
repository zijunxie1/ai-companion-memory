# TASK-006｜本地 Gate Spike 收尾 — 独立 Reviewer 核对交接包

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
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B）
  - project-context/tasks/TASK-006/local-gate-spike-draft.md（v1.2，APPROVED，权威方案）
  - project-context/tasks/TASK-006/spike-stop-cr.md（CR-T006-SPIKE-STOP-01，DECIDED-A）
  - project-context/tasks/TASK-006/spike/implementation-plan.md（v1.0）
  - project-context/tasks/TASK-006/spike/（全部证据：冻结记录/原始数据/审计日志）
doc_type: Reviewer 核对交接包（收尾 PR #17）
task_id: TASK-006（内部 Spike：TASK-006-SPIKE-LOCAL-GATE）
review_target: PR #17（feature/task-006-local-gate-spike → main；状态 STOPPED/FAILED）
role: 独立 Reviewer（默认只审查不修改代码）
handoff_by: operational-chief-2026-08-12-01（执行 Chief）
handoff_date: 2026-08-12
```

---

## 1. 目标角色

独立 Reviewer（新窗口；由 Founder 人工唤醒）。**只审查，不修改代码。**

## 2. 项目位置

P1 Alice Memory → TASK-006（E004 无关召回 Gate）→ 本地相关性 Gate Spike（D-T006-LOCAL-SPIKE）→ **收尾 Review（PR #17）**。

## 3. 本次唯一目标

对照已批准方案（local-gate-spike-draft.md v1.2）与实施计划（implementation-plan.md v1.0），独立核对收尾 PR #17 的**四件事**：① 证据与停止报告一致；② 冻结纪律合规；③ holdout 种子清理结果；④ 零产品改动。输出 REVIEW_APPROVED 或 CHANGES_REQUESTED。

## 4. 为什么做

Spike 触发停止条件 9（两个正式候选都失败），Founder 裁决选项 A（接受失败）。收尾 PR 归档停止事实与证据；独立 Reviewer 核对是"代码与行为 Review"门（Review 3），确保停止结论基于真实证据、冻结纪律未被破坏、无产品越界。

## 5. 当前事实（已核验）

- 收尾 PR #17：`feature/task-006-local-gate-spike` → `main`，12 commits，50 files，**全部在 `project-context/` 下**；v2/ 零改动（执行 Chief 已核验）；
- 候选 1 校准失败：ρ=0.8653（非冗余）但 16 版本分离边际全负（-0.005~-0.145）；
- 候选 2 校准通过（F1=1.0、边际 0.3971）但 holdout 一次性运行失败：H1/H2/H3 PASS、H4 天气变体 FAIL，合并 F1=0.8571、边际 0.0013；
- 停止条件 9 触发；Founder 裁决 A（2026-08-12）：接受失败；禁止补 H4 词表/重跑冻结 holdout/重启外部模型路线；
- **Spike = STOPPED/FAILED，不等于 TASK-006 失败或完成**（TASK-006 保持 APPROVED，E004 缺陷仍存在）。

## 6. 已完成 / 未完成

已完成：S0 预装检查、S1 holdout 冻结、S2/S3 校准采集与标注、S4/S5 候选评估、S6 机制冻结、S7 holdout 一次性运行 + 清理、S9 网络审计（部分）；停止报告与裁决记录。

未完成（如实声明，非缺陷）：S8 延迟/资源测量未执行（两候选均未过质量/泛化门，无测量对象）；S10 完整报告未写（触发停止条件 9，以停止报告替代）。

## 7. 已批准决策（核对依据）

| ID | 内容 |
|---|---|
| D-T006-1 | TASK-006 E004 无关召回 Gate（目标/验收不变） |
| D-T006-ROUTE-B | 不外发用户数据的本地/规则/检索路线 |
| D-T006-LOCAL-SPIKE | 本地 Gate Spike DRAFT v1.2（候选两机制、冻结纪律、验收、停止条件） |

## 8. 决策理由

外部模型 Gate 不满足隐私/延迟/回退要求；简单阈值不可靠；故验证本地机制。两候选均失败 → 按 DRAFT §9 停止条件 9 停止，Founder 裁决 A。

## 9. 已否决方案

补 H4 词表重跑（违反冻结纪律，Founder 裁决 A 禁止）；外部模型路线（D-T006-ROUTE-B 否决为产品路线）。

## 10. required_reading

见头部 YAML。核心：local-gate-spike-draft.md（v1.2）、spike-stop-cr.md、spike/ 全部证据。

## 11. 允许执行

只读核对 PR #17 diff、spike/ 证据文件、提交历史（Git）；输出审查报告；可要求 Builder/Chief 补充证据。

## 12. 禁止执行

修改任何文件；批准合并（合并裁决归 Founder）；扩大审查范围到产品代码/正式评测；重新评估候选机制（不属于本 Review）。

## 13. 核对步骤（四件事）

1. **证据与停止报告一致**：
   - `data/scores/candidate1.json`：16 版本分离边际全为负？ρ=0.8653？
   - `data/scores/candidate2.json`：校准 F1=1.0、边际 0.3971（三轮 0.397-0.409）？
   - `data/holdout/run.json`：H1/H2/H3 PASS、H4 FAIL（相关样本 0.049 < 阈值 0.05、无关最高 0.0404）、合并 F1=0.8571/边际 0.0013？
   - 停止报告（聊天/CR）与上述原始 JSON 数值一致？
2. **冻结纪律合规**（提交历史核对）：
   - holdout 冻结提交 `9459a70`（哈希 307d2663）**先于**一切校准/调参提交？
   - 机制冻结提交 `7e6f414`（哈希 bd4cc70c）之后**无任何调参提交**？`6c73270` 仅一次性运行+清理？
   - `theme-system.md/json` 的 holdout 特有词仅出现在"排除声明"，类别词表仅含校准集+通用知识词（未用 holdout 内容设计机制）？
3. **清理结果**：
   - `data/audit/network-cleanup-*.log`：9 条种子 DELETE？随后 GET 核验清零（eval-spike-h1/h2/h3/h4 返回空）？
   - `data/holdout/cleanup.json` 与 seeds.json 对照？
4. **零产品改动**：
   - `git diff origin/main...feature/task-006-local-gate-spike --stat`：仅 `project-context/tasks/TASK-006/` 文档与 `spike/` 文件？
   - v2/ 下无任何文件变更？无 eval_cases/Schema/评测规则/迁移改动？

## 14. 验收标准（本 Review 的通过门）

1. 四件事全部核对一致，且停止结论与 DRAFT v1.2 §9 停止条件 9 判定相符；
2. 状态表述正确：Spike = STOPPED/FAILED，**未写成 TASK-006 失败或完成**；
3. 未发现越界（无产品代码/评测规则/治理文件行为变更、无外发、无运行时下载）；
4. 输出 REVIEW_APPROVED 或 CHANGES_REQUESTED（含 BLOCKER/MAJOR/MINOR 分级与证据）。

## 15. 停止条件

1. 发现证据与报告实质不符（数值对不上或缺失关键文件）→ CHANGES_REQUESTED；
2. 发现冻结纪律被破坏（调参发生在冻结前/冻结后仍有调参提交）→ CHANGES_REQUESTED（BLOCKER）；
3. 发现种子未清理或非 loopback 网络访问 → CHANGES_REQUESTED（BLOCKER）；
4. 发现产品代码/正式评测/治理行为变更 → CHANGES_REQUESTED（BLOCKER）。

## 16. 完成后必须返回

1. 审查结论（REVIEW_APPROVED / CHANGES_REQUESTED）；
2. 四件事逐项核对结果表；
3. BLOCKER/MAJOR/MINOR 清单（如有）；
4. 是否建议合并的意见（合并裁决归 Founder）。

## 17. 下一张交接卡要求

- Reviewer 输出结论后返回 Founder：REVIEW_APPROVED → Founder 决定是否合并收尾 PR #17；CHANGES_REQUESTED → 返回原 Builder 修复（但本 PR 为归档性质，通常为补充证据）；
- 收尾 PR 合并后：执行 Chief 起草第二轮 Spike 候选范围 DRAFT（新机制方向，不预先选定方案）。
