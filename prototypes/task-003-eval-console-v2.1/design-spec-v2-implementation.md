# AI Memory Evaluation Console

## Design Spec V2 · Implementation Baseline

> 状态：已定稿  
> 适用范围：总览页、Bad Case 管理页、Case 详情页  
> 对齐实现：`index.html`  
> 最后更新：2026-07-27

---

## 1. 文档定位

本文件是 AI Memory 评测控制台的实施级设计规范。

它在原 `design-spec-for-image2.md` 的产品结构基础上，吸收了：

- Humanized Data Atelier 风格地图；
- Web 大屏与移动端适配要求；
- 动效、交互和可访问性要求；
- 混合审查报告中的 A 类设计规范；
- 当前 `index.html` 已落地并通过检查的视觉 Token。

原 Spec 继续作为产品结构与历史依据；从本文件生效后，新增页面和视觉修改均以本文件为准。

### 决策优先级

出现规则冲突时，按以下顺序处理：

1. 本实施级 Design Spec V2
2. 当前页面的明确产品需求
3. 原 `design-spec-for-image2.md`
4. 风格地图和视觉参考图
5. 临时生成提示词

不得根据单张参考图引入与本规范冲突的新颜色、字号、圆角或状态类型。

---

## 2. 产品定位

### Human-friendly AI Evaluation Console

面向产品经理、算法工程师和评审人员的 AI Memory 评测控制台。

视觉关键词：

- 清晰
- 专业
- 克制
- 人本
- 可信赖
- 信息高效
- 适合长期使用

产品应该像一份可操作的研究评测报告，而不是蓝紫发光的 AI 概念 Demo，也不是缺乏层级的传统后台模板。

### 设计原则

1. 结论优先于图表。
2. 多维证据优先于单一总分。
3. 状态颜色只表达语义，不承担装饰。
4. 通过字号、留白和对齐建立层级，不依赖大量阴影。
5. 缺失数据必须明确标记，不生成虚假的可观测链路。
6. 产品、工程和评审人员应能在 30 秒内理解页面核心结论。

---

## 3. 三层信息架构

信息架构沿用原 Spec，不在本次视觉规范中修改。

### 第一层：评测总览

回答：

- 当前版本整体表现如何？
- 最大问题在哪里？
- 与上一版本相比是否进步？
- 哪类 Case 最值得优先处理？

内容顺序：

1. 核心结论
2. 优先处理项
3. GSB 统计
4. 强约束指标
5. 分档维度
6. Before/After Case 列表

### 第二层：Bad Case 管理

完成：

- 筛选 Bad Case
- 查看严重程度与问题类型
- 标注和跟踪修复状态
- 查看根因、修复方向和回归验证

### 第三层：Case 详情

查看：

- 对话上下文
- Memory 候选列表
- 召回分数
- 排序变化
- 最终生成结果
- Memory 写入
- 错误发生节点

以下三项在 V2 未提供数据时必须显示“待 V2 Trace 增强”：

- Gate 命中
- 被过滤的 Memory
- 实际 Prompt 注入

---

## 4. 最终色板

全产品最多使用以下 15 个 Hex 值。禁止在页面组件中临时增加相近颜色。

| Token | Hex | 用途 |
|---|---:|---|
| Background | `#F6F7F9` | 页面背景、次级表面 |
| Surface | `#FFFFFF` | 卡片、输入框、表格主体 |
| Text Primary | `#1C1D21` | 标题、正文、深色导航 |
| Text Secondary | `#70747D` | 白色表面上的说明文字 |
| Text Accessible Muted | `#5F625C` | 时间、辅助信息、浅背景文字 |
| Border | `#E2E4EA` | 所有边框、分割线、轨道 |
| Primary | `#6E5BAA` | 主按钮、Hero、激活状态、主要图表系列 |
| Success | `#2F9364` | 通过、改善、Good |
| Success Soft | `#E6F4EC` | Success 浅背景 |
| Warning | `#BE8128` | 风险、部分通过、待确认 |
| Warning Soft | `#FFF3D8` | Warning 浅背景 |
| Error | `#C94E49` | FAIL、错误、Bad Case |
| Error Soft | `#FCE9E7` | Error 浅背景 |
| Neutral | `#7D817A` | Same、未复测、中性数据 |
| Neutral Soft | `#EFEFEB` | Neutral 浅背景 |

### 主色规则

低饱和蓝紫 `#6E5BAA` 是唯一品牌主色，用于：

- 主 CTA
- 当前导航项
- Hero 核心视觉
- Focus Ring
- 主要图表系列
- 非语义性的选中状态

主色面积应保持克制，不超过页面可视面积的约 10%。

### 珊瑚红规则

`#C94E49` 只允许表示：

- FAIL
- Bad
- 数据退步
- 严重风险
- 输入错误
- 错误节点

禁止用于：

- 主按钮
- Hero
- 普通 Hover
- 品牌标识
- 无错误语义的差异高亮

