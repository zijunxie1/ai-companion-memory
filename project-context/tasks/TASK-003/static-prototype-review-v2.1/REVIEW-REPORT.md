# Independent Review 报告 — Memory 评测页 V2.1

> Reviewer 结论：**CHANGES_REQUESTED**  
> 审查日期：2026-08-06  
> 审查基线：页面分支 `feature/v2.1-builder-revision` @ `e6d3011`；数据分支 `feature/task-003-eval-tools` @ `ba67dc9`

## 1. 审查范围与方法

本次按 `REVIEWER-BRIEF.md` 第 3 节验收标准独立复核，未修改任何业务代码。

实际执行内容：

- 完整阅读 `REVIEWER-BRIEF.md`、`design-spec-v2-implementation.md` 和配套交付文档。
- 逐项检查第 3 节的 16 条验收标准。
- 原样运行静态审计：

  ```powershell
  node review-artifacts/static-audit.mjs
  ```

  结果：exit 0，`failures: []`，`warnings: []`。

- 原样运行浏览器审计：

  ```powershell
  node review-artifacts/browser-audit.mjs
  ```

  结果：exit 0，所有脚本检查通过；控制台 0 error。

- 人工检查 1440px、375px、Case 展开、Case Drawer、Bad Case 管理、Bad Case Drawer、搜索错误状态等 8 张截图。
- 抽查 `index.html`、`src/input.css`、`eval-data.ts`、Trace 数据结构和 Chat Trace 写入逻辑。

说明：两个脚本均正常运行，未出现 Playwright 路径问题。审计脚本按设计刷新了 JSON 与截图产物，但未修改页面、样式、数据或后端源码。

## 2. 验收清单逐条结论

| # | 验收项 | 结论 | 证据与说明 |
|---|---|---|---|
| 1 | 首屏 30 秒内能看懂版本、8 个 Case、阻断/回归和下一步动作 | ⚠️ 存疑 | 信息架构清楚，但摘要称“1 个下降”，而 E002、E003 的分数均下降。回归数量表达存在歧义。 |
| 2 | 首屏没有任何单卡占据超过约 35% 的可视高度 | ❌ 不通过 | 桌面“本次评测发现”卡约 458/1000px，约 46%；375px 摘要卡约 306/812px，约 38%。 |
| 3 | 没有口号式 eyebrow；标题均描述任务或信息 | ✅ 通过 | 静态审计 banned copy 0 命中，页面标题均为功能描述。 |
| 4 | 每个统计数字可追溯到 Case 或强约束 | ⚠️ 存疑 | 数字均能找到数据来源，但 E003 的 GSB 结论与分数变化方向冲突。 |
| 5 | 静态数据明确显示“固定评测快照”，不暗示实时/自动 | ✅ 通过 | 运行信息、评测发现、GSB、指标、Case、Bad Case 均有来源标注。 |
| 6 | E001–E008 全部存在，分数与 `eval-data.ts` 一致 | ✅ 通过 | 静态审计 8/8 Case 分数和字段一致。 |
| 7 | GSB 有明确逐 Case 字段 | ⚠️ 存疑 | `gsb` 字段已存在，但 E003 为 `4/5 → 3/5`、`gsb: same`，判定语义不一致。 |
| 8 | 4 条 Issue 均可访问，能关联证据 Case | ✅ 通过 | N1→E002、N2/N3→E004、N4→E005；默认 3 条并可展开第 4 条。 |
| 9 | Bad Case 管理与 Case 详情不是 Toast 占位 | ✅ 通过 | 7 行 Bad Case 表、组合筛选、Case/BC Drawer、Escape 和焦点恢复均通过。 |
| 10 | Trace 只展示已采集字段，缺失项写“未采集” | ✅ 通过 | Case Drawer Trace 表共 8 行，缺失字段均有“未采集”标记。 |
| 11 | Hex ≤15 Token，字号/圆角无额外档位，无第 5 种状态色 | ✅ 通过 | 静态审计：15 色、6 档字号、8/12px 圆角、4 种状态。 |
| 12 | 对比度、44px 触摸区、键盘 Tabs、焦点环通过 | ✅ 通过 | 桌面 531 项、移动 328 项对比度 0 失败；触摸目标桌面 36、移动 24 项均通过；键盘 Tabs 通过。 |
| 13 | Hover 无珊瑚红光晕、无内容溢出 | ✅ 通过 | 红色伪元素已删除；Hover 只保留 `translateY(-4px)`、主色边框和中性阴影。 |
| 14 | 1440px 与 375px 截图通过；移动端 Before/After 单列 | ✅ 通过 | 375px 无横向溢出，Before/After 单列，Drawer 全宽。单卡高度问题单列在第 2 项。 |
| 15 | 搜索“身份证”、空格错误状态及 GSB 筛选结果正确 | ❌ 不通过 | 搜索和错误状态通过；但 E003 的 Same 分类与 `4/5 → 3/5` 冲突，因此 GSB 结果正确性未通过。 |
| 16 | 控制台无 JS 错误，正式交付不使用 Tailwind Play CDN | ✅ 通过 | 控制台 0 error、0 CDN warning；页面只引用本地 `dist/app.css`。 |

