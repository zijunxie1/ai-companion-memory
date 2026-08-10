# Current State｜项目当前状态快照

> 快照性质：工作状态索引，不替代 Git、代码、数据库、正式契约或任务裁决。
>
> 最近只读核验：2026-08-11（Asia/Shanghai）；核验人：successor-chief-2026-08-11-01（本窗口继任 Chief）
> 核验方式：git rev-parse / git worktree list / gh pr view 8 / QA Worktree 状态 / Run #28 数据库记录（eval_runs、eval_results、traces）
>
> 更新要求：重要状态变化、合并、部署、角色交接或上下文恢复后更新；不得提前写入未发生状态。

> 非自动更新：本文件只有在某个角色被 Founder 唤醒并实际写入时才会变化。每次读取必须重新用 Git 和任务文件核对。

> 上下文规则版本：`2026-08-10.4`

## 一句话状态

P1 已形成真实聊天、Memory、Trace 和 8 Case Eval 纵向闭环；TASK-005A（Config Snapshot Completeness）已于 2026-08-11 合入默认主线并通过合并后主线 QA（QA_APPROVED_MAINLINE，Run #28）；E004 无关召回问题已进入 TASK-006（DRAFT v1.1 已批准，任务 APPROVED，执行模式门待确认）；项目处于产品收敛阶段，未 CLOSED，未进行生产部署。

## Git 事实（2026-08-11 本窗口重新核验）

| 项 | 当前核验值 |
|---|---|
| 仓库 | `E:\正式作品`（主检出，历史分支 feature/task-004-spike，本窗口不触碰） |
| GitHub 默认分支 | `main`（gh repo view 实测） |
| `origin/main` | `4f93fa6`（2026-08-11 06:37 Asia/Shanghai，PR #8 TASK-005A Rebase 合并；mergeCommit=4f93fa6，baseRefName=main） |
| `origin/master` | `064f5b6`（已被 main 完全吸收，保留为归档引用；退役按 D-MASTER-RETIRE 单独裁决） |
| 分叉 | main 独有 34 / master 独有 0；merge-base = master HEAD（`064f5b6`）——master 完全包含于 main |
| 当前规划分支 | `feature/task-006-draft`（规划 Worktree `E:/task-006-plan-worktree`，自 origin/main @ 4f93fa6 创建；治理同步 + TASK-006 DRAFT 未提交） |
| 既有 Worktree | `E:/task-005a-qa-worktree`（detached @ 4f93fa6，干净）；`E:/task-005a-worktree`（feature/task-005a-config-snapshot，干净）；`E:/gov-001-worktree` / `gov-001b` / `gov-001c`（GOV-001 历史）；全部保持不动 |
| 工作区 | 规划 Worktree 待编辑（未提交）；QA Worktree 干净；主检出历史遗留未清理 |

主线已收敛：`main`（`4f93fa6`）含 GOV-001A/B、TASK-003 阶段 2 与 TASK-005A；`master` 已是 main 的祖先。禁止 force push。

## 任务状态

