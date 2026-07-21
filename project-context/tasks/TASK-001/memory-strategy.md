# TASK-001｜Memory 策略详细设计

> 本文件是 V1 Dify Workflow 的策略参考文档。
> V1 Workflow 中每个环节做简化实现，但本文档记录完整的策略设计，供面试官追问时使用。
> V2 实现时以本文档作为技术方案起点。

---

## 1. Memory 写入策略

### 1.1 什么值得记

| 条件 | 说明 | 示例 |
|---|---|---|
| 用户明确要求记住 | 直接指令 | "记住我不喜欢被追问" |
| 对后续互动有长期价值 | 跨会话有效 | 用户职业、稳定偏好 |
| 多次出现 | 同一信息 ≥ 2 次 | 多次提到喜欢动漫 |
| 属于稳定偏好 | 不轻易变化 | 互动风格、聊天节奏 |
| 影响互动方式 | 改变 AI 应该怎么说 | 不喜欢说教 |
| 影响关系阶段 | 称呼、关系变化 | 开始叫"小鹿" |
| 置信度达到阈值 | ≥ 0.7 | 多次确认的偏好 |

### 1.2 什么不该记

| 类型 | 处理 | 示例 |
|---|---|---|
| 一次性情绪 | 不长期写入，可做会话级上下文 | "今天很烦" |
| 随口玩笑 | 不写入 | — |
| 低置信度推测 | 进入待确认，不直接写入 | 单次出现的模糊表达 |
| 敏感隐私 | 禁止或需用户确认 | 身份证、精确住址 |

### 1.3 Memory 类型分类（完整 8 种）

| 类型 | 优先级 | 存储策略 | 示例 | V1 演示 |
|---|---|---|---|---|
| stable_preference | 高 | 长期，高置信度 | 不喜欢被说教 | ✅ M001 |
| important_event | 高 | 长期，到期后降权 | 准备面试 | ✅ M002 |
| relationship_node | 高 | 长期，不可自动清理 | 称呼、关系阶段 | ✅ 可合入 M004 |
| shared_experience | 高 | 长期，构成关系基础 | 一起准备过面试 | ✅ M004 |
| interaction_style | 高 | 长期 | 喜欢轻松陪伴 | ✅ M003 |
| long_term_interest | 中 | 长期，召回优先级中 | 喜欢动漫 | ⬜ V2 |
| transient_state | 低 | 会话级，不跨会话 | 今天很累 | ⬜ 抽取节点展示拒绝写入 |
| sensitive_private | 禁止 | 不写入或需确认 | 身份证 | ⬜ Safety 节点带过 |

### 1.4 写入流程

```text
对话文本
  ↓
LLM 抽取候选事实
  ↓
判断：是否值得写入？
  ├── 是 → 分类 → 置信度评估
  │     ├── confidence ≥ 0.7 → 直接写入
  │     └── confidence < 0.7 → 待确认队列
  └── 否 → 丢弃或仅做会话级上下文
  ↓
写入 Memory 存储（附带 source、timestamp、confidence）
```

---

## 2. Memory 召回策略

### 2.1 召回优先级（V2 用，V1 简化）

| 优先级 | 来源 | 说明 |
|---|---|---|
| P0 | 安全禁止项 | 用户明确说"不要提起 XX" |
| P1 | 当前话题强相关 Memory | 语义相似度匹配 |
| P2 | 用户稳定偏好 | 每轮必带（互动风格、禁忌） |
| P3 | 共同经历和关系阶段 | 关系连续性核心 |
| P4 | 普通兴趣 | 有 Token 余量时才带 |

### 2.2 V1 简化召回规则

V1 不做真实向量检索，用以下规则模拟：

```text
1. 始终返回 P2（稳定偏好 + 互动风格）—— 每轮必带
2. 关键词匹配当前输入：
   - "准备" / "面试" → 返回 M002（important_event）+ M004（shared_experience）
   - "累" / "不想" → 返回 M001（stable_preference：不喜欢说教）
3. Token 预算检查：总 Memory 不超过 500 token
4. 输出 recall_reason 说明为什么返回每条 Memory
```

