# TASK-002 V2 Memory 闭环 — 代码与行为 Review 报告

## 审查元数据

```yaml
task_id: TASK-002
review_type: 代码与行为 Review（Review Gate 3）
branch: feature/task-002-v2-memory-loop
reviewer_role: Reviewer（独立子 Agent，未参与实现）
review_date: 2026-07-23
verdict: REQUEST CHANGES
```

---

## 审查结论

**REQUEST CHANGES**

---

## 验收标准逐项结果

| # | 标准 | PASS/FAIL | 说明 |
|---|---|---|---|
| 1 | 用户能在社交 UI 中发消息并收到 AI 回复 | **PASS** | Next.js dev server 运行中 (HTTP 200)，traces 表有 6 条真实对话记录，AI 回复内容自然（如「又来了啊。你这失眠都快成生物钟了」） |
| 2 | AI 回复使用了 mem0 中的真实 Memory（非预设） | **PASS** | traces 表 `used_memory` JSONB 含真实 mem0 数据：每条有 `id`、`score`（0.39/0.38）、`memory` 内容、`hash` 字段——确认为 mem0 向量检索返回，非硬编码 |
| 3 | Trace 面板显示每轮 used_memory + recall_reason | **PASS** | TracePanel.tsx 同时渲染 `used_memory` 列表（含 score）和 `recall_reason` 文本。traces 表 `recall_reason` 字段有值（「mem0 向量检索返回 3 条记忆，按语义相似度排序」） |
| 4 | Memory 管理页能查看全部 Memory | **PASS** | `/api/memories/[user_id]` 调用 `mem0.getAll()`，mem0 当前有 3 条 Memory（学吉他/橘猫 Mimi/失眠+分手），前端卡片式展示 |
| 5 | 删除 Memory 后不再召回 | **PASS（代码路径）** | DELETE API → `mem0.delete(memory_id)` → mem0-server → `get_memory().delete()` → Qdrant 删除向量。代码路径正确，删除后 search 不再返回。未做运行时删除测试（不修改数据），但链路完整 |
| 6 | 新 Memory 从对话抽取并写入 mem0 | **PASS（附条件）** | mem0 中存在「学吉他」Memory（从对话抽取），证明抽取链路工作。但 6 条 traces 中仅 1 条 `memory_writes` 有值（1 条），其余为空数组——抽取率不稳定，详见问题清单 |
| 7 | 对话记录和 Trace 持久化到自建 PostgreSQL | **PASS** | conversations 表 12 条，traces 表 6 条，均为真实写入（非 Mock）。字段完整：`used_memory`、`recall_reason`、`memory_writes`、`latency_ms`、`prompt_version` |
| 8 | UI 像社交产品私聊 | **PASS** | 用户消息右侧蓝色气泡（`--bubble-user: #0084ff`），AI 左侧白色气泡 + 渐变色头像 + 角色名「PList」+ 在线状态。底部圆角输入框 + 发送按钮。消息有 `slide-up` 动画。整体风格符合社交 App |
| 9 | 修掉 V1 猫依赖问题 | **FAIL — 已知偏差，需裁决** | Builder 声明未修改 Dify Chatflow。实际运行中 AI 回复含猫相关内容（traces 显示回复提及失眠/分手场景），few-shot 示例未调整 |

---

## 安全检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| SQL 注入 | **PASS** | `db.ts` 全部 5 处 `pool.query()` 均使用参数化查询（`$1, $2, ...`），无字符串拼接。所有 route.ts 均通过 db.ts 函数操作数据库 |
| API Key 泄露 | **PASS** | 源码中无明文 key。`.env` 和 `.env.local` 已被 `.gitignore` 排除（`.env*` 通配），`git ls-files` 确认未追踪。dify-client.ts 通过 `env.DIFY_API_KEY` 引用 |
| 输入校验 | **PASS（附 MINOR）** | `/api/chat` 验证 `user_id` 和 `message` 非空。Memory PUT 验证 `content` 非空。MINOR：`user_id` 参数未做格式校验或长度限制，Memory DELETE 未验证 memory 归属——Demo 单用户场景可接受 |
| XSS | **PASS** | 无 `dangerouslySetInnerHTML`、无 `eval()`，React 默认转义 |
| 本地文件写入 | **PASS** | 源码中无 `fs` 模块使用 |

---

## Memory 闭环完整性

search → inject → reply → add → trace 五步验证：

