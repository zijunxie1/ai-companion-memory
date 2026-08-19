# Memory 评测页 V2.1｜Builder 修改方案

> 目标：把当前“高完成度概念展示页”收敛为“可信、可查、可行动的评测工作台”。
>
> 本文输入：用户 5 条浏览器批注、`design-spec-v2-implementation.md`、`index.html` 静态与浏览器审查、真实工程 `eval-data.ts` / Trace API，以及 Zijun 知识库。

## 0. 一句话判断

当前页面适合作为视觉方向 Demo，但还不应被称为日常评测后台。

问题不在于视觉不漂亮，而在于首屏把“表达结论的气氛”放在了“定位问题和采取行动”之前；同时，Priority Queue、GSB 和 Trace 范围缺少清晰的数据来源，容易让人误以为这些能力已经由后端自动生成。

这次 Builder 的目标不是继续加效果，而是完成三件事：

1. 首屏改为任务导向：本次评测结果 → 阻断项/回归项 → 下一步处理。
2. 所有数字可追溯：静态快照、自动计算、人工判断必须明确标注。
3. 用 Spec 收敛视觉变量并通过无障碍底线，不再出现“飞机稿式”的额外标语和装饰。

## 1. 产品定位和核心用户任务

### 1.1 本页定位

这是一个“单次版本评测结果页”，不是品牌落地页，也不是泛化数据大屏。

日常使用者进入后，应该在 30 秒内回答：

- 评的是哪个版本、什么时候完成、覆盖多少 Case？
- 是否存在安全阻断或回归？
- 哪些问题最需要处理，证据来自哪些 Case？
- 点进问题后能否看到 Before / After 和 Trace 证据？
- 修复后下一步是复测、指派还是导出？

任何模块如果不能帮助完成上述任务，就应压缩、下沉或删除。

### 1.2 知识库依据（转述）

- 商业产品 UI 应以“好用、清晰、稳定、可迭代”为主，美观只是加分项；概念稿才以吸睛和创意为主。[[KC-kc_410109972644d4898b5b7de0]] [[MC-2609393de9b682fdb4a0652235d7c4eb53f665466a3d9862d7dc437d13f38929]]
- 工具页先做底线、业务、统一三层校验，业务校验要判断核心信息/入口是否突出、装饰是否抢占注意力。[[KC-kc_7aa78b8a6afa7022b4aa7c0f]]
- 静态 HTML 用于低成本确认结构是合理的，但 Demo 阶段的数据和按钮本来就是假的；方向确认后才逐步接入真实后端。[[KC-kc_cb2c156da6a857ef2e81cdf7]] [[MC-ee27b6f10a23574aac90ae6fbbf24f21fdc691846486bfcfc72997c9c72d9b05]]
- 已有 HTML 和明确 Spec 时，应按模块逐步修改，避免一次性重做整页造成视觉与逻辑偏移。[[KC-kc_52d425ddbd01f05f3d8969cb]] [[MC-82313b12c825fb9d0b1cf4df849d72a114e315d0ef7a0f78caca805653b928de]]

以上均为知识库内容的转述，不是逐字引用。

## 2. 对 5 条批注的直接处理

### 批注 1：强约束大卡是否值得占这么大

判断：内容重要，但不值得作为 316px 左右的大型 Hero。

`False Memory Rate 40% → 0%` 是本次最重要的改善证据之一，但用户更需要先知道“是否可发布、是否有阻断、下一步做什么”。当前 `article#heroParallax`（`index.html:758`）将单一指标放大为首屏视觉主角，还重复出现在下方指标卡（`index.html:910-920`），信息重复。

修改：

- 删除大型红色 Hero、轻视差和装饰圆环。
- 改成高度不超过 160px 的“本次评测摘要”横条。
- 横条只放三组信息：结论、强约束、待处理。
- `False Memory Rate 40% → 0%` 作为强约束中的一项，不再单独占据半屏。
- 详细解释下沉到“强约束”区或 Case 证据中。

建议文案：

- 页面标题：`After Baseline · v2.1 评测结果`
- 摘要：`8 个 Case 已完成；1 个下降，1 个安全项部分通过`
- 强约束：`虚假记忆 0%｜隐私写入已阻断｜安全响应部分通过`
- 主操作：`查看待处理问题`

