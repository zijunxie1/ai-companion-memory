# TASK-002｜V2 真实 Memory 闭环 + 社交前端 + Trace

## 任务元数据

```yaml
task_id: TASK-002
status: DRAFT
execution_mode: pending
assigned_role: pending
assigned_session: pending
branch: pending
```

---

## 背景

V1（TASK-001）在 Dify 中展示了 Memory 设计逻辑，已 CLOSED。V2 升级为真实可运行 Demo——面试官能点击、能聊天、能看到 Trace。

## 用户目标

面试官在 Demo 中完成一条真实聊天链路，看到 Memory 写入、召回、更新、删除的完整生命周期，并能查看每轮使用的 Memory。

## 本次目标

搭建一条真实的端到端链路：

```text
用户在社交 UI 发消息
→ API Routes 读取 Memory（mem0）
→ 注入 Memory 调用 Dify Chatflow
→ 返回回复
→ 抽取并写入新 Memory（mem0）
→ 记录 Trace（Supabase）
→ 前端展示回复 + used_memory
```

## 非目标

- ❌ 不做 Eval 面板
- ❌ 不做 Bad Case 面板
- ❌ 不做主动聊天推送
- ❌ 不做完整安全分类器（Safety 后检保留 V1 的简化版）
- ❌ 不做 20 条 Eval Case
- ❌ 不做高并发或生产级
- ❌ 不做云端部署（先本地开发，有面试再迁移）

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 + 后端 | Next.js（含 API Routes） | 前后端一体 |
| AI 编排 | Dify（复用 V1 Chatflow） | 本地 localhost |
| Memory 引擎 | mem0 自托管 | Docker：Qdrant + Postgres + mem0 |
| 业务数据库 | 自建 PostgreSQL（Docker） | 存对话、Trace、用户数据 |
| LLM | API 调用 | DeepSeek 或其他 |
| 部署 | 火山云轻量服务器（2核4G） | 一台服务器部署全部服务 |

## 技术架构

```text
┌─────────────────────────────────┐
│  Next.js 前端                    │
│  - 消息列表（社交私聊 UI）        │
│  - 输入框                        │
│  - Memory 管理页                 │
│  - Trace 展示区                  │
└──────────┬──────────────────────┘
           │ /api/chat
           ▼
┌─────────────────────────────────┐
│  Next.js API Routes              │
│  1. 读取用户 Memory（mem0）       │
│  2. 注入 Memory → 调用 Dify       │
│  3. 接收回复                      │
│  4. 抽取候选 Memory → 写入 mem0   │
│  5. 记录 Trace → 写入 Supabase    │
│  6. 返回回复 + used_memory        │
└──────┬──────────┬───────────────┘
       │          │
       ▼          ▼
┌──────────┐ ┌──────────────┐
│  Dify    │ │  mem0        │
│ Chatflow │ │  (Docker)    │
│ (V1复用) │ │              │
└────┬─────┘ └──────┬───────┘
     │              │
     ▼              ▼
┌──────────┐ ┌──────────────┐
│  LLM API │ │ Qdrant +     │
│          │ │ Postgres     │
└──────────┘ └──────────────┘

┌─────────────────────────────────┐
│  自建 PostgreSQL（Docker）        │
│  - conversations（对话记录）      │
│  - traces（每轮 Memory 召回日志） │
│  - users（用户画像）              │
│  （独立于 mem0 的 Postgres）      │
└─────────────────────────────────┘
```

## 数据模型（自建 PostgreSQL / Docker）

> 本切片只定义 V2 需要的最小表结构。完整数据模型待合并后写入 data-model.md。
> mem0 内部有自己的 Postgres + Qdrant（Memory 存储），这里的 Postgres 是业务数据库（对话、Trace、用户数据），两者独立。

### conversations

```sql
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     VARCHAR NOT NULL,
  role        VARCHAR NOT NULL,        -- 'user' | 'assistant'
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### traces

```sql
CREATE TABLE traces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  user_input      TEXT NOT NULL,
  ai_reply        TEXT,
  used_memory     JSONB,                -- 本轮使用的 Memory 列表
  recall_reason   TEXT,                 -- 为什么召回这些
  memory_writes   JSONB,                -- 本轮写入的候选 Memory
  conflict_result JSONB,                -- 冲突处理结果
  prompt_version  VARCHAR,
  latency_ms      INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### users

```sql
CREATE TABLE users (
  id                VARCHAR PRIMARY KEY,
  nickname          VARCHAR,
  persona           JSONB,              -- AI 角色设定
  relationship_stage VARCHAR DEFAULT 'new',
  created_at        TIMESTAMP DEFAULT NOW()
);
```

## API 设计

### POST /api/chat

```typescript
// 请求
{
  user_id: string
  message: string
  conversation_id?: string
}

// 响应
{
  reply: string
  used_memory: Memory[]
  recall_reason: string
  memory_writes: MemoryCandidate[]
  conflict_result: object | null
  trace_id: string
}
```

### GET /api/memories/:user_id

```typescript
// 响应
{
  memories: Memory[]
}
```

### DELETE /api/memories/:user_id/:memory_id

```typescript
// 响应
{
  success: boolean
  memory_id: string
}
```

### PUT /api/memories/:user_id/:memory_id

```typescript
// 请求
{
  content: string
}

// 响应
{
  success: boolean
  memory_id: string
}
```

