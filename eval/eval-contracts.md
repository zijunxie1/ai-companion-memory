# Eval 数据模型 / API / Run 状态契约（TASK-003 阶段2）

> 文档类型：**正式契约**（记录已合并并生效的实现事实，依据 AGENTS.md 红线 #2）
> 事实来源：`v2/migrations/002_eval.sql`、`v2/migrations/003_eval_fixes.sql`（均已应用）、
>           `v2/app/src/lib/eval-db.ts`、`eval-runner.ts`、`eval-program-rules.ts`、`eval-types.ts`
> 更新规则：本契约只记录已生效实现。任何 schema/API/状态机变更必须同步更新本文件，禁止契约与代码漂移。
> 关联策略文档：`eval/eval-policy-v1.md`（指标治理模板，版本化）

---

## 1. 数据模型（PostgreSQL，库 ai_companion）

### 1.1 eval_cases — Case 定义库

| 列 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| case_id | VARCHAR(32) UNIQUE | 人类可读 ID：E001-E008（种子）/ Cxxx / BCxxx（Bad Case 转） |
| title | VARCHAR(255) | 标题 |
| category | VARCHAR(32) | core / adversarial / safety |
| test_target | TEXT | 测试目标 |
| input_text | TEXT | 用户输入 |
| preconditions | JSONB | 前置条件 `[{type:"seed_chat"\|"delete_memory", value:"..."}]` |
| expected | TEXT | 预期行为 |
| pass_criteria | JSONB | 通过标准 `{strong:[...], program:{...}, llm:{...}}` |
| eval_type | VARCHAR(16) | program / llm / human / mixed |
| source | VARCHAR(32) | seed / baseline / bad-case / trace |
| source_bad_case | VARCHAR(64) | 关联 Bad Case ID |
| is_active | BOOLEAN | 启用标记 |
| created_at | TIMESTAMPTZ | 创建时间 |

### 1.2 eval_runs — 评测运行

| 列 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| run_number | SERIAL UNIQUE | 人类可读序号 Run #N |
| status | VARCHAR(16) | running / completed / failed（见 §3 状态机） |
| config_snapshot | JSONB | 模型/Prompt 哈希/阈值/top_k/异步模式全量快照（Run 绑定不可变） |
| policy_version | VARCHAR(32) | 绑定的 Eval Policy 版本（默认 v1.0） |
| case_set_version | VARCHAR(32) | Case 集版本（默认 8-case-v1） |
| summary | JSONB | `{gsb:{good,same,bad,total}, strong:{...}, absolute:{pass,fail,not_tested}, score_avg}` |
| error | TEXT | 失败原因 |
| started_at / completed_at / created_at | TIMESTAMPTZ | 时间语义：UTC 存储、本地显示（003 迁移统一） |

### 1.3 eval_results — 单 Case 结果

| 列 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| run_id | UUID FK→eval_runs | 所属 Run（级联删除） |
| case_id | UUID FK→eval_cases | Case |
| case_snapshot | JSONB | 运行时 Case 快照（Case 后续修改不影响历史 Run） |
| user_input / ai_reply | TEXT | 输入 / 回复 |
| used_memory | JSONB | 本轮召回（含打分证据） |
| recall_reason | TEXT | 召回理由 |
| memory_writes | JSONB | 本轮实际写入 |
| latency_ms | INTEGER | 耗时 |
| program_verdict | JSONB | 程序判定 `{strong:{...}, checks:[{name,status,detail,evidence}]}` |
| llm_judge | JSONB | LLM 候选 `{dimensions:{...}, overall_reasoning}` |
| human_override | JSONB | 人工覆盖 `{verdict, reason, judged_at}` |
| final_verdict | JSONB | 最终判定 `{strong, scores, judge_type, notes, program_failed, program_failures, absolute_status, write_state}` |
| judge_type | VARCHAR(16) | program / llm / human（最终来源） |
| gsb | VARCHAR(8) | Good / Same / Bad / NULL（首次 Run 无对比） |
| **eval_user_id** | VARCHAR | **Case 级独立 eval 用户**（`eval-<runShort>-<case>-<rand>`，审计隔离） |
| created_at | TIMESTAMPTZ | 创建时间 |

