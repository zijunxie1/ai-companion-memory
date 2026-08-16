# TASK-006｜现有上下文送达接线修复｜Builder 完整交接

> 给 Hermes Builder；Founder 不需要阅读本文件全文。

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/agent-response-protocol.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/product.md
  - project-context/tasks/TASK-001/memory-strategy.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-006/route-b-decision.md
  - v2/app/src/app/api/chat/route.ts
  - v2/app/src/lib/dify-client.ts
  - v2/app/src/lib/db.ts
  - v2/app/src/lib/types.ts
external_current_handoff:
  - E:/project-handoffs/TASK-006-current-shared-context-2026-08-16.md
task_id: TASK-006-CONTEXT-WIRING
status: APPROVED_FOR_IMPLEMENTATION
assigned_role: Builder
branch: codex/task-006-context-wiring
base: origin/main@517bc80
execution_mode: persistent_session
```

## 1. 唯一目标

让 `/api/chat` 把现有数据库中已经存在的人设、关系阶段和近期聊天，真实传入 Founder 已发布的 Dify 三个入口变量：

- `persona`
- `relationship_stage`
- `recent_history`

本任务只修复“已有材料没有递到模型”的接线问题。不得修改记忆是否应该使用的判断逻辑，也不得宣称本任务会解决 E004。

## 2. Founder 当前批准与动作权限

Founder 已选择把代码接线交给 Builder，并于 2026-08-17 确认建立正式实现工作区。当前明确授权 Builder 写入修改以下两个文件：

1. `v2/app/src/lib/dify-client.ts`
2. `v2/app/src/app/api/chat/route.ts`

允许读取其他必读文件；允许运行现有 Lint、测试、构建和本地 loopback 验证；允许查看 Dify 本地运行详情以确认三个输入非空。

改动范围严格限定为上述两个文件。本任务没有授权 Git 提交、推送、建 PR、转 Ready、合并、部署、下载/安装、外部网络调用、读取 holdout 或运行 R4 实验。

## 3. 已核验事实与来源等级

### 正式代码事实

- `route.ts` 已通过 `getUserPersona` 取得 persona 和 relationshipStage，并传给 `callDifyChatflow`。
- `dify-client.ts` 的参数声明包含 persona、relationshipStage、conversationId，但函数内部只解构 message、memories、userId。
- Dify 请求没有 persona、relationship_stage、recent_history 输入；两个 conversation_id 位置固定为空字符串。
- 页面展示历史消息，但发送 `/api/chat` 时不传历史。
- `getRecentConversations(userId, limit)` 已存在，返回按时间正序排列的产品自有 conversations 记录。

### Founder 当前运行态事实

Founder 已在 Dify 网页中亲自为开始节点新增并发布 `persona / relationship_stage / recent_history` 三个输入，并把模板接线。该事实来自当前 Hermes 执行 Chief 会话和 Founder 明确回复“已发布”，尚未写入 Git；Builder 应通过本地 Dify 参数或运行详情只读确认。若无法确认，代码可完成静态接线，但不得宣称端到端验收通过。

## 4. 实现要求

### `dify-client.ts`

- 为参数增加 `recentHistory: string`；
- 解构 persona、relationshipStage、recentHistory；
- 在 `body.inputs` 中加入：
  - `persona`：把对象稳定转换成 Dify 文本入口可接收的字符串；
  - `relationship_stage`：relationshipStage；
  - `recent_history`：recentHistory；
- 现有 Memory → user_input 的行为、500 字符保护、query、user_id 和空 Dify conversation_id 均保持不变；本任务不依赖 Dify 内置会话窗口。

### `route.ts`

- 从 `@/lib/db` 导入 `getRecentConversations`；
- 在写入当前用户消息之前读取该用户此前的最近 20 条消息（最多约 10 轮），避免当前消息同时出现在 recent_history 和 user_input；
- 按时间顺序格式化为清晰文本，例如 `用户: ...` / `AI: ...`；无历史时传空字符串；
- 将 recentHistory 传给 `callDifyChatflow`；
- persona、关系阶段、召回阈值、召回条数、异步写入和 Trace 现有行为保持不变。

## 5. 明确不做

- 不新增或修改数据库表、字段、迁移、接口或依赖；
- 不改 Dify 工作流；
- 不启用 Dify 内置会话窗口；
- 不改 `RECALL_THRESHOLD=0.35`、召回条数 5、异步写入模式；
- 不改 `used_memory`、E004 判断、R4、评测或 holdout；
- 不为证明输入而把 persona 或聊天原文写入永久应用日志；优先使用 Dify 本地运行详情作临时验证证据。

## 6. 验收

1. TypeScript / Lint / 现有测试 / 构建在本任务改动后没有新增失败；
2. 静态检查确认三个 Dify 输入均来自实际参数而非写死值；
3. 同一 demo 用户连续发送两条消息时，第二次 Dify 运行详情中的 `recent_history` 包含第一轮对话；
4. Dify 运行详情能看到 persona、relationship_stage、recent_history 非空（无历史的第一轮允许 recent_history 为空）；
5. Git diff 只包含本交接授权的两个产品文件；
6. 不宣称“上下文送达”解决了 E004，也不宣称模型一定采纳了这些材料。

如果本地依赖服务不可用，Builder 仍可完成静态实现和静态检查，但必须把端到端项标为 `NOT_RUN / BLOCKED_BY_RUNTIME`，不能猜测通过。

## 7. 停止条件

发现必须修改第三个文件、Schema、依赖、架构、外部服务、Dify 工作流或评测规则；需要读取 holdout；现有 Dify 三个输入与 Founder 所述不一致；或正式代码事实发生冲突。触发后停止写操作，只上报一个明确问题。

## 8. 交付要求

实施完成后先用大白话告诉 Founder：原来什么没有送到、现在送到了什么、用户会感受到什么、本任务仍没有解决什么、验证做到哪一步。完整技术内容包括实际 diff、检查结果、运行证据和未完成项。

不得自行提交、推送、建 PR、合并或唤醒 Reviewer。Founder 作出下一步决定前不提前给 Reviewer 卡。

## 9. 上下文压缩恢复

压缩或恢复后，重新读取 `AGENTS.md`、`context-manifest.md`、`agent-response-protocol.md`、本交接和共同上下文；重新核验当前分支和动作权限。正式交接中已经记录的两文件写入授权继续有效，不需要 Founder 二次确认；提交、推送、PR 和合并仍未授权。