### 2.3 V2 召回策略（面试官追问时展示）

```text
用户输入
  ↓
Embedding 向量化
  ↓
向量检索（cosine similarity > 阈值）
  ↓
结果重排序：
  - 安全禁止项 boost 到最前
  - 稳定偏好始终保留
  - 关系节点权重加成
  - 时效性衰减（important_event 到期降权）
  ↓
Token 预算截断（优先保留高优先级）
  ↓
输出 recalled_memories + recall_reason
```

---

## 3. Context 拼接策略

### 3.1 Prompt 结构（分层拼接）

```text
┌─────────────────────────────────────────────────┐
│ Layer 1: System Prompt                          │
│   - 安全规则（硬约束）                            │
│   - 角色边界（不做医疗诊断、不诱导依赖）            │
├─────────────────────────────────────────────────┤
│ Layer 2: Persona                                │
│   - 角色性格设定                                 │
│   - 语气风格                                     │
│   - 关系阶段（familiar / close / ...）           │
├─────────────────────────────────────────────────┤
│ Layer 3: Memory                                 │
│   - [Preference] 不喜欢被说教                    │
│   - [Event] 正在准备 AI PM 面试                   │
│   - [Style] 喜欢轻松陪伴                          │
│   - [Shared] 一起讨论过 Memory 讲法              │
│   按类型分组，标注来源和置信度                     │
├─────────────────────────────────────────────────┤
│ Layer 4: Conversation Context                   │
│   - 滑动窗口最近 N 轮对话                         │
│   - 或摘要（长对话时用摘要替代全量历史）            │
├─────────────────────────────────────────────────┤
│ Layer 5: User Input                             │
│   - 当前用户消息                                  │
└─────────────────────────────────────────────────┘
```

### 3.2 滑动窗口策略

| 场景 | 策略 | Token 预算 |
|---|---|---|
| 短对话（< 10 轮） | 全量历史 | 不限 |
| 中等对话（10-30 轮） | 滑动窗口最近 10 轮 + 更早的摘要 | 历史 ≤ 1000 token |
| 长对话（> 30 轮） | 最近 5 轮 + 关键事件摘要 + 关系阶段摘要 | 历史 ≤ 800 token |
| 超长对话 | 仅摘要 + 关系阶段 + 最近 3 轮 | 历史 ≤ 500 token |

### 3.3 Token 预算分配

| 层 | Token 预算 | 说明 |
|---|---|---|
| System + Persona | 200-300 | 固定 |
| Memory | 300-500 | 动态，按优先级截断 |
| Conversation Context | 500-1000 | 动态，滑动窗口 |
| User Input + 生成预留 | 1000-2000 | 给 LLM 生成留空间 |
| **总计** | **~4000 token** | 可根据模型调整 |

### 3.4 V1 简化拼接

V1 不做 Token 计算，直接按 Layer 1-5 顺序拼接预设内容。拼接后的完整 Prompt 在节点 4 的输出日志中可见。

---

## 4. Memory 冲突检测与更新策略

### 4.1 冲突类型

| 类型 | 示例 | 检测方式 |
|---|---|---|
| 直接否定 | 用户说"我不是不喜欢被说教" | LLM 判断 + 关键词匹配 |
| 值变更 | 用户纠正"我现在喜欢动漫了，不喜欢游戏了" | 同字段不同值 |
| 语义矛盾 | 旧 Memory"性格开朗"，新信息"最近抑郁" | LLM 语义对比 |

### 4.2 处理规则

```text
检测到冲突
  ↓
判断置信度：
  - 用户明确纠正 → 新信息 confidence = 1.0
  - LLM 推测冲突 → 新信息 confidence = 0.6，标记待确认
  ↓
处理旧 Memory：
  - 明确纠正 → 旧 Memory 降权（weight *= 0.1）或归档
  - 推测冲突 → 旧 Memory 保留，标记 conflict = true
  ↓
写入新 Memory：
  - 附带 supersedes: [旧 memory_id]
  - 保留变更历史
  ↓
记录 Trace：
  - 旧 Memory ID、新 Memory ID、冲突原因、处理方式
```

