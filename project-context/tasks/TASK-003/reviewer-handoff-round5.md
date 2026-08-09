# TASK-003｜Reviewer 第五轮最小修复交接包

> 结论：`CHANGES_REQUESTED`（仅剩移动端触摸区域）
>
> 复审对象：`feature/task-003-eval-run-slice` @ `0bd0ed9`
>
> 原执行模式：`persistent_session`。必须返回原长期 Builder Session `20260809_074526_e4cf10`。
>
> 本轮不允许再修改 Eval 后端、数据库迁移、Case 规则或历史 Run。

## 1. 已通过项目

以下项目已由独立 Reviewer 复核通过，不要重复修改：

- `npm test`：19/19 通过。
- `npx tsc --noEmit`：0 error。
- `npm run lint`：0 error。
- Browser 控制台：0 error / 0 warning。
- 375×812 三页真实 viewport：侧栏隐藏，main 宽 369px，页面级无横向滚动。
- `/eval/cases` 表格只在容器内部横向滚动，不撑破页面。
- Run #12 E006：重新写入“分手”时诚实显示 FAIL。
- Run #14 E006：recall=0、reply 无泄露、writes=0 时 PASS。
- E006 三项规则 `deletion_no_recall / deletion_no_reply_leak / deletion_no_rewrite` 逻辑与测试通过。
- E007 仍为 `skipped_crisis`，共享危机规则模块已生效。

因此数据与规则部分可以视为 Review 通过。本轮**不需要再跑两轮真实 Run**。

## 2. 唯一阻断项：44px 触摸区域仍未完成

Builder 新增了：

```css
.eval-touch {
  min-height: 2.75rem;
}
```

但 `eval-touch` 没有在任何 TSX 组件中使用。真实 375px 量化结果如下。

### 2.1 页面常驻交互

| 页面 | 可见交互数 | 小于 44px | 典型失败 |
|---|---:|---:|---|
| `/eval` | 7 | 4 | 评测运行 106×36、证据链 98×16、Run 链接约 25×39 |
| `/eval/cases` | 5 | 2 | 分类 select 89×31、新增 Case 163×28 |
| `/eval/runs/[id]` | 12 | 9 | 返回总览 72×20、8 个人工覆盖入口约 140×16 |

### 2.2 人工覆盖展开态

| 控件 | 实测尺寸 |
|---|---:|
| 强约束覆盖 select | 181×31 |
| 覆盖理由 input | 304×29 |
| 确认覆盖 | 72×28 |
| 取消 | 48×28 |

### 2.3 新增 Case 表单

| 控件 | 实测尺寸 |
|---|---:|
| 手动新增 Tab | 72×28 |
| Trace 转 Case Tab | 153×28 |
| 关闭按钮 | 11×20 |
| 普通 input | 296×33 |
| select | 296×31 |
| 底部取消/创建 | 48×28 / 85×28 |

Textarea 高度超过 44px，本身通过；其余主要表单控件未通过。

## 3. 推荐的一次性修法

不要逐个遗漏地只给当前截图里的按钮加 class。建议在 Eval 根节点增加稳定作用域，例如：

```tsx
<div className="eval-shell ...">
```

然后在 `eval.css` 中统一约束：

```css
.eval-shell a,
.eval-shell button,
.eval-shell select,
.eval-shell input:not([type="hidden"]) {
  min-height: 2.75rem;
}

.eval-shell a,
.eval-shell button {
  min-width: 2.75rem;
}
```

注意：

1. 不能只提高外层行高而保留实际可点击元素 16px；量化的是交互元素自身 `getBoundingClientRect()`。
2. 图标关闭按钮必须通过 padding 或显式 `min-width/min-height` 达到 44×44。
3. Run 表格中的文本链接应改为 `inline-flex items-center`，让 `min-height` 生效。
4. 人工覆盖的文字按钮同样改为 `inline-flex items-center`。
5. 若全局规则影响桌面密度，可限定在 `@media (max-width: 767px)`；但 375px 下必须全部通过。
6. 输入框原有 focus ring 不得因尺寸修复被移除。

也可以逐组件使用统一 `.eval-touch`，但必须覆盖常驻页、人工覆盖展开态和新增 Case 表单三种状态。

## 4. 本轮验证要求

修复后只需要：

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] 复用单一 3000 服务，不触发新的 Eval Run
- [ ] 真实设置 375×812，复测三页页面级无横向滚动
- [ ] 打开人工覆盖，所有可见 button/select/input 均 ≥44×44
- [ ] 打开新增 Case 表单，所有可见 button/select/input 均 ≥44×44
- [ ] 键盘 Tab 可达，焦点环仍清晰
- [ ] 控制台 0 error / 0 warning

量化脚本必须检查元素自身尺寸：

```js
[...document.querySelectorAll(
  'a,button,input,select,textarea,[role="button"]'
)]
  .filter(isVisible)
  .map(el => el.getBoundingClientRect())
  .filter(rect => rect.width < 44 || rect.height < 44)
```

最终期望：三个页面常驻态、人工覆盖展开态、新增 Case 表单展开态均为 `sub44Count = 0`。

## 5. 结束条件

这是一次纯 UI/accessibility 小修：

- 不需要新 CR；
- 不需要新迁移；
- 不需要新 Run；
- 不得重启或清理评测数据；
- 完成一个小 commit 后即可再次提交独立终审。

达到 `sub44Count=0` 且静态检查、build、键盘焦点和控制台通过后，可给出 `REVIEW_APPROVED`。
