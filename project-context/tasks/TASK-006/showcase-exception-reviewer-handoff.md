# TASK-006｜作品集展示阶段例外纯治理 PR #22 — Reviewer 交接包

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
  - project-context/tasks/TASK-006/route-b-decision.md（§6 展示阶段例外）
  - project-context/tasks/TASK-006/draft.md（v1.1）
  - project-context/tasks/TASK-006/spike-r3-candidate-draft.md（v1.1）
doc_type: Reviewer 交接包（独立事后 Review 门）
task_id: TASK-006（内部治理：展示阶段数据外发临时例外）
decision_id: D-T006-SHOWCASE-EXCEPTION
pr_number: 22
branch: feature/task-006-showcase-exception
status: 待独立 Review（PR #22 OPEN，未合并）
handoff_by: operational-chief-2026-08-12-01（执行 Chief）
handoff_date: 2026-08-14
```

---

## 1. 目标角色

**独立 Reviewer**（事后 Review 门；默认只审查、不修改代码；由 Founder 人工唤醒，非持续监督者）。

## 2. 项目位置

- **项目**：P1「Alice Memory 留存优化」（AI 产品经理求职作品集仓库，非生产产品）
- **GitHub 仓库**：`https://github.com/zijunxie1/ai-companion-memory`（远端名 `origin`，默认分支 `main`）
- **当前阶段**：TASK-006（E004 无关召回 Gate）→ 内部治理「作品集展示阶段数据外发临时例外」
- **本 Review 对象**：纯治理 PR #22（`feature/task-006-showcase-exception` → `main`）
- **本地仓库**：`E:\正式作品`（主检出为历史脏目录 `feature/task-004-spike`，**只读参照，不得写入/checkout/reset/clean/提交/同步**）；本 PR 的干净 Worktree 为 `E:\task-006-showcase-worktree`

## 3. 本次唯一目标

独立 Review 纯治理 PR #22：对照已批准的 `D-T006-SHOWCASE-EXCEPTION` 裁决，检查 5 个治理文档改动是否完整、准确、无越界、无产品代码改动，输出 `REVIEW_APPROVED` 或 `CHANGES_REQUESTED`。

## 4. 为什么做

Founder 2026-08-14 采纳决策 Chief 对选项 A 的裁决：作品集展示阶段取消真实数据外发限制，允许外部大模型处理 Founder 自有数据，未来产品化改回本地（路线 B）。执行 Chief 已按 delegated 授权落地为 5 个治理文档的纯治理改动。本 Review 是合并前的必经门——确认落盘与裁决一致、且没有把「方案 C 运行授权」误写成已批准。

## 5. 当前事实（已核验）

- **远端正式主线**：`origin/main` @ `12b2ef8`（PR #20 已合并后的最新头）；
- **PR #22**：`feature/task-006-showcase-exception` @ `633aca0`，base = `main`，状态 OPEN；
- **PR #22 改动**：仅 5 个治理文档（+36/−17），**零产品代码、零 Schema、零评测、零权限改动**；
- 待改文件清单：`decision-register.md`、`tasks/TASK-006/route-b-decision.md`、`product.md`、`current-state.md`、`project-mainline-roadmap.md`；
- **裁决核心**（D-T006-SHOWCASE-EXCEPTION）：展示阶段取消真实查询+候选记忆外发限制；例外仅限 Founder 个人展示、不适用于未来正式产品或其他用户；未来产品化判断模型优先本机、恢复路线 B；**方案 C 运行授权未包含在本裁决内**；
- 相关执行分支证据（未合入 main，仅作背景）：`feature/task-006-r3-spike` @ `ad581f6`（方案 A/B 校准均候选级停止）。

## 6. 已完成和未完成

**已完成**：执行 Chief 起草方案 → Founder 同意 delegated → 建独立分支 → 改 5 个治理文档 → 提交推送 → 创建 PR #22。

**未完成**：独立 Review（本窗口职责）；Review 通过后由 Founder 决定合并；方案 C 运行授权（另一次单独审批，不在本 PR 范围）。

## 7. 已批准决策

| ID | 决策 | 状态 |
|---|---|---|
| D-T006-SHOWCASE-EXCEPTION | 作品集展示阶段数据外发临时例外 | APPROVED（2026-08-14，本 PR 落盘对象） |
| D-T006-ROUTE-B | 路线 B：不外发用户数据的本地/规则/检索路线（产品化目标） | APPROVED（2026-08-12，本 PR 只补注展示阶段例外，不推翻） |
| D-T006-R3-C-EXT | 方案 C 外部调用政策（展示阶段例外后允许处理 Founder 自有数据） | APPROVED（展示阶段例外，待 S0.3） |

