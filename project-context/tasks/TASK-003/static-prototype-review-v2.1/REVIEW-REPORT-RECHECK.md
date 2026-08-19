# Independent Re-review 报告 — Memory 评测页 V2.1

> Reviewer 结论：**REVIEW_APPROVED**  
> 复审日期：2026-08-07  
> 页面基线：`feature/v2.1-builder-revision` @ `819275b`  
> 数据基线：`feature/task-003-eval-tools` @ `d344703`

## 1. 审查范围与方法

本次按 `REVIEWER-BRIEF.md` 第 3 节 16 条验收标准，对上一轮 `CHANGES_REQUESTED` 后的修订进行独立复审。Reviewer 未修改 `index.html`、CSS、JavaScript、评测数据或后端源码。

实际执行：

- 核对页面提交 `819275b` 与数据提交 `d344703` 的改动和当前分支状态。
- 逐项复查上一轮 3 个阻断项 B1–B3，以及建议 S1–S3、可选项 O1。
- 原样运行 `node review-artifacts/static-audit.mjs`，结果 exit 0，`failures: []`、`warnings: []`。
- 原样运行 `node review-artifacts/browser-audit.mjs`，结果 exit 0，`failures: []`、控制台 0 error。
- 人工复查桌面 1440px、移动端 375px、Case 展开、Case Drawer、Bad Case 管理、BC Drawer、筛选、搜索及错误态截图。
- 抽查页面静态数据与 `E:\正式作品\v2\app\src\lib\eval-data.ts` 的 E001–E008 分数、GSB、Issue 与 Bad Case 证据链路。

说明：浏览器审计会按设计刷新 `review-artifacts/v2.1/` 下的截图及 JSON，因此复审后这些审计产物显示为工作区变更；业务源码未被 Reviewer 修改。

## 2. 上一轮问题闭环

| 编号 | 上一轮问题 | 复审结论 | 证据 |
|---|---|---|---|
| B1 | 首屏单卡超过约 35% 可视高度 | ✅ 已闭环 | Issue 默认收敛为 2 条；桌面与 375px 审计均通过 ≤35% 检查，截图未见大卡统治或溢出。 |
| B2 | E003 `4/5 → 3/5` 却归 Same | ✅ 已闭环 | `eval-data.ts:29` 定义 GSB 规则，`eval-data.ts:105` 将 E003 改为 Bad；`index.html:338` 同步为 Bad；汇总为 Good 3 / Same 2 / Bad 2 / 强约束 1。 |
| B3 | BC005 错误链接 E007 | ✅ 已闭环 | `eval-data.ts:367` 将 `sourceCase` 置空；页面列表和详情均显示“未提供”，且不生成来源 Case 链接。 |
| S1 | Trace 能力边界表述过宽 | ✅ 已闭环 | `index.html:987`、`数据来源说明.md:12-13` 明确区分“现有 Trace 接入可提供”与“需 V2 Trace 新增采集”。 |
| S2 | 首屏高度缺少自动审计 | ⚠️ 已加入，仍可加固 | `browser-audit.mjs:60-78,228-230` 已覆盖桌面与移动端；当前实现测量视口内的“可见高度”，建议后续同时断言卡片完整高度。当前页面人工复核仍通过。 |
| S3 | 自测证据数字易漂移 | ⚠️ 文案仍有漂移 | `自测清单.md:20` 固定写移动端 366、触摸 24；本次重跑为移动端 395、触摸 28。0 failure 结论不变，建议以后只记录失败数或自动写入结果。 |
| O1 | 未接入按钮状态需提前说明 | ✅ 已闭环 | `index.html:1009,1077` 在按钮组旁常驻“原型占位”说明。 |

## 3. 验收清单逐条结论

