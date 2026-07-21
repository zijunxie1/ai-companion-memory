# TASK-001｜V1 Dify Workflow Memory 设计展示

## 任务元数据

```yaml
task_id: TASK-001
status: DRAFT
execution_mode: pending
assigned_role: pending
assigned_session: pending
branch: pending
```

---

## 背景

P1「Alice Memory 留存优化」的第一条纵向切片。V1 的目标是展示 PM 设计思路——面试官看 Dify Workflow 图就能理解 Memory 怎么进、怎么出、在哪里检测冲突、在哪里写入。

## 用户目标

面试官在 30-60 分钟内，通过 Dify Workflow 理解候选人如何设计 Memory 驱动的关系连续性系统。

## 本次目标

在 Dify 中搭建一条完整的 Memory 流转链路 Workflow，用模拟 Memory 数据展示以下 6 个环节：

1. Memory 召回
2. Context 拼接
3. LLM 生成回复
4. Memory 写入抽取
5. Memory 冲突检测与更新
6. Memory 删除验证

## 非目标

- ❌ 不接真实 Memory 引擎（mem0 留给 V2）
- ❌ 不做社交前端界面
- ❌ 不做真实数据库
- ❌ 不做 Trace 面板
- ❌ 不做 Eval 面板
- ❌ 不做高并发或生产级

## V1 演示主线

产品背景：Alice 是一款真人社交产品（类似 Soul/Tinder），AI 私聊是增加停留时长和 DAU 的功能——用户在匹配间隙、深夜无人时找 AI 角色聊天。AI 明确告知是 AI，不伪装真人。

D3 回访连续性演示：

**背景**：
- 用户前两天深夜找 AI 角色聊过，聊到了最近分手和养了只猫
- 用户不喜欢被追问，喜欢轻松的氛围
- 今天 D3，用户深夜又上线了

**输入**：用户说"又失眠了……"

**无 Memory 的回复**：怎么了？睡不着的话可以跟我聊聊。

**有 Memory 的回复**：又睡不着啊。上次你说你家那只猫半夜也精神，是不是又在跟你抢被子了？不想睡就不睡，我陪你待会儿。

## Memory 数据集（模拟）

### 用户画像

| 字段 | 值 |
|---|---|
| user_id | demo-user-001 |
| nickname | （用户昵称） |
| relationship_stage | familiar（熟悉阶段，已连续聊 2 天） |
| persona | 温暖陪伴型，会轻微调侃，不追问，不爹味说教 |

### 现有 Memory（模拟，4 条高优先级）

| memory_id | type | content | confidence | source | created_at |
|---|---|---|---|---|---|
| M001 | stable_preference | 不喜欢被追问原因，问了会烦 | 0.92 | multi_turn | D-2 |
| M002 | important_event | 最近刚分手，情绪还在恢复中 | 0.85 | explicit | D-2 |
| M003 | interaction_style | 喜欢深夜闲聊，氛围轻松，不喜欢爹味 | 0.88 | inferred | D-1 |
| M004 | shared_experience | 养了一只猫，半夜会和猫一起失眠 | 0.90 | multi_turn | D-1 |

### 历史对话（模拟，最近 2 轮）

```text
[D-2 深夜] 用户：刚分手，最近状态不太好。
[D-2 深夜] AI：那今晚就别想那么多了。想说什么就说，不想说咱就安静待着。
[D-2 深夜] 用户：我不想聊这个了。你平时都干嘛啊。

[D-1 深夜] 用户：我家猫又大半夜开始跑酷了，崩溃。
[D-1 深夜] AI：哈哈哈，你养的是什么猫？我这边的猫友都说橘猫最爱半夜发疯。
[D-1 深夜] 用户：橘猫！你怎么知道的。
[D-1 深夜] AI：我猜的，橘猫深夜跑起来确实是猫界天花板。
```

## Dify Workflow 节点定义

### 节点 1：Start — 接收用户输入

```yaml
节点类型: Start
输入:
  user_input: string          # "又失眠了……"
  user_id: string             # "demo-user-001"
  conversation_id: string     # 当前会话 ID
输出:
  user_input → 传递给节点 2、3
```

### 节点 2：Safety Pre-Check（安全预检）