| 工作项 | 当前状态 | 准确说明 |
|---|---|---|
| TASK-001 | CLOSED | Dify V1 Workflow 已完成 |
| TASK-002 | CLOSED | 真实 Memory 闭环；`ef3edb2` 可由 `origin/main` 追溯 |
| TASK-003 阶段 1 | 完成 | Baseline、Bad Case、After Baseline 与灰度方案 |
| TASK-003 阶段 2 | MERGED | 8 Case 真实 Eval 工具已实现并复审；已随 PR #5 合入默认 `main`（不 CLOSED，P1 整体未完成） |
| TASK-004 | DRAFT / PAUSED | 三轮 Spike 未达标；物理删除有效，但未来可能重新抽取；不得宣称删除 Case 100% 通过 |
| GOV-001 | GOV-001A：MERGED（PR #5）；GOV-001B：MERGED（PR #6） | 主线收敛 + 治理文件入库全部完成 |
| TASK-005A | **MERGED**（合并后主线验证结论：QA_APPROVED_MAINLINE） | PR #8 @ `4f93fa6` 已于 2026-08-11 06:37（Asia/Shanghai）Rebase 合并；合并后主线 QA 通过（QA Worktree `E:/task-005a-qa-worktree`，基线 origin/main @ 4f93fa6；Run #28 completed，E001—E008 全链路真实执行无新增执行错误，快照 16 字段及来源真实验证，历史 Run 兼容，/api/chat 无回归）；E006 deletion PASS、E007 safety PASS、E004 无关召回 FAIL（2 条，允许 ≤1）如实记录；**未进行生产部署**；是否 CLOSED 按状态机后续裁决，不自行发明 |
| TASK-006 | **APPROVED**（DRAFT v1.1 已批准，执行模式门待确认） | E004 无关召回 Gate；DRAFT v1.1 已起草于 `feature/task-006-draft` 并获 Founder 批准（2026-08-11，任务方案 Review 通过，进入 APPROVED）；暂不启动 Builder、不实现；执行模式门与入库授权待 Founder 确认 |
| TASK-007 | 未开始 | `3000` 吸收 V2 Design Spec 与 `8765` 设计母版 |
| TASK-005B | 未开始 | Persistent Eval Runner |

## 已确认主线顺序

```text
GOV-001 → TASK-005A → TASK-006 → TASK-007 → TASK-005B
→ 20 Case / Bad Case 完整度 → CR-B（有真实需要时）
```

具体任务仍须逐一经历 DRAFT、Founder 批准、Builder 计划、实现、独立 Review、合并和验证。

## 当前阻断与已知限制

1. TASK-005A 已合并并通过主线 QA（QA_APPROVED_MAINLINE）；后续任务状态须保持与 Git 同步；
2. TASK-003 元数据已与远端对齐（MERGED @ `4baabf0`）；
3. Config 快照部分字段按契约语义为 `unavailable + reason`（chat_model / embed_model / chatflow_version / extract_model，属 TASK-005A 已批准口径，非缺陷）；
4. **E004 存在无关 Memory 召回**（Run #28：天气话题召回失眠 0.431 / 橘猫 0.360 两条无关，且回复被污染）——TASK-006 待解决的产品问题；
5. 删除后未来重新抽取尚无满足零误删和至少 90% 召回的轻量方案（TASK-004 PAUSED）；
6. `3000` 尚未完整吸收 `8765` 的 V2 视觉与信息架构；
7. Eval Runner 仍缺持久化执行与中断恢复（TASK-005B）；
8. 产品标准中的 20 Case、完整 Bad Case 流程和最终 Release/QA 尚未完成；
9. 本任务（TASK-005A）未进行生产部署；P1 未 CLOSED。

## 当前建议动作

1. ✅ TASK-006 DRAFT v1.1 已获 Founder 批准（2026-08-11，任务进入 APPROVED）；
2. Founder 确认执行模式（建议 HANDOFF REQUIRED 长期 Builder 会话）与治理文件入库授权（6 改 2 新，方案见 Chief 输出）；
3. 入库后（获得授权时）由 Founder 合并；随后唤醒长期 Builder 会话（先交实施计划，再实现）；
4. master 退役按 D-MASTER-RETIRE 单独裁决（不阻塞主线）。

## 下一窗口唤醒卡（当前建议）

- **目标角色**：长期 Builder 会话（TASK-006｜Builder｜E004 无关召回 Gate，HANDOFF REQUIRED）。
- **Founder 何时发送**：执行模式已确认（HANDOFF REQUIRED，2026-08-11）且规划文档 PR 合并后。
- **本次只需要它完成**：先提交实施计划（含 §3.1 测量定义要求的 ≥3 轮测量结果与方案选择依据），经 Review 2 后再实现；不改评测判定规则、不部署、不触密钥；holdout 不可行时停止并提交 Change Request。
- **必须附带**：`AGENTS.md`、`context-manifest.md`、本文件、`decision-register.md`、TASK-006/draft.md（v1.1，APPROVED）、TASK-005A 全套任务文件与 release-qa-report.md、规划文档 PR diff。
