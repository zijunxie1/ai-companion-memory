# Reviewer 交接包 — Memory 评测页 V2.1（TASK-003）

> 你是**独立 Reviewer**：只审查、不修改代码（AGENTS.md 四个 Review 门之一）。
> 审查完成后输出结构化 Review 报告，由用户（CEO）决定合并。

## 1. 任务背景

Builder 已按 `builder-revision-plan.md` 的四个阶段完成 Memory 评测页 V2.1 修订：
把"高完成度概念展示页"收敛为"可信、可查、可行动的评测工作台"。
Builder 自测全绿，现请你独立复核，重点是对照**验收标准**而非听信自测结论。

## 2. 审查对象（路径均为 Windows）

| 对象 | 路径 | 说明 |
|---|---|---|
| 页面 | `E:\正式作品\prototypes\task-003-eval-console-v2.1\index.html` | 单文件静态页 + 内嵌 JS 渲染，**无 CDN、无构建期依赖**，双击即可运行 |
| 视觉规范 | `E:\正式作品\prototypes\task-003-eval-console-v2.1\design-spec-v2-implementation.md` | 唯一视觉依据：15 色 Token / 6 档字号 / 8·12px 圆角 / 4 种状态色 |
| 评测数据 | `E:\正式作品\v2\app\src\lib\eval-data.ts` | 唯一评测数据源（本轮含修正：BC006→E007、BC007→E008、新增逐 Case gsb、rootCause→hypothesis） |
| 构建 | `E:\正式作品\prototypes\task-003-eval-console-v2.1\package.json` + `src\input.css` → `dist\app.css` | Tailwind v4 CLI 正式构建产物（36KB minified） |
| 交付文档 | `数据来源说明.md`、`自测清单.md`（同目录） | 数据来源与验收自述 |

## 3. 验收标准（builder-revision-plan.md 第 6 节，逐条核对）

- [ ] 首屏 30 秒内能看懂版本、8 个 Case、阻断/回归和下一步动作
- [ ] 首屏没有任何单卡占据超过约 35% 的可视高度
- [ ] 没有口号式 eyebrow；标题均描述任务或信息
- [ ] 每个统计数字可追溯到 Case 或强约束
- [ ] 静态数据明确显示「固定评测快照」，不暗示实时/自动
- [ ] E001–E008 全部存在，分数与 eval-data.ts 一致
- [ ] GSB 有明确逐 Case 字段（已采用方案 1：新增 gsb 字段），否则不展示总数
- [ ] 4 条 Issue 均可访问，能关联证据 Case
- [ ] Bad Case 管理与 Case 详情不是 Toast 占位（真实视图 + 全屏 Drawer）
- [ ] Trace 只展示已采集字段，缺失项写「未采集」
- [ ] Hex ≤ 15 Token，字号/圆角无额外档位，无第 5 种状态色（Review 色已删）
- [ ] 对比度（正文 ≥4.5:1 / 大字号 ≥3:1）、44px 触摸区、键盘 Tabs、清晰焦点环全部通过
- [ ] Hover 无珊瑚红光晕、无内容溢出（仅 translateY(-4px) + 主色边框 + 中性阴影）
- [ ] 1440px 与 375px 截图通过；移动端 Before/After 为单列
- [ ] 搜索「身份证」得到 E007；空格提交触发错误；Good/Same/Bad 结果正确
- [ ] 控制台无 JS 错误，正式交付不使用 Tailwind Play CDN

## 4. 自动化证据（可复核，也可自己重跑）

- 静态审计：`node review-artifacts/static-audit.mjs`（期望 exit 0、failures 空；输出 `review-artifacts/static-audit.json`）
- 浏览器审计：`node review-artifacts/browser-audit.mjs`（期望 exit 0；覆盖筛选/搜索/展开/Drawer/Bad Case/键盘/对比度/触摸目标/控制台；输出 `review-artifacts/v2.1/browser-audit.json`）
- 截图：`review-artifacts/v2.1/`（01 桌面首屏、02 展开、03 Case Drawer、04 Bad Case 视图、05 BC Drawer、06 搜索错误、07 移动端 375、08 移动端详情）

⚠️ 浏览器审计脚本顶部 `require()` 了 playwright，路径指向
`C:\Users\admin\.cache\codex-runtimes\...\playwright`（Edge 内核）。
若你本机该路径不存在：改脚本顶部两行路径，或跳过脚本、按第 5 节人工验证。

## 5. 建议人工抽查（浏览器打开 index.html）

1. 首屏信息架构顺序：运行信息 → 评测摘要 → 本次评测发现 → 强约束+GSB → 评测指标 → Case 结果
2. 每个模块右上角的「数据来源」标注与「原因假设」措辞是否诚实
3. Case 展开 →「查看 Trace 证据」→ 详情 Drawer：Trace 表缺失项是否标「未采集」
4. 侧栏切 Bad Case 管理：筛选组合、行点击进详情、来源 Case 跳转
5. 键盘：Tabs 方向键/Home/End；Drawer Escape 关闭并还原焦点
6. 375px（DevTools 设备模式）：无横向滚动、Before/After 单列
7. 抽查 eval-data.ts 与页面数据一致性（E001-E008 分数/GSB、4 条 Issue、7 条 Bad Case）

## 6. 已知判断点（Builder 已决策，请复核合理性）

1. **E003 归「Same」**：4/5→3/5 但根因（无关召回）两轮都存在；方案要求"不得凑数"，按原页面归类保留 Same，GSB 结果 3/3/1 + 强约束 1（E008）。
2. **BC005 sourceCase=E007 为历史遗留**（阿华删除 Case 指向身份证 Case），builder-revision-plan 未要求修改，Builder 未动。
3. **更新时间/负责人显示 "—"**：静态快照无此数据，诚实留空。
4. **复测/指派/导出为占位按钮**：点击提示「接入 Run API 后可用」，不假装已接入（符合"不在 P0/P1 用假数据模拟 P2"）。
5. **其余导航项（Memory 管理/Trace 日志/评测运行/系统设置）仍为 Toast 占位**：超出本方案范围，未实现。
6. **GSB 采用"逐 Case 新增 gsb 字段"**（方案二选一中的方案 1），而非移除 GSB 汇总。

## 7. 输出要求

Markdown Review 报告，包含：
1. 审查范围与方法（你实际做了什么）
2. 验收清单逐条结论：✅ 通过 / ❌ 不通过（附证据）/ ⚠️ 存疑
3. 问题清单：按 **阻断 / 建议 / 可选** 分级，每条注明位置（文件:行）与修改建议（你不改代码）
4. 数据真实性核查结论（页面 vs eval-data.ts vs 后端能力边界）
5. 最终结论：**REVIEW_APPROVED** 或 **CHANGES_REQUESTED**（列出必须修改项）

## 8. Git 状态（供参考）

- 原独立原型分支：`feature/v2.1-builder-revision` @ `e6d3011`；内容现已迁入 `E:\正式作品\prototypes\task-003-eval-console-v2.1`
- 数据分支：`E:\正式作品` → `feature/task-003-eval-tools` @ `ba67dc9`（仅 eval-data.ts）