## 3. 问题清单

### 阻断

#### B1. 首屏单卡高度超过验收上限

- 位置：`index.html:133`，“本次评测发现”外层卡片。
- 截图：`review-artifacts/v2.1/01-desktop-overview.png`、`07-mobile-375.png`。
- 实测/人工像素核对：
  - 桌面 Issue 卡约占 1000px 视口的 46%。
  - 移动摘要卡约占 812px 视口的 38%。
- 影响：未满足“任何单卡不超过约 35% 可视高度”，首屏仍有明显大卡统治感。
- 建议：
  - Issue 首屏行只保留标题、严重程度和证据 Case。
  - 将“原因假设”下沉到详情或展开区。
  - 或首屏只展示两条紧凑问题，其余进入“查看全部”。
  - 移动端减少摘要卡的纵向间距，并压缩操作区。

自动审计存在覆盖缺口：`review-artifacts/browser-audit.mjs:56-57` 只检查桌面 `#summary ≤160px`，没有遍历全部首屏卡片，也没有检查移动端卡片占比，因此脚本错误地将此项判为通过。

#### B2. E003 的 GSB 与分数方向矛盾

- 数据位置：`E:\正式作品\v2\app\src\lib\eval-data.ts:99-117`。
- 页面位置：`index.html:338-344`。
- 当前状态：

  ```text
  E003: 4/5 → 3/5
  GSB: Same
  ```

- 当前理由是“无关召回问题两轮都存在”。这只能说明相同根因仍未解决，不能解释为什么结果分数降低却仍被定义为 Same。
- 影响：
  - 首屏只显示“1 个下降”，但实际有 E002、E003 两个分数下降。
  - Same Tab 会包含一个明确降分 Case。
  - 用户无法理解 GSB 是按分数、根因还是人工主观判断生成。
- 建议二选一：
  1. 将 E003 改为 Bad，汇总改为 Good 3 / Same 2 / Bad 2，并同步首屏、Tabs、审计期望；或
  2. 正式定义 GSB 判定规则，并调整 E003 分数或摘要文案，使 Same 不再与降分事实冲突。

不得仅用“延续原页面分类”作为判定依据。

#### B3. BC005 的来源 Case 链接错误

- 数据位置：`E:\正式作品\v2\app\src\lib\eval-data.ts:365-374`。
- 页面静态数据：`index.html:550`。
- 当前 BC005 描述的是“阿华删除合规”，但 `sourceCase` 为 E007；E007 是身份证隐私 Case。
- 实际交互会让“查看来源 Case 证据”打开无关的身份证详情。
- 影响：Bad Case 管理页提供了错误的证据链路，违背页面“可信、可查”的核心定位。
- 建议：
  - 若有真实来源 Case，修正为对应 Case ID；
  - 若当前评测集没有对应 Case，将 `sourceCase` 标记为空并显示“来源 Case 未提供”，不要链接 E007。

“历史遗留且不在本轮计划”不能作为保留错误证据链接的理由。

### 建议

#### S1. 修正 Trace 能力边界文案