不要继续使用：`Memory 更可信了，但还不够自然。`、`核心结论 · STRONG CONSTRAINT`。

### 批注 2：Priority Queue 的后端数据从哪里来

判断：当前不能宣称由后端自动传来。

真实工程现状：

- `eval-data.ts:400-425` 的 `newIssues` 是静态数组，不是 API 结果。
- 当前源码搜索不到 `eval-data.ts` 被页面/API 引用，说明它还是未接入的评测快照。
- Trace 后端能提供召回 Memory、召回原因、异步写入结果、Prompt 版本、延迟等原始证据（`db.ts:52-57`，`api/chat/route.ts:54-125`）。
- 现有后端不能自动给出“优先级、根因、修复方向、影响 Case 数、处理状态”。这些仍需要评测规则或人工分析。

本轮 Builder 应这样处理：

- 标题改为 `本次评测发现`，先不要叫 `Priority Queue`。
- 模块右上明确显示 `数据来源：固定评测快照`。
- 每条问题至少展示：严重程度、证据 Case、来源、状态。
- 根因如果没有人工确认，字段名必须写 `原因假设`，不可写成确定事实。
- 只展示真实存在的 4 条 `newIssues`；如果首屏只显示 3 条，提供 `查看全部 4 条`。
- 不显示“自动发现”“实时队列”等暗示。

推荐的静态数据结构：

```js
{
  id: "N1",
  title: "异步写入延迟",
  severity: "medium",
  evidenceCaseIds: ["E002"],
  sourceType: "static_eval_snapshot",
  sourceLabel: "固定评测快照",
  status: "open",
  hypothesis: "mem0.add() 异步完成晚于后续召回"
}
```

### 批注 3：首屏 2×2 区域是否是真需求

判断：其中三块有业务价值，但当前组织方式偏展示稿；Trace Journey Map 目前最像“纯 YY”。

| 当前模块 | 处理 | 理由 |
|---|---|---|
| 大型 False Memory Hero | 压缩 | 指标重要，但与下方重复，且挤压问题入口 |
| Priority Queue | 保留并改名 | 日常有用，但必须显示来源和证据 |
| Good / Same / Bad | 保留并压缩 | 适合快速判断趋势，但当前只覆盖 7 条且缺 E008 |
| Trace 可观测范围 | 从总览下沉 | 当前是“能力示意”，不是本次运行的真实覆盖统计 |

Trace Journey Map 只有在后端能给每个节点的 `observed / missing / failed` 状态时才适合放在总览。现有 Trace 只可靠记录输入、回复、召回、写入、Prompt 版本和延迟；Gate 过滤、实际 Prompt 注入链路等尚未形成完整节点证据。因此：

- 总览移除 Journey Map。
- Case 展开区增加 `查看 Trace`，展示真实已有字段。
- 缺失字段明确写 `未采集`，不要用灰色节点暗示系统已完成采集。

### 批注 4：口号像飞机稿

判断：同意。工具页的标题应该描述“这里是什么/能做什么”，而不是解释设计理念。

替换规则：

| 当前文案 | 替换为 |
|---|---|
| `MULTI-DIMENSIONAL EVIDENCE` | 删除 |
| `指标不是一个分数，而是一组证据` | `评测指标` |
| `强约束先判断是否守住底线，分档维度再解释体验为什么变好或变差。` | `查看强约束结果与 5 个体验维度的 Before / After。` |
| `GOOD / SAME / BAD` | `Case 结果` |
| `MEMORY JOURNEY MAP` | 删除或改为 `Trace 证据` |
| `PRIORITY QUEUE` | `本次评测发现` |

页面只保留必要的中文标题；英文只用于既有专业缩写（GSB、Trace、Case），不再作为装饰 eyebrow。

### 批注 5：Hover 红色溢出

根因是 `index.html:219-237` 的伪元素：

```css
.interactive-card::after {
  inset: 14% 10% -14%;
  filter: blur(24px);
  background: rgba(217,78,48,.15);
}
.interactive-card:hover::after { opacity: 1; }
```

它在卡片外制造珊瑚红模糊层，且 `z-index: -1` + `isolation` 在大区域悬浮时会产生视觉溢出。

修复要求：

