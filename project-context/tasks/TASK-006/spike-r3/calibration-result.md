# TASK-006 第三轮 Spike — S2/S3 校准结果（方案 A/B）

```yaml
doc_type: S2/S3 校准结果记录（DRAFT v1.1 §3/§4 / 实施计划 v1.1 §7 S2-S3 产物）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
calibration_date: 2026-08-14（Asia/Shanghai）
checker: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
calibration_scope: 仅校准部分 22 对（split=calibration）；holdout 10 对全程未读取
parent_hash: sha256=70994185911dee85aa16bb1d6707be0385cb769e64e7d2cb7fce6ec318a3bff4
derived_file: calibration-only-definition.json（父哈希可追溯）
```

---

## 1. 一句话结论

**方案 A（mem0 阈值基线）与方案 B（cross-encoder 重排）在校准集上的分离边际均为负值（A=-0.2323，B=-0.3794），双双触发候选级停止判据（分离边际 ≤ 0.1）。** 这验证了第一轮 R1/R3 根因：单一分数 + 单一阈值无法可靠分离相关/无关候选；cross-encoder 也未能独立解决本项目的"失眠↔橘猫"隐式关联判别。

---

## 2. S2 采集完成情况

| 项 | 结果 |
|---|---|
| 校准候选对 | 22 对（从 `candidate-pool-definition.json` 派生，父哈希核验通过） |
| 方案 A 检索 | 3 轮 mem0 REST search（loopback 8100，产品同路径），**三轮分数完全一致（波动=0）** |
| 方案 B 推理 | cross-encoder `bge-reranker-base`（容器内 fastembed ONNX 本地推理） |
| 种子写入 | 22 条候选 memory 经容器内 `add(infer=False)` 零外发写入（4 个评测专用 user） |
| 种子清理 | 22/22 DELETE 成功，核验剩余 0（`cleanup-result.json`） |
| 网络边界 | 全程仅 loopback + 容器内本地推理，**外部请求数 = 0** |
| holdout | 10 对全程未读取、未 seed、未统计 |

---

## 3. 方案 A 校准结果（mem0 score + 阈值）

| 指标 | 值 | 判据 | 判定 |
|---|---|---|---|
| 分离边际 | **-0.2323**（最低正例 0.3347 − 最高负例 0.5670） | > 0.1 | ❌ 不通过 |
| 波动（三轮 max） | **0.0000** | ≤ 0.1 | ✅ 通过 |
| 最优阈值（网格） | 0.32 | — | F1=0.7097（P=0.55, R=1.0） |
| 现状阈值 0.35 | — | — | F1 更差（漏掉最低正例 0.3347） |

**关键观察**：方案 A 的最优 F1=0.71 是"阈值选在重叠区、R=1.0 靠全保留"的假象（R3 根因复现）——正例分数区间 [0.335, 0.762] 与负例区间 [0.265, 0.567] 高度重叠，物理上无法用一个阈值分离。

## 4. 方案 B 校准结果（cross-encoder logit → sigmoid + 阈值）

| 指标 | 值 | 判据 | 判定 |
|---|---|---|---|
| 分离边际 | **-0.3794**（最低正例 0.0000 − 最高负例 0.3795） | > 0.1 | ❌ 不通过 |
| 最优阈值（网格） | 0.02 | — | F1=0.7000（P=0.7778, R=0.6364） |
| 非冗余诊断 ρ | 待 S4 补充（本轮 S3 只定阈值与停止判据） | ρ<0.9 | 待测 |

**关键观察**：cross-encoder 对"失眠↔养猫/猫跳床"这类隐式情感关联判别失败——S1-03（猫半夜跳床，label=relevant）sigmoid=0.0098、S1-04（养猫，relevant）sigmoid=0.0000、S5-05（养猫，relevant）sigmoid=0.0000，全部被压到接近 0。cross-encoder 的联合编码对"字面无关、语义隐式相关"的配对不敏感，恰好卡在 R1 的失败类型上。

## 5. 关键记忆独立门（7 个正向关键候选对）

| 方案 | 通过 | 失败 |
|---|---|---|
| A | S1-01/S1-03/S1-04/S3-01/S3-02/S5-05（6/6） | 无 |
| B | S1-01/S3-01/S3-02（3/6） | **S1-03、S1-04、S5-05**（失眠↔养猫隐式关联类） |

> 方案 B 即使 F1 看似接近 A，但漏掉 3 条关键记忆（独立门 FAIL），证明"F1 高 ≠ 可靠"——正是 DRAFT §6.4 独立门要防的"多删拿高分"。

## 6. 停止判据判定（DRAFT §9.1）

| 方案 | 分离边际 | 判定 |
|---|---|---|
| A | -0.2323 ≤ 0.1 | **候选级停止**（分离判据失效） |
| B | -0.3794 ≤ 0.1 | **候选级停止**（分离判据失效） |

> 按 DRAFT §9.1 候选级停止第 1 条：分离边际 ≤ 0.1 → 只停止对应方案。**方案 A/B 均触发候选级停止**。方案 C 未进入校准（deepseek-v4-flash 待正式主线决策登记同步）。

## 7. 结论与后续

1. **方案 A/B 校准集分离边际均 ≤ 0.1，触发候选级停止**（DRAFT §9.1-1），如实记录为失败/不达标，不宣称通过；
2. **方案 C 未执行**（模型名 deepseek-v4-flash 尚待同步进正式主线决策登记）；
3. **holdout 10 对零运行记录**（未 seed、未读取、未统计）；
4. **下一动作**：返回 Founder——方案 A/B 均不达标，方案 C 需先同步正式决策登记后才可校准；是否继续/缩范围/停止由 Founder 裁决（DRAFT §8.0 完成度分档 + §9.2）。

## 8. 证据文件清单

| 文件 | 内容 |
|---|---|
| `data/calibration/scheme-a-rounds.json` | 方案 A 三轮 mem0 检索原始 score |
| `data/calibration/scheme-b-scores.json` | 方案 B cross-encoder logit |
| `data/calibration/seeds.json` | seed 记录（user_id + memory id） |
| `data/calibration/cleanup-result.json` | 清理核验（22/22 删除，剩余 0） |
| `data/calibration/calibration-result.json` | 校准汇总（分离边际/阈值/F1/独立门） |
| `data/audit/network-s2-*.log` | 访问审计（外部请求 0） |
| `scripts/collect-s2.mjs` / `calibrate-s3.mjs` / `cleanup-calibration.mjs` / `config.mjs` | 采集/校准/清理脚本 |