### 4.3 V1 冲突演示

V1 用 Path B 演示：
- 用户说"我不是不喜欢被说教，我只是不想今天聊这个"
- 节点 7 检测到与 M001 冲突
- 旧 M001 内容修正
- 后续对话不再误用旧 Memory

---

## 5. Memory 删除策略

### 5.1 删除级别

| 级别 | 操作 | 示例 |
|---|---|---|
| 用户主动删除 | 硬删除，立即生效 | 用户在 Memory 管理页删除 |
| 自动过期 | important_event 到期后降权，不删除 | 面试结束后面试事件衰减 |
| 系统清理 | 低置信度 + 长期未召回的 Memory 归档 | 置信度 < 0.3 且 30 天未召回 |

### 5.2 删除后的防重注入（关键）

> 这是重度用户最敏感的问题——删了的东西不能从摘要或缓存重新出现。

| 风险点 | 防御措施 |
|---|---|
| 对话历史中包含已删除信息 | 删除时同步清理历史摘要中的相关内容 |
| LLM 摘要中保留了已删除事实 | 摘要生成时传入 deleted_memory_ids 列表 |
| 向量索引残留 | 删除时同步删除向量索引 |
| Prompt 缓存 | 不使用 Prompt 缓存，或缓存 key 包含 memory 版本 |

### 5.3 V1 删除演示

V1 用 Path C 演示：
- 用户删除 M002（准备面试）
- 节点 3 召回时不再返回 M002
- 后续回复不提及面试
- 输出 recall_reason 标注"M002 已删除，已排除"

---

## 6. Memory 数据结构（V2 实现）

### 6.1 Memory 表结构（面试官追问时展示）

```sql
CREATE TABLE memories (
  id              VARCHAR PRIMARY KEY,
  user_id         VARCHAR NOT NULL,
  agent_id        VARCHAR,              -- AI 角色 ID
  type            VARCHAR NOT NULL,     -- stable_preference / important_event / ...
  content         TEXT NOT NULL,
  confidence      FLOAT DEFAULT 0.5,
  source          VARCHAR,              -- explicit / multi_turn / inferred
  status          VARCHAR DEFAULT 'active',  -- active / archived / deleted / pending
  weight          FLOAT DEFAULT 1.0,
  supersedes      VARCHAR[],            -- 替代了哪些旧 Memory
  conflict_with   VARCHAR[],
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,
  expires_at      TIMESTAMP,            -- important_event 到期时间
  metadata        JSONB                 -- 扩展字段
);
```

### 6.2 变更历史表

```sql
CREATE TABLE memory_changes (
  id              SERIAL PRIMARY KEY,
  memory_id       VARCHAR NOT NULL,
  change_type     VARCHAR,              -- create / update / delete / conflict / restore
  old_content     TEXT,
  new_content     TEXT,
  reason          TEXT,
  changed_by      VARCHAR,              -- user / system / agent
  created_at      TIMESTAMP
);
```

---

## 7. Safety 策略（底线）

### 7.1 V1 安全检测范围（简化）

| 检测项 | V1 实现 | V2 实现 |
|---|---|---|
| 危机表达（自伤/自杀） | 关键词 + LLM 判断 | 独立 Safety Classifier Workflow |
| 情感依赖 | 不做 | 依赖度评分 + 频率监控 |
| 不当暧昧 | 关键词过滤 | LLM 判断 + 规则 |
| 隐私泄露 | 不做 | PII 检测 + 脱敏 |

### 7.2 安全兜底回复

```text
[危机表达检测到时]
→ 降低暧昧语气
→ 不说"只有我陪你"
→ 不进行医疗或心理诊断
→ 鼓励联系可信任真人
→ 触发平台安全策略
→ 输出 handoff_needed: true
```