- 完整删除 `.interactive-card::after` 和 `.interactive-card:hover::after`。
- Hover 仅保留 Spec 规定的 `translateY(-4px)`、主色边框和中性阴影。
- 推荐：`border-color: rgba(110, 91, 170, .48)`；阴影不得带红色。
- 不用 `overflow: hidden` 掩盖问题；只有存在内部装饰的特定组件才单独使用裁剪。
- `prefers-reduced-motion` 下取消位移，仅保留边框变化。

## 3. 新的信息架构

### 3.1 总览页顺序

1. 运行信息栏
   - 版本、基线、完成时间、数据源、8 个 Case、导出。
2. 本次评测摘要（紧凑横条）
   - 结论、强约束、待处理数。
3. 本次评测发现
   - 默认显示最重要 3 条；每条能进入对应 Case 证据。
4. 强约束 + GSB 摘要
   - 强约束单独显示；GSB 仅统计定义清楚且可归类的 Case。
5. 评测指标
   - 5 个维度 Before / After，去掉口号式引导。
6. Case 结果
   - 搜索、筛选、展开；这是页面的主要工作区。

### 3.2 第二层：Bad Case 管理

如果作品集声称实现 Spec 三层架构，则必须有可进入的真实页面或面板，不能 Toast 占位。

最小可用内容：

- 列表字段：Issue/Bad Case ID、来源 Case、严重程度、类型、状态、负责人（可选）、更新时间。
- 筛选：严重程度、状态、类型。
- 点击进入详情。
- 数据仍可来自静态快照，但页面显示 `固定评测快照`。

### 3.3 第三层：Case 详情

最小可用内容：

- Case 描述与输入。
- Before / After 双栏。
- 分数变化、GSB/约束结果。
- Trace 证据：召回 Memory、召回原因、写入结果、Prompt 版本、延迟。
- 关联 Issue / Bad Case。
- 缺失数据明确标注 `未采集`。

如果不做第二、三层，就必须把产品说明改成“总览页交互原型”，不能声称三层 IA 已完成。

## 4. 数据修正和真实性

### 4.1 本轮必须修复

- HTML 目前只有 7 条 Case；补入 E008 `不想活了`（FAIL → PARTIAL）。
- 总数从 7 改为 8。
- GSB 数据源没有明确字段。两种选择二选一：
  1. 在每个 Case 增加明确 `gsb: good | same | bad | not_applicable`；或
  2. 暂时移除 GSB 总数，只展示可直接验证的分数/约束结果。
- 不得为了凑 3/3/1 将 E008 随意归类。
- 修复数据源映射错误：`eval-data.ts:366-375` 的 BC006 是身份证隐私 Case，`sourceCase` 应为 E007，不是 E008；BC007 才对应 E008。
- `newIssues` 有 4 条，页面不能写成总共 3 条。

### 4.2 当前可用与不可用的后端能力

| 数据 | 当前可真实提供？ | 说明 |
|---|---:|---|
| user input / AI reply | 是 | Trace 已存储 |
| recalled memories / score | 是 | Chat route 已记录 |
| recall reason | 是 | 已生成并存储 |
| memory writes | 是，但异步 | 初始返回空，后台更新 Trace |
| prompt version / latency | 是 | Trace 已存储 |
| Case Before / After 评测结果 | 否，当前静态 | 来自 `eval-data.ts` |
| GSB 标签 | 否 | 当前数据结构没有字段 |
| Priority 排序 | 否 | 当前没有规则/服务 |
| 根因与修复方向 | 否，静态人工结论 | 不应包装为自动诊断 |
| Trace Journey 全节点覆盖 | 否 | Gate/Prompt 注入等节点未完整采集 |

### 4.3 若要成为日常工具，需要新增的数据契约

后续生产化建议新增：

- `eval_runs`：run_id、baseline_version、candidate_version、status、started_at、completed_at、dataset_version。
- `eval_case_results`：run_id、case_id、before_score、after_score、gsb、constraint_result、trace_id、evidence。
- `eval_issues`：issue_id、run_id、title、severity、status、source_case_ids、hypothesis、confirmed_root_cause、owner、updated_at。
- `GET /api/evaluations/runs/:id/summary`
- `GET /api/evaluations/runs/:id/cases`
- `GET /api/evaluations/runs/:id/issues`

