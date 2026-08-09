# TASK-003｜四项复审交接包（合并准备终审）

> 交接角色：Chief of Staff → **新独立 Reviewer**
> 交接类型：合并前四项复审（Builder 已完成合并收尾；复审项 1 打回后已修复）
> 复审对象：`feature/task-003-eval-run-slice` @ `9bcfe9c`
> 复审范围：**只审四项，不审业务功能**（功能已由前五轮 Review 完成，最终报告 `review-report-final.md` 为 REVIEW_APPROVED）
> 日期：2026-08-10

---

## 0. Reviewer 提示词（可直接复制下发）

```
你是 TASK-003 合并前的独立 Reviewer（新会话，独立视角）。
任务：对 feature/task-003-eval-run-slice @ 9bcfe9c 做合并前四项复审。
只审下列四项，不做功能 Review（功能已 REVIEW_APPROVED，见
project-context/tasks/TASK-003/review-report-final.md）。

【复审项 1：文档与代码一致性】（重点：前次打回 5 处已修复，请复核 commit 9bcfe9c）
对照 eval/eval-contracts.md 与 v2/app/src/lib/ 下实际代码、v2/migrations/002/003_eval_fixes.sql，
逐项核实：数据模型列名/类型、API 路由路径、状态机语义是否与代码一致。
前次 5 处差异（已在 9bcfe9c 修正，复核点）：
1. eval_cases.created_at=TIMESTAMP（非 TIMESTAMPTZ；003 未转换该表）
2. judge 请求体={strong?, scores?, reason}（reason 必填；非 {override}）
3. human_override={strong, scores, reason, judged_at}
4. final_verdict 按 judge_type 变化：程序/LLM 保留候选字段；
   人工覆盖重建仅 {strong,scores,judge_type,notes}（契约 §1.3.1 已记录）
5. case_id 含 Txxx（from-trace）；source 含 manual（普通 POST）
发现新不一致 → 列差异并判 CHANGES_REQUESTED。

【复审项 2：无关文件检查】
git status --short 中所有未跟踪项（V3-Memory-评测效率工具-workspace/、
articles_batch*.txt、cards_batch*.txt、eval/cases-full.md、eval/llm-judge.md、
eval/shots-r4/）必须保持未跟踪、不得进入任何提交。
git diff master...HEAD --name-only 必须只含 TASK-003 业务文件。
发现混入 → 判 CHANGES_REQUESTED。

【复审项 3：契约覆盖】
确认 eval-contracts.md 覆盖：
- 新增表 3 个（eval_cases / eval_runs / eval_results）+ traces 终态协议 4 字段
- API 5 个（runs POST / runs GET / runs[id] GET / cases / cases/from-trace / results[id]/judge）
- Run 状态机：running → completed/failed；写入终态四态 pending/completed/failed/timeout；
  三态 PASS/FAIL/NOT_TESTED + absolute_status 优先级
- eval_user_id 持久化（Case 级隔离）
缺项 → 判 CHANGES_REQUESTED。

【复审项 4：可安全合并】
- git diff master...HEAD --stat：无代码功能变化超出已批准范围（预期仅 docs 类新增）
- 无新依赖（package.json diff 仅加 test script）
- 可 Rebase and merge，无冲突风险
- 不得自行合并/推送/部署

输出：逐项结论 + 最终 APPROVE / CHANGES_REQUESTED + 简短证据。
```

---

## 1. 复审目标与通过标准（交接包 §11）

| 复审项 | 通过标准 |
|---|---|
| 文档与代码一致性 | 契约文档描述的表/API/状态与代码实际一致 |
| 无关文件检查 | 无 Chrome profile、批量文本、无关截图进入提交 |
| 契约覆盖 | 新增表（3）、API（5）、状态机（running/completed/failed + 终态四态）全覆盖 |
| 可安全合并 | diff 干净、无代码功能变化、可 Rebase and merge |

## 2. 复审材料清单

| 材料 | 路径 | 用途 |
|---|---|---|
| 复审对象分支 | `feature/task-003-eval-run-slice` @ `9bcfe9c` | 待审提交 |
| 契约文档 | `eval/eval-contracts.md` | 一致性/覆盖对照基准 |
| 指标策略 | `eval/eval-policy-v1.md` | 关联策略（只读） |
| 最终功能 Review | `project-context/tasks/TASK-003/review-report-final.md` | 功能已 APPROVED 依据 |
| 收尾提交链 | `002e8b8`（文档归档）/ `4849b08`（元数据+契约）/ `aecb9ed`（标注）/ `9bcfe9c`（**复审项1 契约修正**） | 复审目标 |
| 前五轮交接包 | `reviewer-handoff-round3/4/5.md` | 历史打回背景（可选参考） |
| Chief 裁决 | `chief-decision-brief-v2.md` | CR-A/CR-C 范围依据 |

