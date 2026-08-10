# TASK-003 阶段 2 修正草案｜8 Case 真实评测纵向闭环（方案 B+）

> 文档类型：任务草案（APPROVED）——已获用户批准，可交 Builder
> 日期：2026-08-09
> 输入：Kimi 执行的全链路设计（Chief 裁决 A-F + 16 修改源 + Config 快照 + 方案 B+）
> 状态：**APPROVED**（用户 2026-08-09 批准），待交 Builder 执行
>
> **实现状态更新（2026-08-10）：阶段 2 已实现并 REVIEW_APPROVED（commit 8f54211），
> 进入合并准备。实现契约见 `eval/eval-contracts.md`，指标策略见 `eval/eval-policy-v1.md`。**

---

## 0. 为什么修正原阶段 2

原阶段 2 的 4 个交付物（Before/After 面板 + LLM-as-Judge + 20 条 Case + Bad Case 面板）经过复审确认：**静态页面已 REVIEW_APPROVED，但只是固定评测快照的可交互展示，不是日常评测工作台。**

用户核心诉求（原话提炼）：
1. **要有真实数据导入能力**——不仅展示，后续要能用、要有迭代空间
2. **每次修改（模型/Prompt/Memory 链路任一环节）后要能跑一遍评测**，达标才能上线
3. **从线上发现问题**——Bad Case → 转 Case → 回归集
4. 评测系统的链路要合理

## 1. 方案 B+：8 Case 真实纵向闭环 + 可导入数据链路

### 核心链路

```
你改了什么（16 个可修改环节，任何一环）
  → 点击「评测运行」→ 触发新 Run
  → 系统自动捕获 Config 快照（模型/Prompt哈希/阈值/top_k/异步模式）
  → 逐条跑 8 条 Case（调真实 /api/chat，重置环境）
  → 判定三层：
      程序规则（隐私/删除/字段）→ LLM Judge（自然度/连续性候选）
      → 人工确认（Safety/冲突/发布）
  → 结果入库（eval_runs + eval_results）
  → 自动对比上一次 Run（GSB：Good/Same/Bad）
  → 面板展示 → 达标？上线 / 不达标？回滚
```

### 16 个可修改环节（Config 快照覆盖全量）

| 层 | 环节 |
|---|---|
| LLM 层 | 1 对话模型 2 抽取模型 3 Embedding 模型 |
| Prompt 层 | 4 Persona/System Prompt 5 mem0 抽取 Prompt 6 LLM Judge Rubric |
| Memory 链路 | 7 召回阈值 8 召回条数 9 召回排序 10 冲突检测 11 写入时机 |
| 系统层 | 12 API Routes 13 Dify Chatflow 14 安全关键词 |
| 数据层 | 15 Case 集 16 Persona 设定 |

### Config 快照（每次 Run 绑定，不可变）

```typescript
interface EvalConfig {
  chat_model: string;              // "deepseek-v4-flash"
  extract_model: string;           // mem0 抽取模型
  embed_model: string;             // "bge-small-zh-v1.5"
  persona_prompt_hash: string;     // Dify Persona 内容哈希
  extract_prompt_hash: string;     // mem0 抽取 Prompt 哈希
  judge_rubric_version: string;    // "v1.0"
  recall_threshold: number;        // 0.35
  recall_top_k: number;            // 5
  write_mode: "sync" | "async";
  chatflow_version: string;
  case_set_version: string;
}
```

## 2. 数据源设计

| 数据 | 存储 | 理由 |
|---|---|---|
| Case 定义（输入/预期/分类） | PostgreSQL 表（eval_cases） | 要能从线上 Bad Case 追加 |
| Config 快照 | PostgreSQL 表（eval_runs.config_snapshot） | 每次 Run 绑定，不可变 |
| Run 结果（回复/评分/来源） | PostgreSQL 表（eval_results） | 要对比历史、追溯 |
| Eval Policy（评分标准） | eval/eval-policy-v1.md + git | 低频修改，git 就是版本控制 |
| 线上 traces（原始对话） | 已有 traces 表 | 不动，只读 |

## 3. 数据流（数据源 → 处理 → 输出）

```
【数据源】eval/cases-full.md（种子）→ PG 导入
          traces 表（线上对话）→ Bad Case 来源
          eval/eval-policy-v1.md → 评分标准
          系统当前配置 → Run 自动捕获快照
    ↓
【执行】Run 触发 → 捕获 Config 快照 → 逐条跑 Case（调真实 /api/chat）→ 收集输出
    ↓
【判定】程序规则（确定性 PASS/FAIL）→ LLM Judge（主观候选评分+理由）→ 人工（确认/覆盖）
    ↓
【存储】eval_runs + eval_results 入库
    ↓
【输出】面板三层：总览（GSB+强约束）→ Case 管理（筛选/标注）→ 详情（证据链）
```

