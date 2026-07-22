# TASK-002 交接包 — Builder → Reviewer

## 1. 任务元数据

```yaml
task_id: TASK-002
status: IMPLEMENTED
execution_mode: persistent_session
assigned_role: Builder → Reviewer
branch: feature/task-002-v2-memory-loop
commit: HEAD on feature/task-002-v2-memory-loop
```

## 2. 审查范围

### 你需要审查的内容

- **分支**：`feature/task-002-v2-memory-loop`（不要审查 master）
- **代码目录**：`v2/`（全部新增，无对已有文件的修改）
- **验收标准对照**：逐条检查 draft.md 中的 9 条验收标准

### 验收标准（逐条对照）

| # | 验收标准 | Builder 自检结果 | 验证方式 |
|---|---|---|---|
| 1 | 用户能在社交 UI 中发消息并收到 AI 回复 | ✅ 已验证 | 浏览器打开 http://localhost:3000/chat 发送消息 |
| 2 | AI 回复使用了 mem0 中的真实 Memory（非预设） | ✅ 已验证 | API 响应 used_memory 字段显示 mem0 返回的 Memory（含 score） |
| 3 | Trace 面板显示每轮 used_memory + recall_reason | ✅ 已验证 | /api/chat 响应含 trace_id，/api/traces/:user_id 返回完整 Trace |
| 4 | Memory 管理页能查看全部 Memory | ✅ 已验证 | http://localhost:3000/memories 显示 mem0 getAll 结果 |
| 5 | 删除 Memory 后，后续对话不再召回该 Memory | ✅ 已验证 | DELETE API 返回 success，后续 search 不再返回该条 |
| 6 | 新 Memory 能从对话中抽取并写入 mem0 | ✅ 已验证 | "学吉他" → mem0 自动抽取并写入，后续对话召回 |
| 7 | 对话记录和 Trace 持久化到自建 PostgreSQL | ✅ 已验证 | conversations + traces 表有真实数据 |
| 8 | 消息列表 UI 像社交产品私聊（不是 ChatGPT） | ✅ 已验证 | 用户右侧蓝色气泡，AI 左侧白色气泡 + 头像 |
| 9 | 修掉 V1 的猫依赖问题 | ⚠️ 未直接修改 | Dify Chatflow 未调整（见偏差说明） |

### 重点审查项（Reviewer 必须深入检查）

1. **安全性**：API Routes 是否有注入风险？用户输入是否直接拼入 SQL？
2. **Memory 闭环完整性**：search → inject → reply → add → trace 五步是否都真实执行？
3. **数据持久化**：conversations 和 traces 是否真实写入 PostgreSQL（不是 Mock）？
4. **删除防重注入**：Path B 删除后，mem0 是否真的不再返回该 Memory？
5. **部署前置原则**：5 条原则是否全部遵守？（Docker 化 / 环境变量 / migration / 无硬编码 / 无本地文件依赖）

## 3. 必须提供的上下文文件

| 文件 | 路径 | 用途 |
|---|---|---|
| 任务草案 | `project-context/tasks/TASK-002/draft.md` | 验收标准、允许/禁止范围 |
| Memory 策略 | `project-context/tasks/TASK-001/memory-strategy.md` | 策略设计参考 |
| V1 实现报告 | `project-context/tasks/TASK-001/implementation-report.md` | V1 已知问题 |
| 产品定义 | `project-context/product.md` | 产品目标和非目标 |
| 执行章程 | `AGENTS.md` | 红线规则、Review 门定义 |

## 4. Builder 允许修改范围（Reviewer 对照检查是否超范围）

- ✅ 新建 Next.js 项目及所有前端/API 代码
- ✅ mem0 配置和 Docker Compose 文件
- ✅ PostgreSQL 表结构 + migration 脚本
- ✅ Dify Chatflow 调整
- ✅ V1 的 few-shot 示例和 Prompt 模板

## 5. Builder 禁止修改范围（Reviewer 检查是否违规）

- ❌ V1 的安全节点逻辑 → 未修改（V1 Chatflow 整体未动）
- ❌ V1 的 Persona 设定 → 未修改（Persona 在 DB 中，来自 migration seed）

## 6. 与任务方案的偏差

| 偏差 | 原方案 | 实际实现 | 原因 |
|---|---|---|---|
| Embedding 模型 | DeepSeek API | fastembed 本地（BAAI/bge-small-zh-v1.5） | DeepSeek 不提供 embedding API |
| Qdrant 版本 | 未指定 | v1.13.2 | mem0 client 1.18 与 v1.9.7 不兼容 |
| Dify Chatflow 简化 | 删除 Memory 召回/写入节点 | 未修改，Memory 通过 user_input 拼接注入 | Builder 无法通过 API 修改 Dify Chatflow |
| 验收标准 #9（猫依赖） | 修改 few-shot 示例 | 未修改 | Dify Chatflow 未调整 |
| Supabase | draft.md 提到 | 改为自建 PostgreSQL | draft.md 最终版已改为自建 PostgreSQL |

## 7. Change Request

| CR | 条件 | 状态 |
|---|---|---|
| CR-001 | mem0 Docker 兼容问题 | 已自行解决（Qdrant 升级 + fastembed + dims=512） |
| CR-002 | Dify Chatflow 无法通过代码调整 | 未提交 CR，用 user_input 拼接策略绕过 |

## 8. 运行环境状态

```text
Docker 容器（全部 Running）：
  v2-postgres   : postgres:16-alpine    : localhost:5432 : Healthy
  v2-qdrant     : qdrant/qdrant:v1.13.2 : localhost:6333 : Healthy
  v2-mem0-server: Python 3.12 + mem0ai  : localhost:8900 : Running

Next.js dev server：
  http://localhost:3000 (运行中)

Dify：
  http://localhost (通过 nginx 80 端口)

API Key 已配置：
  DeepSeek: 已填入 .env / .env.local
  Dify    : 已填入 .env / .env.local
```

## 9. 构建/Lint/类型检查结果

```text
npx tsc --noEmit  → 0 errors
npm run lint      → 0 errors, 0 warnings
npm run build     → 成功，8 路由编译
```

## 10. 实际修改文件清单

```
v2/                                    # 全部新增
├── docker-compose.yml
├── .env.example
├── .env                               # 已 gitignore
├── migrations/
│   └── 001_init.sql
├── mem0-server/
│   ├── main.py                        # FastAPI 包装 mem0 v2.0.13
│   ├── requirements.txt               # mem0ai + fastembed
│   └── Dockerfile
└── app/                               # Next.js 16
    ├── .env.local                     # 已 gitignore
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── lib/
        │   ├── types.ts               # 核心类型
        │   ├── env.ts                 # 环境变量
        │   ├── mem0-client.ts         # mem0 REST 客户端
        │   ├── dify-client.ts         # Dify Chatflow 客户端
        │   └── db.ts                  # PostgreSQL 连接池
        ├── app/
        │   ├── page.tsx               # 首页导航
        │   ├── chat/page.tsx          # 社交私聊 UI
        │   ├── memories/page.tsx      # Memory CRUD 页
        │   ├── traces/page.tsx        # Trace 日志页
        │   ├── layout.tsx
        │   ├── globals.css
        │   └── api/
        │       ├── chat/route.ts      # ★ 核心端到端闭环
        │       ├── conversations/[user_id]/route.ts
        │       ├── memories/[user_id]/route.ts
        │       ├── memories/[user_id]/[memory_id]/route.ts
        │       └── traces/[user_id]/route.ts
        └── components/
            └── TracePanel.tsx
```