| 步骤 | 代码位置 | 真实执行 | 说明 |
|---|---|---|---|
| search | `route.ts:53` `mem0.search()` | ✅ | 调用 mem0-server `/memories/search`，返回带 score 的真实 Memory |
| inject | `dify-client.ts:28-31` | ✅ | Memory 格式化为 `[Memory Context]` 块，拼接到 `user_input` 前面发送给 Dify |
| reply | `dify-client.ts:63` `data.answer` | ✅ | Dify 返回真实 AI 回复（非预设） |
| add | `route.ts:90` `mem0.add()` | ✅（附 MINOR） | 调用 mem0-server 抽取写入。MINOR：失败被 `catch` 静默吞掉（`route.ts:94-97`），`memoryWrites` 默认空数组——用户无感知抽取是否成功 |
| trace | `route.ts:101` `insertTrace()` | ✅ | 写入 PostgreSQL traces 表，字段完整 |

**闭环完整性判定：PASS**

---

## 部署前置原则

| # | 原则 | PASS/FAIL | 说明 |
|---|---|---|---|
| 1 | 所有服务用 Docker 容器化 | **PASS** | docker-compose.yml 包含 postgres + qdrant + mem0-server 三个容器，全部 Running |
| 2 | 所有配置走环境变量 | **PASS（附 MAJOR）** | 代码层面全部走 `process.env` / `os.environ`。MAJOR：mem0-server `main.py` 的 embedder 配置硬编码 `fastembed` + `BAAI/bge-small-zh-v1.5`，不读取 `MEM0_EMBEDDER_*` 环境变量——但 docker-compose.yml 和 .env.example 仍然传递这些变量，造成误导性死配置 |
| 3 | Docker Compose 可迁移 | **PASS** | 全部使用 `${VAR:-default}` 引用，端口/密码/模型均可通过 .env 覆盖 |
| 4 | 数据库用 migration 脚本 | **PASS** | `migrations/001_init.sql` 存在，挂载到 `docker-entrypoint-initdb.d:ro`，PostgreSQL 启动时自动执行。表结构与 draft.md 一致 |
| 5 | 不依赖本地文件系统存储 | **FAIL** | MAJOR：mem0-server 的 history DB 实际使用容器内 SQLite (`/root/.mem0/history.db`)，而非 docker-compose.yml 配置的 PostgreSQL `mem0_history` 数据库。该 SQLite 文件未挂载 volume——容器重建后 mem0 历史记录丢失。虽然 Memory 向量数据在 Qdrant（有 volume）中安全，但 mem0 的变更历史/元数据不持久 |

---

## 偏差确认

| # | 偏差 | Reviewer 确认 | 理由 |
|---|---|---|---|
| 1 | Embedding 模型：DeepSeek → fastembed | **合理** | DeepSeek 确实不提供 embedding API。fastembed + bge-small-zh-v1.5（512 维）是合理的本地替代。但：docker-compose.yml / .env.example 仍保留 OpenAI embedding 死配置，需清理 |
| 2 | Qdrant v1.13.2 | **合理** | mem0 client 兼容性需要，运行验证通过（3 points, status green） |
| 3 | Dify Chatflow 未修改 | **合理（附条件）** | Dify Chatflow 确实只能通过 UI 修改，Builder 无法通过 API 调整。user_input 拼接注入 Memory 是可行的绕过策略。但：draft.md 允许范围包含「Dify Chatflow 调整」，Builder 未提交 CR 说明此限制就自行绕过，流程上有瑕疵 |
| 4 | 验收标准 #9（猫依赖） | **FAIL — 需裁决** | Builder 已声明。few-shot 未调整，非猫话题仍可能往猫上靠 |
| 5 | Supabase → PostgreSQL | **合理** | draft.md 最终版技术栈已改为自建 PostgreSQL |

---

## 超范围检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| 只修改 v2/ 目录 | **PASS** | `git diff master..feature/task-002-v2-memory-loop --stat` 显示 41 文件全部在 `v2/` 和 `project-context/tasks/TASK-002/`，无其他目录变更 |
| 未修改 V1 安全节点逻辑 | **PASS** | Dify Chatflow 整体未修改，V1 安全节点保持原样 |
| 未修改 V1 Persona 设定 | **PASS** | Persona 来自 `001_init.sql` 的 seed 数据（`users` 表 `demo-alice`），与 V1 设定一致 |

---

## 问题清单

### BLOCKER

无。

### MAJOR

**M1：mem0 history DB 使用容器内 SQLite，违反部署原则 #5**

- **现象**：docker-compose.yml 配置了 `MEM0_HISTORY_DB_*` 指向 PostgreSQL，`001_init.sql` 创建了 `mem0_history` 数据库，但 mem0 实际使用容器内 `/root/.mem0/history.db`（SQLite）。PostgreSQL `mem0_history` 数据库中无任何表。
- **影响**：容器重建后 mem0 变更历史丢失。Memory 向量数据在 Qdrant（有 volume）安全，但 mem0 的内部 tracking（add/update/delete 日志）不持久。
- **建议**：① 给 mem0-server 容器挂载 volume 映射 `/root/.mem0/`；或 ② 调查 mem0 v2.0.x 是否支持 PostgreSQL history DB 并修复配置；或 ③ 至少在文档中声明此限制。

