# GOV-COMM-004｜独立 Reviewer 交接

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/agent-response-protocol.md
  - project-context/role-wakeup-and-handoff.md
  - project-context/handoff-and-task-state-machine.md
  - project-context/decision-register.md
  - project-context/tasks/GOV-COMM-004/root-cause-report.md
  - project-context/tasks/GOV-COMM-004/validation-scenarios.md
  - project-context/tasks/GOV-COMM-004/implementation-report.md
  - project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/__init__.py
  - project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/test_founder_scope_guard.py
task_id: GOV-COMM-004
status: IMPLEMENTED
next_gate: IN_REVIEW
assigned_role: Independent Reviewer
branch: codex/gov-comm-004-root-fix
base: origin/main@7ef1023
product_scope: none
```

## 1. 唯一目标

独立审查 GOV-COMM-004 是否真正从根因上解决 Hermes 回复漂移与动作越权，而不是只增加另一层提示词。审查同时覆盖正式治理 diff、本机 Hermes 全局规则、插件机械拦截、真实会话证据和范围保护。

## 2. 审查对象

- 分支：`codex/gov-comm-004-root-fix`；基线：`origin/main @ 7ef1023`；
- 当前实现尚未推送、未建 PR、未合并；Reviewer 应以本 worktree 实际 diff 为准，不把任务报告自述当证据；
- 全局运行态：`C:/Users/admin/AppData/Local/hermes/SOUL.md`、`memories/MEMORY.md`、`memories/USER.md`、`config.yaml`、`plugins/founder-scope-guard/`；
- 备份：`C:/Users/admin/AppData/Local/hermes/state-snapshots/20260816-gov-comm-004/`。

## 3. 必须独立复核

1. 原失败会话 `20260815_114833_6cc864` 是否确为无压缩、无 Skill，且在明确禁止写入/提交后因内容批准而越权；
2. 正式规则是否只剩一个 Founder 呈现协议，旧固定“执行模式判断/状态报告/HANDOFF REQUIRED”主体是否清零；
3. 内容批准、动作权限和治理落盘权限是否真正独立，APPROVED 是否不再自动授予写入；
4. `founder-scope-guard` 是否只认 Founder 原始消息，Agent/工具输出不能创造权限；压缩摘要不能冒充授权；跨进程持久状态仅保存禁止类别；
5. 工具分类是否既能拦受禁的写入/Git/PR/合并/委派/holdout，又不误拦只读 Git 查询；
6. 真实回归会话 `20260816_083234_b6baac`、`20260816_083939_cb6d26`、`20260816_084118_9d1b90`、`20260816_084152_38d138` 的输入、API 注入、工具调用、子会话和最终回复是否支持报告结论；
7. Hermes 默认模型是否仍为 `deepseek-v4-pro`，配置差异是否只新增启用权限锁；保留 Skill、Session Review、产品、R4、评测和 holdout 是否均未变化；
8. 执行验证脚本和插件 11 个测试，检查 `git diff --check` 与完整 diff。

## 4. 允许与禁止

允许：只读 Git/文件/会话数据库/配置核验；运行不修改业务状态的治理检查和插件测试；输出审查结论。

禁止：修改任何分支或全局 Hermes 文件；提交、推送、建 PR、合并；启动 R4、实验或读取 holdout；唤醒其他角色。

## 5. 验收与停止条件

结论必须给出 `REVIEW_APPROVED` 或 `CHANGES_REQUESTED`，并按 BLOCKER / MAJOR / MINOR / NOTE 分级。发现下列任一项立即停止并打回：权限锁可被“批准方案/选择执行模式”清除；插件只靠内存、恢复后失效；普通 Agent/工具文本能改变权限；默认模型或产品/R4/holdout 被改；规则仍有两套互斥输出；证据与实际会话不一致。

完整 Review 报告写入 Reviewer 自己的审查交付位置；给 Founder 的聊天只先说能不能继续、真正风险和建议，不倾倒技术矩阵。
