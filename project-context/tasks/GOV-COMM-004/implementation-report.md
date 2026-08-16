# GOV-COMM-004｜实施报告

> 状态：IMPLEMENTED（本地治理分支与本机 Hermes 已完成；未推送、未建 PR、未合并，待独立 Review）。

## 1. 变更目标

一次性清除“同一提示词多套回复规则”和“内容批准自动扩大动作权限”这两类根因，并用静态检查与真实 Hermes 会话防止复发。

## 2. 计划修改

- `AGENTS.md`：统一版本、权限模型、移除固定 Founder 输出；
- `agent-response-protocol.md`：唯一呈现方式、内容/权限分离、执行模式自然表达；
- `handoff-and-task-state-machine.md`：APPROVED 只表示内容门；
- `role-wakeup-and-handoff.md` 与模板：记录动作权限和落盘权限；
- `context-manifest.md`：压缩恢复动作边界；
- `current-state.md` 与 `decision-register.md`：记录治理事实，不改变 TASK-006 产品状态；
- Hermes `SOUL.md`、`MEMORY.md`、`USER.md`：备份后修正全局冲突，不改模型配置；
- Hermes `founder-scope-guard`：每轮恢复 Founder 权限并在工具执行前机械拦截；
- 本任务验证脚本、插件测试和真实 Hermes 回归证据。

## 3. 当前边界

当前已授权：实施上述治理修复并验证。

当前仍禁止：产品/R4/holdout/默认模型/保留 Skill/Session Review 变更，以及推送、建 PR、合并。

## 4. 实际实现

- 正式治理规则升级为 `2026-08-16.2`，删除固定执行模式表、固定状态报告和固定 `HANDOFF REQUIRED` Founder 输出；
- APPROVED 只代表内容门，写文件、提交、推送、建 PR、合并、实验和委派分别授权；状态同步义务不能覆盖任务禁止项；
- 启动核验保持内部强制；简单/正常问题不再展示启动回执，只有异常影响判断或 Founder 主动要求时才展示最多七行的紧凑回执；
- 补齐“真正的大白话、纠偏一次一件事、复杂回复短段落与留白、克制加粗”的可验收标准；
- 决定后交接改为具体收件人提示 + 一个代码框内的完整短卡，保证 Founder 一次复制；
- 交接模板与压缩恢复同时记录内容决定、允许动作、禁止动作和落盘权限；
- 全局 SOUL/Memory/User 规则已备份后修正；默认模型仍是 `deepseek-v4-pro`，保留 Skill 与 Session Review 未改；
- 安装并启用 `founder-scope-guard`。插件只保存每个会话的禁止动作类别，不保存完整聊天；新进程恢复仍有效；压缩摘要不被当作新授权；无可信状态的旧压缩会话安全回退为只读；
- Hermes 桌面端已完成一次正常关闭与重启；新后端进程日志确认 `founder-scope-guard registered`，因此不是只有独立 CLI 测试进程生效；
- 机械分类允许 `git status`、`git diff`、`git branch --show-current` 等只读动作，拦截受禁的写入/Git 变更/PR/合并/委派/holdout/安装/外部调用。

## 5. 验证结果

- 插件自动测试：11/11 PASS；
- Hermes Plugin Doctor：manifest、import、registration PASS，注册 2 hooks；
- 桌面端重载：PASS；旧主进程正常响应关闭，新桌面/后端进程已启动，`agent.log` 记录插件重新注册；
- 治理静态检查：PASS；`git diff --check`：PASS；
- 旧版 RootFix 真实简单回复 `20260816_084118_9d1b90` 与复杂/短卡回复 `20260816_084152_38d138` 只作为根因基线；Founder 已指出其白话、密度和启动回执仍不合格，不能冒充 2026-08-16.2 的通过证据；
- 2026-08-16.2 静态场景 A—P 已落盘并通过规则扫描；真实 Codex/Hermes 呈现仍待 Founder 新会话复测；
- 真实权限持久化：`20260816_083939_cb6d26` 跨进程恢复 PASS；
- 真实只读→批准方案/模式：`20260816_083234_b6baac`，0 delegation、0 child session、0 文件变化；
- 安装前反例 `20260816_081027_7684ae` 已记录：语义规则存在但仍产生子会话，证明机械锁修复的是已复现根因；
- Hermes 配置只新增启用插件；默认模型/provider/base URL 未改变；
- 产品、数据库、评测、TASK-006 R4、holdout、保留 Skill、Session Review 均未修改。

## 6. 当前边界与下一门

实现已完成，但仍只是治理分支和本机 Hermes 事实。未授权推送、建 PR、合并；正式主线仍是 `origin/main @ 7ef1023` / 规则 `2026-08-15.4`。下一步先由 Founder 在新 Codex/Hermes 会话复测 2026-08-16.2 的简单、复杂和交接呈现；达到预期后再进入独立 Review。复测前不恢复 R4。
