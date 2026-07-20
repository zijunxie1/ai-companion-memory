# Agent 交接、Review 与任务状态机

## 1. 三个不同动作

### 新开同角色会话

角色不变，只清理上下文。

适用于：

- 当前聊天过长；
- Agent 反复引用已否决方案；
- Agent 无法准确复述当前任务；
- 当前任务仍属于同一职责，但上下文污染。

新会话必须重新提供：

- 当前任务；
- 最新代码状态；
- 测试结果；
- 剩余问题；
- 相关正式契约。

### 新建或切换 Agent

职责、权限、视角或专业能力发生变化。

例如：

- Chief of Staff → Builder；
- Builder → Reviewer；
- Reviewer → Builder 修复；
- Reviewer → 用户审批；
- 合并后 → Release / QA。

### 任务交接

当前角色的职责已经完成，但整个功能尚未完成，因此交给下一角色。

交接必须依赖结构化交接包，不依赖聊天记忆。

---

## 2. 任务状态机

所有功能任务使用以下状态：

```text
IDEA
→ DRAFT
→ APPROVED
→ IN_PROGRESS
→ IMPLEMENTED
→ IN_REVIEW
→ CHANGES_REQUESTED / REVIEW_APPROVED
→ MERGED
→ DEPLOYED
→ VERIFIED
→ CLOSED
```

---

## 3. 状态含义和负责人

### IDEA

用户提出想法。

负责人：Chief of Staff。

动作：

- 判断是否值得做；
- 判断是否需要调研、Demo 或 Spike；
- 不交给 Builder。

### DRAFT

Chief of Staff 正在形成任务草案。

必须包含：

- 目标；
- 非目标；
- 风险；
- 验收标准；
- 拟议变化；
- 修改边界。

任务尚不能开发。

### APPROVED

用户已批准：

- 需求；
- 范围；
- 验收标准；
- 风险；
- 允许修改范围。

这是交给 Builder 的门。

### IN_PROGRESS

Builder 正在实现。

同一目标、同一职责且上下文清晰时，不要随意更换 Builder。

出现边界或方案冲突时提交 Change Request。

### IMPLEMENTED

Builder 声称实现完成。

必须同时满足：

- 功能实现完成；
- 新测试已增加；
- 原有测试通过；
- 构建、Lint 和类型检查通过；
- 正式契约变化已进入同一 PR；
- 没有未处理 Change Request；
- Builder 已提交实现报告。

这是 Builder 停止并交给 Reviewer 的门。

### IN_REVIEW

Reviewer 独立审查。

Builder 不再随意继续修改，除非收到审查意见。

### CHANGES_REQUESTED

Reviewer 发现必须修改的问题。

通常交回原 Builder，因为原 Builder 最了解实现。

只有以下情况才考虑更换 Builder：

- 同一问题连续两轮没有修正；
- 实现方向根本错误；
- 需要不同专业能力；
- Builder 反复超范围或破坏测试；
- 需要推倒重来。

### REVIEW_APPROVED

Reviewer 技术审查通过。

这不等于自动合并。

下一步：交用户决定是否合并。

### MERGED

代码、测试、迁移和正式契约已合并主分支。

从此才属于项目当前事实。

### DEPLOYED

已部署到目标环境。

部署成功不等于任务完成。

### VERIFIED

部署后已验证：

- 核心流程可用；
- 数据读写正确；
- 权限正确；
- 日志无严重异常；
- 成本或调用量无异常；
- 回滚信息可用。

### CLOSED

任务正式完成，可开始下一个任务。

---

## 4. 四个 Review 门

### Review 1：任务方案 Review

开发前由用户审查 Chief of Staff 草案。

检查：

- 是否解决正确问题；
- 范围是否足够小；
- 验收标准是否可判断；
- 是否有不必要的数据表、接口或依赖；
- 权限和成本是否考虑；
- 是否应先做 Spike。

通过后：`DRAFT → APPROVED`。

### Review 2：实现计划 Review

中等以上任务，Builder 写代码前应先给出：

- 计划修改文件；
- 数据流；
- 新增测试；
- 风险；
- 契约冲突。

涉及数据库、权限、外部服务时必须进行。

### Review 3：代码与行为 Review

Builder 完成后由独立 Reviewer 执行。

输入：

- 任务说明；
- 验收标准；
- 正式契约；
- diff；
- 测试结果；
- Builder 报告。

### Review 4：部署后 Review

检查真实环境：

- 核心流程；
- 权限；
- 日志；
- 数据；
- 成本；
- 回滚。

通过后才能关闭任务。

---

## 5. 角色 Definition of Done

### Chief of Staff 完成标准

- 已质疑需求，而非机械转述；
- 已分析影响；
- 已形成明确任务单；
- 已定义验收标准；
- 已列风险和停止条件；
- 已获得用户批准；
- 已形成可交给 Builder 的任务包。

