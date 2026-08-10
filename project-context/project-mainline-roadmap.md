# P1 Alice Memory｜项目主线路线图与偏航恢复规则

> 文档类型：项目级主线路线图 / 跨角色强制上下文 / Builder 规划输入
>
> 状态：ACTIVE ROADMAP（描述已确认的执行顺序；各具体任务仍须单独 DRAFT、批准和 Review）
>
> 日期：2026-08-10
>
> 项目根目录：`E:\正式作品`
>
> 适用角色：Chief of Staff、长期 Builder、独立 Reviewer、Release / QA

> 强制阅读：所有 Agent 在新开窗口、接手项目或开始新任务前必须完整阅读本文件；本文件不替代当前任务说明和正式契约。

> 启动入口：先读取 `project-context/context-manifest.md` 和 `project-context/current-state.md`；面向 Founder 的回复遵守 `project-context/agent-response-protocol.md`；重大决策以 `project-context/decision-register.md` 为索引。

> 运行方式：所有角色均为非驻留窗口。角色切换必须由 Founder 使用 `project-context/role-wakeup-and-handoff.md` 的唤醒卡手动触发；箭头表示交接顺序，不表示自动接力。

---

## 1. Builder 先要理解的项目结论

这不是单纯把评测页做漂亮，也不是把所有测试调成绿色。项目最终要形成一条可以被面试官验证的真实闭环：

```text
真实聊天
→ Memory 写入 / 召回 / 更新 / 删除
→ Trace 解释发生了什么
→ Eval 发现问题
→ 产品策略修复问题
→ Before / After 证明变化
→ Bad Case 沉淀与回归
→ 以统一、可信的正式产品完成演示
```

最终只保留 `3000` 的真实产品作为正式入口。`8765` 静态页面是设计母版和验收参考，不继续演化为第二套产品，也不得把其中的固定快照、口号或假交互复制进正式产品。

项目当前是“核心纵向闭环已形成、正在收敛为最终作品集成品”，不是 CLOSED。

---

## 2. 不随插曲改变的北极星

无论中途出现 UI 问题、模型波动、分支冲突、单个 Case 失败或第三方服务异常，最终都必须回到以下五个结果：

1. **单一可信主线**：代码、任务状态、契约和运行事实来自同一权威分支。
2. **结果可解释**：每个 Run 能回答“用了什么配置、为什么变化、判断来自哪里”。
3. **评测驱动改进**：至少完成一条“Eval 暴露问题 → 产品修复 → 回归验证”的真实案例，首选 E004。
4. **产品体验统一**：`3000` 吸收 V2 Design Spec 的视觉、信息架构与关键交互，同时继续使用真实数据。
5. **可稳定演示**：核心 Demo 不依赖运气、临时人工删数据或服务一直不重启；已知限制被诚实展示。

任何新想法如果不能直接支持上述五项之一，默认进入 Backlog，不插入当前任务。

### 2.1 多角色窗口与职责边界

本路线图描述的是同一项目主线，不代表 Builder 拥有所有阶段的决策权。每种角色应使用独立、职责清晰的窗口；交接依赖仓库文件和证据，不依赖前一个窗口的聊天记忆。

| 窗口 / 角色 | 应该做什么 | 不应该做什么 | 固定产出 |
|---|---|---|---|
| **Founder / CEO（用户）** | 决定产品方向、任务优先级、范围取舍、主线方案、是否合并与部署 | 不需要代替 Builder 解决实现细节；不把口头同意自动视为已经合并 | 裁决文本、任务批准/否决、合并与部署授权 |
| **Chief of Staff** | 读取项目事实；质疑需求；维护大方向；拆分单一可审查任务；定义目标、非目标、风险、验收门和停止条件；处理 Change Request | 不写产品实现；不自行选择主线；不把 DRAFT 写成已实现事实；不越过 Founder 批准 | DRAFT、决策包、优先级、Chief→Builder 交接包、固定状态报告 |
| **Git / Governance Builder** | 只执行已批准的分支收敛方案；保全历史；解决明确冲突；形成可审查 PR | 不自行决定 main/master；不 force push；不顺便改产品功能 | Git 审计、冲突解决记录、测试结果、PR、回滚点 |
| **长期 Builder** | 先提交实施计划；在独立分支实现一个任务；同步代码、测试、迁移和契约；记录失败尝试与已知限制 | 不修改任务目标；不降低验收标准；不跨任务顺手重构；不直接合并主线；不自己宣布 Review 通过 | 实施计划、代码与测试、Builder 实现报告、commit/PR、Change Request |
| **独立 Reviewer** | 从新窗口读取任务、契约、diff 和证据；逐项复核验收；主动找回归、数据不一致、越界和“为了变绿”的修改 | 默认不修改代码；不沿用 Builder 的自我结论；不把测试通过等同于产品正确；不批准合并 | Review 报告、BLOCKER/MAJOR/MINOR、`REVIEW_APPROVED` 或 `CHANGES_REQUESTED` |
| **UX / Design Reviewer** | 对 TASK-007 进行 1440px/375px 实测；检查信息层级、真实数据表达、交互手感、无障碍和 V2 Design Spec 收敛 | 不只看静态截图；不要求复制固定数据或飞机稿文案；不替代功能 Reviewer | 对照截图、Browser 实测、视觉/交互问题清单、UX 结论 |
| **Release / QA** | 只在已合并后部署；执行迁移、健康检查、冒烟、日志、数据和回滚验证 | 不修功能；不部署未合并分支；不因“本地可运行”直接标记 VERIFIED | 部署记录、版本号、冒烟证据、回滚信息、`VERIFIED`/失败报告 |

