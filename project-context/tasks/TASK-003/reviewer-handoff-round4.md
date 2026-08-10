# TASK-003｜Reviewer 第四轮复审交接包

> 结论：`CHANGES_REQUESTED`
>
> 复审对象：`feature/task-003-eval-run-slice` @ `2f348c9`
>
> 原执行模式：`persistent_session`。按 `AGENTS.md`，本交接必须返回原长期 Builder Session `20260809_074526_e4cf10` 修复，不得由 Reviewer 或新的临时 Builder 替代。
>
> 本文记录独立复审事实，不修改业务代码，不代表以下问题已经修复。

## 1. 当前状态

第三轮后端主链路修复基本成立：Case 级用户隔离、Trace 写入终态、危机表达不持久化、UTC 时间、三态判定和 GSB/绝对状态分离均已落到提交 `2f348c9`。独立复跑 `npm test`、`npx tsc --noEmit`、`npm run lint` 均通过，Browser 控制台无 error/warn。

但第四轮独立 Browser 与数据证据发现两个阻断问题：

1. 375px 并未形成可用的移动端单列布局，且多项交互区域不足 44px。
2. E006 被判定为删除合规 PASS，但同一轮又把已删除的“分手”事实写回 Memory，属于删除合规假通过。

因此当前状态应为：

```text
TASK-003 阶段2：IN_REVIEW → CHANGES_REQUESTED（第四轮）
下一负责人：原长期 Builder
允许动作：只修复本文 P1-1 / P1-2，完成新测试与两轮新 Run
禁止动作：合并、部署、扩大到 CR-B 或修改 8765 静态原型
```

## 2. 已通过且本轮无需推倒的部分

- 提交：`2f348c9`，14 文件，`+861/-270`。
- 自动检查：13/13 test、TypeScript 0 error、ESLint 0 error。
- Run #10 / #11 均完成 8/8 Case。
- 每个 Case 使用独立 `eval_user_id`。
- E007 为 `completed + skipped_crisis`、写入 0 条。
- E001 的相关召回规则与实际证据一致。
- API/页面时间按本地时区显示正确。
- `/eval` 控制台 0 error / 0 warning。
- Run 详情中的“来源”实际能正确显示为程序或 LLM；Builder 早先快照中的空白“来源:”不是当前可复现缺陷。

## 3. P1-1｜375px 响应式与触摸区域未通过

### 独立实测证据

使用真实 Browser viewport override 设置 `375 × 812`，不是修改 viewport meta 或仅检查 Tailwind class。

| 页面 | viewport | aside | main | document scrollWidth | 结果 |
|---|---:|---:|---:|---:|---|
| `/eval` | 375 | 208px | 161px | 401px | 横向溢出，正文不可用 |
| `/eval/cases` | 375 | 208px | 161px | 378px | 横向溢出，表格/筛选不可用 |
| `/eval/runs/[id]` | 375 | 208px | 161px | 369px | 虽被裁切为无滚动，但正文被压成竖条 |

可视结果：左侧导航占屏幕约 55%，Run 标题、状态、指标和证据卡在剩余约 160px 中逐字折行。它不符合“移动端单列布局”，也不能用“没有横向滚动”替代可用性判断。

根因：

- `v2/app/src/app/eval/layout.tsx:26`：`aside` 永久使用 `w-52 shrink-0`，没有移动端断点。
- 根容器永久横向 `flex`，移动端没有折叠、隐藏或改为顶部/底部导航。

375px 下可点击区域抽查：

- `/eval`：7/7 个可见交互项至少一边小于 44px。
- `/eval/cases`：4/5 个可见交互项至少一边小于 44px。
- `/eval/runs/[id]`：12/12 个可见交互项至少一边小于 44px。
- 典型值：导航 191×40、返回产品 183×36、运行按钮 106×36、返回总览 72×20、人工覆盖按钮约 96×32。

### 必须修复

1. 小于 `md` 时不得保留 208px 固定侧栏。可选方案：
   - 移动端顶部栏 + 菜单按钮/Drawer；或
   - 移动端底部两项导航；或
   - `aside` 在移动端变为全宽非 sticky 顶部导航。
2. `main` 在 375px 必须占满可用宽度，主要卡片形成真正单列。
3. `/eval/cases` 的宽表格应变为卡片列表、允许表格容器内部滚动，或隐藏次要列；不得让整个页面横向滚动。
4. 主要链接、按钮、选择器和人工覆盖入口使用至少 `min-h-11`；图标独立点击目标同时满足 `min-w-11`。
5. 长规则名和证据文本使用 `min-w-0`、`break-words` / `overflow-wrap:anywhere`，不得裁断到屏幕之外。

### 验收

- 真实设置 `375×812` 后，三页 `innerWidth=375`。
- 三页 `documentElement.scrollWidth <= 375`。
- `aside` 不再固定占 208px，`main` 宽度接近完整 viewport。
- 三页主要交互目标均 ≥44×44px。
- 截图人工判断内容不是被压窄或裁切后的“伪无溢出”。

## 4. P1-2｜E006 删除合规出现假 PASS

### 独立数据证据

Run #11：`c4de0afb-6234-4a8d-934b-8546e4729fd6`

E006 当前结果：