### Builder 完成标准

- 所有验收标准均有对应实现；
- 构建、Lint、类型检查、测试通过；
- 未削弱验收护栏；
- 未未经批准超范围修改；
- 迁移和正式契约已同步进入 PR；
- 已提交实现报告；
- 没有未处理 Change Request；
- PR 可供 Reviewer 审查。

### Reviewer 完成标准

- 已读取任务、契约、diff 和测试结果；
- 已逐项检查验收标准；
- 已检查权限、测试和范围；
- 已输出明确结论；
- 阻塞问题有证据和修改建议；
- 未直接替 Builder 修改代码。

### Release / QA 完成标准

- 部署成功；
- 迁移成功；
- 健康检查通过；
- 核心冒烟流程通过；
- 日志无严重异常；
- 回滚信息已记录；
- 部署版本已记录。

---

## 6. 交接包

### Chief of Staff → Builder

必须提供：

- 任务目标；
- 非目标；
- 验收标准；
- 允许修改范围；
- 禁止修改范围；
- 相关正式契约；
- 拟议变化；
- 必须运行的测试；
- Change Request 条件。

没有验收标准，不允许交接。

### Builder → Reviewer

必须提供：

- 实现摘要；
- 实际修改文件；
- 关键设计选择；
- 新增或修改测试；
- 构建、Lint、类型检查和测试结果；
- 已知限制；
- 与原任务方案的偏差；
- 未解决问题；
- PR 或 diff。

如果存在未解决重大问题，不能声称 `IMPLEMENTED`。

### Reviewer → 用户

必须提供：

- 审查结论；
- BLOCKER / MAJOR / MINOR / SUGGESTION；
- 验收标准逐项结果；
- 权限和安全结论；
- 测试充分性；
- 是否超范围；
- 是否建议合并；
- 剩余风险。

### 用户 → Release / QA

必须提供：

- 已批准 PR；
- 目标环境；
- 迁移说明；
- 环境变量变化；
- 部署步骤；
- 健康检查；
- 冒烟测试；
- 回滚方案。

---

## 7. 什么时候新建 Agent

考虑切换 Agent 的条件：

1. 职责发生变化；
2. 需要独立视角；
3. 需要新的专业能力；
4. 当前角色上下文严重污染；
5. 工作可以真正独立并行。

### 不应该切换的情况

- 当前只是修小错误；
- Reviewer 要求补测试或修明确 Bug；
- 任务仍属于同一纵向切片；
- 只是聊天太长，可以新开同角色会话；
- 旧 Agent 尚未输出完整交接包。

---

## 8. 并行 Builder 的条件

只有满足以下条件才并行：

- 不修改同一核心模块；
- 不修改同一数据库 Schema；
- 不依赖对方未完成接口；
- 不共享迁移顺序；
- 不修改同一公共组件；
- 合并顺序不会改变行为。

否则串行执行。

---

## 9. 固定状态报告

要求 Chief of Staff 和每个执行 Agent 在重要节点输出：

```text
## 当前任务状态
IDEA / DRAFT / APPROVED / IN_PROGRESS / IMPLEMENTED /
IN_REVIEW / CHANGES_REQUESTED / REVIEW_APPROVED /
MERGED / DEPLOYED / VERIFIED / CLOSED

## 当前负责人
User / Chief of Staff / Builder / Reviewer / Release

## 当前阶段是否完成
是 / 否

## 完成依据
列出已满足条件。

## 下一交接对象
谁接手；没有则写“无”。

## 交接前仍缺少什么
没有则写“无”。

## 建议动作
继续当前 Agent / 新开同角色会话 /
交接另一 Agent / 请求用户裁决
```

---

## 10. 快速决策表

| 当前情况 | 下一步 |
|---|---|
| 只有模糊想法 | Chief of Staff |
| 需求明确但无验收标准 | Chief of Staff 继续 |
| 任务已获用户批准 | Builder |
| Builder 发现边界冲突 | Change Request → 用户裁决 |
| Builder 写完但测试未过 | 原 Builder 继续 |
| Builder 全部检查通过 | Reviewer |
| Reviewer 发现普通问题 | 原 Builder 修复 |
| Reviewer 发现方案根本错误 | 回 Chief of Staff 重做方案 |
| Reviewer 批准 | 用户决定合并 |
| 已合并未部署 | Release / QA |
| 已部署未验证 | Release / QA 继续 |
| 生产验证完成 | CLOSED |
| 新工作需要不同能力 | 新建专业 Agent |
| 同角色上下文污染 | 新开同角色会话 |
| 两任务修改相同核心文件 | 串行，不并行 |

> 最终原则：同一职责内继续做；职责变化时交接；实现完成后必须独立 Review；只有本角色的完成条件全部满足，才允许交给下一个 Agent。