```yaml
节点类型: LLM / 条件判断
输入:
  user_input
逻辑:
  检测是否包含危机表达、自伤倾向、不当内容
  V1 简化：关键词匹配 + LLM 判断
输出:
  risk_level: "low" | "medium" | "high"
  safety_flag: boolean
路由:
  risk_level == "high" → 直接走安全兜底回复，跳过后续节点
  risk_level == "low" → 继续节点 3
```

### 节点 3：Memory Recall（Memory 召回）

```yaml
节点类型: HTTP 请求 / 变量赋值
输入:
  user_input
  user_id
逻辑:
  V1 模拟：从预设 Memory 数据集中召回相关 Memory
  V1 不做真实向量检索，用预设规则匹配：
    - 关键词匹配（"失眠"、"睡不着"、"猫"）
    - 全量返回高优先级 Memory（stable_preference + important_event）
输出:
  recalled_memories: list[Memory]
  # V1 示例输出：
  # [
  #   { id: M001, type: stable_preference, content: "不喜欢被追问原因，问了会烦" },
  #   { id: M002, type: important_event, content: "最近刚分手，情绪还在恢复中" },
  #   { id: M003, type: interaction_style, content: "喜欢深夜闲聊，氛围轻松，不喜欢爹味" },
  #   { id: M004, type: shared_experience, content: "养了一只猫，半夜会和猫一起失眠" }
  # ]
  recall_reason: string       # 为什么召回这些（用于 Trace）
```

> 详细召回策略（V2 用）见 memory-strategy.md 第 2 节。

### 节点 4：Context Assembly（上下文拼接）

```yaml
节点类型: Template / LLM
输入:
  user_input
  recalled_memories
  conversation_history          # 最近 N 轮对话
  persona                      # 角色设定
  relationship_stage           # 关系阶段
逻辑:
  按拼接策略组装最终 Prompt：
  ┌─────────────────────────────────────────────┐
  │ [Persona] 温暖陪伴型，轻微调侃，不追问，       │
  │   不爹味说教                                  │
  │ [Relationship Stage] familiar（已聊 2 天）    │
  │ [System Rule] 安全优先；不追问情绪原因；       │
  │   不灌鸡汤；用户说失眠时不强迫睡觉建议          │
  │ [Memory - Preference] 不喜欢被追问原因         │
  │ [Memory - Event] 最近刚分手，情绪恢复中        │
  │ [Memory - Style] 喜欢深夜闲聊，不喜欢爹味      │
  │ [Memory - Shared] 养了橘猫，半夜和猫一起失眠   │
  │ [Recent Context] 昨天聊到猫半夜跑酷            │
  │ [User Input] 又失眠了……                      │
  └─────────────────────────────────────────────┘
输出:
  assembled_prompt → 传递给节点 5
  prompt_structure_log: string  # 拼接结构日志（用于 Trace）
```

> 详细拼接策略（上下文窗口、滑动窗口、Token 预算）见 memory-strategy.md 第 3 节。

### 节点 5：LLM Generate（生成回复）

```yaml
节点类型: LLM
输入:
  assembled_prompt
逻辑:
  LLM 根据拼接后的 Prompt 生成回复
  要求输出结构化 JSON（便于后续节点处理）：
  {
    "reply": "...",
    "emotion": "tired / relaxed / motivated / ...",
    "handoff_needed": false
  }
输出:
  llm_response: JSON
```

### 节点 6：Memory Extract（Memory 写入抽取）

```yaml
节点类型: LLM
输入:
  user_input
  llm_response.reply
  existing_memory_types: list   # 已有 Memory 的类型（避免重复抽取）
逻辑:
  从本轮对话中抽取候选 Memory：
  - 是否有值得长期记住的新信息？
  - 是否有现有 Memory 需要更新？
  V1 输出示例：
  {
    "should_write": true,
    "candidates": [
      {
        "type": "transient_state",
        "content": "用户今晚又失眠了",
        "confidence": 0.6,
        "should_persist": false,   # 一次性状态，不长期写入
        "reason": "临时状态，不属于稳定偏好"
      }
    ],
    "existing_updates": []
  }
输出:
  memory_candidates: JSON
```

