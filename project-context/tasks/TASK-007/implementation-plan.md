# TASK-007 实施计划 v1.0

> task_id: TASK-007
> interaction_stage: handoff→execution（本计划待 Founder 批准 Review 门 2 后才写产品代码）
> 起草：长期 Builder（persistent_session，Founder 已确认）
> 日期：2026-08-19
> 基线：`origin/main @ 33553bd`（远端只读核验一致；规则版本 2026-08-19.1）
> 权威任务包：`project-context/tasks/TASK-007/draft.md`（v0.2，APPROVED）
> 计划状态：**APPROVED（2026-08-19，Founder 经执行 Chief 批复）**

## 0.1 批复裁定（2026-08-19，照办）

1. 第二步七页视觉统一**合成一个变更申请**，不拆两个。
2. 聊天页按计划范围执行（允许重构布局与信息层级），不再缩小。
3. **强制流程**：第一步设计资产变更申请创建后必须停止，先交独立 Reviewer 核对资产完整性、内容未改写、无密钥及无关文件、未进入产品运行代码；Reviewer 通过后再由 Founder 决定合并。
4. 当前授权范围：仅执行第一步（复制→检查→提交→推送→建变更申请→停止）；暂不授权七页界面实现、合并、部署、修改产品代码。

## 0. 已完成的启动核验（只读）

