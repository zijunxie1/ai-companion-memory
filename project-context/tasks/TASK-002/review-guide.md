# TASK-002 Reviewer 审查指南

## 审查元数据

```yaml
task_id: TASK-002
review_type: 代码与行为 Review（Review Gate 3）
branch: feature/task-002-v2-memory-loop
reviewer_role: Reviewer（独立子 Agent，未参与实现）
```

## Reviewer 输入

| 材料 | 路径 |
|---|---|
| 任务草案（验收标准+允许/禁止范围） | `project-context/tasks/TASK-002/draft.md` |
| Builder 交接包 | `project-context/tasks/TASK-002/handoff-to-reviewer.md` |
| Memory 策略文档 | `project-context/tasks/TASK-001/memory-strategy.md` |
| V1 实现报告 | `project-context/tasks/TASK-001/implementation-report.md` |
| 执行章程 | `AGENTS.md` |
| 产品定义 | `project-context/product.md` |

## 代码目录

`v2/` — 全部新增代码在此目录，无对已有文件的修改。

## 审查要求

**你只能审查，不能修改代码。** 输出 `APPROVE` / `REQUEST CHANGES` / `BLOCK`。

---

## 逐条验收标准审查指南

### 标准 1：用户能在社交 UI 中发消息并收到 AI 回复

| 项 | 内容 |
|---|---|
| PASS 条件 | 浏览器打开 http://localhost:3000/chat，输入消息，收到 AI 回复 |
| FAIL 条件 | 页面报错 / 发送无响应 / API 返回错误 |
| 验证方法 | 打开 chat 页面，发送一条消息，检查响应 |

### 标准 2：AI 回复使用了 mem0 中的真实 Memory（非预设）

| 项 | 内容 |
|---|---|
| PASS 条件 | `/api/chat` 响应的 `used_memory` 字段有内容，且来自 mem0（有 score 字段），不是硬编码 |
| FAIL 条件 | used_memory 为空 / 硬编码 / 来自预设而非 mem0 |
| 验证方法 | 1) 先在 Memory 管理页确认有 Memory 数据 2) 发送相关消息 3) 检查 API 响应的 used_memory 是否包含 mem0 返回的 Memory（含 score） |

### 标准 3：Trace 面板显示每轮 used_memory + recall_reason

| 项 | 内容 |
|---|---|
| PASS 条件 | Trace 面板能看到每轮对话的 used_memory 列表和 recall_reason |
| FAIL 条件 | Trace 面板为空 / 缺少 recall_reason / 只有 used_memory 没有原因 |
| 验证方法 | 发送消息后，展开 Trace 面板，检查字段完整性 |

### 标准 4：Memory 管理页能查看全部 Memory

| 项 | 内容 |
|---|---|
| PASS 条件 | http://localhost:3000/memories 显示 mem0 中的全部 Memory |
| FAIL 条件 | 页面为空 / 只显示部分 / 报错 |
| 验证方法 | 1) 在 Memory 管理页查看列表 2) 对比 mem0 中实际 Memory 数量 |

### 标准 5：删除 Memory 后，后续对话不再召回该 Memory

| 项 | 内容 |
|---|---|
| PASS 条件 | 删除一条 Memory → 同一话题输入 → AI 回复不再提及该 Memory |
| FAIL 条件 | 删除后 AI 仍然提及 / Trace 仍然召回 |
| 验证方法 | 1) 记录一条 Memory 的内容和 ID 2) 删除 3) 发送相关话题的消息 4) 检查 used_memory 和 AI 回复 |

### 标准 6：新 Memory 能从对话中抽取并写入 mem0

| 项 | 内容 |
|---|---|
| PASS 条件 | 发送包含新事实的消息（如"我最近开始学吉他了"）→ Memory 管理页出现新条目 |
| FAIL 条件 | Memory 管理页无新增 / mem0 无写入 |
| 验证方法 | 1) 发送"我最近开始学吉他了" 2) 等待几秒 3) 刷新 Memory 管理页 4) 检查是否出现吉他相关 Memory 5) 再发一条相关消息，检查是否召回 |

### 标准 7：对话记录和 Trace 持久化到自建 PostgreSQL

| 项 | 内容 |
|---|---|
| PASS 条件 | conversations 和 traces 表有真实写入数据 |
| FAIL 条件 | 表为空 / 使用 Mock / 数据只存内存 |
| 验证方法 | 执行 SQL 查询确认有数据（见下方 SQL） |

```sql
-- 检查 conversations
SELECT COUNT(*) FROM conversations;
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;

-- 检查 traces
SELECT COUNT(*) FROM traces;
SELECT id, user_input, ai_reply, used_memory, created_at FROM traces ORDER BY created_at DESC LIMIT 5;
```

### 标准 8：消息列表 UI 像社交产品私聊（不是 ChatGPT）

| 项 | 内容 |
|---|---|
| PASS 条件 | 用户消息在右、AI 消息在左、有 AI 头像和角色名、输入框在底部，整体像社交 App 私聊 |
| FAIL 条件 | 看起来像 ChatGPT（纯文本列表、无气泡、无头像） |
| 验证方法 | 打开 chat 页面，发几条消息，截图判断 UI 风格 |

