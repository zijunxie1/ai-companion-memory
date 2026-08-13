# Current State｜项目当前状态快照

> 快照性质：工作状态索引，不替代 Git、代码、数据库、正式契约或任务裁决。
>
> 最近只读核验：2026-08-13（Asia/Shanghai）；核验人：operational-chief-2026-08-12-01（执行 Chief）
> 核验方式：本地 `git fetch origin main` / `git rev-parse` / `git log` / `git worktree list` / `git status` / `git ls-tree`、正式任务文件、`gh pr list` / `gh pr view`，以及 `E:\task-006-research-tmp\` 公开调研材料；未查询数据库、未调用外部模型。
> 本快照以本次核验时的 `origin/main @ 6660ca2` 为基础；GOV-CHIEF-001、GOV-COMM-001、GOV-002（含合并后修正 PR #15）、TASK-006 第一/二轮 Spike、第三轮规划（PR #19）均已合入。每次读取仍须重新核验远端主线，快照不会自动更新。
>
> 更新要求：重要状态变化、合并、部署、角色交接或上下文恢复后更新；不得提前写入未发生状态。

> 非自动更新：本文件只有在某个角色被 Founder 唤醒并实际写入时才会变化。每次读取必须重新用 Git 和任务文件核对。

> 上下文规则版本：`2026-08-12.2`

## 一句话状态

P1 已形成真实聊天、Memory、Trace 和 8 Case Eval 纵向闭环；TASK-005A 已合入默认主线并通过合并后主线 QA；PR #10、PR #11 与 GOV-COMM-001 治理同步均已合并（GOV-COMM-001 合并提交为 `3412c3c`，状态同步 `980bfa5`）。E004 无关召回问题仍未解决，TASK-006 保持 `APPROVED`。Founder 已选择不外发用户数据的路线 B；**方案 C（外部大模型相关性裁判）已获有条件授权作合成数据效果上限对照（DeepSeek、≤100 次/≤10 元），待 S0.3 连通检查；真实用户记忆外发仍禁止**。Chief 角色已按 Founder 裁决拆分为执行 Chief / 决策 Chief（GOV-CHIEF-001 已合入）；GOV-COMM-001、GOV-002（含合并后修正 PR #15 @ `5de2714`）均已合并。TASK-006 本地 Gate Spike 第一轮 STOPPED/FAILED、第二轮候选 A 因无重排权重只停候选 A／候选 B 暂停；**第三轮「检索后相关性判断」对照 Spike 已批准（DRAFT v1.1 + 执行模式 persistent_session），方案 B-1 `bge-reranker-base` 已下载核验完成，下一步 = 先执行 S0.3 方案 C 连通检查，通过后进入 S1 冻结**。项目未 CLOSED，未进行生产部署。

## Git 事实（2026-08-13 执行 Chief 重新核验）

| 项 | 当前核验值 |
|---|---|
| 仓库 | `E:\正式作品`（主检出为历史 `feature/task-004-spike`，无 upstream，存在历史修改和未跟踪文件；本轮不触碰） |
| GitHub 默认分支 | `main`（此前 `gh` 实测；本次本地 `origin/HEAD` 仍指向 `origin/main`，核验以 `git fetch origin main` 结果为准） |
| `origin/main`（本次核验快照） | `6660ca2`（PR #19 第三轮规划已合并，2026-08-12；含 GOV-002 合并后修正 PR #15 `5de2714`、TASK-006 第一/二轮 Spike；读取时必须重新核验最新 tip） |
| `origin/master` | `064f5b6`（已被 main 完全吸收，保留为归档引用） |
| 分叉 | main 独有 44+ / master 独有 0（merge-base = master HEAD `064f5b6`） |
| PR #10 治理同步 | **已完成**：`codex/task-006-governance-sync` 分支四文件治理同步已 Rebase 合并进 `origin/main`（2026-08-12 00:34 Asia/Shanghai） |
| PR #11 GOV-CHIEF-001 | **已合并**：执行/决策 Chief 角色拆分与状态校准已 Rebase 合并进 `origin/main`（治理提交 `a420b62` + 3 个状态同步提交，最终 `42786da`） |
| 治理任务分支 | `codex/gov-chief-001` 已合并（PR #11，REVIEW_APPROVED → MERGED） |
| GOV-COMM-001 | **已合并**：沟通与交接规范经独立复审 REVIEW_APPROVED（0/0/0）后 Rebase 合并进 `origin/main`（`3412c3c`）；源分支仅作历史引用，不再承载当前工作 |
| GOV-002 | **已合并（含合并后修正 PR #15）**：PR #14 @ `011168f` + 合并后修正 PR #15 @ `5de2714`（A 类遗留 MA1/M1—M4 + B 类展示结构，统一治理版本 2026-08-12.2）均已 Rebase 合并进 `origin/main`；PR #15 状态 MERGED，不再待复审 |
| TASK-006 规划分支 | `feature/task-006-draft` @ `982d8a1`（Worktree `E:/task-006-plan-worktree`，干净；历史规划分支，DRAFT 已以 `0762a17` 进入 origin/main） |
| TASK-006 实施分支 | `feature/task-006-e004-gate` 指向 `0762a17`（历史分支，未推进；无实施 Worktree、无产品实现差异） |
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
| GOV-CHIEF-001 | **MERGED** | 执行 Chief / 决策 Chief 角色拆分与状态校准；PR #11 已 Rebase 合并（`42786da`），REVIEW_APPROVED → MERGED，正式治理事实 |
| GOV-COMM-001 | **MERGED** | 沟通与交接规范；Review 1 已批准、delegated 已同意、Review 2 已批准（2026-08-12）；已完成 **14 个文件**（8 个现有治理文件 + 1 个新模板 + 3 份正式规划文件 + 2 份过程证据文件），V1—V9 验证通过；最终独立复审 **REVIEW_APPROVED（0/0/0）**后，已 Rebase 合并进 `origin/main`（`3412c3c`）。未进行部署，纯治理规则已成为正式主线事实 |
| GOV-002 | **MERGED（含合并后修正）** | 上下文完整性护栏；DRAFT v1.2 已批准（2026-08-12）、delegated 已确认、Review 2 实现计划已批准；PR #14 已 Rebase 合并（`011168f`）；合并后修正 PR #15（`5de2714`，A 类遗留 MA1/M1—M4 + 状态同步 + B 类展示结构）**已 Rebase 合并，状态 MERGED，不再待复审**；统一治理版本 2026-08-12.2（见 D-GOV-002-POSTMERGE） |
| TASK-006 本地 Gate Spike | 第一轮 **STOPPED/FAILED**；第二轮候选 A 只停候选 A、候选 B 暂停；**第三轮「检索后相关性判断」对照 Spike APPROVED，执行模式已确认，B-1 已下载核验完成，下一步 = S0.3 方案 C 连通检查** | 第一轮两候选均失败已收尾（PR #17 合并）。**第二轮**：候选 A（cross-encoder 方向）因 P5-A 无 reranker 权重缓存只停候选 A，候选 B（k-means）Founder 指示暂停。**第三轮**：Founder 批准 DRAFT v1.1——方案 A 零新增依赖基线 / 方案 B 本地 Cross-Encoder 方向 / 方案 C 外部大模型效果上限对照；主实验（固定候选池判断器对比）与补充实验（Mem0 阈值端到端）分表；完成度分档（B/C 未授权只能形成部分证据）；关键记忆防漏独立门。**当前进展**：规划 PR #19 已合并（`6660ca2`）；执行模式 = persistent_session 已确认（D-T006-R3-EXEC）；**方案 B-1 `bge-reranker-base` 已批准并下载核验完成**（固定版本 `2cfc18c`、仅 ONNX 实测 1.13GB≤1.2GB、SHA-256 一致、最小推理通过，D-T006-R3-B-MODEL）；**方案 C 已授权、待 S0.3 连通检查**（仅合成数据、DeepSeek、≤100 次/≤10 元、零真实数据，D-T006-R3-C-EXT）。**下一步**：先执行 S0.3 方案 C 连通检查，通过后进入 S1 冻结，失败则只停 C（A/B 独立继续）。**仍禁止**：真实用户记忆外发、v2-m3 下载、torch/sentence-transformers 等新依赖；见 D-T006-R3-SPIKE / -EXEC / -B-MODEL / -C-EXT |
| TASK-007 | 未开始 | `3000` 吸收 V2 Design Spec 与 `8765` 设计母版 |
| TASK-005B | 未开始 | Persistent Eval Runner |

## 已确认主线顺序

```text
产品主线：GOV-001 → TASK-005A → TASK-006 → TASK-007 → TASK-005B
→ 20 Case / Bad Case 完整度 → CR-B（有真实需要时）
```

治理任务顺序（TASK-006 内部前置治理，2026-08-12 Founder 裁决，不改变产品任务顺序）：

```text
GOV-CHIEF-001 角色拆分与状态校准 → GOV-COMM-001 沟通与交接规范 → GOV-002 上下文完整性护栏
```

TASK-006 内部后续规划顺序：

```text
（治理顺序完成后）本地 Gate Spike
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

