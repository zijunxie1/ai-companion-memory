# TASK-006 Spike — 机制冻结记录（步骤③）

```yaml
freeze_type: mechanism
candidate: candidate-2（本地主题类别 Gate）
version: v1.0
freeze_timestamp: 2026-08-12T09:27:57+08:00（UTC 2026-08-12T01:27:57Z）
git_commit: <S6 提交号（写入后回填）>
score_function_hash: sha256=bd4cc70c84dca5a578f25aef6460d213a6b8fe9e4c3d414fab7780169b960a7b（theme-system.json）
score_function: score = w1·comp + w2·lex（theme-engine.mjs themeScore；lex = features.mjs f1—f5 均值）
parameters:
  w1: 0.8
  w2: 0.2
  decision_threshold: 0.05
  comp_取值: {0, 0.5, 1}
  lex_取值: [0, 1]
calibration_summary:
  rounds: 3（run 31/30/29，校准集 E001-E005，29 样本：20 正 / 9 负）
  f1: 1.0000
  margin: 0.3971（最低正例分 − 最高无关分）
  per_round_f1: [1.0000, 1.0000, 1.0000]
  per_round_margin: [0.4093, 0.3971, 0.4025]
  volatility: 0（三轮 F1 全 1.0000）
  calibration_grid: w1/w2 ∈ {0.5/0.5, 0.6/0.4, 0.7/0.3, 0.8/0.2}；阈值网格 0.05—0.95 步长 0.05
  best_by: F1≥0.9 且分离边际最大
freeze_discipline:
  - 冻结后不得再修改机制、矩阵与权重（DRAFT v1.2 §5.3 步骤③）
  - holdout 一次性运行（步骤④）只运行一次；运行后禁止继续调参
  - 本记录的时间戳、提交号与哈希供独立 Reviewer 核对（§5.3.7）
  - 候选 1 未进入冻结：校准集分离边际全为负（-0.005~-0.145），已按 DRAFT 语义记录失败（data/scores/candidate1.json）
note: 候选 1 失败不影响本冻结；按 DRAFT「至少一个候选通过即可」语义，候选 2 进入 holdout 一次性运行
```

## 冻结事实核对（Builder 提供，供 Reviewer 核验）

- 冻结时间：2026-08-12T09:27:57+08:00；
- 冻结对象：`theme-system.json`，sha256 = `bd4cc70c...960a7b`；参数 w1=0.8 / w2=0.2 / 阈值=0.05；
- 冻结顺序符合 DRAFT 四步：① holdout 数据冻结（`9459a70`，先于一切校准）→ ② 校准调参（S5，候选 2 校准集 F1=1.0、边际 0.3971）→ ③ 本机制冻结（S6）→ ④ holdout 一次性运行（S7，尚未执行）；
- 冻结记录、theme-system.json 与校准证据（`data/scores/candidate2.json`）提交历史可核验；
- 候选 2 主题体系基于校准集与通用知识（`theme-system.md` §1 来源标注），holdout 特有词已显式排除。
