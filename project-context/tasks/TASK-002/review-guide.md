# TASK-002 审查指南（Reviewer 必读）

> 本文件由 Chief of Staff 编写，定义 Reviewer 的审查范围、标准和输出格式。
> Reviewer 对照本文件执行审查，不得自行增减验收标准。

---

## A. 审查边界

### 你可以做的

- 读取分支 `feature/task-002-v2-memory-loop` 上的所有代码和文件
- 运行 Docker 容器、Next.js dev server、数据库查询
- 用 curl / 浏览器测试 API 和前端
- 查看数据库实际数据
- 标记 PASS / FAIL / CONDITIONAL

### 你不能做的

- ❌ 修改代码（只审查不修改）
- ❌ 修改验收标准
- ❌ 合并分支
- ❌ 接触 API Key 或 .env 文件

### 遇到以下情况必须停止并上报

- 验收标准之间存在矛盾
- Builder 的实现与 draft.md 有重大偏差且没有记录
- 发现安全漏洞或数据泄露风险

---

## B. 验收标准逐条审查方法

### 标准清单（来自 draft.md，已用户 APPROVED）

| # | 验收标准 | 严重度 | 审查方法 |
|---|---|---|---|
| V1 | 用户能在社交 UI 中发消息并收到 AI 回复 | P0 必须 | 浏览器打开 http://localhost:3000/chat，输入消息，确认收到 AI 回复 |
| V2 | AI 回复使用了 mem0 中的真实 Memory（非预设） | P0 必须 | 检查 /api/chat 响应的 `used_memory` 字段：① 非空 ② 来自 mem0（有 score 字段）③ 不是硬编码 JSON |
| V3 | Trace 面板显示每轮 used_memory + recall_reason | P0 必须 | 发送一条消息后，确认响应含 `trace_id`；调用 GET /api/traces/demo-alice 确认 Trace 记录存在且 used_memory + recall_reason 有值 |
| V4 | Memory 管理页能查看全部 Memory | P1 重要 | 打开 http://localhost:3000/memories，确认显示 mem0 中所有 Memory 条目 |
| V5 | 删除 Memory 后，后续对话不再召回该 Memory | P0 必须 | ① 记录当前 Memory 列表 ② 删除一条 ③ 确认 Memory 列表不再包含 ④ 发送相关话题消息 ⑤ 确认 used_memory 不含已删除条目 |
| V6 | 新 Memory 能从对话中抽取并写入 mem0 | P0 必须 | ① 发送含新事实的消息（如"我开始学钢琴了"）② 检查 memory_writes 字段 ③ 打开 Memory 管理页确认新条目出现 ④ 再次发送相关话题，确认新 Memory 被召回 |
| V7 | 对话记录和 Trace 持久化到自建 PostgreSQL | P1 重要 | `docker exec v2-postgres psql -U postgres -d ai_companion -c "SELECT COUNT(*) FROM conversations;"` 和 `... FROM traces;"` 确认有真实数据 |
| V8 | 消息列表 UI 像社交产品私聊（不是 ChatGPT） | P2 期望 | 打开 /chat 页面：① 用户消息右侧气泡 ② AI 消息左侧气泡 + 头像 ③ 社交风格输入栏（不是大文本框）|
| V9 | 修掉 V1 的猫依赖问题 | P2 期望 | 检查 V1 Dify Chatflow 的 few-shot 是否调整。Builder 报告为未修改——确认是否为可接受的已知偏差 |

### PASS / FAIL / CONDITIONAL 判定规则

- **PASS**：完全满足标准，有验证证据
- **FAIL**：不满足标准，有明确的失败证据
- **CONDITIONAL**：满足核心逻辑但有瑕疵（如边界情况未覆盖、UI 细节不完善），需要在结论中说明

---

## C. 代码质量审查

### C1. 安全性（P0）

| 检查项 | 检查方法 | 判定 |
|---|---|---|
| SQL 注入防护 | 检查 `src/lib/db.ts`：所有查询是否使用参数化（$1, $2...），不拼接字符串 | FAIL if 拼接 |
| 用户输入验证 | 检查 `src/app/api/chat/route.ts`：是否验证 user_id 和 message 非空 | FAIL if 无验证 |
| API Key 泄露 | 检查 `.env` 和 `.env.local` 是否在 `.gitignore` 中；检查代码中是否硬编码 Key | FAIL if 硬编码 |
| Dify API Key 传输 | 检查 `src/lib/dify-client.ts`：Key 是否通过 Header 传输，不暴露在前端 | FAIL if 前端可见 |

