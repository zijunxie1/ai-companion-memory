# TASK-007｜3000 正式产品视觉与布局统一（V2 设计母版收敛）

> task_id: TASK-007
> status: **APPROVED**（Founder 2026-08-19 批准 DRAFT v0.2 内容方向、范围与验收边界；仅内容批准，执行动作另行授权）
> execution_mode: persistent_session（推荐，待 Founder 确认）
> assigned_role: Builder（待授权唤醒）
> assigned_session: TASK-007｜Builder｜3000 视觉与布局统一（推荐名，待确认）
> branch: feature/task-007-design-unification（计划名，从最新 origin/main 创建；创建待授权）
> 文档版本：v0.2（2026-08-19）

## 0. 批准与授权边界（2026-08-19）

- Founder 批准本 DRAFT v0.2 的内容方向、范围和验收边界；此次批准只代表方案内容通过。
- 已获授权并执行的第一步（Founder 2026-08-19 聊天明文授权）：创建本任务包（状态 APPROVED）、同步 `project-context/current-state.md` 与 `project-context/decision-register.md`、完成一次仅含上述治理文件的本地提交。
- 尚未授权（后续另行安排）：推送、创建实现分支、设计资产入库、修改产品代码、唤醒 Builder、建 PR、部署。
- 核验基线：远端 `origin/main @ 37c16d0`（2026-08-19 只读核验：本地 main 与远端一致、工作区干净）；统一规则版本 `2026-08-19.1`。

### 0.1 required_reading

`AGENTS.md`；`project-context/context-manifest.md`；`project-context/CHIEF-BOOTSTRAP.md`；`project-context/current-state.md`；`project-context/decision-register.md`（D-T007-1）；`project-context/project-mainline-roadmap.md`（Phase 3）；`project-context/handoff-and-task-state-machine.md`；`project-context/role-wakeup-and-handoff.md`；TASK-003 V2.1 设计规范（入库前位于 `E:/正式作品/prototypes/task-003-eval-console-v2.1/design-spec-v2-implementation.md`，Slice 1 入库后为仓库内 `prototypes/` 路径）；TASK-003 V2.1 独立复审与数据来源说明（入库前位于 `E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/`，Slice 1 入库后为仓库内路径）；`project-context/tasks/TASK-003/chief-decision-brief-v2.md`；`project-context/tasks/TASK-003/review-report-final.md`

## 1. 核验结论（2026-08-19，只读）

1. 正式主线：远端 `origin/main @ 37c16d0`，本地 main 一致、工作区干净；统一规则版本 `2026-08-19.1`。
2. TASK-006 R4：已完成两轮真实验证 + 判断标准修订 v2 + 收尾 + 独立证据审查（REVIEW_APPROVED），但整体未通过；不启动第五轮、不接入聊天；E004 为 Demo 已知限制。R4 证据仍在 worktree 分支，标「已完成并审查、待正式保存」（不属本任务范围）。
3. TASK-007 正式目录在本任务包创建前不存在；本文件为首份正式任务包（2026-08-19 落盘）。
4. 3000 真产品（`v2/app`，Next.js 16.2.11 + Tailwind 4）：七个路由全部真实实现、走真实 API 与数据库；但视觉呈「两套方言」——评测三页（`/eval/*`）已有独立侧栏外壳并部分采用 Spec 色（#1C1D21/#70747D/#F6F7F9），主按钮仍是 Tailwind indigo-600 而非 Spec 紫 #6E5BAA；首页/聊天/记忆/Trace 四页无共享外壳，各用临时 Tailwind 灰 + 独立小 header；`globals.css` 仅有最小变量（accent 为 #6366f1，与 Spec 不一致）。
5. 首页无 `/eval` 入口（仅聊天/记忆/Trace 三卡），演示叙事链路在「评测」处断裂；eval 侧栏仅 2 项（总览/Case 管理），Run 详情无导航入口；eval 面包屑向用户暴露内部任务名「TASK-003」。
6. 设计资产现状：`E:/正式作品/prototypes/task-003-eval-console-v2.1/`（index.html 1145 行、design-spec V2 全文、src/dist CSS、README）与复审证据 `E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/`（复审报告、数据来源说明、自测清单、审计脚本与截图）均未被任何分支跟踪、未进正式主线，单副本存放于历史脏工作区。复审结论 REVIEW_APPROVED（16/16 项通过；静态审计 15 色/6 档字号/2 档圆角/4 状态；1440px+375px 对比度、触摸、键盘、控制台全过）。
7. 真实数据对 Before/After 的支持度：`/api/eval/runs`（列表）+ `/api/eval/runs/[id]`（逐 Case 结果）现有接口即可在前端拼出「本次 vs 上次」逐条对比；是否允许标记变好/持平/变坏以 §6.1 可比性规则为准。Gate 命中、被过滤 Memory、实际 Prompt 注入仍未采集，沿用「未采集（待增强）」。

