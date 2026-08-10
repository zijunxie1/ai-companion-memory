# TASK-005A｜Config Snapshot Completeness — 结构化实现报告（Review 3 复审版）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-005A/draft.md（v2.1）
  - project-context/tasks/TASK-005A/implementation-plan.md（v1.1）
  - eval/eval-contracts.md
  - eval/eval-policy-v1.md
task_id: TASK-005A
status: IN_REVIEW（Review 3 第三轮 CHANGES_REQUESTED 已修复并推送，PR #8 等待下一轮复审）
execution_mode: persistent_session（HANDOFF REQUIRED）
assigned_role: Builder
branch: feature/task-005a-config-snapshot
baseline: origin/main @ c242338
report_version: v1.4（2026-08-11；v1.3 + Review 3 第三轮治理修正轮）
```

---

## 1. 本轮（Review 3 修复轮）变更清单

| # | Review 意见 | 修复 | 验证 |
|---|---|---|---|
| 1 | WRITE_MODE 影子配置 | chat/route.ts Step 8 写入路径由 `if (WRITE_MODE === "async")` 实际控制（产品与快照共同消费同一只读来源，async 行为不变） | T12a/T12b（import + 分支断言 + 常量值） |
| 2 | case_set_version 来源 | 默认值 → code；POST 请求参数覆盖 → declared（runs/route.ts 传覆盖标志） | T10h 两路径；集成核验 |
| 3 | 新快照停止写 persona_prompt_hash | buildSnapshot 只写 persona_data_hash；类型改可选；展示层旧键归并保留 | T10g/T13；DB 集成测试断言 |
| 4 | 历史 Run 详情页四列 | runs/[id]/page.tsx 新增 ConfigSnapshotCard（共用 buildSnapshotDisplayRows，旧格式未知来源） | T13；build/lint/tsc |
| 5 | 数据库独立列写入测试 | 新增 eval-db-integration.test.ts（**调用生产 createEvalRun/getEvalRun**，查询真实落库行，断言独立列字符串，finally 清理；不用自拼 INSERT） | 44/44 全绿含此测试 |
| 6 | 治理事实 | current-state Git 主线版本（c242338）、draft 状态（IMPLEMENTED + 执行模式）、decision-register 待决矛盾清除、embed_model 最终语义（unavailable+reason，非 declared） | 文件核对 |
| 7 | 实现报告落盘 | 本文件 | — |
| 8 | 提交推送 + PR + 复审 | 见 §7 | — |

## 2. 实际修改文件（相对 origin/main 基线完整清单）

```text
新增：
  v2/app/src/lib/memory-config.ts           共享只读配置（0.35 / 5 / async）
  v2/app/src/lib/eval-snapshot-core.ts      快照纯逻辑核心（零 Node 内置依赖）
  v2/app/src/lib/eval-hash.ts               hashContent（crypto）
  v2/app/src/lib/eval-extract-prompt.ts     extract prompt 文件读取（repository source）
  v2/app/src/lib/eval-snapshot-core.test.ts 快照核心测试（T1-T10）
  v2/app/src/lib/eval-snapshot-compat.test.ts 展示兼容测试（T4-T13）
  v2/app/src/lib/eval-db-integration.test.ts 数据库独立列集成测试
  project-context/tasks/TASK-005A/          draft.md / implementation-plan.md / 本报告

修改：
  v2/app/src/lib/eval-types.ts              类型扩展（SnapshotMeta/来源/新字段）
  v2/app/src/lib/eval-config.ts             采集层重构（结构化 + meta + 哈希）
  v2/app/src/lib/eval-llm-judge.ts          导出 JUDGE_SYSTEM_PROMPT；import 显式 .ts
  v2/app/src/lib/eval-runner.ts             删除 user_isolation 静默追加
  v2/app/src/app/api/chat/route.ts          共享常量引用（0.35/5） + WRITE_MODE 消费
  v2/app/src/app/api/eval/runs/route.ts     case_set_version 覆盖标志传递
  v2/app/src/app/eval/page.tsx              Config 区 4 列
  v2/app/src/app/eval/runs/[id]/page.tsx    ConfigSnapshotCard 4 列（历史兼容）
  v2/.env.example                           CHAT_MODEL/CHATFLOW_VERSION optional/declared
  eval/eval-contracts.md                    快照结构契约（schema_version 2）
  project-context/current-state.md          状态/主线版本
  project-context/decision-register.md      D-T005A-1/MODE 事实