### C2. 架构符合度（P1）

| 检查项 | 对照文件 | 判定 |
|---|---|---|
| 端到端数据流实现 | draft.md「端到端数据流」10 步 | 每一步都要有对应代码实现 |
| 数据模型与设计一致 | draft.md「数据模型」SQL | 表结构、字段类型、JSONB 是否匹配 |
| API 响应格式 | draft.md「API 设计」TypeScript 定义 | 字段名和类型是否匹配 |
| Memory 闭环 5 步 | search → inject → reply → add → trace | /api/chat 中是否完整实现 |

### C3. 部署前置原则（P1）

draft.md 定义了 5 条部署前置原则，逐条检查：

| # | 原则 | 检查方法 |
|---|---|---|
| D1 | 所有服务用 Docker 容器化 | docker-compose.yml 是否包含所有服务 |
| D2 | 所有配置走环境变量（.env），不硬编码 | grep 代码中是否有 `localhost:5432` 等硬编码（env.ts 的 fallback 可接受） |
| D3 | Docker Compose 随时可迁移 | 检查 docker-compose.yml 是否引用 ${VAR} 而非写死值 |
| D4 | 数据库用 migration 脚本 | migrations/001_init.sql 是否存在且可独立执行 |
| D5 | 不依赖本地文件系统存储 | Memory 和业务数据是否都在数据库中（不在 JSON 文件中） |

### C4. 代码质量（P2）

| 检查项 | 判定标准 |
|---|---|
| TypeScript 类型安全 | `npx tsc --noEmit` 零 error |
| ESLint | `npm run lint` 零 error |
| 构建通过 | `npm run build` 成功 |
| 错误处理 | API Route 是否有 try-catch，是否返回适当的 HTTP 状态码 |
| 代码注释 | 核心逻辑是否有注释说明 |

---

## D. 已知偏差审查

Builder 在交接包中记录了以下偏差，Reviewer 需要确认每一条是否可接受：

| 偏差 | Builder 说明 | Reviewer 判定标准 |
|---|---|---|
| Embedding 改为 fastembed | DeepSeek 无 embedding API | 可接受 if Memory 召回功能正常工作 |
| Qdrant 升级到 v1.13.2 | mem0 client 兼容性 | 可接受 if 容器稳定运行 |
| Dify Chatflow 未简化 | Memory 通过 user_input 拼接注入 | 判断：这种方式是否影响 AI 回复质量？Memory 是否真的被 Dify 的 LLM 使用了？ |
| 猫依赖问题未修复 | Dify Chatflow 未调整 | 判断：是否严重影响面试演示？是否需要在合并前修复？ |

---

## E. 运行环境验证

Reviewer 需要确认以下服务正常运行：

```bash
# 1. Docker 容器
docker ps --format "{{.Names}} {{.Status}}" | grep v2
# 预期：v2-postgres Healthy, v2-qdrant Healthy, v2-mem0-server Up

# 2. mem0 健康检查
curl http://localhost:8900/health
# 预期：{"status":"ok"}

# 3. Next.js
curl http://localhost:3000
# 预期：HTML 响应

# 4. 数据库
docker exec v2-postgres psql -U postgres -d ai_companion -c "\dt"
# 预期：conversations, traces, users 三张表

# 5. Memory 数据
curl http://localhost:3000/api/memories/demo-alice
# 预期：返回 Memory 列表
```

---

## F. 输出格式

Reviewer 必须按以下格式输出审查报告：

```markdown
# TASK-002 Review Report

## 审查结论

[REVIEW_APPROVED / CHANGES_REQUESTED]

## 验收标准对照

| # | 标准 | 结果 | 证据 |
|---|---|---|---|
| V1 | ... | PASS/FAIL/CONDITIONAL | 具体验证结果 |
| ... | ... | ... | ... |

## 代码质量

### 安全性
- [PASS/FAIL] SQL 注入防护：...
- [PASS/FAIL] 输入验证：...
- ...

### 架构符合度
- ...

### 部署前置原则
- D1: [PASS/FAIL] ...
- ...

## 已知偏差审查
- 偏差1：[可接受/不可接受] 原因：...
- ...

## 发现的问题
（如果 CHANGES_REQUESTED，按严重度排序）
1. [P0/P1/P2] 问题描述 → 建议修复方式
2. ...

## 建议动作
[合并到 master / 需要修改后重新审查 / 需要用户裁决]
```