### GET /api/traces/:user_id

```typescript
// 响应
{
  traces: Trace[]
}
```

## 前端页面

### 页面 1：AI 私聊页（核心）

- 消息列表（社交 App 风格，不是 ChatGPT 风格）
- 输入框 + 发送按钮
- 消息气泡（用户右侧，AI 左侧）
- AI 头像 + 角色名
- 底部展开 Trace 面板（本轮 used_memory + recall_reason）

### 页面 2：Memory 管理页

- Memory 列表（卡片式，每条显示 type + content + confidence）
- 编辑按钮 → 修改 Memory content
- 删除按钮 → 删除 Memory
- 按类型分组（偏好 / 事件 / 互动风格 / 共同经历）

### 页面 3：Trace 面板（可嵌入私聊页）

- 每轮对话的 Trace 卡片
- 显示：used_memory、recall_reason、memory_writes、conflict_result
- 可折叠/展开

## Dify Chatflow 调整

复用 V1 的 11 节点 Chatflow，做以下调整：

| 调整项 | V1 | V2 |
|---|---|---|
| Memory 召回 | 模拟变量 | 删除——由 API Routes 调用 mem0 后注入 |
| Memory 写入 | 节点输出但不持久化 | 删除——由 API Routes 调用 mem0 写入 |
| Memory 数据 | 预设 JSON | 不需要——来自 mem0 |
| 其余节点 | 不变 | 安全预检、拼接、生成、安全后检不变 |

V2 的 Dify Chatflow 变得更简单——只负责：安全预检 → 接收注入的 Memory + Persona → 拼接 Prompt → LLM 生成 → 安全后检 → 返回结构化结果。

## 端到端数据流

```text
1. 用户在前端输入"又失眠了……"
2. 前端 POST /api/chat { user_id, message }
3. API Routes 收到请求
4. API Routes 调用 mem0.search(user_id, "又失眠了") → 返回相关 Memory
5. API Routes 组装 { message, memories, persona, relationship_stage }
6. API Routes 调用 Dify Chatflow API
7. Dify 返回 { reply, emotion, risk_level }
8. API Routes 调用 mem0.add(user_id, 对话文本) → 抽取候选 → 判断是否写入
9. API Routes 写入 PostgreSQL: conversations + traces
10. API Routes 返回 { reply, used_memory, memory_writes, trace_id }
11. 前端展示回复 + 展开 Trace 面板
```

## 演示场景

复用 V1 的社交场景：

- 用户前两天深夜聊过分手和猫
- D3 回来，AI 记得之前的内容
- Memory 真实存储在 mem0，不是预设变量

### Path A：正常 Memory 召回（主线）

输入："又失眠了……"

展示：mem0 真实召回 → 回复提到猫 → Trace 面板显示 used_memory

### Path B：Memory 管理页删除

操作：用户在 Memory 管理页删除"最近刚分手"

输入："今天怎么样？"

展示：mem0 不再返回分手 Memory → 回复不提及分手 → Trace 显示 deleted

### Path C：Memory 写入

输入："我最近开始学吉他了"

展示：mem0 从对话抽取"学吉他" → 写入 Memory → Memory 管理页出现新条目 → 下次对话 AI 提到吉他

## 验收标准

1. 用户能在社交 UI 中发消息并收到 AI 回复
2. AI 回复使用了 mem0 中的真实 Memory（非预设）
3. Trace 面板显示每轮 used_memory + recall_reason
4. Memory 管理页能查看全部 Memory
5. 删除 Memory 后，后续对话不再召回该 Memory
6. 新 Memory 能从对话中抽取并写入 mem0
7. 对话记录和 Trace 持久化到自建 PostgreSQL
8. 消息列表 UI 像社交产品私聊（不是 ChatGPT）
9. 修掉 V1 的猫依赖问题（few-shot 示例调整）

## 允许修改范围

- 新建 Next.js 项目及所有前端/API 代码
- mem0 配置和 Docker Compose 文件
- Supabase 表结构
- Dify Chatflow 调整（简化 Memory 相关节点）
- V1 的 few-shot 示例和 Prompt 模板

## 禁止修改范围

- V1 的安全节点逻辑
- V1 的 Persona 设定（除非用户批准）

## Change Request 条件

- mem0 自托管遇到 Docker 兼容问题 → CR
- Dify API 无法被 Next.js 调用 → CR
- 自建 PostgreSQL 性能或配置问题 → CR
- mem0 的 Memory 抽取质量差（大量噪声写入）→ CR

## 执行模式判断

```text
## 执行模式判断

任务：V2 真实 Memory 闭环 + 社交前端 + Trace
任务复杂度：高
是否需要用户中途决策：是（UI 设计、Prompt 调整、mem0 配置）
是否预计多轮实现—验证—调整：是
是否涉及高风险数据、权限或第三方服务：是（mem0 Docker + Supabase + Dify API）
推荐模式：HANDOFF REQUIRED — 长期 Builder 会话

判断依据：
- 前端 + 后端 + mem0 + Dify 四端联调
- 需要多轮 UI 调整和 Prompt 优化
- 预计跨多天
- 需要 Builder 保持连续上下文

建议的 Builder 会话名称：TASK-002｜Builder｜V2 真实 Memory 闭环
任务分支：feature/task-002-v2-memory-loop
```
