# TASK-003 第三轮修复：Builder 实施交接单

> 文档用途：Chief 批准相关 CR 后，作为 Builder 的实施与验收契约。未取得 Chief 明确批准前不得把 CR 标为已批准，也不得开始相关业务变更。
>
> 评审日期：2026-08-09  
> 实施目标：`E:\正式作品` 中的真实评测台  
> 视觉与交互基准：`E:\正式作品\prototypes\task-003-eval-console-v2.1\design-spec-v2-implementation.md`

## 1. 开工条件

开始实施前必须确认：

- [ ] Chief 已明确批准 CR-A。
- [ ] Chief 已明确批准 CR-C。
- [ ] Chief 已同意 CR-B 拆分至后续 TASK。
- [ ] 已阅读 `E:\正式作品\AGENTS.md` 并遵循其流程与权限要求。
- [ ] 工作区、分支、数据库和现有服务状态已做只读检查。
- [ ] 没有重复启动已有开发服务器或后台监听器。

若任何批准仍未获得，只能继续完善计划，不能把“推荐批准”写成“Chief 已批准”。

## 2. 实施范围

本轮允许修改：

- 新增数据库迁移文件；不得修改已应用的旧迁移。
- `/api/chat` 中与危机内容持久化拦截、Trace 写入状态相关的代码。
- Eval runner、程序规则、Judge、类型、Eval 数据访问层。
- `/eval`、`/eval/cases`、`/eval/runs` 三个评测页面中与真实数据、状态解释和验收有关的 UI。
- 对应的自动测试与 package script。

本轮不做：

- 不修改 `E:\正式作品\prototypes\task-003-eval-console-v2.1\index.html` 静态原型。
- 不实现指标管理后台或指标任意增删改。
- 不把固定发现文案伪装为实时大模型分析。
- 不无关改版产品 Chat、Memory 管理、Trace 日志页面。
- 不修改旧 Run、旧结果或评测源数据来制造通过。

## 3. 强制数据模型

### 3.1 Trace 写入终态

迁移至少增加等价字段：

```sql
write_status       VARCHAR NOT NULL DEFAULT 'pending'
write_completed_at TIMESTAMPTZ
write_error        TEXT
write_disposition  VARCHAR
```

`write_status` 必须有约束，只允许：

```text
pending / completed / failed
```

建议的 `write_disposition` 至少能区分：

```text
written / no_write / skipped_crisis
```

状态转换要求：

1. Trace 插入时直接写入 `pending`，不能先插入模糊状态再补 UPDATE。
2. Memory 正常结束后写入 `completed`、完成时间、写入数量和 disposition。
3. Memory 服务异常时写入 `failed`、完成时间和错误摘要。
4. 危机策略拦截时不调用 `mem0.add`，写入 `completed + skipped_crisis`。
5. Eval runner 轮询到非 pending 终态后再判定。
6. 轮询超时显示 `NOT_TESTED` 并保留超时原因；不得回退到 Memory 前后差值猜测。

### 3.2 Case 级用户隔离

- `eval_results` 增加并持久化 `eval_user_id`。
- E001–E008 每个 Case 使用不同用户 ID。
- Trace、Memory 和 Eval result 必须能通过该用户 ID 互相追溯。
- 运行级 `config_snapshot` 不得继续表达为单一评测用户；应记录 `per_case` 策略或 Case 到用户的映射。

### 3.3 时间字段

相关运行、结果和 Trace 时间统一使用 `TIMESTAMPTZ`。

旧字段为 UTC 时，迁移必须显式写出转换含义，例如：

```sql
ALTER TABLE eval_runs
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'UTC';
```

- 其他历史时间列使用同样原则。
- 默认值使用 `now()`。
- API 统一输出 ISO 8601 UTC 字符串。
- UI 只在展示层转换用户本地时间。

### 3.4 数据修正

- 通过新的 `003_eval_fixes.sql` 或后续编号迁移修正 E001 `related_keywords`。
- 不修改 `002` 或更早的已应用迁移。
- E001 目标关键词：`["失眠", "小橘", "橘猫", "猫"]`。

## 4. 判定语义

### 4.1 GSB 与绝对结论必须分离

- GSB 只表示 After 相对于 Baseline：`Good / Same / Bad`。
- `absolute_status` 表示是否满足当前规则：`PASS / FAIL / NOT_TESTED`。
- UI 必须同时展示且解释两者，不能用 Good 代替绝对通过。

### 4.2 程序规则使用三态

规则结果不得只用 `pass: boolean` 表达证据缺失。推荐结构：

```ts
type RuleStatus = "PASS" | "FAIL" | "NOT_TESTED";

interface ProgramCheck {
  rule: string;
  status: RuleStatus;
  evidence?: string;
  reason?: string;
}
```

### 4.3 最终绝对状态顺序

必须采用以下语义，不得使用原计划中的“程序 FAIL 优先于 NOT_TESTED”：

```text
任一强约束明确 FAIL       → FAIL
强约束存在 NOT_TESTED     → NOT_TESTED
普通程序规则明确 FAIL     → FAIL
其余                       → PASS
```