## 2. 目标

1. 七类核心页面（首页、聊天、记忆管理、Trace 日志、评测总览、Case 列表、Run 详情）使用同一套导航外壳、布局容器与视觉令牌；每页按 §6 逐页映射完成页面级布局、信息层级、导航关系与响应式重构，验收以 §8 逐页可核验标准为准（不使用「80-90% 一致性」等不可验收表述）。
2. 首页改造为可讲故事的演示入口，串起 聊天 → 记忆 → Trace → 评测 → Before/After → 已知限制 的完整演示路线；凡引用 E004 等历史结论必须链接真实证据并标明来源（见 §6.2）。
3. 评测三页信息层级按 Spec 第一层架构收敛（核心结论 → 优先处理 → GSB → 强约束 → 分档 → Case 列表 → 下钻证据）。
4. 全程冻结业务能力、数据逻辑与评测结论：重构页面布局与交互表现，但不动任何接口语义、算法、规则与数据。

## 3. 非目标（明确不做）

1. 不修复 E004，不启动 TASK-006 第五轮，不把 E004 修复纳入本任务；
2. 不修改记忆算法、人设策略或评测规则；
3. 不扩充到 20 条案例；
4. 不建设完整 Bad Case 流转管理（仅保留展示已有真实 Bad Case 数据的能力）；
5. 不修改数据库结构和现有接口语义；
6. 不引入新依赖或外部服务；
7. 不做生产部署、企业级监控或权限后台；
8. 不把静态母版复制进真实运行页面；
9. 不因界面调整改写历史结论或冻结证据；
10. 不做个人网站（本任务是产品界面统一，不是新建网站）。

## 4. 设计资产保存（Slice 1，独立分支 + PR）

1. 范围：把 `E:/正式作品/prototypes/task-003-eval-console-v2.1/`（设计母版：index.html、design-spec-v2-implementation.md、src/、dist/、README、package 元数据）与 `E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/`（独立复审报告、数据来源说明、自测清单、审计脚本与截图）复制入本仓库，消除单副本丢失风险。
2. 方式：独立分支 + 独立 PR，先于 Slice 2 合并；复制入仓后 `required_reading` 中的外部路径改用仓库内路径。
3. 边界：只做保存，不做修改；母版内容保持原样入库（作为审查通过的历史资产），不直接复制进 `v2/` 产品代码。

## 5. 视觉与布局基准

### 5.1 风格与令牌（TASK-003《Design Spec V2 · Implementation Baseline》）

- 风格是克制、专业、可信、有人情味的评测与记忆产品；像可操作的研究报告，不像炫技型 AI 概念页或通用企业后台。
- 主色使用既有紫色体系（Spec 紫 #6E5BAA）；错误红只用于真正错误；只保留成功、错误、警告、中性四类状态。
- 字号、圆角、间距和页面宽度按既有设计令牌收敛（15 色 / 6 档字号 / 2 档圆角 / 4 状态）；桌面使用清晰栅格，900px 以下转为单列。
- 禁止霓虹、彩色光晕、玻璃拟态和装饰性渐变。

### 5.2 母版使用边界（8765 静态母版）

8765 静态母版只允许参考视觉、信息层级、响应式和交互。禁止复制其中的固定数字、日期、旧案例映射、历史结论、静态按钮和假工作流。3000 真实产品及真实接口是唯一数据与功能来源。

## 6. 七类页面逐页映射

| # | 页面 | 路由 | 现状要点 | 重构方向 |
|---|---|---|---|---|
| 1 | 首页 | `/` | 仅三张导航卡（聊天/记忆/Trace），无 `/eval` 入口，演示链路断裂 | 演示入口：串起 聊天 → 记忆 → Trace → 评测 → Before/After → 已知限制；引用结论按 §6.2 标注证据来源 |
| 2 | 聊天 | `/chat` | 无共享外壳，独立小 header | 必须保留聊天气泡、输入和连续对话的社交体验；页面级布局、信息层级、导航关系与响应式允许重构（保留社交体验 ≠ 冻结现有布局） |
| 3 | 记忆管理 | `/memories` | 无共享外壳 | 结构性收敛：并入统一外壳与令牌，重构信息层级与导航关系，不得只替换颜色、圆角和外壳 |
| 4 | Trace 日志 | `/traces` | 无共享外壳 | 结构性收敛：并入统一外壳与令牌，重构信息层级与导航关系，不得只替换颜色、圆角和外壳 |
| 5 | 评测总览 | `/eval` | 已有侧栏但仅 2 项；主按钮 indigo-600 非 Spec 紫 | 按 Spec 第一层架构收敛：核心结论 → 优先处理 → GSB → 强约束 → 分档 → Case 列表 → 下钻证据；侧栏补齐 Run 详情入口 |
| 6 | Case 列表 | `/eval/cases` | 同外壳；面包屑暴露内部任务名「TASK-003」 | 收敛信息层级；去除面向用户的内部任务名 |
| 7 | Run 详情 | `/eval/runs/[id]` | 无导航入口，孤立页 | 接入统一导航；Before/After 呈现遵守 §6.1 |