```

## 3. 质量门结果（本轮修复后全部重跑）

```text
test（npm test，node --test）：44/44 通过（含新增 T10h/T12a/T12b/T13 与 DB 集成测试）
lint（npm run lint）：0 error / 0 warning
tsc --noEmit：0 error
build（next build）：成功
```

## 4. 真实 8 Case Run 证据（Review 3 修复轮）

- **复验 Run #19**（真实 8 Case，生产构建产物，端口 3001；产品链路 /api/chat 走 3000 既有服务，行为不变）：
  - status=completed，results=8，error=None；gsb good=1 / same=6 / bad=1（E002 Bad 属正常评测波动，与快照无关）
  - 新快照验证：extract_prompt_hash=`875129e48a7b1ae3`（derived）；judge_prompt_hash=`6bff2fcfcde01605`（derived）
  - **persona_prompt_hash 键不存在**（新快照单键 persona_data_hash）✅
  - case_set_version 默认路径 → source_type=code ✅；write_mode=async；user_isolation=per_case；snapshot_schema_version=2
  - 16 字段全登记；无 observed；unavailable 全带 reason；独立列 policy= v1.0 / case_set=8-case-v1
- 首轮（v1.1）Run #16 证据同结构（persona 双键已按 Review 修正）；
- **过程说明（诚实披露）**：Run #18 曾由 3001 端口**残留的旧代码测试服务**（v1.1 双键版本，首轮测试服务 kill 后子进程未退出）创建，快照含旧键；已定位根因（EADDRINUSE + 残留进程），清理后由新服务重新触发 Run #19 验证通过。该问题仅影响测试过程，不影响代码正确性。

### 4.1 当前分支全链路证据（Review 3 第二轮，Run #23）

- **链路**：当前分支服务（PORT=3001）同时提供 /api/eval/runs 与 /api/chat；Eval Runner 经 `EVAL_CHAT_API_URL=http://localhost:3001/api/chat` 调用**当前分支产品路径**（非 3000 旧服务），真实 8 Case，无 Mock；
- **结果**：status=completed，results=8，error=None；无执行异常/LLM 错误；judge 分布 program 7 / llm 1；gsb good=1 / same=6 / bad=1（1 个程序规则 FAIL 为真实评测结果，如实呈现未隐藏）；
- **快照**：write_mode=async；extract_prompt_hash=875129e48a7b1ae3（derived）；judge_prompt_hash=6bff2fcfcde01605（derived）；persona_prompt_hash 键不存在（单键）；case_set_version source_type=code；user_isolation=per_case；snapshot_schema_version=2；16 字段全登记；无 observed；
- **独立列**：policy_version=v1.0 / case_set_version=8-case-v1。

## 5. 已知限制与诚实披露

1. `.env` / `.env.local` 从主工作区复制用于本地集成核验（未读取内容、未入库、被 .gitignore 排除）；
2. 运行环境说明（无歧义）：
   - 主工作区既有 3000 端口服务未被本任务触碰（用户环境）；
   - Run #23 专项复验使用当前分支 3001 服务；
   - 该服务 Eval Runner 经 EVAL_CHAT_API_URL 自指当前分支 3001 的 /api/chat（当前分支全链路）；
   - 专项验证结束后该服务已停止（3001 已释放）。
3. 集成核验期间数据库产生 Run #15（旧服务误触发，旧代码格式）与 #16/#17（新代码）；均为正常评测运行数据，未删除（无删除 API，且不属本任务范围）；
4. `eval/llm-judge.md` 磁盘存在但未入库（独立发现，不属本任务）；
5. 本任务无任何字段标 observed；embed_model 固定 unavailable+reason（Founder 定稿）。

## 6. 边界合规确认

未改 0.35 / top_k 5 / async 行为（async 行为由 WRITE_MODE 常量显式控制且值不变）；未改 Gate / 判定逻辑 / 数据库结构（无迁移）/ 产品行为；未创建影子配置；未硬编码模型名或哈希；未触碰密钥；TASK-004 保持 PAUSED；未启动 TASK-006；E004 结果未隐藏（如实记录）。

## 6.5 第二轮复审修复（2026-08-11）

| # | 意见 | 修复 | 验证 |
|---|---|---|---|
| 1 | DB 测试须调用生产 createEvalRun | 测试改为动态 import 生产 `createEvalRun` + `getEvalRun`（先设 DATABASE_URL 再加载 db.ts 顶层 Pool）；不再自行拼接 INSERT | 集成测试真实执行通过 |
| 2 | 真实产品路径证据（当前分支服务调当前分支 /api/chat） | 以 `EVAL_CHAT_API_URL=http://localhost:3001/api/chat PORT=3001` 启动当前分支服务，Eval Runner 与产品路径均为当前分支代码 | Run #23（见 §4.1） |
| 3 | 治理事实修正 | current-state 分支提交数/干净工作区；draft §8-§10 标历史预判/已确认；本报告更新 PR 状态 | 文件核对 |

## 7. 交接状态

```text
## 当前任务状态
IN_REVIEW（Review 3 第三轮 CHANGES_REQUESTED 已修复并推送；PR #8 等待下一轮复审）

## 当前负责人
Builder（本窗口）；最终裁决：Founder

## 当前阶段是否完成
否 — 等待独立 Reviewer 复审（Review 3 第四轮）

## 完成依据
- 第二轮 3 项 Review 意见全部修复（DB 测试走生产函数、真实产品路径证据、治理事实）
- 44/44 测试、lint/tsc/build 全绿、真实 8 Case Run（当前分支全链路）通过
- PR #8 已创建（github.com/zijunxie1/ai-companion-memory/pull/8），修复已推送

## 下一交接对象
独立 Reviewer（Review 3 下一轮复审）

## 交接前仍缺少什么
无（PR #8 已创建，修复已推送；等待 Founder 启动下一轮复审）

## 建议动作
Founder 将下一轮复审唤醒卡发送给独立 Reviewer
```