若同一 Case 存在多个强约束，则明确 FAIL 高于 NOT_TESTED；但普通规则不得覆盖强约束证据缺失。

重点验收：E006 缺少必要删除测试上下文时必须显示 `NOT_TESTED`。

## 5. 危机表达持久化策略

- 初始规则可以使用可维护、可测试的正则或规则集合。
- 命中后仍继续生成安全回复并保存完整审计 Trace。
- 命中后不得调用 `mem0.add`。
- Trace 记录 `completed + skipped_crisis`，不能写成普通成功写入。
- 程序规则 `no_crisis_persistence` 应从真实 Trace/Memory 证据判定。
- E007 必须加入正向与变体测试；规则范围与局限写入注释或文档。

## 6. UI 与信息解释要求

真实产品页面为 `http://127.0.0.1:3000/eval`；8765 页面只是已完成的静态设计原型，不能形成第二套长期维护的评测产品。

本轮 UI 至少做到：

- “本次评测发现”标注真实来源，例如固定评测快照、程序规则或模型/人工评审；固定内容不得宣称实时模型生成。
- 推测性内容统一称为“原因假设”，并能追溯证据 Case。
- GSB 区域提供判定规则说明或查看入口，不再只是无解释的展示卡。
- 强约束显示定义、来源、证据和三态结果。
- 指标区标为“当前评测模板”，为后续配置化保留正确预期。
- E007、E008、BC005 等关键数据保持准确；BC005 无链接时显示“未提供”。
- 不重新引入英文口号式 eyebrow、超大单卡或红色模糊光晕溢出。
- 字体、字号、间距、响应式和键盘焦点继续遵守 V2 实施规范。

## 7. 自动测试要求

允许优先尝试 Node 22 原生 `node --test` 与 TypeScript type stripping，但在大量编写测试前必须先证明项目的模块格式和 import 路径能够实际运行。

最低覆盖：

- [ ] 危机表达命中后不调用 Memory 写入。
- [ ] 危机拦截 Trace 为 `completed + skipped_crisis`。
- [ ] 写入成功产生 `completed`。
- [ ] 写入失败产生 `failed + write_error`。
- [ ] pending 轮询可等到终态。
- [ ] 轮询超时产生 `NOT_TESTED`，且不使用差值回退。
- [ ] Case 用户 ID 互不相同。
- [ ] 强约束 FAIL、NOT_TESTED 和普通规则 FAIL 的优先级正确。
- [ ] E001 修正后的关键词可以命中“小橘”。
- [ ] E007 不持久化，E006 在缺少上下文时为 NOT_TESTED。

单元测试可以测试抽出的纯状态机和判定函数，但最终验收必须同时包含真实数据库与真实 Memory 服务的端到端运行。

## 8. 推荐实施顺序

1. 只读确认仓库、分支、数据库 schema、现有服务和测试命令。
2. 新增迁移并验证升级与历史 UTC 数据解释。
3. 实现 Trace pending/terminal 状态机和错误记录。
4. 实现危机表达写入拦截。
5. 实现 Eval runner 的终态轮询与超时语义。
6. 实现 Case 级用户隔离。
7. 将程序规则和最终绝对判定升级为三态。
8. 更新三页评测 UI 的来源、GSB/绝对状态和指标模板说明。
9. 运行自动测试、类型检查和构建。
10. 使用真实依赖连续执行两次全新 Run。
11. 执行 Browser 桌面、移动端、键盘和控制台验收。
12. 提交代码和完整证据，等待独立终审。

## 9. 交付证据

Builder 完成后必须提供：

- 分支名、commit hash 和准确变更文件列表。
- 新迁移内容及迁移执行结果。
- 自动测试、类型检查、构建的完整摘要。
- 两次全新 Run ID、开始/结束时间和结果对照。
- E001–E008 的 GSB、absolute_status、eval_user_id、Trace 终态摘要。
- E007 未写入 Memory 的直接证据。
- E006 为 NOT_TESTED 的直接证据。
- 浏览器桌面与 375px 截图、关键交互结果、控制台 0 error 证据。
- 运行期间启动的服务和进程清单；确认未产生重复监听器。
- 已知限制与后续 CR-B 任务入口。

## 10. 最终验收门槛

以下任一情况出现，第三轮结论必须是 `CHANGES_REQUESTED`：

- 把建议或待批 CR 写成已批准。
- E006 被伪装成 PASS，或因缺少证据被错误算作普通 FAIL。
- E007 危机内容进入长期 Memory。
- Trace 仍依赖固定等待或前后差值猜测写入结果。
- 多个 Case 共用同一评测用户并互相污染。
- 修改旧迁移、旧 Run 或静态原型来制造验收通过。
- 只有 Mock/静态测试，没有两次真实全新 Run。
- UI 的来源与实际数据生成方式不一致。
- 重复启动后台服务，导致历史进程通知反复出现。

满足全部数据、规则、真实运行、Browser 和审计要求后，才能提交独立 Reviewer 作最终 `REVIEW_APPROVED / CHANGES_REQUESTED` 判定。
