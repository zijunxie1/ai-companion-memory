# 角色交接卡模板（role-handoff-template）

> 用途：所有角色（Chief / Builder / Reviewer / Release）交接时直接复制本模板填写。
> 字段权威来源：`project-context/role-wakeup-and-handoff.md` §3.1（交接卡结构十七项）；本模板是填写用空白卡片，不重复定义规则。
> 渲染要求：发送给下一角色时，交接卡必须在聊天中显示为**一个完整、可直接复制的代码框**（`` ```text `` 开头 / `` ``` `` 结尾）。

```text
# 交接卡

## 1. 目标角色
（谁接手：执行 Chief / Builder / Reviewer / Release / QA / Founder）

## 2. 项目位置
（P1 项目 → 当前阶段 → 当前任务 → 当前角色位置）

## 3. 本次唯一目标
（一句话：这次接手只完成什么）

## 4. 为什么做
（产品/治理原因：不做的后果）

## 5. 当前事实
（已核验的 Git 事实、任务状态、基线；只写已发生事实）

## 6. 已完成和未完成
（逐项列出：已完成 / 未完成）

## 7. 已批准决策
（决策 ID 与结论，引用 decision-register.md）

## 8. 决策理由
（为什么这样决策）

## 9. 已否决方案
（否决过的方案，避免重新提出）

## 10. required_reading
- AGENTS.md
- project-context/context-manifest.md
- project-context/current-state.md
- <当前任务文件>
- <相关契约 / Review / 实现报告>

## 11. 允许执行
（本窗口/本轮可以做什么）

## 12. 禁止执行
（红线：不提交/不推送/不合并/不越权/不超范围等）

## 13. 具体步骤
1. ...
2. ...

## 14. 验收标准
（对照任务验收，可逐项打勾）

## 15. 停止条件
（满足任一 → 停止并上报 / 提交 Change Request）

## 16. 完成后必须返回的材料
（实现报告 / diff / 验证结果 / 下一张交接卡）

## 17. 下一张交接卡要求
（完成后交谁：Reviewer / Founder 合并裁决等；结论必须落盘）
```