## 3. 代码事实定位（供逐项核对）

| 契约项 | 代码位置 |
|---|---|
| eval_cases 表 | `v2/migrations/002_eval.sql` |
| eval_runs 表 | `v2/migrations/002_eval.sql` |
| eval_results 表 | `v2/migrations/002_eval.sql` + `003`（eval_user_id）|
| traces 终态协议 | `v2/migrations/003_eval_fixes.sql` + `v2/app/src/lib/db.ts` finalizeTraceWrite |
| API runs POST/GET | `v2/app/src/app/api/eval/runs/route.ts` + `runs/[id]/route.ts` |
| API cases | `v2/app/src/app/api/eval/cases/route.ts` + `cases/from-trace/route.ts` |
| API results judge | `v2/app/src/app/api/eval/results/[id]/judge/route.ts` |
| Run 状态机 | `v2/app/src/lib/eval-db.ts`（running/completed/failed）|
| 写入终态四态 | `v2/app/src/lib/eval-runner.ts` waitForTraceWriteFinal |
| 三态 + absolute_status | `v2/app/src/lib/eval-types.ts` + `eval-program-rules.ts` |

## 4. 已执行的检查命令（Builder 自证，Reviewer 可复核）

```bash
git diff master...HEAD --stat          # 35 files, +6280/-16（收尾前）；+9bcfe9c 后仍纯 docs
git diff master...HEAD --name-only | grep -iE "V3-|workspace|batch|profile"  # 空=干净
grep -c "已被 B+ 修正" project-context/tasks/TASK-003/draft.md   # 1
git status --short                     # 未跟踪仅 V3-workspace/batch 等无关项
```

## 4.5 复审项 1 打回修复记录（2026-08-10，commit 9bcfe9c）

Reviewer 复审项 1 判 CHANGES_REQUESTED，指出 5 处契约与代码不一致。Builder 以**代码为准**修正契约（未动任何代码/迁移）：

| # | Reviewer 指出 | 代码事实（已核实）| 契约修正 |
|---|---|---|---|
| 1 | eval_cases.created_at 类型错误 | `002_eval.sql:23`=TIMESTAMP；`003` 未转换 eval_cases | 改回 TIMESTAMP + 注明未随 003 转换 |
| 2 | judge 请求体不一致 | `judge/route.ts:22` 读取 `{strong, scores, reason}`（reason 必填 400） | 改写实际格式，删除错误的 `{override}` |
| 3 | human_override 结构不一致 | `eval-types.ts:96`=`{strong, scores, reason, judged_at}` | 对齐实际类型 |
| 4 | 覆盖后 final_verdict 不保留候选字段 | `judge/route.ts:31` 重建仅 `{strong,scores,judge_type,notes}` | 新增 §1.3.1 字段矩阵 + absolute_status 适用范围注明 |
| 5 | case_id/source 枚举缺项 | from-trace 生成 `T###`；POST 默认 `manual` | 补 Txxx + manual |

修正后契约与代码逐项对齐，复审项 2/3/4 原结论不受影响。

## 5. Reviewer 输出格式

```text
## 复审项 1 结论（文档一致性）：APPROVE / CHANGES_REQUESTED
证据：…
## 复审项 2 结论（无关文件）：…
## 复审项 3 结论（契约覆盖）：…
## 复审项 4 结论（可安全合并）：…
## 最终结论：APPROVE / CHANGES_REQUESTED
## 建议动作：…
```

## 6. 红线（Reviewer 强制）

- ❌ 不修改代码、不修改文档（默认只审）
- ❌ 不合并 master、不推送、不部署
- ❌ 不扩大复审范围到业务功能（功能已终审）
- ✅ 发现契约与代码不一致 → 列证据并判 CHANGES_REQUESTED，交回原 Builder

## 7. 交接路径

```
Builder（收尾完成 @aecb9ed）
  → 本交接包 → 新独立 Reviewer（四项复审）
  → APPROVE → 用户（唯一有权合并）
  → [合并后] TASK-004/005/006/007 按序排期
```