### 文字对比度

- 正文默认使用 `#1C1D21`。
- `#70747D` 优先用于白色表面。
- 在 `#F6F7F9` 等浅灰背景上，辅助文字优先使用 `#5F625C`。
- 禁止恢复使用 `#8A8E86` 等低对比度灰色。
- 白色文字只能放在对比度合格的深色或主色表面上，不放在珊瑚红浅色背景上。

---

## 5. 状态语义

全产品只允许四类状态：

| 状态 | 颜色 | 示例 |
|---|---|---|
| Success | 绿色 | PASS、Good、已修复、改善 |
| Error | 珊瑚红 | FAIL、Bad、致命、下降 |
| Warning | 琥珀色 | PARTIAL、待确认、风险 |
| Neutral | 灰色 | Same、未复测、暂无数据 |

禁止新增：

- Review 紫色状态
- Info 蓝色状态
- 每个问题类型一种颜色
- 同一状态同时使用高饱和文字、图标、背景和边框

状态标签使用浅背景与深色文字；必要时可增加 6px 状态点。

---

## 6. 字体与字号

### 字体组合

界面字体：

```css
font-family:
  "Inter",
  "PingFang SC",
  "HarmonyOS Sans SC",
  "Microsoft YaHei",
  sans-serif;
```

数据字体：

```css
font-family:
  "IBM Plex Mono",
  "JetBrains Mono",
  "SFMono-Regular",
  "Consolas",
  monospace;
```

以下内容使用等宽数字字体：

- 分数
- 百分比
- Case ID
- Memory ID
- 延迟
- 时间戳
- 模型和 Prompt 版本

必须开启等宽数字特性：

```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1, "zero" 1;
```

### 六档字号

全产品只使用以下字号：

| Token | 字号 | 用途 |
|---|---:|---|
| Display | 48px | 核心指标、关键变化数字 |
| H1 | 24px | 页面标题、主要章节标题 |
| H2 / H3 | 16px | 卡片标题、模块标题 |
| Body | 14px | 正文、表格主要内容 |
| Caption | 12px | 标签、时间、辅助说明 |
| Micro | 10px | 极少量元信息、英文 Eyebrow |

禁止新增 11、13、15、17、18、20、30、32、38、58、76px 等中间档位。

字重最多使用：

- 400：正文
- 500：数据和表格重点字段
- 600：标题和标签

---

## 7. 圆角系统

全产品只使用两档组件圆角：

| Token | 圆角 | 用途 |
|---|---:|---|
| Card Radius | 12px | 应用容器、卡片、面板、弹层 |
| Control Radius | 8px | 按钮、输入框、Tab、状态标签、内部小块 |

禁止使用：

- 14px、18px、24px、28px 等额外档位
- 999px 胶囊形组件
- 同一区域出现三种以上圆角

状态点和纯装饰性圆点可以使用圆形，但不计入组件圆角体系。

---

## 8. 间距与布局

采用 8pt 间距系统：

```text
4px   微调
8px   图标与文字、紧凑控件
12px  紧凑内部间距
16px  标准组件间距
24px  卡片内边距
32px  模块内部区分
40px  主要区块间距
48px  大章节间距
64px  页面级留白
```

### 桌面端

- 页面内容最大宽度：1600px
- 页面外围留白：16–32px
- 内容区使用 12 列网格
- 指标卡桌面端可多列排列
- 表格和 Case 列表优先使用完整内容宽度

### 移动端

- 900px 以下隐藏桌面侧栏
- 卡片、指标和 Before/After 对比改为单列
- 顶部导航允许横向滚动
- 表格行保留 Case ID、标题和展开操作，次级列可隐藏

---

## 9. 表面与材质

### 允许

- `#F6F7F9` 页面画布
- 白色哑光卡片
- 1px 浅灰边框
- 极轻的中性环境阴影
- 页面外围不超过 4% 透明度的颗粒纹理
- 吸顶导航使用背景模糊
- Hero 使用同一主色范围内的轻微明度变化

### 禁止

- 大面积蓝紫渐变
- 多色渐变
- 霓虹描边
- 发光线条
- 彩色弥散 Hover 光晕
- 每张卡片都使用明显阴影
- 内容卡片大面积玻璃拟态
- 机器人、大脑发光、电路板等 AI 套路装饰

### Hover 反馈

卡片 Hover 使用：

```css
transform: translateY(-4px);
border-color: rgba(110, 91, 170, 0.48);
box-shadow: 0 10px 24px rgba(28, 29, 33, 0.09);
```

Hover 阴影必须以卡片自身为中心，不使用绝对定位的彩色伪元素制造弥散光，以免出现位置偏移。

---

## 10. 组件规范

### 主按钮

- 高度：44px
- 圆角：8px
- 背景：Primary
- 文字：白色
- Hover：保持同色系，略微加深或增加中性阴影
- Active：缩放至约 97%
- Focus：主色 Focus Ring