### 2.2 每个窗口何时开始、何时停止

| 当前状态 | 当前窗口 | 本窗口完成门 | 下一窗口 |
|---|---|---|---|
| IDEA / 模糊问题 | Chief | 形成 DRAFT，目标与验收可判断 | Founder |
| DRAFT | Founder | 批准、打回或要求补充 | Builder 或 Chief |
| APPROVED | Builder | 先完成实施计划 Review；再实现、测试并提交报告 | Reviewer |
| IMPLEMENTED / IN_REVIEW | Reviewer | 输出明确审查结论 | 原 Builder 或 Founder |
| CHANGES_REQUESTED | 原长期 Builder | 修复同一任务并更新证据 | 原独立 Reviewer 复审 |
| REVIEW_APPROVED | Founder | 决定是否合并 | Git Builder / 合并执行者 |
| MERGED | Release / QA | 部署和真实环境验证 | Founder / Chief |
| VERIFIED | Chief + Founder | 核对产品目标与剩余限制，决定是否 CLOSED | 下一任务或结束 |

任何角色到达本窗口完成门后都应停止，不得因为“下一步很明显”自动扮演下一角色。

### 2.3 本项目各阶段的窗口交接顺序

#### GOV-001

```text
Chief 起草非破坏性方案
→ Founder 裁决唯一主线
→ Git Builder 输出实施计划
→ Founder 确认执行模式
→ Git Builder 建集成分支并提交 PR
→ 独立 Reviewer 验证历史、冲突、测试和可回滚性
→ Founder 决定合并
→ 状态同步 PR
```

#### TASK-005A / TASK-006 / TASK-005B

```text
Chief 建立独立任务 DRAFT
→ Founder 批准验收标准
→ 原长期 Builder 先交实施计划
→ 实现与自动测试
→ 独立功能 Reviewer
→ Founder 合并裁决
→ Release / QA 验证真实 Run
```

#### TASK-007

```text
Chief 明确“设计母版 → 正式模块”映射
→ Founder 批准收敛范围
→ 长期 Builder 实现真实数据版本
→ 功能 Reviewer 验证数据与交互
→ UX / Design Reviewer 做桌面与移动实测
→ Founder 合并裁决
→ Release / QA 验证正式入口
```

#### 最终产品交付

```text
Chief 汇总所有已完成任务与已知限制
→ 新独立 Reviewer 做产品交付对抗评审
→ 原 Builder 只修被打回问题
→ Release / QA 做最终部署验证
→ Founder 决定 P1 是否 CLOSED
```

### 2.4 插曲应该交给哪个窗口

| 插曲 | 处理窗口 |
|---|---|
| 需求、范围、优先级或成功标准冲突 | Chief → Founder |
| main/master、提交丢失、合并冲突 | Git Builder；方案先由 Chief/Founder批准 |
| 实现 Bug、测试失败、局部性能问题 | 当前长期 Builder |
| 任务范围外的新接口、新表、新依赖 | Builder 提 CR → Chief → Founder |
| 数据真实性、规则被削弱、回归或安全问题 | 独立 Reviewer 打回 |
| 视觉、排版、交互手感和无障碍 | UX / Design Reviewer；修改仍回原 Builder |
| 部署、迁移、环境变量、线上日志 | Release / QA |

如果一个插曲跨越两个以上角色，先由 Chief 判断归属和是否需要新任务，Builder 不自行协调成一个扩大后的 PR。