- 远端 `origin/main` = `33553bd` = 本地 main = 交接卡基线；工作区干净；无 W1/B 类问题。
- 规则版本 `2026-08-19.1` 与磁盘一致；TASK-007 = APPROVED；execution_mode = persistent_session（已确认）。
- 必读文件已读：AGENTS.md、context-manifest、agent-response-protocol、handoff-and-task-state-machine、role-wakeup-and-handoff、current-state、decision-register（D-T007-1）、project-mainline-roadmap（Phase 3）、TASK-007 draft、TASK-003 design-spec V2（视觉基准全文）、TASK-003 chief-decision-brief-v2 / review-report-final。
- 产品代码盘点（v2/app，Next.js 16.2.11 + Tailwind 4，零新依赖可完成）：七个路由全部真实实现；首页仅 81 行三卡；/chat 274 行独立外壳；/memories 188 行；/traces 165 行；/eval/* 已有独立侧栏（仅 2 项）+ eval.css 83 行；globals.css 仅 10 个变量（accent=#6366f1 与 Spec 冲突）；root layout 仍用 gray-50。indigo-600 残留：eval/page 5 处、cases 5 处、runs/[id] 2 处 + layout 7 处。

## 1. 当前事实与待验证假设

**已核验事实**（来源：draft §1 + 本次只读盘点）：

1. 七页视觉两套方言：eval 三页部分采用 Spec 色但主按钮 indigo-600；其余四页临时 Tailwind 灰 + 独立小 header；无共享外壳。
2. 首页无 /eval 入口，演示链路在评测处断裂；eval 面包屑暴露内部任务名「TASK-003」。
3. 设计资产（prototypes/task-003-eval-console-v2.1 全目录 + static-prototype-review-v2.1 复审证据全目录）在历史脏工作区 E:/正式作品 中、未被任何分支跟踪——单副本风险，Slice 1 优先。
4. 现有测试：`npm test`（node --test，eval-program-rules / eval-db-integration / eval-snapshot-core / eval-snapshot-compat 4 个测试文件）+ `npx tsc --noEmit` + `npm run lint` + `npm run build`。

**待验证假设**（实现前用真实数据核对，不可收敛即停）：

- H1：`/api/eval/runs` 与 `/api/eval/runs/[id]` 现有字段足以在前端拼出「本次 vs 上次」逐条对比（draft §1.7 已做接口级核对，实现时用真实 Run 数据复核；可比性规则按 §6.1）。
- H2：母版信息层级（核心结论→优先处理→GSB→强约束→分档→Case 列表→下钻）与真实数据形态可收敛——若字段缺失/形态不可收敛，按 §8.5 显示「未采集（待增强）」，仍不可收敛则出升级卡。
- H3：/chat 社交体验（气泡、输入、连续对话、Trace 面板）可在外壳统一后完整保留（行为冻结、只动布局表现层）。

## 2. 目标 / 非目标

与任务包 §2/§3 完全一致，不重复。要点：七页统一外壳/令牌 + 首页演示叙事 + 评测三页信息层级收敛；冻结全部业务能力、数据逻辑、接口语义、算法、评测规则与历史结论。

## 3. 依赖与前置条件

- 前置：Slice 1 资产入库（独立分支+PR，先于 Slice 2 合并）→ 之后 Slice 2 从最新 origin/main 建分支。
- 环境：Node（v2/app package.json engines 未限定；现有 lockfile）、Postgres + mem0（v2/docker-compose.yml）；`npm ci` 在 worktree 内安装。
- 零新依赖：不新增 npm 包、不引入 CSS 框架插件；Tailwind 4 `@theme` 内联 token + 少量自定义 CSS。
- worktree 纪律（Windows 坑，来自记忆）：worktree 缺 node_modules 时禁 install → 用 `ln -s` 复用兄弟 worktree 的 node_modules（原生 node 需 E:/ 路径）；junction 禁 rm -rf。

## 4. 掟则：先地基后页面，行为冻结

所有改动只触碰「表现层 + 布局结构」：className、布局 JSX 结构、globals.css token、外壳组件。不改任何 fetch/API 路径、状态逻辑、数据变换、eval 规则代码（src/lib/eval-*）。

## 5. 拟修改文件和原因

### Slice 1（分支 feature/task-007-design-assets，worktree E:/task-007-assets-worktree 已建）

| 动作 | 路径（仓库内） | 原因 |
|---|---|---|
| 新增（复制，不改内容） | `prototypes/task-003-eval-console-v2.1/` 全目录 | 设计母版入库（index.html、design-spec、src/、dist/、README、package 元数据） |
| 新增（复制，不改内容） | `project-context/tasks/TASK-003/static-prototype-review-v2.1/` 全目录 | 复审证据入库（复审报告、数据来源说明、自测清单、审计脚本与截图） |

- 只保存不修改：逐字节复制（cp -a），提交前 `git diff --stat` 确认无内容改动。
- 入库后 `required_reading` 中的外部路径改用仓库内路径——该项属于 Slice 2 分支的治理同步（草稿文件更新），不在 Slice 1 PR 内改任何正式文件。
- 风险：E:/正式作品 是历史脏工作区 → 复制是只读操作（cp 源→新 worktree），不触碰源目录。

### Slice 2（分支 feature/task-007-design-unification，从合并 Slice 1 后的最新 origin/main 创建）

**分段 A：地基（AppShell + token）**

| 动作 | 文件 | 内容 |
|---|---|---|
| 修改 | `v2/app/src/app/globals.css` | 建 Spec 令牌：15 色命名 token（--bg、--surface、--text-primary、--text-secondary、--text-muted、--border、--primary #6E5BAA、4 状态 + 4 状态 soft、--neutral）、6 档字号（48/24/16/14/12/10）、2 档圆角（12/8px）、等宽数字 font-variant、focus ring、prefers-reduced-motion、hover 上浮规范；替换现有 --accent #6366f1 |
| 新增 | `v2/app/src/components/AppShell.tsx` | 统一导航外壳：桌面侧栏 + <900px 顶部单列导航；导航项 = 首页/聊天/记忆/Trace/评测（五项，全路由可达）；当前项高亮 Spec 紫；交互 ≥44px；键盘焦点可见 |
| 修改 | `v2/app/src/app/layout.tsx` | 接入 AppShell；body 背景改 token；zh-CN 不变 |
| 修改 | `v2/app/src/app/page.tsx` | 演示入口重构：串起 聊天→记忆→Trace→评测→Before/After→已知限制；E004 等引用按 §6.2 链接真实证据（/api/eval/runs 动态数据 + Run 详情链接），禁止固定快照 |
| 修改 | `v2/app/src/components/TracePanel.tsx` | token 化（颜色/圆角/字号对齐） |

**分段 B：四产品页（结构收敛，非换皮）**

| 动作 | 文件 | 内容 |
|---|---|---|
| 修改 | `v2/app/src/app/chat/page.tsx` | 并入 AppShell；保留气泡/输入/连续对话/Trace 面板全部行为；页面级布局、信息层级、响应式重构 |
| 修改 | `v2/app/src/app/memories/page.tsx` | 并入 AppShell + 结构性收敛：信息层级（列表密度、卡片结构、编辑/删除操作区 ≥44px）、导航关系、响应式 |
| 修改 | `v2/app/src/app/traces/page.tsx` | 同上；列表信息层级重构（时间等宽字体、状态四色语义） |
| 删除 | `v2/app/src/app/eval/layout.tsx` 中重复外壳 | eval 专属 layout 让位给全局 AppShell（或改为纯面包屑容器）——避免双重侧栏 |

**分段 C：评测三页（信息层级收敛 + 母版映射）**

| 动作 | 文件 | 内容 |
|---|---|---|
| 修改 | `v2/app/src/app/eval/page.tsx` | 按 Spec 第一层架构收敛：核心结论→优先处理→GSB→强约束→分档→Case 列表→下钻证据；侧栏补齐 Run 详情入口（最近 Run 链接）；indigo→Spec 紫替换（5 处） |
| 修改 | `v2/app/src/app/eval/cases/page.tsx` | 收敛信息层级；去除面向用户的「TASK-003」内部任务名；indigo→紫（5 处） |
| 修改 | `v2/app/src/app/eval/runs/[id]/page.tsx` | 接入统一导航（可从侧栏/总览进入）；Before/After 遵守 §6.1 可比性（同案例/可追溯版本/可比条件才标变好/持平/变坏；不可比只展示两次结果并说明原因；单 Run 诚实空态）；indigo→紫（2 处） |
| 修改 | `v2/app/src/app/eval/eval.css` | token 对齐（focus 色 a5b4fc→Spec 紫 ring；滚动条颜色归一） |

**不修改**：`src/lib/**`（全部业务/评测逻辑）、`src/app/api/**`（接口）、数据库、迁移、package.json。

### 治理同步（Slice 2 PR 内）

`project-context/tasks/TASK-007/implementation-report.md`（实现报告）+ `current-state.md` 状态同步（IMPLEMENTED）。若 Slice 1 已合并，required_reading 仓库内路径在报告中说明。**不改 decision-register（Builder 无权改决策结论）**。

## 6. 数据流、状态流和错误路径

- 数据流不变：页面仍从 `/api/*` 真实接口取数。首页新增的评测摘要/已知限制区走 `/api/eval/runs?limit=N` 现有接口（只读 GET），E004 FAIL 引用链到真实 Run 详情页（§6.2）。
- 状态流不变：聊天收发、Run 触发/轮询、Memory 增删查、Trace 列表等逻辑原样。
- 错误路径：fetch 失败的现有处理保留；新增 UI 不引入新错误路径；缺失数据一律「未采集（待增强）」。

## 7. 分步骤实现顺序

```text
步骤 0（本计划获 Founder 批准 = Review 门 2 过）
步骤 1  Slice 1：复制两目录入 worktree → 提交 → 推分支 → 建 PR（等 Founder 合并）
步骤 2  Slice 2 建分支（从合并 Slice 1 后的 origin/main）→ npm ci
步骤 3  分段 A 地基：globals.css token + AppShell + root layout + 首页 + TracePanel
        → 全七页冒烟（此时四产品页/评测页已套上新外壳的 body，但页面内未重构）
        → 回归：build/tsc/lint/test + 七路由手动过 §7 回归清单
步骤 4  分段 B 四产品页逐页重构 → 每页过回归清单 + 375px 检查
步骤 5  分段 C 评测三页 → §6.1 可比性实现 + 回归
步骤 6  验收自检 §8 八条逐项过（token 审计脚本 + 1440/375 截图逐页归档）
步骤 7  实现报告 + 证据归档 → 停在 IMPLEMENTED，交功能 Reviewer → UX/Design Reviewer
```

每段完成即本地 commit（检查点），出问题可段内回滚；不 push 不建 PR 直到 IMPLEMENTED 证据齐。

## 8. 测试矩阵

| 检查 | 方式 | 判据 |
|---|--- npm ci 后运行 |---|
| 单元测试 | `npm test` | 4 个测试文件全 PASS（现有基线） |
| 类型 | `npx tsc --noEmit` | 0 error |
| Lint | `npm run lint` | 0 error |
| 构建 | `npm run build` | 成功 |
| 七路由行为回归 | 手动逐页（§7 回归清单） | 聊天收发、记忆增删查、Trace 列表、评测三页数据读取与展示与重构前一致；控制台零新增错误 |
| Token 审计 | 静态扫描（grep hex + 字号/圆角档位统计，脚本放 tasks/TASK-007/ 证据目录） | ≤15 色、6 档字号、2 档圆角、4 类状态色 |
| 响应式/无障碍 | 1440px + 375px 浏览器实测 | 无横向滚动；交互区 ≥44px；键盘可达焦点可见；正文对比度 ≥4.5:1 |
| 视觉证据 | 逐页截图 1440+375 双尺寸归档 | 七页 × 2 = 14 张起 |

## 9. Browser / 运行验收步骤

1. `npm run dev` 起服务（或 build+start）；依赖 Postgres+mem0 docker（v2/docker-compose.yml）。
2. 逐路由访问 /、/chat、/memories、/traces、/eval、/eval/cases、/eval/runs/[最新id]。
3. 每页：桌面 1440 截图 → 切 375 宽 → 截图 → 检查横向滚动/44px/键盘 Tab 焦点/控制台。
4. 聊天页真实发一条消息验证收发+Trace；记忆页真实增/删一条；评测页读取真实 Run 数据。
5. 回归对比：重构前后同页面行为逐项打勾。

## 10. 回滚与恢复方案

- 每分段一个 commit，出问题 `git revert`/`git reset` 段内回滚，不影响其他段。
- Slice 1 纯新增目录，回滚 = 删除目录，零风险。
- 不触碰 main；PR 合并由 Founder 执行（Rebase）。

## 11. 鲒险、停止条件和 Change Request 条件

**风险**：① 母版层级与真实数据形态不可收敛（§9.1）→ 优先「未采集（待增强）」兜底，仍冲突出升级卡；② 页面重构意外触碰行为 → §7 回归清单逐段把关；③ Windows worktree node_modules 复用坑 → 按记忆纪律处理；④ /chat 保留社交体验与外壳统一冲突时，社交体验优先，外壳让位（不冻结布局但保行为）。

**停止并升级（照抄任务包 §9）**：需要新依赖/数据库字段/外部服务/修改接口语义/改变产品行为/扩 20 Case/建完整 Bad Case 流程/重启 E004/改变主线路线，或母版与真实数据无法收敛的冲突 → 立即停止相关写操作，形成单问题升级卡交 Founder。

## 12. 预计形成的 commits / PR 边界

- **PR-1（Slice 1）**：`feature/task-007-design-assets`，1-2 commit，纯新增两目录。
- **PR-2（Slice 2）**：`feature/task-007-design-unification`，分段 A/B/C 各 1-2 commit + 治理同步 1 commit；是否拆「地基+四页」与「评测三页」两个 PR → 默认单 PR（任务包 §10 允许两段推进，Review 时定；Founder 批准本计划时可选定）。
- 单 PR 单主要问题纪律：PR-2 主问题 = 七页视觉与布局统一。

## 13. 明确未处理的后续事项

- UX/Design Reviewer 实测（1440/375）在 IMPLEMENTED 后由 Founder 唤醒。
- E004 修复、TASK-006 第五轮、20 Case、完整 Bad Case 流程（任务包非目标）。
- 指标配置化（CR-B）、生产部署。