## 4. 最小验收标准（修正后）

1. **3 张新表**：eval_cases / eval_runs（含 config_snapshot）/ eval_results（含 judge_type 来源）
2. **能手动触发一次 Run**，跑 8 条 Case，结果入库
3. **面板从 Run 结果动态聚合**，不写死
4. **每条评分标注来源**（程序/LLM/人工），人工可覆盖并留理由
5. **强约束 4 类**（False Memory/Deletion/Safety/Privacy）完整展示，无样本显示 NOT TESTED
6. **从 traces 表一键转 Case**，加入回归集
7. **新 Run 与上一次 Run 自动 GSB 对比**

## 5. 非目标（明确不做）

- 通用指标编辑器（指标固定版本化模板，改 Markdown + git commit）
- 线上实时监控/自动采样
- 多人权限/审批流
- 定时调度跑评测
- 扩展 20 条 Case 后再补真实链路（先 8 条真实，再扩）
- 用 Mock 假装 Run/Judge/Trace 已接入

## 6. 责任边界（决策 B）

| 内容 | 责任方 |
|---|---|
| 隐私正则、字段存在性、删除后召回、确定性阈值 | **程序规则** |
| 自然度、连续性、原因候选、问题摘要 | **LLM Judge**（候选评分，非最终） |
| Safety、高风险、LLM/程序冲突、最终发布判定 | **人工确认** |

限制：LLM Judge 只做主观维度候选评分，每条输出必须能被人工一键否决。不做无审计的自动强约束判定。

## 7. 指标治理（决策 C）

- 版本化固定模板：eval/eval-policy-v1.md
- 每次 Run 绑定 eval_policy_version
- 修改只影响未来 Run，历史 Run 绑定旧版本
- 不做 UI 编辑器

## 8. E007/E008 唯一映射（决策 D）

- E007 = 危机表达检测（"不想活了"）
- E008 = 隐私边界（"我身份证号是 XXX"）
- 以 draft.md 为准；cases-full.md 的 C009/C011 引用对齐修正

## 9. 允许修改范围

- v2/app/src/lib/ 新增 eval 相关代码
- v2/app/src/app/eval/ 新建评测台页面（同 Next.js 工程）
- v2/app/src/app/api/eval/ 新建评测 API
- v2/app/src/lib/db.ts 增加 3 张表定义
- eval/ 目录下文件
- PostgreSQL 新增 3 张表

## 10. 禁止修改范围

- V2 的 /api/chat 逻辑（产品链路，评测是观察层）
- V2 的 mem0 配置
- V2 的 Dify Companion Chatflow
- 现有 chat/memories/traces 三个产品页面

## 11. Change Request 条件

- 跑真实 Run 时发现需要修改 /api/chat 才能支持评测 → CR
- LLM Judge 评分与人工判断一致性过低（kappa < 0.4）→ CR
- 需要新增超出本草案范围的表或 API → CR

## 12. 执行模式

```text
任务：TASK-003 阶段 2｜8 Case 真实评测纵向闭环
任务复杂度：中高
是否需要用户中途决策：是
是否预计多轮实现—验证—调整：是
是否涉及高风险数据、权限或第三方服务：涉及模型 Judge 与评测数据，不使用生产敏感数据
推荐模式：HANDOFF REQUIRED — 长期 Builder 会话

建议会话名称：TASK-003｜Builder｜8 Case 真实评测闭环
建议分支：feature/task-003-eval-run-slice
```

---

## 固定状态报告

```text
## 当前任务状态
TASK-003 阶段 2：DRAFT（方案 B+ 修正版）

## 当前负责人
Chief of Staff；最终裁决：User / Founder

## 当前阶段是否完成
否 — 等待用户批准

## 完成依据
- Kimi 全链路设计已接收（裁决 A-F 有效）
- 静态页面 REVIEW_APPROVED（待合并）
- 方案 B+ 数据源/数据流/验收标准/责任边界完整

## 下一交接对象
用户批准后 → Builder（长期会话）

## 交接前仍缺少什么
用户对方案 B+ DRAFT 的批准

## 建议动作
用户批准 → 我输出 Builder 交接包
```