### 次按钮

- 高度：44px
- 圆角：8px
- 白色或浅灰背景
- 1px Border
- 不使用错误色或成功色装饰

### 输入框

- 高度：44px
- 圆角：8px
- 默认边框：Border
- Focus：Primary 边框与低透明度 Focus Ring
- Error：Error 边框、错误文字和 `aria-describedby`

### Tab

- 最小高度：44px
- 圆角：8px
- 当前项：深色或 Primary 实色背景
- 非当前项：透明或浅灰背景
- 必须包含 `role="tab"`、`aria-selected` 和 `aria-controls`
- 使用 Roving Tabindex
- 支持：
  - Left / Up：上一项
  - Right / Down：下一项
  - Home：第一项
  - End：最后一项

### 状态标签

- 高度：至少 24px
- 圆角：8px
- 字号：12px
- 只使用四种语义状态
- 不使用胶囊形

### 数据卡片

- 圆角：12px
- 内边距：20–24px
- 默认只使用边框
- 核心数字使用等宽字体
- 卡片标题保持 16px
- 不允许一张卡片内部出现超过三种字号

### Case 列表

- 行高：至少 64px
- 使用分割线，不使用斑马纹
- Hover：浅灰背景
- 展开/选中：Primary 左侧 3px 指示条
- 展开区域使用 Before/After 双栏；移动端转单栏
- 差异高亮使用 Primary Soft，不使用 Error Soft，除非内容确实是错误

---

## 11. 动效规范

### 滚动入场

- 使用 `IntersectionObserver`
- 动效：淡入 + 上浮
- 位移：约 20–24px
- 时长：600–800ms
- 缓动：`cubic-bezier(.16, 1, .3, 1)`
- 元素按信息层级延迟出现

### 微交互

- 卡片 Hover：上浮 4px
- 按钮 Active：轻微缩放
- 主按钮可使用一次性点击波纹
- Case 展开使用网格高度过渡，不读取和反复写入元素高度

### 视差

- 只允许首屏核心视觉使用轻微视差
- 最大偏移约 7px
- 使用 `requestAnimationFrame`
- 只修改 `transform`
- 不在滚动事件中反复触发布局计算

### 减少动态效果

必须支持：

```css
@media (prefers-reduced-motion: reduce)
```

该模式下：

- 关闭视差
- 取消平滑滚动
- 跳过骨架屏等待
- 将动画时长压缩到接近 0

---

## 12. 无障碍基线

所有页面必须满足：

- 普通文字对比度不低于 4.5:1
- 大字号文字对比度不低于 3:1
- 所有点击和触摸目标不小于 44×44px
- 键盘用户可以访问全部筛选、按钮和展开项
- Focus 状态必须清晰可见
- 不只依赖颜色传达 Good、Same、Bad
- 表单错误使用文字说明，并通过 ARIA 与输入框关联
- 展开按钮维护 `aria-expanded`
- 弹层支持 Escape 关闭并恢复焦点
- 页面语言设置为 `zh-CN`

---

## 13. 数据真实性

评测页面只显示已有数据。

### 已有

- 用户输入
- AI 回复
- Memory 召回列表
- 召回分数
- Memory 写入
- 对话上下文
- 延迟
- Prompt 版本

### 缺失

- Gate 命中
- 被过滤的 Memory
- 实际 Prompt 注入

缺失维度统一使用 Neutral 或 Warning 样式，并显示：

> 待 V2 Trace 增强

不得使用模拟数据填充缺失链路。

---

## 14. 页面验收清单

每个新增页面在交付前检查：

### 视觉

- [ ] Hex 值总数不超过 15
- [ ] 只使用 6 档字号
- [ ] 组件圆角只有 8px 和 12px
- [ ] 珊瑚红只表示错误
- [ ] 状态类型只有四种
- [ ] 没有彩色 Hover 光晕

### 交互

- [ ] 所有按钮具备 Hover、Active、Focus
- [ ] 触摸目标不小于 44px
- [ ] Tab 支持方向键、Home、End
- [ ] Case 展开状态具备 `aria-expanded`
- [ ] 搜索和筛选存在空状态反馈
- [ ] 支持减少动态效果

### 内容

- [ ] 首屏能回答本页面的核心问题
- [ ] 数字使用等宽字体
- [ ] 差异高亮不滥用错误色
- [ ] 缺失 Trace 数据明确标注
- [ ] 不改变三层信息架构

---

## 15. 实施约定

后续页面应优先复用当前 `index.html` 中的：

- CSS Variables
- 状态标签
- 按钮
- 输入框
- Tab
- 卡片 Hover
- Focus Ring
- Intersection Observer
- Ripple
- Roving Tabindex
- Reduced Motion

新增视觉变量前必须先确认现有 Token 无法表达该语义。不得为单个页面创建独立色板、圆角体系或字号阶梯。