### 6.1 Before/After 可比性规则

只有同一案例、可追溯版本和可比运行条件下才能标记「变好/持平/变坏」；不可比时只展示两次结果并明确说明原因。数据仅来自 `/api/eval/runs` 与 `/api/eval/runs/[id]` 真实接口；仅一次 Run 时沿用现有诚实空态「首次 Run，无对比基准」。Gate 命中、被过滤 Memory、实际 Prompt 注入未采集，一律标「未采集（待增强）」。

### 6.2 证据标注义务（首页与演示路线）

首页引用 E004 或其他历史结论时，必须链接真实证据（Run 记录、复审报告等）并标明来源与时间，不得把历史固定结论写成实时数据。E004 当前 FAIL 状态在演示路线中如实展示，不得因界面美化弱化或改写。

## 7. 冻结清单与回归清单

**冻结清单（实现期间一律不动）**：业务能力与功能集合；数据逻辑与数据库结构；现有接口语义（`/api/*`）；记忆算法与人设策略；评测规则、Case 数据与历史评测结论（含 E004 FAIL 记录）。

**回归清单（每个 PR 合并前全过）**：现有构建、类型检查、Lint、测试全部通过；七个路由行为无回退（聊天收发、记忆增删查、Trace 列表、评测三页数据读取与展示均与重构前一致）；不新增控制台错误。

## 8. 验收标准（最低门，8 条）

1. 七页使用同一导航外壳、布局容器与视觉令牌；Token 审计通过（≤15 色、6 档字号、2 档圆角、4 类状态色）；
2. 页面上所有数字、Case、状态与结论均来自真实产品 API，无母版固定快照数据混入；
3. §7 冻结清单与回归清单全部通过，无行为回退；
4. 1440px 与 375px 视口无横向滚动；交互区 ≥44px；键盘可达、焦点可见；正文对比度 ≥4.5:1；
5. 缺失数据一律显示「未采集（待增强）」，不得留空或编造；
6. 构建/类型/检查/测试通过，七个路由浏览器检查控制台零新增错误；
7. 桌面 + 手机逐页视觉证据（截图）已保存并归档；
8. 双 Review 分别通过：功能 Reviewer（对照本任务包 §7/§8）+ UX/Design Reviewer（1440/375 实测）。

## 9. 风险与停止条件

**主要风险**：
1. 母版视觉基于静态快照设计，真实数据形态（字段、空态、长度）可能与其不可收敛 → 触发停止条件，出升级卡；
2. 页面级布局重构可能意外触碰行为 → 以 §7 回归清单逐 PR 把关；
3. 设计资产在 Slice 1 合并前仍是单副本 → Slice 1 优先执行。

**停止并升级条件（不得自行决定）**：如方案要求新增依赖、数据库字段、外部服务、修改接口语义、改变产品行为、扩大到 20 Case、建设完整 Bad Case 流程、重启 E004 研究、改变主线路线，或设计母版与真实数据发生无法收敛的冲突，必须形成单问题升级卡交给 Founder，不得自行扩大范围。

## 10. 执行模式与角色建议

- **执行模式**：persistent_session（长期 Builder 会话，待 Founder 确认）。理由：需要多轮「实现—看稿—调整」，视觉取舍需 Founder 中途查看与决定，单次临时委派不可行。
- **建议会话名**：`TASK-007｜Builder｜3000 视觉与布局统一`。
- **PR 切分**：Slice 1 资产保存（独立分支 + 独立 PR）→ Slice 2 视觉统一（`feature/task-007-design-unification`，从最新 origin/main 创建；可按「地基 + 四产品页 / 评测三页」两段推进，是否拆两个 PR 在实现计划 Review 时定）。
- **Review 顺序**：Builder 停在 IMPLEMENTED → 功能 Reviewer → UX/Design Reviewer（1440/375 实测）→ Founder 合并裁决。