---

## 3. 当前事实与必须先处理的冲突

### 3.1 Git 主线状态（2026-08-11 已收敛）

> ⚠️ 以下为**历史快照**（2026-08-10 生成，已过期），保留仅用于追溯；当前权威状态以 `project-context/current-state.md` 为准。

| 引用 | Commit | 说明 |
|---|---|---|
| GitHub 默认分支 `origin/main` | `855f16b` | （历史快照）当时含 TASK-002 历史，不含 TASK-003 合并链 |
| 远端 `origin/master` | `064f5b6` | （历史快照）当时含 TASK-003 `0403107` 及文档路径修复 |
| 分叉 | `11 / 29` | （历史快照）当时双方均有独有提交 |

**2026-08-11 实际状态（Git 核验）**：GOV-001A PR #5（@`4baabf0`）与 GOV-001B PR #6（@`5901c64`）均已合并，`main` 已通过可审查集成吸收 `master` 全部内容，且治理文件（AGENTS/current-state/decision-register/roadmap 等）已入库；`master` 已是 `main` 的祖先（master 独有提交 = 0）。“TASK-003 MERGED” 现在可表述为“已合入默认主线”。禁止 force push；master 退役由 D-MASTER-RETIRE 单独裁决。

### 3.2 产品成功标准冲突

`project-context/product.md` 仍要求：

- 20 条离线 Eval Case；
- 删除 Case 必须 100% 通过。

TASK-004 三轮 Spike 已证明：物理删除有效，但未来对话仍可能重新抽取；现有轻量方案无法同时达到零误删和至少 90% 召回。TASK-004 已暂停，验收标准没有降低。

在 Founder 明确修改产品目标前，Builder 必须把它记录为“尚未满足的已知限制”，不得通过改规则、改文案或隐藏失败声称完成。

---

## 4. 推荐主线与阶段门

### Phase 0｜GOV-001 主线与状态收敛

**目标**：建立唯一权威分支和可信任务状态，为后续所有开发清场。

**Owner**：Chief 提案，Founder 裁决，Git Builder 执行，独立 Reviewer 复核。

**Builder 规划时必须覆盖**：

- 对 `origin/main`、`origin/master`、TASK-002、TASK-003 做提交与文件树审计；
- 给出非破坏性的收敛方案，不使用 force push；
- 明确唯一默认主线及各 feature branch 的去留；
- 同步 TASK-003 的真实状态、最终 commit、PR/合并依据；
- 分类未跟踪的原型、截图、审查证据和临时文件；
- 所有路径改为仓库相对路径；
- 保留 TASK-004 Spike 独立分支及停止证据。

**退出条件**：

- 只有一个被 Founder 确认的权威主线；
- TASK-001/002/003 状态与 Git 事实一致；
- 本地跟踪关系不再把 `main` 和 `master` 混用；
- Reviewer 给出明确的分支/历史一致性结论。

**非目标**：不顺便修 E004、不改 UI、不改数据库。

---

### Phase 1｜TASK-005A Config Snapshot Completeness

**目标**：先建立“为什么结果变化”的证据能力，再优化评测结果。

**原因**：当前多个关键字段为 `unavailable`。如果先调 Gate 把 E004 变绿，却不能说明改了什么，评测驱动开发的叙事不成立。

**至少应固化的 Run 快照**：

- `chat_model`
- `embed_model`
- `write_mode`
- `recall_top_k`
- `recall_threshold`
- `chatflow_version`
- Extract Prompt Hash
- Persona Hash
- Judge 版本
- Case Set / Eval Policy 版本

**设计约束**：

- 快照在 Run 创建时固化，不随当前系统配置变化；
- 历史 Run 保持可读；
- 真正不适用的字段可以标记 N/A，但必须带原因；
- 可采集字段不得继续无解释地写 `unavailable`；
- UI 要区分程序规则、LLM Judge、人工覆盖、固定评测快照和原因假设。

**退出条件**：新 Run 能从 UI/API 追溯上述配置；测试覆盖快照不可变性和历史兼容；契约、迁移、代码、测试在同一 PR。

**非目标**：本阶段不做持久化任务队列，不做指标自由配置。

---

### Phase 2｜TASK-006 E004 无关召回 Gate

**目标**：完成第一条真实“评测暴露问题 → 产品修复 → 回归证明”的闭环。

**规划原则**：不要预设“调高阈值一定可行”。先测量 E004 与 E001 等正向召回 Case 的分数分布，再选择阈值、过滤或 Gate 方案。

