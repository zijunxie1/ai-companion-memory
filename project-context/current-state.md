# Current State｜项目当前状态快照

> 快照性质：工作状态索引，不替代 Git、代码、数据库、正式契约或任务裁决。
>
> 最近只读核验：2026-08-12（Asia/Shanghai）；核验人：successor-chief-2026-08-11-01（现任继任 Chief，本窗口为同角色恢复）
> 核验方式：本地 `git rev-parse` / `git log` / `git worktree list` / `git status` / `git ls-tree`、正式任务文件，以及 `E:\task-006-measurement-tmp\` 文件清单与元数据；本次未联网刷新远端、未查询数据库、未调用外部模型。
>
> 更新要求：重要状态变化、合并、部署、角色交接或上下文恢复后更新；不得提前写入未发生状态。

> 非自动更新：本文件只有在某个角色被 Founder 唤醒并实际写入时才会变化。每次读取必须重新用 Git 和任务文件核对。

> 上下文规则版本：`2026-08-10.4`

## 一句话状态

P1 已形成真实聊天、Memory、Trace 和 8 Case Eval 纵向闭环；TASK-005A 已合入默认主线并通过合并后主线 QA；E004 无关召回问题仍未解决，TASK-006 保持 `APPROVED`。Founder 已选择不外发用户数据的路线 B；外部模型 Gate 只保留为离线研究证据，下一步依次为治理同步、GOV-002 上下文护栏和本地 Gate Spike。项目未 CLOSED，未进行生产部署。

## Git 事实（2026-08-12 本窗口重新核验）

| 项 | 当前核验值 |
|---|---|
| 仓库 | `E:\正式作品`（主检出为历史 `feature/task-004-spike`，无 upstream，存在历史修改和未跟踪文件；本轮不触碰） |
| GitHub 默认分支 | `main`（此前 `gh` 实测；本次本地 `origin/HEAD` 仍指向 `origin/main`，未联网刷新） |
| `origin/main` | `0762a17c24ca6dbd1a03e9b1daa47f9ccf2fe9a6`（含 TASK-005A 治理收尾与 TASK-006 DRAFT v1.1 APPROVED） |
| `origin/master` | `064f5b6945b4b5f62075354270b3999edf1ca17a`（已被 main 完全吸收，保留为归档引用） |
| 分叉 | main 独有 36 / master 独有 0；merge-base = master HEAD（`064f5b6`） |
| 当前治理分支 | `codex/task-006-governance-sync`（Worktree `E:/task-006-governance-sync-worktree`，自 origin/main @ `0762a17` 创建；只允许本次四文件治理同步） |
| TASK-006 规划分支 | `feature/task-006-draft` @ `982d8a1`（Worktree `E:/task-006-plan-worktree`，干净；历史规划分支，DRAFT 已另以 `0762a17` 进入 origin/main） |
| TASK-006 实施分支 | `feature/task-006-e004-gate` 仅指向 origin/main @ `0762a17`；无实施 Worktree、无产品实现差异 |
| 其他 Worktree | `E:/gov-001-worktree` 干净；`E:/gov-001b-worktree` 干净；`E:/gov-001c-worktree` 有历史治理改动；`E:/task-005a-worktree` 干净；全部保持不动 |

主线已收敛为 `main`；`master` 是 `main` 的祖先。禁止 force push。本轮治理分支不承载产品代码。

## 任务状态

| 工作项 | 当前状态 | 准确说明 |
|---|---|---|
| TASK-001 | CLOSED | Dify V1 Workflow 已完成 |
| TASK-002 | CLOSED | 真实 Memory 闭环；`ef3edb2` 可由 `origin/main` 追溯 |
| TASK-003 阶段 1 | 完成 | Baseline、Bad Case、After Baseline 与灰度方案 |
| TASK-003 阶段 2 | MERGED | 8 Case 真实 Eval 工具已实现并复审；已合入默认 `main`（不等于 P1 CLOSED） |
| TASK-004 | DRAFT / PAUSED | 三轮 Spike 未达标；物理删除有效，但未来可能重新抽取；不得降低 E006 标准或宣称删除 Case 100% 通过 |
| GOV-001 | GOV-001A：MERGED；GOV-001B：MERGED | 主线收敛和治理文件入库已完成 |
| TASK-005A | MERGED（QA_APPROVED_MAINLINE） | PR #8 @ `4f93fa6` 已合并并完成本地/测试主线 QA；Run #28 证明快照能力，E004 FAIL 如实记录；未进行生产部署，是否 CLOSED 待后续裁决 |
| TASK-006 | **APPROVED** | DRAFT v1.1 已入库；E004 缺陷仍存在。Founder 已批准路线 B（不外发用户数据的本地/规则/检索路线）；外部 Gate 不进入产品。临时计划 v1.4 与 CR-01 v1.2 均未批准；没有产品代码、实施 Worktree或正式 Reviewer 报告；任务不进入 IN_PROGRESS |
| GOV-002 | 未开始（规划基础已获 Founder 同意） | 候选任务：上下文完整性护栏；必须单独形成正式 DRAFT、分支、PR 和 Review，不在本轮实现 |
| TASK-006 本地 Gate Spike | 未开始（规划基础已获 Founder 同意） | 候选独立 Spike；不得外发用户数据，不接入产品；必须在 GOV-002 后单独批准和执行 |
| TASK-007 | 未开始 | `3000` 吸收 V2 Design Spec 与 `8765` 设计母版 |
| TASK-005B | 未开始 | Persistent Eval Runner |

## 已确认主线顺序

```text
GOV-001 → TASK-005A → TASK-006 → TASK-007 → TASK-005B
→ 20 Case / Bad Case 完整度 → CR-B（有真实需要时）
```

TASK-006 内部当前规划顺序：

```text
当前事实同步 → GOV-002 上下文完整性护栏 → 本地 Gate Spike
→（Spike 通过后）新 Change Request + 新实施计划 + Founder 批准
→ 产品实现与独立 Review
```

该内部顺序不改变项目主线；TASK-006 未完成时，不默认绕过它启动 TASK-007 或 TASK-005B。

## 当前阻断与已知限制

1. **E004 产品问题未解决**：Run #28 天气话题召回失眠 0.431、橘猫 0.360 两条无关 Memory，回复被污染；
2. 简单阈值证据不能可靠分离相关与无关候选；外部 Gate 虽有正向离线分类证据，但隐私、严格墙钟延迟、失败回退和证据治理未满足产品化要求；
3. 外部 Gate v6 最大墙钟耗时 4063ms，不得写成通过 4000ms；超时 keep-all 回退会恢复 E004 缺陷；
4. BL-2 低于产品 0.35 粗筛阈值，不计入产品可见 Gate 指标；成本文字与原始 JSON 有数字不一致；离线脚本存在版本、默认参数和覆盖输出风险；
5. `implementation-plan.md` v1.4 和 `TASK-006-E004GATE-CR-01.md` v1.2 只在临时目录存在，未批准、未入库；
6. Reviewer 第四轮结论未发现正式入库报告；聊天或临时材料不得写成正式 `CHANGES_REQUESTED`；
7. 当前敏感信息程序规则覆盖有限，不能据此自行认定其他敏感类别可外发；本路线不作法律合规结论；
8. TASK-004、TASK-007、TASK-005B、20 Case、完整 Bad Case 和最终 Release / QA 仍未完成；P1 未 CLOSED。

## 当前建议动作

1. 完成本次四文件纯治理同步，形成可审查 diff；
2. 由独立 Reviewer 只审查治理事实、状态准确性、分支边界和是否误写产品完成；
3. Founder 决定是否合并治理 PR；
4. 合并后再单独起草 GOV-002；GOV-002 完成后再起草本地 Gate Spike；
5. 在 Founder 另行批准前，不启动任何产品实现或后续主线任务。

## 下一窗口唤醒卡（当前建议）

- **目标角色**：独立 Reviewer（仅在本治理分支形成可审查提交/PR且 Founder 决定唤醒后）。
- **本次只需要它完成**：核对四文件 diff 是否只记录已发生事实，TASK-006 是否保持 APPROVED，路线 B 是否被准确表述为“无用户数据外发的待验证路线”，以及是否错误宣称产品已修复。
- **不得执行**：修改文件、产品实现、外部补测、任务状态变化、合并或部署。
- **必须阅读**：`AGENTS.md`、`context-manifest.md`、本文件、`decision-register.md`、`project-mainline-roadmap.md`、TASK-006 `draft.md` 与 `route-b-decision.md`、完整 diff。