Priority 的排序规则必须显式定义，例如：安全阻断 > 回归 > 未解决高严重度 > 影响 Case 数 > 最近发生。不要让前端凭颜色或数组顺序推断。

## 5. 视觉与交互整改优先级

### P0：本轮必须完成

- 首屏去 Hero 化、去口号化、去 Journey Map 示意。
- 补齐 E008，修正 Case 总数、Issue 总数和 BC006 映射。
- 标明所有模块的数据来源。
- 删除红色 Hover 光晕，采用 Spec 主色 Hover。
- 严格收敛到 Spec 的 15 个颜色 Token；当前 55 个 Hex、46 个额外颜色不可接受。
- 字号只保留 48/24/16/14/12/10；当前 19 档需收敛。
- 圆角只保留 12px/8px；删除 4/9/10/11/14/18/28/999/9999 等档位。
- 删除第 5 种 Review 状态色；只有 Success/Warning/Error/Neutral。
- 修复文字对比度：正文 ≥ 4.5:1，大字号 ≥ 3:1。
- 所有可点击区域 ≥ 44×44px，特别是清空搜索按钮和 Case Tabs。

### P1：达到作品集可交付

- 完成可进入的 Bad Case 管理页。
- 完成可进入的 Case 详情页或全屏详情 Drawer。
- Tabs 实现 roving tabindex、左右方向键、Home/End、`aria-controls`。
- 搜索、筛选、展开、空状态、错误状态在桌面与 375px 移动端均可用。
- 页面不再依赖 Tailwind Play CDN；构建产物使用正式 Tailwind CSS。
- 控制台 0 error、0 production CDN warning。

### P2：真正日常使用时再做

- 评测 Run API 与持久化。
- 自动/人工 Issue 流程、负责人、状态与复测。
- Trace 全链路节点采集。
- 自动生成报告和版本对比历史。

不要在 P0/P1 阶段用假数据模拟 P2 已完成。

## 6. 做到什么程度算好

### 推荐交付边界：作品集可用原型（P0 + P1）

这是当前最合适的目标：保留静态评测快照，但数据完整、来源诚实、三层信息架构可操作。它足以证明产品与 UX 能力，又不会虚构尚不存在的后端。

验收清单：

- [ ] 首屏 30 秒内能看懂版本、8 个 Case、阻断/回归和下一步动作。
- [ ] 首屏没有任何单卡占据超过约 35% 的可视高度。
- [ ] 没有口号式 eyebrow；标题均描述任务或信息。
- [ ] 每个统计数字可追溯到 Case 或强约束。
- [ ] 静态数据明确显示 `固定评测快照`，不暗示实时/自动。
- [ ] E001–E008 全部存在，分数与 `eval-data.ts` 一致。
- [ ] GSB 有明确逐 Case 字段，否则不展示总数。
- [ ] 4 条 Issue 均可访问，能关联证据 Case。
- [ ] Bad Case 管理与 Case 详情不是 Toast 占位。
- [ ] Trace 只展示已采集字段，缺失项写 `未采集`。
- [ ] Hex 不超过 Spec 15 Token，字号/圆角无额外档位，无第 5 种状态色。
- [ ] 对比度、44px 触摸区、键盘 Tabs、清晰焦点环全部通过。
- [ ] Hover 无珊瑚红光晕、无内容溢出。
- [ ] 1440px 与 375px 截图通过；移动端 Before / After 为单列。
- [ ] 搜索“身份证”得到 E007；空格提交触发错误；Good/Same/Bad 结果正确。
- [ ] 控制台无 JS 错误，正式交付不使用 Tailwind Play CDN。

如果以上未完成，只能称“视觉 Demo”；完成 P0 + P1 后，可称“作品集可用评测原型”；完成 P2 并接真实 Run 数据后，才可称“日常可用评测后台”。

## 7. 可直接交给 Builder 的执行指令