**必须保护的行为**：

- E004 天气场景不召回猫、分手、失眠等无关 Memory；
- E001 等应召回场景不能因 Gate 过严而退化；
- Safety、Privacy、Deletion 强约束不得退化；
- 不修改评测规则制造 PASS；
- 不隐藏失败，不用固定前端数字替代真实 Run。

**退出条件**：

- 至少三轮全量 8 Case 新 Run；
- E004 无关召回为 0；
- E001 和其余强约束无回归；
- Config 快照能指出具体策略变化；
- Builder 报告包含失败尝试、停止条件和 Before / After 证据。

**停止条件**：若正负 Case 分数无法安全分离，或修 E004 必然造成 E001 明显退化，立即提交 Change Request，不继续为了变绿而调参。

---

### Phase 3｜TASK-007 正式产品与 V2 Design Spec 收敛

**目标**：让 `3000` 成为 `8765` 设计母版的真实产品实现，达到关键路径 80%–90% 的视觉和交互一致性。

**应迁移**：

- Humanized Data Atelier 的 Token、字体层级、圆角、间距和卡片密度；
- 总览结论、强约束、GSB、指标、Case、Trace 和 Bad Case 的信息层级；
- 搜索、筛选、展开、Drawer、键盘焦点、移动单列和减少动态效果；
- 从汇总到 Case、证据、根因和处理动作的下钻链路。

**不得迁移**：

- 固定数字、固定日期和固定评测结论；
- 没有后端支持的字段；
- 英文口号式 eyebrow；
- 被用户指出像“飞机稿”的营销表达；
- 假按钮、假工作流、纯装饰的大面积 Hero；
- Hover 红色模糊光晕溢出。

**用户此前注释必须转化为设计要求**：

- 首屏重点服务日常判断，不让单一卡片占据超过约 35% 可视高度；
- “本次评测发现”必须标明数据来源和判断来源；
- GSB、强约束和评测指标要能解释定义、来源、作用和下钻路径；
- 指标暂为版本化模板，不伪装成已经支持自由编辑；
- Trace 明确区分“当前已采集”和“需后续新增采集”。

**退出条件**：1440px 与 375px 对照验收；真实数据贯通；无横向滚动；交互、焦点、触摸区、控制台和静态 Token 审计通过；独立人工 UX Review 通过。

---

### Phase 4｜TASK-005B Persistent Eval Runner

**目标**：Run 不再依赖 Next.js Web 进程内的临时后台执行。

**规划至少覆盖**：持久化队列、heartbeat/lease、retry、幂等、恢复、终态、重复执行保护和中断后的可观察状态。

**退出条件**：人为重启 Web/Worker 后，Run 不丢失、不永久卡在 running；可以安全恢复或明确失败；不依赖人工删数据库记录。

**非目标**：不借机建设通用工作流平台。

---

### Phase 5｜作品集完整度补齐

按独立任务串行推进：

1. 从 8 条扩展到产品标准中的 20 条高质量 Case；
2. 补 Persona、主动消息、长对话摘要、Creepiness、更多 PII 变体；
3. 完整 Bad Case 生命周期：负责人、状态、修复版本、回归 Run、关闭依据；
4. 补齐产品策略层的必要展示，但不建设无真实用途的后台页面；
5. 准备一条 10–15 分钟可重复的面试演示路线。

每个子项必须独立建任务，不打包成一个大 PR。

---

### Phase 6｜平台化与最终交付

CR-B 指标配置化只有在以下任一条件成立时才进入：

- 当前固定模板确实阻塞版本比较；
- 用户需要新增/修改/发布指标；
- 历史 Run 的指标兼容已成为真实问题。

否则保留为 P2，不作为当前 Demo 的阻断项。

完成前执行一次产品交付对抗评审，重点攻击：

- 服务中断与恢复；
- 删除后重新写入的诚实披露；
- Config 是否足以解释版本变化；
- 是否存在为了全绿而修改规则或隐藏失败；
- `3000` 是否真正收敛 `8765`；
- 面试官能否从总览一路追到证据、根因和处理状态。

之后才进入 Release / QA、DEPLOYED、VERIFIED；P1 是否 CLOSED 仍由 Founder 裁决。

---

## 5. 依赖关系与执行顺序

```text
GOV-001
  ↓
TASK-005A Config 快照
  ↓
TASK-006 E004 Gate
  ↓
TASK-007 设计收敛
  ↓
TASK-005B Runner 持久化
  ↓
20 Case / Bad Case / 产品策略层补齐
  ↓
最终对抗评审 → Release / QA
```

