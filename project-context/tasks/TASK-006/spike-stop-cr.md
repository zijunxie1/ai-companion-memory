# TASK-006｜本地相关性 Gate Spike 停止裁决包（Change Request）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/project-mainline-roadmap.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/tasks/TASK-006/draft.md（v1.1，APPROVED）
  - project-context/tasks/TASK-006/route-b-decision.md（D-T006-ROUTE-B，APPROVED）
  - project-context/tasks/TASK-006/local-gate-spike-draft.md（v1.2，APPROVED）
  - project-context/tasks/TASK-006/spike-builder-handoff.md
  - project-context/tasks/TASK-006/spike/implementation-plan.md（v1.0，已批准）
  - project-context/tasks/TASK-006/spike/（冻结记录、原始数据、审计日志）
doc_type: Change Request / 决策包（八类升级事项第 5 条：引入新架构/候选范围重裁；停止条件 9 触发）
task_id: TASK-006（内部 Spike：TASK-006-SPIKE-LOCAL-GATE）
cr_id: CR-T006-SPIKE-STOP-01
status: DECIDED（Founder 2026-08-12 裁决：选项 A——接受第一轮 Spike 失败结论；禁止补 H4 词表、重跑冻结 holdout、重启外部模型路线）
prepared_by: operational-chief-2026-08-12-01（执行 Chief，依据 Builder 停止报告 + 证据核验）
prepared_date: 2026-08-12
stop_condition_triggered: DRAFT v1.2 §9 停止条件 9（两个正式候选都失败）
decision_scope: 候选范围/路线重裁（第二轮 Spike 候选范围 DRAFT 在收尾 PR 合入后另行起草）
founder_options: 3（A 接受失败/重裁范围 / B 豁免冻结补词重跑 / C 回到外部 Gate 离线路线重议）
founder_decision: A（2026-08-12）——接受失败结论；禁止补 H4 词表、重跑冻结 holdout、重启外部模型路线
spike_status: STOPPED/FAILED（两候选均未通过 §8 全部门；**不等于 TASK-006 失败或完成**；TASK-006 保持 APPROVED）
closeout_pr: 单一收尾 PR #17（OPEN，REVIEW_APPROVED——独立 Reviewer 2026-08-12 核对四件事一致，建议合并；合并裁决归 Founder）
next_step: 收尾 PR 由 Founder 合并后，执行 Chief 再起草第二轮 Spike 候选范围 DRAFT（针对词法不可分与手工词表覆盖不足提出新机制，**不预先选定方案**）；新 DRAFT 批准前不唤醒 Builder、不修改产品/评测规则
```

---

## 1. 先说人话（30 秒）

本地把关方案的两种机制实测都失败了：第一种（纯文字相似度）在"聊天气 vs 聊失眠"这种记忆文本几乎相同的场景下物理上分不开；第二种（话题分类）在三个新场景全对，但栽在"下雨"这种没见过的天气说法上——相关记忆差 0.001 没过线，且补词属于"看着答案改考卷"，违反纪律不能做。所以本 Spike 结论是**未形成"存在可行候选"**，按已批准规则触发停止条件。这不是"彻底没戏"：失败根因清楚、证据完整，为下一步省了弯路。现在需要你裁决候选范围/路线怎么走。

## 2. 停止条件触发声明（DRAFT v1.2 §9 停止条件 9）

```text
两个正式候选均未通过 §8 全部门：
- 候选 1（本地词法/统计二次相关性 Gate）：校准失败——ρ=0.8653（非冗余✅）但 16 个机制版本分离边际全为负（-0.005~-0.145），未过 0.1 门；
- 候选 2（本地主题类别 Gate）：校准通过（F1=1.0、边际 0.3971）但冻结 holdout 一次性运行失败——H1/H2/H3 PASS，H4 天气变体（下雨）FAIL；
  合并 F1=0.8571、分离边际 0.0013，未过 0.1 门；
