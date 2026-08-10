# Role Wake-up & Handoff｜非驻留 Agent 唤醒与交接协议

> 基础事实：Chief、Builder、Reviewer、Release / QA 都不是常驻进程。只有 Founder 向对应窗口发送消息后，该角色才会读取文件、核对状态并工作。
>
> 默认不存在自动监督、自动接力、自动 Review、自动状态更新或自动部署。除非某项自动化已经被明确配置、测试并记录为生效事实，否则一律按“未自动化”处理。

## 1. 正确协作模型

```text
当前活跃窗口完成本阶段
→ 把状态、证据和下一步写入仓库文件
→ 输出一段给 Founder 的下一窗口唤醒卡
→ 当前窗口停止
→ Founder 选择是否、何时把唤醒卡发送给下一角色
→ 下一角色重新读取项目上下文并提交启动回执
```

角色之间不能直接假设对方已经看到文件或消息。文件只提供可恢复上下文，Founder 的唤醒消息才启动下一次工作。

## 2. Founder 是流程触发者，不是技术搬运工

Founder 只需要完成两类动作：

1. 决定是否进入下一阶段；
2. 将当前窗口生成的“下一窗口唤醒卡”发送给目标会话。

唤醒卡必须使用产品语言说明目的，并附必读文件路径。不得要求 Founder 自己整理 commit、冲突文件、测试命令或长篇技术上下文。

## 3. 每个窗口休眠前的强制检查点

活跃 Agent 在完成、阻塞、等待决策或即将结束会话时必须：

1. 更新当前任务的状态与交接文件；
2. 重要项目状态变化更新 `project-context/current-state.md`；
3. 重大决策更新 `project-context/decision-register.md`；
4. 保存实际分支、commit、diff、测试、已知限制和未完成项；
5. 明确下一责任角色；
6. 输出下一窗口唤醒卡；
7. 停止，不代替下一角色继续。

如果 Agent 没有权限修改文件，必须在回复中提供可直接落盘的完整交接内容，并标明“尚未落盘”。

## 4. 下一窗口唤醒卡

每次需要角色接力时，面向 Founder 的回复末尾必须提供：

```markdown
## 下一窗口唤醒卡

目标角色 / 会话：
为什么现在唤醒：
本次只需要它完成：
不得执行：
必须阅读：
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/current-state.md
  - <当前任务文件>
  - <相关契约 / Review / 实现报告>

请复制发送：
> 你现在是……。如果这是新任或新窗口 Chief，先读取 `project-context/CHIEF-BOOTSTRAP.md` 并声明与前任会话的关系。然后从磁盘读取以上文件并做只读核对；回复先写“先说人话（30 秒）”，再在启动回执中报告 AGENTS 规则版本、分支、Worktree 和工作区状态。确认无冲突后，只执行……。不要……。完成或阻塞时更新交接文件，并返回下一窗口唤醒卡。
```

如果不需要启动任何窗口，明确写：

> 当前没有需要唤醒的下一角色；等待 Founder 新指令。

## 5. 各角色何时需要 Founder 唤醒

| 情况 | Founder 应唤醒谁 | 唤醒后的职责 |
|---|---|---|
| 新需求、范围冲突、优先级或 Change Request | Chief | 形成产品判断和 DRAFT，不实现 |
| 任务已 APPROVED，需要实施计划或实现 | 原长期 Builder / 指定 Git Builder | 先提交计划，再按批准范围实现 |
| Builder 声称 IMPLEMENTED | 新独立 Reviewer | 读取文件、diff 和证据，执行事后 Review 门 |
| Reviewer 输出 CHANGES_REQUESTED | 原 Builder | 只修被打回问题并更新证据 |
| Reviewer 输出 REVIEW_APPROVED | Founder 自己裁决 | 决定是否合并；Reviewer 不自动合并 |
| 已 MERGED，需要部署或真实环境验证 | Release / QA | 部署、冒烟、日志和回滚验证 |
| 部署已 VERIFIED 或需要规划下一任务 | Chief | 汇总状态、更新路线和提出下一决策 |

Reviewer 不检查尚未交给它的实时过程。它在被唤醒后，根据 Git 历史、任务文件、交接记录和测试证据做追溯审计。

## 6. 没有常驻监督时的保障方式

| 风险 | 可行保障 | 不能保证的部分 |
|---|---|---|
| Agent 忘读上下文 | 唤醒提示词明确列必读文件；启动回执 | 无法靠静态文件主动唤醒 Agent |
| Builder 中途越界 | 分支、diff、测试与交接落盘；Reviewer 事后审计 | Reviewer 未被唤醒前不会实时阻止 |
| 状态过期 | 每次休眠前更新 current-state；下一窗口重新核对 | 没有活跃 Agent 时文件不会自己更新 |
| 决策遗漏 | decision-register + Founder 决策卡 | Agent 若未落盘，仍需在下次启动时补录 |
| 重复进程通知 | 活跃 Agent 按事件 ID 去重，不重复转述 | Hermes/系统层自动通知仍可能出现，仓库规则无法拦截 |
| 规则版本过期 | 新 Hermes 编码会话通常会在启动时注入根目录 `AGENTS.md`；唤醒消息仍要求核对版本并读取 manifest | 已存在会话可能继续使用启动时缓存的旧版 AGENTS；其引用的 project-context 文件不会自动全部展开 |

## 7. 自动化的准确边界

可以逐步自动化的内容：

- GitHub PR 上的测试、Lint、类型检查和构建；
- 文件是否存在、任务元数据和 `required_reading` 格式；
- 分支保护、禁止直接推送主线；
- 重复事件 ID 的通知去重（需要 Hermes/编排层支持）。

不能仅靠 Markdown 文件自动化的内容：

- 主动唤醒一个休眠角色；
- 判断产品方向和范围取舍；
- 保证模型真实阅读并理解全部文件；
- 持续观察 Builder 的每一步；
- 在没有用户授权时自动合并或部署。

任何回复不得把“写入规则文件”表述为“系统已经自动执行这些规则”。

## 8. Hermes 当前加载边界

本机 Hermes 的普通编码会话在 `coding_context:auto` 生效且未使用 `--ignore-rules` 时，会在**会话启动时**把仓库根目录 `AGENTS.md` 注入 system prompt。需要注意：

- 这是启动时快照，不代表每次回复重新读取；
- 会话运行期间修改 `AGENTS.md`，旧会话可能继续使用缓存版本；
- `AGENTS.md` 引用的 `project-context/*.md` 不会因此自动全部加载；
- batch/数据生成或显式跳过 context files 的模式可能不加载；
- 上下文压缩通常保留 system prompt，因此能保留启动时的 AGENTS，但也可能保留已经过期的版本。

所以：新会话仍必须输出启动回执；旧会话收到重大规则更新后，Founder 应明确要求它重新读取规则，必要时新开同角色窗口。