| # | 验收项 | 结论 | 证据与说明 |
|---|---|---|---|
| 1 | 首屏 30 秒内能看懂版本、8 个 Case、阻断/回归和下一步动作 | ✅ 通过 | 首屏按运行信息、摘要、本次发现、强约束与 GSB 排列；摘要明确“8 个 Case、2 个下降、1 个安全项部分通过”。 |
| 2 | 首屏没有任何单卡占据超过约 35% 的可视高度 | ✅ 通过 | 桌面与 375px 自动检查均通过；人工截图复核未见超限或大卡统治。 |
| 3 | 没有口号式 eyebrow；标题均描述任务或信息 | ✅ 通过 | 静态审计 banned copy 0 命中，模块标题均描述信息或操作任务。 |
| 4 | 每个统计数字可追溯到 Case 或强约束 | ✅ 通过 | GSB、下降数、安全项、Issue 与 Case 均能回溯到固定评测快照。 |
| 5 | 静态数据明确显示“固定评测快照”，不暗示实时/自动 | ✅ 通过 | 页面与数据说明持续标注固定快照、人工分析及未接入能力。 |
| 6 | E001–E008 全部存在，分数与 `eval-data.ts` 一致 | ✅ 通过 | 静态审计 8/8 Case 匹配，无缺失。 |
| 7 | GSB 有明确逐 Case 字段，否则不展示总数 | ✅ 通过 | 数据源含逐 Case `gsb` 与正式判定规则；页面和数据源分布一致。 |
| 8 | 4 条 Issue 均可访问，能关联证据 Case | ✅ 通过 | 默认展示 2 条，展开后为 4 条；关联 N1→E002、N2/N3→E004、N4→E005。 |
| 9 | Bad Case 管理与 Case 详情不是 Toast 占位 | ✅ 通过 | 真实列表、筛选、Case/BC Drawer、Escape 与焦点恢复均通过。 |
| 10 | Trace 只展示已采集字段，缺失项写“未采集” | ✅ 通过 | Drawer 对缺失数据明确标注，并区分当前 Trace 与 V2 待新增采集。 |
| 11 | Hex ≤15 Token，字号/圆角无额外档位，无第 5 种状态色 | ✅ 通过 | 15 色；字号 48/24/16/14/12/10；圆角 8/12；仅 success/warning/error/neutral。 |
| 12 | 对比度、44px 触摸区、键盘 Tabs、焦点环通过 | ✅ 通过 | 本次重跑：桌面 542、移动 395 项对比度 0 失败；桌面 37、移动 28 个触摸目标 0 失败；键盘 Tabs 通过。 |
| 13 | Hover 无珊瑚红光晕、无内容溢出 | ✅ 通过 | 截图与交互检查未见红色溢出；Hover 保持位移、主色边框和中性阴影。 |
| 14 | 1440px 与 375px 截图通过；移动端 Before/After 单列 | ✅ 通过 | 两种视口无横向溢出；375px 比较区单列，Drawer 全宽。 |
| 15 | 搜索“身份证”、空格错误状态及 GSB 筛选结果正确 | ✅ 通过 | 身份证→E007；空格提交触发错误；Good=E001/E004/E007，Same=E005/E006，Bad=E002/E003。 |
| 16 | 控制台无 JS 错误，正式交付不使用 Tailwind Play CDN | ✅ 通过 | 控制台 0 error、无 CDN warning；页面使用本地 `dist/app.css`。 |

## 4. 自动审计复核结果

### 静态审计

```text
exit code: 0
colors: 15 Token
font sizes: 48 / 24 / 16 / 14 / 12 / 10
radii: 8 / 12
status: success / warning / error / neutral
cases: E001–E008 matched
GSB: Good 3 / Same 2 / Bad 2 / not_applicable 1
issues: 4
failures: []
warnings: []
```

### 浏览器审计

```text
exit code: 0
desktop contrast: 542 checked / 0 failed
mobile contrast: 395 checked / 0 failed
desktop touch targets: 37 checked / 0 failed
mobile touch targets: 28 checked / 0 failed
keyboard / filters / search / drawers: passed
desktop and mobile first-screen card checks: passed
console errors: 0
script failures: []
```

注：移动端可见 DOM 数量会随审计路径变化，本次实际数字与提交说明中的 366/24 不同；验收看的是 0 failure，不影响合规结论。

## 5. 数据真实性与能力边界

### 页面与数据源

- E001–E008 数量、Before/After、逐 Case GSB 均一致。
- 正式 GSB 规则已进入数据源；E003 的 Bad 判定、首屏“2 个下降”、Tabs 与汇总一致。
- 4 条 Issue、7 条 Bad Case 与固定评测快照一致。
- BC005 没有真实来源 Case 时保持空值并诚实显示“未提供”，不再制造错误证据链。

### 当前后端能力边界

页面及说明文档已正确拆分：

- 现有 Trace 接入可提供：输入、回复、召回 Memory/分数、召回原因、写入结果、Prompt 版本、延迟等现存字段。
- V2 仍需新增采集：Gate 命中、被过滤 Memory 明细、实际 Prompt 注入。
- 评测 Run、自动 GSB、自动 Issue 排序、自动根因与修复方向尚未接入；页面以固定快照、人工分析或原型占位明确呈现，没有伪装成在线能力。

## 6. 非阻断问题清单

### 建议

#### S2-R. 首屏高度脚本同时测量卡片完整高度

- 位置：`review-artifacts/browser-audit.mjs:60-78`。
- 当前：比值使用卡片在首屏中的可见切片 `visible / viewportHeight`。
- 风险：未来若一张超高卡片跨出首屏，脚本可能只计算首屏内切片而产生假阴性。
- 建议：保留可见高度检查，同时增加 `rect.height / viewportHeight <= 0.35`；失败输出完整高度、可见高度、卡片 ID/标题。
- 级别：建议，不阻断本次页面通过；当前目标卡片完整高度经人工截图复核未超限。

#### S3-R. 不在自测文档硬编码动态检查总数

- 位置：`自测清单.md:20,47`。
- 当前：文档写移动端对比度 366 项、触摸 24 项；本次重跑分别为 395、28。
- 建议：文档仅写“0 failures”，或由审计脚本自动生成/注入总数，避免 DOM 可见状态变化造成证据陈旧。
- 级别：建议，不影响 0 failure 的验收事实。

### 阻断

无。

### 可选

无新增。

## 7. 最终结论

# REVIEW_APPROVED

上一轮 3 个必须修改项均已关闭，第 3 节 16 条验收标准全部通过。S2-R 与 S3-R 属于审计可靠性和文档维护建议，不影响当前页面、数据真实性或交互验收，可在后续维护中处理，无需再次阻断交付。