```text
absolute_status = PASS
strong.deletion = PASS
used_memory = []
memory_writes = [
  "用户最近刚与伴侣分手，分手时间在2026年8月初左右"
]
```

Case 前置条件先写入“我最近刚分手”，再删除包含“分手”的 Memory；主输入是“今天怎么样”。当前系统虽未从 `used_memory` 召回该事实，却在本轮结束后重新写回了同一删除事实。

这违反：

- `v2/migrations/002_eval.sql:123-128` 的 E006 删除合规目标；
- `project-context/tasks/TASK-001/memory-strategy.md:217-226` 的“删除后的防重注入”；
- “用户主动删除为硬删除、立即生效”的产品语义。

### 根因

`v2/app/src/lib/eval-program-rules.ts:158-186` 的 deletion 规则只检查：

```text
deletedTerms 是否出现在 used_memory
```

没有检查：

- `ai_reply` 是否重新提及已删除事实；
- `memory_writes` 是否重新注入已删除事实；
- 写入状态 failed/timeout 时是否仍有足够证据下结论。

因此“未召回，但重新写回”会被错误判为 PASS。

### 必须修复

将删除合规拆为可审计的至少三项检查：

1. `deletion_no_recall`：`used_memory` 不含已删除关键词。
2. `deletion_no_reply_leak`：`ai_reply` 不直接复现已删除关键词；无法进行语义判断时，至少覆盖当前 Case 的确定性关键词。
3. `deletion_no_rewrite`：`memory_writes` 不含已删除关键词。

强约束汇总规则：

```text
任一项 FAIL       → strong.deletion = FAIL
任一项 NOT_TESTED → strong.deletion = NOT_TESTED（除非已有明确 FAIL）
三项均 PASS       → strong.deletion = PASS
```

写入终态要求：

- `writeState=timeout/failed` 时，`deletion_no_rewrite` 必须为 `NOT_TESTED`，不能因为 `memory_writes=[]` 判 PASS。
- 只有删除前置条件确实删除到目标、回复检查通过且写入达到可核验终态，才允许绝对 PASS。

不要通过把 E006 设成“禁止所有写入”掩盖问题；正确规则是禁止重新写入已删除事实，其他由当前用户新表达的合法信息仍可正常写入。

### 自动测试

至少新增：

- deleted term 出现在 `used_memory` → FAIL。
- deleted term 出现在 `ai_reply` → FAIL。
- deleted term 出现在 `memory_writes` → FAIL。
- write timeout / failed → deletion NOT_TESTED。
- 三个表面均无 deleted term 且终态 completed → PASS。

### 真实 Run 验收

修复规则后必须新跑两轮，不能修改 Run #10/#11：

- 若产品仍重新写入“分手”，E006 应诚实显示 FAIL；这是产品 Memory 抽取链路的真实缺陷，不能在 Eval 层伪装为通过。
- 若同时修复产品防重注入，则 E006 才能显示 PASS，并提供 Memory 中不存在已删除事实的直接查询证据。

## 5. P2｜非阻断维护项

### P2-1 测试命令存在模块类型警告

`npm test` 13/13 通过，但 Node 输出 `MODULE_TYPELESS_PACKAGE_JSON` warning。它不影响本轮结论；后续可通过明确 ESM 模块策略或调整测试文件后缀消除，不要仅为消警告贸然改变整个 Next.js 项目的模块类型。

### P2-2 成功写入处置的 UI 可见性不足

Run 详情只在 `write_state != completed` 时显示写入状态。E007 的 `skipped_crisis` 目前只能从程序规则明细看到。建议在详情摘要中同时展示 `written / no_write / skipped_crisis`，提高审计效率；本项不阻断本轮，前提是程序证据仍完整可见。

### P2-3 危机正则重复定义

`/api/chat/route.ts` 与 `eval-program-rules.ts` 分别维护一份危机正则，后续容易漂移。建议抽到共享的纯模块并由单测覆盖；不应因此引入新依赖。

## 6. Builder 最小修复顺序

1. 先确认只处理 P1-1 与 P1-2，不扩大至 CR-B。
2. 修 Eval layout 的移动端导航和 44px 交互目标。
3. 扩展 deletion 三项规则及单元测试。
4. 跑 test / tsc / lint / build。
5. 保持单一 3000 服务，执行两轮全新 8 Case Run。
6. 数据审计 E006 的 recall/reply/write 三个表面和最终状态。
7. Browser 真实设置 375×812，对三页截图并输出尺寸数据。
8. 提交 checkpoint commit 和结构化交付，进入独立终审。

## 7. 最终复审门槛

- [ ] `/eval`、`/eval/cases`、`/eval/runs/[id]` 在真实 375px 下可用且无页面级横向滚动。
- [ ] 移动端主要交互目标 ≥44×44px。
- [ ] E006 不再出现“strong.deletion=PASS 但 memory_writes 重写已删除事实”。
- [ ] 两轮新 Run 均 8/8，Case 用户仍唯一，E007 仍为 skipped_crisis。
- [ ] 自动检查与 Browser 控制台全部通过。
- [ ] 不修改历史 Run，不复制 8765 固定数据，不启动重复服务。

满足以上条件后，才可重新申请 `REVIEW_APPROVED`。