默认串行。只有文件、Schema、契约和公共组件完全不重叠的工作才允许并行，并且必须由 Chief 明确批准。

---

## 6. 小插曲处理与回到主线的机制

Builder 遇到问题时先分类，不直接扩范围：

| 类型 | 示例 | 动作 |
|---|---|---|
| A：当前验收内的小问题 | 测试夹具、局部 UI 错位、明确 Bug | 原分支修复，记录在实现报告 |
| B：阻塞当前任务但可控 | API 缺字段、旧数据兼容、依赖服务异常 | 时间盒验证；超过当前任务预计工作量 20% 就提交 CR |
| C：跨契约/跨任务问题 | 新表、新依赖、权限、主线冲突、产品语义变化 | 立即停止，提交 Change Request 给 Chief/Founder |
| D：不阻塞的改进 | 动画润色、通用组件抽象、额外指标 | 写入 Backlog，立即返回当前任务 |
| E：安全/数据丢失风险 | 错删、越权、泄露、破坏历史 Run | 停止所有写操作，保留证据并上报 |

每次插曲结束后执行“回主线检查”：

1. 当前任务目标有没有变化；
2. 验收标准有没有被削弱；
3. 是否产生未批准依赖、表、接口或公共组件修改；
4. 测试和契约是否仍与实现同步；
5. 当前分支是否仍只服务一个主要问题；
6. 将插曲结论写入文件，而不是只留在聊天中；
7. 重新从当前阶段最近一个未通过的验收项继续。

禁止用“顺手修一下”跨过任务边界。

---

## 7. 每个任务统一的 Builder 计划模板

Builder 在任何代码修改前必须提交以下计划，等待 Review 2：

```markdown
# TASK-XXX 实施计划

## 1. 当前事实与待验证假设
## 2. 目标 / 非目标
## 3. 依赖与前置条件
## 4. 拟修改文件和原因
## 5. 数据流、状态流和错误路径
## 6. 契约、Schema、权限和兼容性影响
## 7. 分步骤实现顺序
## 8. 测试矩阵
## 9. Browser / 运行验收步骤
## 10. 回滚与恢复方案
## 11. 风险、停止条件和 Change Request 条件
## 12. 预计形成的 commits / PR 边界
## 13. 明确未处理的后续事项
```

计划必须说明“如何证明没有回归”，不能只列准备修改的文件。

---

## 8. 分支、提交与证据规则

- 一个任务一个分支，一个 PR 一个主要问题；
- Builder 不直接修改主分支；
- 不使用 force push 解决当前双主线问题；
- 不删除已有验收、不加 skip、不降低阈值制造通过；
- 代码、迁移、测试和正式契约必须在同一 PR；
- 原型、截图和审计证据只作为验收材料，不进入运行时代码；
- 临时 Chrome profile、批量文本、实验输出不得混入产品 PR；
- 每个重要节点记录分支、commit、测试命令、结果和已知限制。

---

## 9. Builder 本次应返回什么

本次只要求 Builder进行规划，暂不实现。请返回：

1. 是否接受上述主线和依赖顺序；
2. GOV-001 的非破坏性 Git 收敛方案候选及风险；
3. TASK-005A 的实施计划草案；
4. TASK-006、TASK-007、TASK-005B 的粗粒度文件/模块影响图；
5. 哪些工作必须串行，哪些可以安全并行；
6. 每阶段预计需要的独立 Reviewer 证据；
7. 发现的契约冲突、缺失输入和 Change Request；
8. 明确声明：在 Founder 批准 GOV-001 和首个正式任务前，不修改产品代码。

---

## 10. 给 Builder 的启动指令

> 阅读 `AGENTS.md`、`project-context/product.md`、`project-context/handoff-and-task-state-machine.md`、TASK-003 最终 Review 与本路线图。先以只读方式核对 Git、任务状态、契约和现有实现。按照第 9 节输出跨任务实施规划，不修改代码、不提交、不推送、不合并。遇到本文与仓库事实冲突时，以 AGENTS.md 的“停止并上报”规则处理，不自行选择主线或修改产品成功标准。

在执行上述指令前，还必须读取 `project-context/context-manifest.md`、`project-context/current-state.md`、`project-context/decision-register.md`、`project-context/agent-response-protocol.md` 和 `project-context/role-wakeup-and-handoff.md`，并提交启动回执。Builder 的规划回复必须先给出 Founder 可理解的产品摘要，再附技术计划；阶段结束时返回下一窗口唤醒卡。