### 1.4 traces（产品表，003 扩展）— 写入终态协议

| 列 | 类型 | 说明 |
|---|---|---|
| write_status | VARCHAR NOT NULL | **pending / completed / failed**（CHECK 约束） |
| write_completed_at | TIMESTAMPTZ | 终态时间 |
| write_error | TEXT | failed 时的错误 |
| write_disposition | VARCHAR | written / no_write / **skipped_crisis**（CHECK 约束；危机拦截 CR-A） |
| memory_writes | JSONB | 实际写入内容（completed 后回填） |

> 终态协议（CR-C）：评测侧**不得用 memory_writes 非空/差值猜测终态**，
> 只认 `write_status` 状态机轮询；超时按 NOT_TESTED 处理（见 §3.2）。

---

## 2. API 契约

### 2.1 触发 Run

```
POST /api/eval/runs
```
- 单 Run 互斥：已有 running Run → 409（禁止并发）
- 返回 `{run: {id, run_number, status:"running"}}`

### 2.2 Run 列表 / 详情

```
GET /api/eval/runs?limit=N        → {runs: [...]}
GET /api/eval/runs/[id]           → {run: {...}, results: [...]}
```

### 2.3 人工覆盖重算

```
POST /api/eval/results/[id]/judge
body: { override: {verdict, reason} }   # verdict: PASS | FAIL
```
- 更新 human_override + final_verdict.judge_type=human + gsb 重算 + summary 重聚合
- **completed_at 不回写**（避免 recalc 时间漂移，Reviewer #4 修复）

### 2.4 Case 管理

```
GET/POST /api/eval/cases
POST /api/eval/cases/from-trace     # Trace 转回归 Case
```

---

## 3. Run 状态机

### 3.1 Run 生命周期

```text
(running) ──全部 Case 完成──▶ (completed)
    │
    └──执行异常──▶ (failed)   # error 记录原因
```

- 互斥：同一时刻最多一个 running Run（409）
- GSB 对比基准：上一次 **completed** 的 Run（同 Case 逐条对比）

### 3.2 Trace 写入终态（每 Case 内）

```text
pending ──mem0.add 完成──▶ completed (+disposition: written|no_write|skipped_crisis)
   │
   └──异常──▶ failed (+write_error)
   └──轮询超时(90s)──▶ timeout（评测侧：该 Case 写入按 NOT_TESTED 处理）
```

### 3.3 判定三态与绝对状态优先级

```text
规则判定：PASS | FAIL | NOT_TESTED（证据缺失=NOT_TESTED，不算 FAIL）

absolute_status 优先级（高→低）：
  强约束 FAIL > 强约束 NOT_TESTED > 普通程序规则 FAIL > PASS
```

- E006 删除合规 = 三项检查：deletion_no_recall（used_memory）/ deletion_no_reply_leak（ai_reply）/ deletion_no_rewrite（memory_writes）；write timeout/failed 时 deletion_no_rewrite 必 NOT_TESTED
- E007 危机表达 = skipped_crisis（不写入长期 Memory，CR-A）

---

## 4. 契约与代码一致性自查（新独立 Reviewer 复审用）

| 契约项 | 代码位置 | 一致 |
|---|---|---|
| eval_cases 三表结构 | `002_eval.sql` | ✅ |
| 终态协议 4 字段 | `003_eval_fixes.sql` + `db.ts finalizeTraceWrite` | ✅ |
| TIMESTAMPTZ | `003_eval_fixes.sql` | ✅ |
| eval_user_id 持久化 | `003` + `eval-db.ts insertEvalResult` | ✅ |
| API 5 路由 | `api/eval/*`（runs ×2、cases ×2、results judge ×1） | ✅ |
| 状态机 running/completed/failed | `eval-db.ts` | ✅ |
| 终态四态 pending/completed/failed/timeout | `eval-runner.ts waitForTraceWriteFinal` | ✅ |
| 三态 + absolute_status | `eval-types.ts` / `eval-program-rules.ts` | ✅ |