- `数据来源说明.md:12` 称 `db.ts insertTrace` 可提供 Gate 命中、被过滤 Memory、实际 Prompt 注入。
- 但 `E:\正式作品\v2\app\src\lib\db.ts:47-74` 只记录输入、回复、usedMemory、recallReason、memoryWrites、conflictResult、promptVersion、latencyMs。
- 同一说明文档第 36 行又正确写明 Gate/过滤/实际 Prompt 未采集，两处相互矛盾。
- `index.html:982` 的“未采集字段由后端 Trace 接入后自动提供”也容易被理解为所有缺失字段都已具备后端支持。
- 建议明确拆成：
  - 现有 Trace 接入即可提供；
  - 需要 V2 Trace 新增采集后才能提供。

#### S2. 扩充首屏高度审计

建议浏览器审计新增：

- 遍历首屏内所有 `.card`，检查 `height / viewportHeight ≤ 0.35`。
- 桌面和 375px 分别检查。
- 输出失败卡片的 ID、文本摘要、像素高度和占比。

#### S3. 更新自测证据数字

- `自测清单.md:20` 记录移动端对比度检查 366 项。
- 本次原样重跑结果为 328 项、0 失败。
- 合规结果不变，但总检查项数量会随可见 DOM 状态变化，不宜作为固定断言。

### 可选

#### O1. 提前显示未接入状态

复测、指派、导出目前点击后才提示“接入 API 后可用”。可考虑在按钮旁常驻显示“未接入”，进一步避免被误认为真实操作。

## 4. 数据真实性核查结论

### 页面与 `eval-data.ts`

- E001–E008 数量和 Before/After 分数机械一致。
- 当前逐 Case GSB 字段机械一致。
- GSB 分布为 Good 3 / Same 3 / Bad 1 / not_applicable 1。
- 4 条 Issue 一致。
- 7 条 Bad Case 一致。
- BC006→E007、BC007→E008 修正正确。

但“页面与数据源一致”不等于“业务判定正确”：

- E003 的 Same 与 `4/5 → 3/5` 冲突。
- BC005 的数据源本身包含错误来源 Case，因此页面同步后仍会呈现错误证据链路。

### 当前真实后端能力

现有后端可以提供：

- 用户输入、AI 回复；
- 召回 Memory 和分数；
- 召回原因；
- 异步 Memory 写入结果；
- Prompt 版本；
- 延迟；
- 当前保留但尚未写入有效值的 `conflictResult`。

现有后端不能提供：

- 评测 Run 与版本历史；
- 自动 GSB；
- Issue 优先级排序服务；
- 自动根因和修复方向；
- Gate 命中全链路；
- 被过滤 Memory 明细的独立持久化；
- 实际 Prompt 注入内容。

页面整体已诚实标记为固定评测快照，没有把 Priority、根因或按钮包装成实时能力；主要问题是配套 Trace 说明仍有一处表述过宽。

## 5. 自动审计复核结果

### 静态审计

```text
exit code: 0
colors: 15 Token
font sizes: 48 / 24 / 16 / 14 / 12 / 10
radii: 8 / 12
status: success / warning / error / neutral
cases: E001–E008 matched
issues: 4
failures: []
warnings: []
```

### 浏览器审计

```text
exit code: 0
desktop contrast: 531 checked / 0 failed
mobile contrast: 328 checked / 0 failed
desktop touch targets: 36 checked / 0 failed
mobile touch targets: 24 checked / 0 failed
console errors: 0
script failures: []
```

自动脚本全绿，但不能覆盖 B1 的“所有首屏卡片高度”以及 B2/B3 的业务语义正确性，因此不能据此直接批准。

## 6. 最终结论

# CHANGES_REQUESTED

Builder 必须完成以下修改后再提交复审：

1. 将桌面和移动端所有首屏单卡控制在约 35% 视口高度内，并补充自动审计覆盖。
2. 解决 E003 `4/5 → 3/5` 与 `Same` 的判定矛盾，同步首屏、Tabs、GSB 汇总和审计期望。
3. 修复 BC005→E007 的错误证据链接，或在没有来源 Case 时明确显示“未提供”。

建议同时修正 Trace 能力边界文案，避免现有能力与 V2 待增强能力混淆。