→ 触发停止条件 9：两个正式候选都失败，停止 Spike，提交 Change Request 由 Founder 裁决候选范围。
```

## 3. 核验结论（执行 Chief 只读复核 Builder 自报，2026-08-12）

| 核验项 | 结果 |
|---|---|
| Builder 停止报告自报与本地证据一致 | ✅ 候选 1 边际全负、候选 2 H4 失败数据（0.049<0.05）、合并 F1=0.8571/边际 0.0013 均与原始 JSON 相符 |
| 冻结纪律（四步顺序） | ✅ holdout 冻结提交 `9459a70`（哈希 307d2663）先于一切校准；机制冻结 `7e6f414`（哈希 bd4cc70c，w1=0.8/w2=0.2/阈值 0.05）后无任何调参提交；`6c73270` 仅一次性运行+清理 |
| 候选 2 主题体系未用 holdout 内容 | ✅ `theme-system.md/json` 中 holdout 特有词（雨/苹果/金毛/朋友/戚风）仅出现在"排除声明"中，类别词表仅含校准集文本 + 通用知识词 |
| 数据/网络边界 | ✅ 三阶段运行期 fetch 审计日志全部仅 loopback（127.0.0.1:8100）；holdout 种子 9 条已 DELETE 并核验清零（cleanup 日志） |
| 零产品改动 | ✅ 分支 diff 相对 origin/main 仅含 `project-context/tasks/TASK-006/` 文档与 `spike/` 文件；无产品代码/8 Case/Schema/评测规则/治理文件变更 |
| 样本量诚实声明 | ✅ 校准 29 样本（20正/9负）+ holdout 9 样本，报告如实声明量小、置信有限；失败方向非样本噪声可解释 |
| ⚠️ 交付报告偏差（非证据问题） | Builder 报告称"分支已推送远端 @ 6c73270"，实际本地分支 `feature/task-006-local-gate-spike` ahead 7（9459a70…6c73270 均**未推送**），远端仍为 7b425e0。证据在本地完整可核验；已要求 Builder 在 Founder 裁决路径上确认推送（不影响本 CR 裁决） |

## 4. 失败根因（来自 Builder 报告 + 原始数据复核）

1. **候选 1 证伪根因（结构性，非调参可解）**：E001 的"失眠↔橘猫"相关对与 E004 的"天气↔橘猫"无关对，记忆文本几乎完全相同（同一用户的橘猫记忆），纯词法/统计信号物理上无法区分——最低正例分 − 最高无关分在 16 个权重版本下全为负；F1 虽达 0.93-0.97 但这是"阈值选在重叠区内"的假象，分离边际为负说明任何阈值都必然混入或漏掉；
2. **候选 2 失败根因（结构性词表缺口，精确到 0.001）**：冻结主题词表不含"雨/下雨/阴"等天气变体词 → H4 查询"外面下好大的雨"落入"其他"类 → 类别相容度 comp=0 → 相关样本（阴雨天膝盖疼）score=0.0490 < 阈值 0.05（漏报），无关最高 0.0404；若下调阈值则无关混入——词表缺口是结构性的，调阈值是打地鼠；H4 原数据 `data/holdout/run.json` 完整留档；
3. **补充词表的边界风险**：即使补"雨"类词，也只是把 holdout 特例修绿，接近"针对冻结场景补词"的边界（触发停止条件 3 风险），按纪律不做。

## 5. 候选范围/路线裁决选项（供 Founder 选择）

| 选项 | 内容 | 后续 | 执行 Chief 评估 |
|---|---|---|---|
| **A（推荐）** | 接受 Spike 失败结论；由 Founder 批准新的候选范围/方法重裁（可基于本 Spike 根因提出新机制方向），再开第二轮 Spike | 需要新批准的范围 + 新的冻结纪律 + 独立 Review | 符合"不隐藏失败"北极星；本 Spike 证据链（词法不可分/词表缺口）可直接指导下一轮候选设计（如：语义层信号、类别体系自动构建、或检索层改造） |
| B | 针对 H4 词表缺口补"天气变体词"后重跑 | 需 Founder 明确豁免冻结纪律（"运行后禁止继续调参"） | 不推荐：违反冻结纪律；接近"针对冻结场景补词"（停止条件 3 风险）；补词后 holdout 不再独立，证据价值归零 |
| C | 暂停本地 Spike，回到已否决的"外部模型 Gate 仅作离线研究"路线重新讨论 | 需 Chief 重新出决策包 | 已否决路线（D-T006-ROUTE-B）；若无新证据（如隐私/延迟约束变化）不应重开；可作为并行研究选项但不推荐作主路线 |

**执行 Chief 推荐：A。** 依据：Spike 的产出是诚实证据而非可行方案；继续硬调会把 Spike 变成过拟合表演；候选 2 的失败点（词表缺口）同时暴露了"手工主题体系覆盖不完"这一可改进方向，为下一轮候选设计提供了明确输入。

## 6. Founder 裁决记录（2026-08-12，选项 A）

- **Founder 裁决：A——接受第一轮本地 Gate Spike 失败结论**；
- **禁止**：补 H4 词表、重跑冻结 holdout、重启外部模型路线；
- **收尾**：推送本地完整证据 + 停止报告 + 本裁决记录（不得误报远端状态）；创建**单一收尾 PR**，状态写 **STOPPED/FAILED**（**不得写成 TASK-006 已失败或已完成**）；交独立 Reviewer 核对证据、冻结纪律、清理结果及零产品改动；
- **下一步（收尾 PR 由 Founder 合并后）**：执行 Chief 起草第二轮 Spike 候选范围 DRAFT——针对**词法不可分**与**手工词表覆盖不足**提出新机制，**不得预先选定方案**；新 DRAFT 批准前不唤醒 Builder、不修改产品/评测规则；
- 在收尾 PR 合并前：不开启第二轮 Spike、不调整候选范围、不修改产品代码/评测规则、不重新启用已冻结机制调参。

> 裁决前的"唯一问题"已由 Founder 于 2026-08-12 以选项 A 答复，本 CR 关闭（DECIDED）。

## 7. 证据索引（全部入库，可复现）

```text
project-context/tasks/TASK-006/spike/
├── implementation-plan.md          # 实施计划 v1.0（已批准）
├── preflight-check.md              # S0 预装检查（P1-P6 通过）
├── holdout-freeze.md               # S1 holdout 冻结记录（哈希 307d2663）
├── holdout-definition.json         # 冻结的 holdout 定义（唯一事实）
├── theme-system.md / theme-system.json  # 候选 2 主题体系（冻结哈希 bd4cc70c）
├── mechanism-freeze.md             # S6 机制冻结记录（w1=0.8/w2=0.2/阈值 0.05）
├── scripts/                        # 测量/验证脚本（纯 Node ESM，零新增依赖）
├── data/
│   ├── calibration/round-{1,2,3}/  # 3 轮校准原始 JSON（run 31/30/29）
│   ├── labels/                     # 标签（20正/9负）+ 人工复核记录
│   ├── scores/candidate1.json      # 候选 1 全 16 版本（边际全负）
│   ├── scores/candidate2.json      # 候选 2 校准（F1=1.0、边际 0.3971）
│   ├── holdout/run.json            # H4 失败原始数据（0.049 vs 0.05）
│   └── audit/                      # 网络审计（全部 loopback）+ 清理日志
```

分支：`feature/task-006-local-gate-spike`（本地 @ `6c73270`，**未推送**——待 Founder 裁决路径确认推送；远端 @ `7b425e0`）。

## 8. 下一步（Founder 裁决后）

- 选项 A：执行 Chief 起草第二轮 Spike 候选范围 DRAFT（新机制方向基于本 CR §4 根因），经 Founder Review + 独立 Review 后另行执行；
- 选项 B/C：按对应流程；
- 本 CR 为决策包，不含产品实现授权；TASK-006 保持 APPROVED 状态不变（未改变任务状态）。
