# GOV-005｜P1 项目全览地图与上下文恢复（DRAFT）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/agent-response-protocol.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/product.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/decision-register.md
  - project-context/tasks/TASK-003/chief-decision-brief-v2.md
  - project-context/tasks/TASK-003/draft-phase2-bplus.md
  - project-context/tasks/TASK-003/reviewer-handoff-round3.md
  - project-context/tasks/TASK-006/draft.md
  - project-context/tasks/TASK-006/route-b-decision.md
doc_type: 治理任务 DRAFT
task_id: GOV-005
status: APPROVED（Founder 已通过 GOV-005 Builder 会话指令下达并批准任务方向、范围、权限与验收；本文件由 Builder 落盘为正式任务定义）
draft_version: v1.0
drafter: GOV-005 Builder（本窗口；无旧会话继承，事实均从 origin/main 与指定证据重新核验）
draft_date: 2026-08-19
basis: Founder 对 GOV-005 的完整任务指令（目标、主线/分支/工作区、必读、证据、项目尺度、地图覆盖项、状态边界、允许/禁止、实施顺序、验收标准）
execution_mode: persistent_session（本窗口为治理 Builder 长期会话；只推进 GOV-005 单一问题）
branch: codex/gov-005-project-atlas
worktree: E:/gov-005-project-atlas-worktree
```

---

## 1. 任务目标

实施 Founder 已批准的 GOV-005「P1 项目全览地图与上下文恢复」治理任务。

把 P1 产品的全貌、真实进度、完整闭环、作品集尺度、重大产品决策、失败路线、两套前端关系和后续路线，整理成一张面向**无技术背景读者**的大白话地图，并把它接入正式的上下文恢复导航。

新地图文件是 **`project-context/project-atlas.md`**，定位是「索引 + 大白话翻译层」，**不是**新的产品事实权威。详细事实仍分别以 `product.md`、`project-mainline-roadmap.md`、`current-state.md`、`decision-register.md`、正式契约、Git 和审查证据为准。

本任务不开发产品、不启动 TASK-007。

## 2. 非目标

- 不开发产品、不修改任何产品代码；
- 不修改 Dify、数据库、Schema、迁移、依赖、评测规则；
- 不启动 TASK-007、TASK-005B，不开发个人网站；
- 不运行实验、不做外部模型调用、不读取冻结/保留测试数据；
- 不部署、不合并 PR；
- 不唤醒 Reviewer 或其他角色（完成后由 Founder 人工转交）；
- 不用地图替代任何权威文件，也不把未实现内容写成已实现。

## 3. 项目尺度（Founder 已批准）

这是 **AI 产品经理求职作品集**，不是企业生产系统。

当前优先目标：能运行、能点击、能聊天、能查看 Memory 和 Trace、能看真实 Eval 与 Before/After、能讲清问题/决策/证据/失败/下一步；证据真实、边界诚实。

隐私、安全、稳定性、成本、监控、回滚和扩展必须说明已经考虑，但当前默认不建设完整企业级体系，除非它们阻塞真实 Demo、核心证据或基本安全。

个人作品集网站是另一个项目；P1 仓库只负责提供可运行、可嵌入、可讲解的真实 Demo 与证据。

## 4. 地图必须覆盖的内容

`project-context/project-atlas.md` 应按无技术背景 Founder 能顺序读懂的方式覆盖：

1. 项目背景和初衷；
2. 目标用户；
3. 为什么聚焦中期和重度用户；
4. AI 失忆、误记、乱用记忆怎样破坏关系连续感；
5. 完整产品闭环（聊天 → Memory 写入/召回/更新/删除 → Trace → Eval → Bad Case → 产品决策与修复 → Before/After）；
6. 正式三层 Demo（用户侧产品 / 产品策略后台 / Eval·Trace·Bad Case 质量层）；
7. 单列「作品集叙事层」，明确它不是第四层产品功能；
8. 当前代码和产品真正能演示什么；
9. 哪些只完成一部分；
10. 哪些已批准但尚未实现；
11. 哪些只是未来设想；
12. R1—R4 的决策时间线；
13. 为什么停止阈值、孤立打分和当前 R4；
14. 哪些证据支持选择、哪些证据否决选择；
15. 3000 真实产品与 8765 设计母版关系；
16. TASK-007、TASK-005B、20 Case、完整 Bad Case 生命周期和最终网站的后续顺序；
17. 面试时可以展开讲的产品判断；
18. 当前 Demo 不能证明什么；
19. 新窗口最短恢复入口。

每一项能力状态只能属于四类之一：**已实现且有证据 / 部分实现 / 已批准但未实现 / 未来设想**。每个「已实现」必须链接到正式文件、真实代码、合并记录或审查证据；聊天摘要和未追踪文件不能单独证明正式完成。

## 5. 必须保持的状态边界（不可违反）

- R4 已完成并审查，但整体未通过；
- E004 未解决；
- 不得声称 TASK-006 成功解决了问题；
- 当前阶段停止继续迭代 R4，主线准备转入 TASK-007；
- 20 条 Eval Case 仍是正式 Demo 成功标准中的未完成缺口，不能降级成「以后有空再做」；
- 完整 Bad Case 生命周期尚未实现；
- TASK-007 尚未开始；
- TASK-005B 尚未开始；
- 生产部署尚未完成；
- 个人网站不在 P1 仓库内；
- 本地能运行不等于已上线或具备真实灰度发布能力；
- 设计稿、批准方向和未来路线不能写成产品已实现；
- 不自行发明新的任务状态。

R4 必须恢复为以下事实（来自指定证据文件，见 §6）：

- 已完成两轮真实验证；
- 已完成判断标准修订；
- 已完成收尾；
- 已通过独立证据审查；
- 显式判断能减少无关记忆硬扯；
- 关键记忆仍会漏；
- 整体未通过；
- 不启动第五轮；
- 不接入聊天产品；
- E004 仍未解决；
- 当前阶段接受为 Demo 已知限制；
- R4 证据尚未全部进入正式主线，应标为「已完成并审查、待正式保存」。

不得写成「R4 DRAFT 未批准」或「R4 尚未执行」。

## 6. 指定证据（当前任务明确指定的输入，非正式主线）

R4 最新证据位置：`E:/task-006-context-wiring-worktree/project-context/tasks/TASK-006/`（该 worktree 未合入 main，只能读取，不得在其中修改、提交、推送）：

- `spike-r4-evidence.md`
- `spike-r4-standard-revision.md`
- `spike-r4-design-review.md`
- `spike-r4-evidence-round2.md`
- `spike-r4-closeout.md`
- `spike-r4-closeout-review-report.md`

TASK-003 设计母版参考（历史输入，非正式主线事实）：

- `C:/Users/admin/Desktop/project-atlas.md`
- `E:/project-atlas-worktree/project-context/project-atlas.md`
- `E:/正式作品/prototypes/task-003-eval-console-v2.1/`（design-spec / index.html / README）
- `E:/正式作品/project-context/tasks/TASK-003/static-prototype-review-v2.1/`（REVIEW-REPORT-RECHECK.md、数据来源说明.md、review-artifacts/v2.1 截图）

两套前端关系（必须写清）：

1. **3000 端口是真实产品**：聊天、Memory、Trace、真实 Eval、Case、Run、PostgreSQL 和真实接口。
2. **8765 端口是 TASK-003 V2.1 静态设计母版**：视觉、信息层级、Before/After、Case Drawer、Trace 边界、Bad Case 管理、桌面和移动端参考。

最终只保留 3000 的真实产品；TASK-007 负责吸收 8765 的设计系统和关键交互。禁止把 8765 的固定数字、旧 Case 映射、假按钮、固定日期或历史结论写成真实产品事实。设计母版及其审查证据目前未进入正式主线，地图应标为「已完成设计资产、待正式保存」。

## 7. 允许修改的文件

- `project-context/tasks/GOV-005/draft.md`
- `project-context/tasks/GOV-005/implementation-plan.md`
- `project-context/tasks/GOV-005/implementation-report.md`
- `project-context/tasks/GOV-005/reviewer-handoff.md`
- `project-context/project-atlas.md`
- `project-context/context-manifest.md`
- `project-context/current-state.md`
- `project-context/decision-register.md`
- 经证据证明必须同步时：`project-context/product.md`、`project-context/project-mainline-roadmap.md`、`AGENTS.md` 中的地图入口和统一治理版本

原则上不得修改：`project-context/agent-response-protocol.md`（回复协议与本任务无关，不得顺带改）。

如果把 project-atlas 加入强制的新窗口或压缩恢复阅读，属于治理行为变化，必须搜索全部统一治理版本引用，在同一变更中完成一致升级；不得只修改一个版本号。

## 8. 授权与禁止的动作

**Founder 明确授权（仅适用于 GOV-005）**：

- 创建独立工作区；
- 从最新 origin/main 创建分支；
- 修改批准范围内的治理文档；
- commit；
- push 该单一问题分支；
- 建立 PR；
- 运行治理文档的一致性、路径和版本检查。

**禁止**：

- 修改任何产品代码、Dify、数据库/Schema/迁移、依赖、评测规则；
- 修改或读取冻结测试数据；
- 运行实验、外部模型调用；
- 启动 TASK-007、开发个人网站、部署、合并 PR；
- 修改无关文件；
- 使用旧脏工作区提交（禁止从 `codex/task-006-r4-realignment`、`codex/task-006-context-wiring`、`codex/project-atlas`、`E:/正式作品`、`E:/project-atlas-worktree`、任何 TASK-006/R4 旧分支继续开发）；
- 自动唤醒 Reviewer 或其他角色。

## 9. 实施顺序

1. 完成内部启动核验（不向 Founder 展示回执）；
2. 核验远端正式主线；
3. 创建独立分支与工作区；
4. 读取全部 required_reading 和指定证据；
5. 创建并完善 GOV-005 DRAFT 与 implementation-plan；
6. 若正式规则要求实施计划 Review，先向 Founder 用大白话说明计划和主要风险，等待批准后再修改正式治理文件；
7. 实施 project-atlas 和必要的状态、决策、导航、治理版本同步；
8. 检查所有「已实现」均有证据；
9. 检查没有把静态设计、聊天设想或未来规划写成事实；
10. 检查统一治理版本、文件导航和引用一致；
11. 创建 implementation-report 和 reviewer-handoff；
12. commit、push、建 PR；
13. 返回结果并停止，等待 Founder 人工转交 Reviewer。

## 10. 验收标准

- 新 Agent 只读地图即可理解项目全貌和当前阶段；
- 地图不会替代正式权威文件；
- 所有能力明确属于四种状态之一；
- R4 最新结论准确；
- TASK-006 不被写成问题已解决；
- 20 Case 不被降级；
- 两套前端关系准确；
- 设计母版和 R4 本地证据的「待正式保存」风险明确；
- 正式三层 Demo 与作品集叙事层没有混淆；
- TASK-007 与后续路线清楚；
- 回复协议未被无关修改；
- 若恢复阅读规则改变，治理版本已完整同步；
- 没有产品代码、实验、依赖或冻结证据变化；
- PR 只解决 GOV-005 一个问题。

## 11. 停止条件

- 发现远端主线、当前交接、R4 证据或任务状态存在**无法解释的冲突** → 停止写入并用大白话报告，不得自行猜测；
- 实施计划未获 Founder 批准 → 不修改正式治理文件；
- 需要超出本任务批准范围的修改 → 提交 Change Request，不自行扩大范围。
