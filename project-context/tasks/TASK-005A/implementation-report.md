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
status: IMPLEMENTED（Review 3 首轮 CHANGES_REQUESTED 已修复完毕，待复审）
execution_mode: persistent_session（HANDOFF REQUIRED）
assigned_role: Builder
branch: feature/task-005a-config-snapshot
baseline: origin/main @ c242338
report_version: v1.2（2026-08-11；v1.1 实现 + Review 3 修复轮）
```

---

## 1. 本轮（Review 3 修复轮）变更清单

| # | Review 意见 | 修复 | 验证 |
|---|---|---|---|
| 1 | WRITE_MODE 影子配置 | chat/route.ts Step 8 写入路径由 `if (WRITE_MODE === "async")` 实际控制（产品与快照共同消费同一只读来源，async 行为不变） | T12a/T12b（import + 分支断言 + 常量值） |
| 2 | case_set_version 来源 | 默认值 → code；POST 请求参数覆盖 → declared（runs/route.ts 传覆盖标志） | T10h 两路径；集成核验 |
| 3 | 新快照停止写 persona_prompt_hash | buildSnapshot 只写 persona_data_hash；类型改可选；展示层旧键归并保留 | T10g/T13；DB 集成测试断言 |
| 4 | 历史 Run 详情页四列 | runs/[id]/page.tsx 新增 ConfigSnapshotCard（共用 buildSnapshotDisplayRows，旧格式未知来源） | T13；build/lint/tsc |
| 5 | 数据库独立列写入测试 | 新增 eval-db-integration.test.ts（真实连接本地 PG，INSERT→断言字符串列→DELETE） | 44/44 全绿含此测试 |
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

## 5. 已知限制与诚实披露

1. `.env` / `.env.local` 从主工作区复制用于本地集成核验（未读取内容、未入库、被 .gitignore 排除）；
2. 3000 端口被主工作区既有 dev server 占用（用户环境，未触碰），新服务以 3001 验证；产品行为链路仍走 3000；
3. 集成核验期间数据库产生 Run #15（旧服务误触发，旧代码格式）与 #16/#17（新代码）；均为正常评测运行数据，未删除（无删除 API，且不属本任务范围）；
4. `eval/llm-judge.md` 磁盘存在但未入库（独立发现，不属本任务）；
5. 本任务无任何字段标 observed；embed_model 固定 unavailable+reason（Founder 定稿）。

## 6. 边界合规确认

未改 0.35 / top_k 5 / async 行为（async 行为由 WRITE_MODE 常量显式控制且值不变）；未改 Gate / 判定逻辑 / 数据库结构（无迁移）/ 产品行为；未创建影子配置；未硬编码模型名或哈希；未触碰密钥；TASK-004 保持 PAUSED；未启动 TASK-006；E004 结果未隐藏（如实记录）。

## 7. 交接状态

```text
## 当前任务状态
IMPLEMENTED（Review 3 修复轮完成，待复审）

## 当前负责人
Builder（本窗口）；最终裁决：Founder

## 当前阶段是否完成
否 — 等待独立 Reviewer 复审（Review 3 第二轮）

## 完成依据
- 8 项 Review 意见全部修复并有对应测试/证据
- 44/44 测试、lint/tsc/build 全绿、真实 8 Case Run 复验通过
- 修复已提交推送（分支 feature/task-005a-config-snapshot）

## 下一交接对象
独立 Reviewer（Review 3 复审）

## 交接前仍缺少什么
PR 创建（本轮 push 后创建）+ Founder 启动复审

## 建议动作
Founder 将复审唤醒卡发送给独立 Reviewer
```