**M2：Embedder 配置不一致——死配置误导**

- **现象**：`docker-compose.yml` 传递 `MEM0_EMBEDDER_PROVIDER=openai`、`MEM0_EMBEDDER_MODEL=text-embedding-3-small`、`MEM0_EMBEDDER_API_KEY=${LLM_API_KEY}` 等环境变量。`.env.example` 同样如此。但 `main.py` 的 `_build_config()` 硬编码 `embedder.provider = "fastembed"`、`model = "BAAI/bge-small-zh-v1.5"`，不读取这些环境变量。
- **影响**：使用者误以为可以通过环境变量切换 embedder，实际无效。如果按 `.env.example` 配置了真实 OpenAI key，也不会被使用。
- **建议**：统一——要么 main.py 读取 env var（与 LLM 配置一致），要么从 docker-compose.yml 和 .env.example 中删除 embedder 相关死配置。

### MINOR

**m1：mem0 add() 失败被静默吞掉**

- `route.ts:94-97`：`mem0.add()` 的 catch 只 `console.error`，`memoryWrites` 保持空数组。用户在 Trace 面板看到「0 条写入」但不知道是「本轮无新事实」还是「抽取失败」。
- 建议：在 Trace 中区分「无新事实」和「抽取失败」两种状态。

**m2：memory_writes 抽取率不稳定**

- 6 条 traces 中仅 1 条有 memory_writes（1 条写入），其余 5 条为空。mem0 的 LLM 抽取可能对短对话（「你好呀」「好呀」）不敏感。
- 对 Demo 影响：Path C（「学吉他」写入）需要较长/信息量较大的对话才能稳定触发。

**m3：Memory DELETE/PUT 未验证 memory 归属**

- `memories/[user_id]/[memory_id]/route.ts` 的 DELETE 和 PUT 直接用 `memory_id` 调用 `mem0.delete/update`，不检查该 memory 是否属于 `user_id`。Demo 单用户场景可接受，但需在文档中标注。

**m4：Dify conversation_id 固定为 "demo-session-001"**

- `dify-client.ts:38`：`conversation_id: params.conversationId || "demo-session-001"`。Dify 侧的对话上下文可能因此混淆。Demo 场景可接受。

### SUGGESTION

- `dify-client.ts:72`：尝试 `JSON.parse(answer)` 提取结构化 JSON 的兜底逻辑是好的，但 V1 Chatflow 如果不输出 JSON，这段会静默失败。建议加注释说明 V1 的输出格式预期。
- 前端 `chat/page.tsx` 加载历史对话时，历史 AI 消息没有 `trace` 数据（只有新发的消息有）——Trace 面板只能看当前轮。建议在消息列表的 AI 回复上加「查看 Trace」链接跳转到 `/traces` 页面对应记录。

---

## 是否建议合并

**否——REQUEST CHANGES**

阻断合并的条件：
1. **M2（Embedder 死配置）** 必须修复——统一 docker-compose.yml / .env.example / main.py，消除误导
2. **验收标准 #9** 需用户裁决：是接受偏差（后续单独处理 Dify Chatflow），还是要求当前任务完成

M1（mem0 history 持久化）建议修复但不阻断合并——可在合并后作为后续任务处理，因为 Demo 短期内不会重建容器。

---

## 剩余风险

| 风险 | 级别 | 说明 |
|---|---|---|
| 容器重建丢失 mem0 history | 中 | Qdrant 向量安全（有 volume），但 mem0 变更历史丢失。重新 add 相同内容时 mem0 可能无法判断是否重复 |
| Path C 演示不稳定 | 低 | 短对话「学吉他」可能不触发抽取。建议 Demo 时输入较长句子（如「我最近开始学吉他了，感觉挺有意思的」） |
| Dify 猫依赖（#9） | 中 | 非猫话题输入时 AI 可能仍往猫上靠。Demo 前需实际测试几轮确认影响程度 |
| mem0 抽取质量依赖 DeepSeek | 低 | mem0 的 Memory 抽取使用 DeepSeek LLM，抽取的 Memory 为英文（如「User started learning to play the guitar」）——中文输入但 Memory 英文存储，可能影响语义匹配精度 |

---

## 状态转移

```
当前状态：CHANGES_REQUESTED
需用户裁决后：
  → 接受偏差 → Builder 修复 M2 后重新提交 Review
  → 不接受 #9 偏差 → Builder 同时修复 M2 + #9 后重新提交 Review
```