1. GOV-002 已实施并合并（PR #14 @ `011168f`）；合并后修正 PR #15 已并入 origin/main（`920ae72`/`5de2714`，统一治理版本 2026-08-12.2）；
2. **TASK-006 第三轮 Spike 已进入 S0.3 前状态（2026-08-13）**：规划 PR #19 已合并（`6660ca2`）；执行模式 persistent_session 已确认；方案 B-1 `bge-reranker-base` 已批准并下载核验完成（`2cfc18c`，实测 1.13GB，实施分支 `5653240`）；方案 C 已授权（仅合成数据、DeepSeek、≤100 次/≤10 元）、待 S0.3 连通检查。**下一步**：长期 Builder 先执行 **S0.3 方案 C 连通检查**（通过后进入 S1，失败则只停 C，A/B 独立继续）；流程统一为 **S1 冻结 → S2/S3 校准集核验与标注 → S4/S4.5 主实验+补充实验 → S5 机制冻结 → S6 holdout 一次性运行并清理 → S7 延迟/资源/费用 → S8 网络审计 → S9 报告**；
3. 在 Founder 另行批准前，不启动任何产品实现或后续主线任务；真实用户记忆外发、v2-m3 下载、torch/sentence-transformers 新依赖继续禁止。

## 下一窗口唤醒卡（当前建议）

- **目标角色**：长期 Builder（本 persistent_session 会话继续）。
- **本次唯一目标**：先执行 S0.3 方案 C 连通检查（通过后进入 S1 冻结统一候选池与 holdout，失败则只停 C）。
- **不得执行**：A/B/C 提前查看 holdout；真实用户数据；超授权外部调用（C 限 DeepSeek 白名单、≤100 次/≤10 元）；v2-m3 或其他模型下载；安装 torch/sentence-transformers。
- **必须阅读**：`tasks/TASK-006/spike-r3-candidate-draft.md`（v1.1）、`tasks/TASK-006/spike-r3/implementation-plan.md`（§7 S0.3/S1）、`tasks/TASK-006/spike-r3/model-facts.md`、本文件、`decision-register.md`（D-T006-R3-B-MODEL / -C-EXT）。