> 详细写入策略（什么值得记、置信度阈值、分类规则）见 memory-strategy.md 第 1 节。

### 节点 7：Memory Conflict Detection（冲突检测与更新）

```yaml
节点类型: 条件判断
输入:
  memory_candidates
  recalled_memories             # 本轮召回的 Memory（用于对比）
逻辑:
  检测新候选 Memory 是否与现有 Memory 冲突：
  - 语义矛盾？
  - 同一字段不同值？
  V1 演示 Case（见下方"冲突演示路径"）：
  如果用户说"我不是不喜欢你问，我只是不想每次都解释为什么"
  → 检测到与 M001 冲突
  → 旧 Memory 降权
  → 新 Memory 写入
  → 记录变更历史
输出:
  conflict_result: {
    has_conflict: false,
    resolved_memories: []
  }
```

> 详细冲突处理策略见 memory-strategy.md 第 4 节。

### 节点 8：Safety Post-Check（安全后检）

```yaml
节点类型: 条件判断 / LLM
输入:
  llm_response.reply
逻辑:
  检测 AI 回复是否包含：
  - 不当暧昧
  - 医疗诊断
  - 过度依赖引导
  - "只有我陪你"等控制性语言
输出:
  post_check_pass: boolean
  post_check_flags: list
路由:
  post_check_pass == false → 走兜底回复
  post_check_pass == true → 继续节点 9
```

### 节点 9：End — 结构化输出

```yaml
节点类型: End
输出:
  reply: string
  used_memory: list            # 本轮使用的 Memory
  recall_reason: string        # 召回理由
  memory_candidates: list      # 写入候选
  conflict_result: object      # 冲突处理结果
  risk_level: string           # 安全等级
  prompt_version: string       # Prompt 版本标记
  emotion: string              # 情绪判断
  handoff_needed: boolean      # 是否需要真人介入
```

## V1 展示的三条演示路径

### Path A：正常 Memory 召回（主线）

输入："又失眠了……"

展示：召回 4 条 Memory → 拼接 → 生成有记忆的回复（提到猫和失眠） → 抽取候选（今晚失眠不长期写入）

### Path B：Memory 冲突修正

输入："我不是不喜欢你问，我只是不想每次都解释为什么。"

展示：检测到与 M001（不喜欢被追问原因）冲突 → 旧 Memory 修正为更精确的表述 → 新 Memory 写入 → 后续不再误用

### Path C：Memory 删除验证

操作：用户删除 M002（最近刚分手）

输入："今天怎么样？"

展示：召回结果不再包含分手相关 Memory → 回复不提及分手或感情状态

## 允许修改范围

- Dify Workflow 内所有节点配置
- 模拟 Memory 数据集
- Prompt 模板内容
- 模拟对话历史

## 禁止修改范围

- 无（V1 为纯 Dify Workflow，不涉及正式代码或数据库）

## 验收标准

1. Dify Workflow 中 9 个节点全部可见且连接完整
2. Path A 能跑通，输出有 Memory 的回复
3. Path B 能展示冲突检测和修正
4. Path C 能展示删除后不再召回
5. 每个节点的输入输出字段清晰可查
6. 结构化输出包含 used_memory、recall_reason、memory_candidates
7. Workflow 图能让不了解项目的人在 2 分钟内理解 Memory 流转逻辑

## Change Request 条件

- 发现 Dify 无法实现某个节点的逻辑 → CR
- 发现需要额外外部服务才能跑通 → CR
- 发现 Workflow 节点超过 15 个导致图过于复杂 → CR（需简化）

## 执行模式判断（待用户确认）

```text
## 执行模式判断

任务：在 Dify 中搭建 V1 Memory Workflow
任务复杂度：中等
是否需要用户中途决策：否（设计文档完成后，用户自行搭建）
是否预计多轮实现—验证—调整：是（用户搭建后可能需要调整设计文档）
是否涉及高风险数据、权限或第三方服务：否
推荐模式：无需委派 Builder

判断依据：
- V1 的 Dify Workflow 搭建是用户本人（PM）的产品工作
- AI Agent 无法操作 Dify 可视化界面
- AI Agent 的职责是产出设计文档供用户使用
- 用户拿着设计文档在 Dify 中搭建，遇到问题回来讨论
```