### 标准 9：修掉 V1 的猫依赖问题

| 项 | 内容 |
|---|---|
| PASS 条件 | Dify Chatflow 的 few-shot 示例已调整，猫场景占比降低，非猫话题输入不会往猫上靠 |
| FAIL 条件 | 仍然往猫话题上靠 |
| **已知状态** | **Builder 已声明未修改 Dify Chatflow（偏差 #4）** |
| 验证方法 | 发送一条与猫无关的消息，检查 AI 回复是否往猫上靠 |

**注意**：Builder 在交接包中已声明验收标准 #9 未完成（偏差 #4：Dify Chatflow 未调整）。Reviewer 应确认这一声明，并标记为 **FAIL — 已知偏差，需裁决**。

---

## 重点审查项（必须深入检查）

### 重点 1：安全性

| 检查项 | 方法 | 严重程度 |
|---|---|---|
| API Routes 是否有 SQL 注入风险 | 检查 `db.ts` 和所有 route.ts，确认是否使用参数化查询 | BLOCKER |
| 用户输入是否直接拼入 SQL | 搜索代码中是否有字符串拼接 SQL | BLOCKER |
| `.env` 是否被 gitignore | 检查 `.gitignore` 是否包含 `.env` 和 `.env.local` | BLOCKER |
| 是否硬编码 API Key | 搜索代码中是否有明文 key | BLOCKER |
| API 是否有基本输入校验 | 检查 route.ts 是否验证 user_id、message 等参数 | MAJOR |

### 重点 2：Memory 闭环完整性

| 检查项 | 方法 |
|---|---|
| search → inject → reply → add → trace 五步是否都真实执行 | 审查 `/api/chat/route.ts` 的完整流程 |
| search 结果是否真实注入到 Dify 请求 | 检查 mem0 返回的 Memory 是否拼接进 Dify user_input |
| add 是否真实调用 mem0 | 检查是否调用了 mem0-server 的 add 端点 |
| trace 是否包含完整字段 | 检查 traces 表的 used_memory、recall_reason、memory_writes |

### 重点 3：部署前置原则（5 条）

| # | 原则 | 检查方法 |
|---|---|---|
| 1 | 所有服务用 Docker 容器化 | 检查 docker-compose.yml 是否包含 postgres + qdrant + mem0-server |
| 2 | 所有配置走环境变量 | 检查代码中是否有硬编码的 localhost / 端口 / 密码 |
| 3 | Docker Compose 可迁移 | 检查 docker-compose.yml 是否用 `${VAR}` 引用环境变量 |
| 4 | 数据库用 migration 脚本 | 检查 migrations/001_init.sql 是否存在且可执行 |
| 5 | 不依赖本地文件系统存储 | 检查是否有本地文件读写操作（fs.writeFile 等） |

---

## 偏差审查

Builder 声明了 5 项偏差，Reviewer 需确认每项：

| # | 偏差 | 原方案 | 实际实现 | Reviewer 确认 |
|---|---|---|---|---|
| 1 | Embedding 模型 | DeepSeek API | fastembed 本地（BAAI/bge-small-zh-v1.5） | 合理？DeepSeek 确实不提供 embedding |
| 2 | Qdrant 版本 | 未指定 | v1.13.2（兼容性修复） | 合理？是兼容性需要 |
| 3 | Dify Chatflow 简化 | 删除 Memory 节点 | 未修改，Memory 通过 user_input 拼接注入 | 合理？Builder 无法通过 API 改 Dify |
| 4 | 验收标准 #9（猫依赖） | 修改 few-shot | 未修改 | **FAIL — 需裁决** |
| 5 | Supabase → PostgreSQL | Supabase | 自建 PostgreSQL | 合理（draft 最终版已改） |

---

## 超范围检查

| 检查项 | 方法 |
|---|---|
| Builder 是否只修改了 v2/ 目录 | `git diff master..feature/task-002-v2-memory-loop --stat` 确认无其他目录变更 |
| 是否修改了 V1 安全节点逻辑 | Builder 声明未修改 Dify Chatflow — 确认 |
| 是否修改了 V1 Persona 设定 | Builder 声明 Persona 在 DB seed 中 — 确认是否来自 migration |

---

## Reviewer 输出格式

审查完成后输出：

```text
## 审查结论
APPROVE / REQUEST CHANGES / BLOCK

## 验收标准逐项结果
| # | 标准 | PASS/FAIL | 说明 |
|---|---|---|---|

## 安全检查
- SQL 注入：PASS/FAIL
- API Key 泄露：PASS/FAIL
- 输入校验：PASS/FAIL

## Memory 闭环完整性
- search → inject → reply → add → trace：PASS/FAIL

## 部署前置原则
- 5 条原则：逐条 PASS/FAIL

## 偏差确认
- 5 项偏差：逐条 合理/不合理

## 超范围检查
- PASS/FAIL

## 问题清单
- BLOCKER：...
- MAJOR：...
- MINOR：...
- SUGGESTION：...

## 是否建议合并
是/否

## 剩余风险
...
```