## 8. 决策理由

前两轮 Spike 证明本地候选机制无法可靠分离相关/无关候选（方案 A/B 校准分离边际均为负，双双候选级停止）；Founder 为优先完成可展示作品，采纳选项 A——展示阶段用外部大模型效果对照，未来产品化再改回本地。

## 9. 已否决方案

- 选项 B「永久取消隐私限制」——否决（采用临时例外而非永久放开）；
- 选项 C「维持现状完全本地」——否决（Founder 明确要求展示阶段放开）；
- 第二轮候选 A（cross-encoder 方向）与候选 B（k-means）——均已候选级停止，不作为本轮对象。

## 10. required_reading

见文件头部 YAML。**核心必读**：`decision-register.md`（D-T006-SHOWCASE-EXCEPTION / D-T006-ROUTE-B / D-T006-R3-C-EXT 三张卡）、`tasks/TASK-006/route-b-decision.md`（§6 展示阶段例外）、`product.md`（产品定位 + 非目标第 8 条）、`agent-response-protocol.md`（回复分级 L1/L2/L3）、`role-wakeup-and-handoff.md`（Reviewer 交接规则）。

## 11. 允许执行

1. 只读核验：`git fetch origin main`、`git ls-remote`、`gh pr view 22`、`gh pr diff 22`、读取正式主线文件与本 PR 分支文件；
2. 对照 D-T006-SHOWCASE-EXCEPTION 裁决逐项检查 5 个文档改动；
3. 追溯检查过程合规：启动回执、required_reading、决策登记、Founder 回复协议是否被遵守；
4. 输出 REVIEW_APPROVED 或 CHANGES_REQUESTED（附逐项依据）。

## 12. 禁止执行

1. **不修改任何代码或文件**（Reviewer 默认只审查）；
2. 不合并 PR #22、不推送、不 force push；
3. 不运行方案 C、不下载模型、不调用外部服务；
4. 不触碰历史脏目录 `E:\正式作品`；
5. 不自行扩大审查范围到其他任务；
6. 不得把「方案 C 运行授权」误认为已批准——它仍需另一次单独审批。

## 13. 具体步骤

1. 完整阅读 required_reading（以 decision-register D-T006-SHOWCASE-EXCEPTION 为核心）；
2. 只读核验 Git 事实：远端 main 头、PR #22 head/state、分支 diff 文件清单；
3. 逐项检查 5 个文档改动是否与裁决一致、是否遗漏、是否有越界（尤其：是否误改产品代码、是否误写方案 C 已获运行授权、是否误删路线 B）；
4. 输出启动回执（角色 / 规则版本 C1 / 主线提交 C3 / 上下文来源 C6）+ Review 结论。

## 14. 验收标准

1. PR #22 仅改动 5 个治理文档，零产品代码/Schema/评测/权限改动；
2. D-T006-SHOWCASE-EXCEPTION 决策卡内容与 Founder 裁决一致；
3. 三处冲突源（route-b-decision §6、D-T006-R3-C-EXT、current-state）已同步，无「真实用户记忆外发仍禁止」残留；
4. 路线 B 未被误删，仍明确为未来产品化目标路线；
5. 方案 C 运行授权明确标注「未包含、需另次审批」；
6. required_reading 完整、决策登记日期与依据齐全。

## 15. 停止条件

- 发现产品代码/Schema/评测/权限被改动 → 立即 CHANGES_REQUESTED（BLOCKER）；
- 发现裁决落盘与实际裁决不一致、或方案 C 被误写为已获运行授权 → CHANGES_REQUESTED；
- 证据冲突无法收敛 → 停止并上报 Founder。

## 16. 完成后必须返回的材料

Review 结论（REVIEW_APPROVED 或 CHANGES_REQUESTED，逐项对标验收）、发现问题清单（分级 BLOCKER/MAJOR/MINOR）、过程合规检查结果、下一窗口唤醒卡。

## 17. 下一张交接卡要求

- 若 **REVIEW_APPROVED**：返回 Founder 合并裁决卡（目标角色 = Founder，附 Review 结论）；
- 若 **CHANGES_REQUESTED**：返回执行 Chief 交接卡（目标角色 = 执行 Chief 或原 Builder，只修被打回问题并更新证据，不得用新临时 Builder 替代）。
