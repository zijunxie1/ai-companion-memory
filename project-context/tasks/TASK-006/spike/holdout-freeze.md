# TASK-006 Spike — Holdout 数据冻结记录（步骤①）

```yaml
freeze_type: holdout
freeze_timestamp: 2026-08-12T09:18:38+08:00（UTC 2026-08-12T01:18:38Z）
git_commit: 9459a70（S1 冻结提交；本文件与 holdout-definition.json 同提交入库）
content_hash: sha256=307d266374f850e3abc282182e15b9f7c398f5417de4bd7326896cbea1ab0336
frozen_object: holdout-definition.json（本目录，唯一事实；冻结后不得修改）
scenario_count: 4
scenarios:
  - H1: 多义词（苹果：水果 vs 公司）— query+2 种子；相关 1 / 无关 1
  - H2: 他人属性（朋友分手）— query+2 种子；相关 1 / 无关 1
  - H3: 语义隐式关联（失眠与猫半夜跑酷）— query+2 种子；相关 1 / 无关 1
  - H4: 天气变体泛化（下雨）— query+3 种子；相关 1 / 无关 2
freeze_discipline:
  - holdout 内容不得用于设计/调整任何候选机制（含候选 2 主题体系、关键词、相容矩阵与权重）
  - 冻结时间戳、提交号与内容哈希供独立 Reviewer 核对（DRAFT v1.2 §5.3.7）
  - 每场景使用全新评测专用 user（eval-spike-<Hn>-<rand>）；种子经 mem0.add 写入，一次性运行后清理
note: 本冻结发生在任何校准调参与机制设计之前（实施计划 S0 预装检查通过后、S2 校准采集前）
```

## 冻结事实核对（Builder 提供，供 Reviewer 核验）

- 冻结时间：2026-08-12T09:18:38+08:00；
- 冻结对象：`holdout-definition.json`（本提交内），sha256 = `307d2663...1ab0336`；
- 本记录与冻结对象在同一 Git 提交内入库（提交号见上方 YAML），提交历史可核验冻结先于校准调参提交；
- holdout 场景类型与骨架已在获批实施计划 §8.2 预声明（Founder Review 2 批准），本文件为最终冻结版本。