```text
请基于现有 index.html 做局部重构，不要推倒重做，也不要发明新的后端能力。

唯一视觉规范：design-spec-v2-implementation.md。
唯一评测数据源：E:\正式作品\v2\app\src\lib\eval-data.ts。
产品定位：单次版本评测结果页，不是品牌落地页或数据大屏。

按以下阶段实现，每完成一个阶段先自测再进入下一阶段：

阶段 1｜数据与真实性
1. 补齐 E008，Case 总数改为 8。
2. 修复 BC006 sourceCase 为 E007；BC007 对应 E008。
3. newIssues 共 4 条，不得写成总共 3 条。
4. 若没有逐 Case 的 gsb 字段，暂时移除 GSB 总数；不得自行推断 E008。
5. 所有模块显示数据来源：固定评测快照 / 自动采集 Trace / 人工判断。
6. 根因未确认时字段名使用“原因假设”。

阶段 2｜信息架构
1. 删除大红色 False Memory Hero，改成 ≤160px 的评测摘要横条。
2. 首屏顺序：运行信息 → 评测摘要 → 本次评测发现 → 强约束/指标 → Case 结果。
3. 总览删除 Trace Journey Map；Trace 证据下沉到 Case 展开或详情。
4. 将“Priority Queue”改为“本次评测发现”，展示 3 条并提供“查看全部 4 条”。
5. 删除所有装饰性英文 eyebrow 和口号；使用功能型中文标题。
6. 实现 Bad Case 管理页与 Case 详情页/全屏 Drawer，不允许 Toast 占位。

阶段 3｜视觉规范
1. 严格使用 Spec 的 15 个颜色 Token，不新增 Hex。
2. 字号只使用 48/24/16/14/12/10；圆角只使用 12px/8px。
3. 状态只有 Success/Warning/Error/Neutral；删除 Review 状态。
4. 删除 .interactive-card::after 与 hover::after 的红色模糊光晕。
5. Hover 仅保留 translateY(-4px)、rgba(110,91,170,.48) 主色边框和中性阴影。
6. prefers-reduced-motion 下取消位移。

阶段 4｜交互与无障碍
1. Good/Same/Bad、搜索、展开、错误状态保持可用。
2. Tabs 实现 roving tabindex、ArrowLeft/ArrowRight、Home/End 和 aria-controls。
3. 所有点击区域至少 44×44px；正文对比度至少 4.5:1，大字号至少 3:1。
4. 375px 下 Before/After 单列，不横向溢出。
5. 不再使用 Tailwind Play CDN，改为正式构建 CSS。

最终提交：
- 修改后的 index.html（若拆文件同时提交 CSS/JS）。
- 数据来源说明。
- 1440px 和 375px 截图。
- 自测清单：8 Case、4 Issue、筛选、搜索、展开、键盘、触摸区、对比度、控制台。
```

## 8. 依据文件

- 页面：`E:\正式作品\prototypes\task-003-eval-console-v2.1\index.html`
- Spec：`E:\正式作品\prototypes\task-003-eval-console-v2.1\design-spec-v2-implementation.md`
- 评测数据：`E:\正式作品\v2\app\src\lib\eval-data.ts`
- Trace：`E:\正式作品\v2\app\src\lib\db.ts`
- Chat Trace 写入：`E:\正式作品\v2\app\src\app\api\chat\route.ts`

## 9. Zijun 知识库来源

- [[KC-kc_410109972644d4898b5b7de0]] 商业产品 UI vs 概念创意稿
- [[KC-kc_7aa78b8a6afa7022b4aa7c0f]] 设计完成后三层校验法
- [[KC-kc_cb2c156da6a857ef2e81cdf7]] Demo 优先
- [[KC-kc_b87a9b9b0b0953597a16f1f9]] 文档驱动开发
- [[KC-kc_52d425ddbd01f05f3d8969cb]] HTML 预览稿再还原
- [[KC-kc_1f34b88108443c59ed53049d]] UI 局部单点修改
- [[MC-2609393de9b682fdb4a0652235d7c4eb53f665466a3d9862d7dc437d13f38929]] UI 设计规范方法论
- [[MC-ee27b6f10a23574aac90ae6fbbf24f21fdc691846486bfcfc72997c9c72d9b05]] Vibe Coding 防烂尾三心法
- [[MC-ae11b1cff69b8529db4ad5a4ac899ed7f4a9c8608a7d26d461382578864baff4]] HTML 设计稿与代码还原工作流
- [[MC-82313b12c825fb9d0b1cf4df849d72a114e315d0ef7a0f78caca805653b928de]] 分阶段实现与视觉偏移控制
