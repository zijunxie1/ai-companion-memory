# TASK-006 第二轮 Spike — 候选 A 模型事实报告（model-facts.md）

```yaml
doc_type: 模型事实报告（候选 A 专属；实施计划 §7 / DRAFT §5.4 约束 3/8）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R2
status: N/A（P5-A 未通过——缓存中无 cross-encoder reranker 权重）
candidate_a_executable: 否（候选级停止 §9.1-4；候选 B 独立继续）
confirmed_by: 待 Founder/决策 Chief 确认（本报告为确认门输入）
report_date: 2026-08-12
```

---

## 0. 结论摘要

S0 预装检查 P5-A **未发现任何 cross-encoder reranker 权重**缓存于 mem0-server 容器（`/tmp/fastembed_cache/` 下仅有 `models--Qdrant--bm25` 稀疏索引与 `models--Qdrant--bge-small-zh-v1.5` embedding 缓存）。按 DRAFT §5.4 + 实施计划 §3.2：**候选 A 标记不可执行（候选级停止 §9.1-4），候选 B 独立继续；不下载、不安装、不替换权重**。本报告逐项记录为 N/A + 缺失证据。

## 1. 模型事实逐项（实施计划 §7 六字段）

| # | 字段 | 值 | 证据 |
|---|---|---|---|
| ① | 模型名称与版本 | **N/A（未发现缓存权重）** | `find /tmp/fastembed_cache -maxdepth 2 -type d`：仅 `models--Qdrant--bm25`、`models--Qdrant--bge-small-zh-v1.5`、`.locks`，无任何 reranker/cross 目录（2026-08-12 S0 核验） |
| ② | 权重内容哈希 | **N/A（无权重文件）** | 无权重可哈希 |
| ③ | 许可证 | **N/A（无具体权重，无模型卡可查）**；调研报告已记录的方向参考（bge-reranker-v2-m3 模型卡 = apache-2.0）不作为已选模型许可 | `spike-r2-research.md` §2 方案 1 |
| ④ | 缓存来源与路径 | **N/A（未缓存）**；容器缓存根 = `/tmp/fastembed_cache/` | S0 P5-A 核验输出 |
| ⑤ | 运行接口 | **接口可用但无权重**：fastembed **0.8.0**，`from fastembed.rerank.cross_encoder import TextCrossEncoder` **import ok**（仅 import 级核验，未实例化）；无权重则 `rerank()` 无法执行 | S0 P5-A2 核验输出 |
| ⑥ | 资源需求 | **N/A（无权重，无法估算文件大小）**；若未来确认具体模型，磁盘/内存按该模型卡记录 + S8 实测补充 | — |

## 2. 确认门状态

- 本报告为候选 A 模型事实确认门输入；**确认门未通过**（P5-A 未发现权重）。
- 按批准约束 4：具体模型未获 Founder/决策 Chief 确认前，**不得运行候选 A、不得下载/安装/替换权重**。
- 候选 B（k-means 原型聚类）不依赖未确认模型，**独立可执行**；本轮按 Founder 指示不开始候选 B 实验。
- 确认记录（日期/确认人）将在 Founder/决策 Chief 给出结论后回填本文件。

## 3. 候选 A 后续选项（交 Founder/决策 Chief 裁决，Builder 不自行选择）

1. 维持"候选 A 不可执行"结论，仅以候选 B 继续第二轮 Spike（当前推荐，符合 DRAFT §9.1-4 语义）；
2. 若 Founder 另有已预装/可离线核验的 reranker 权重来源，需先经预装检查核验 + 本报告更新 + Founder 确认后才可进入；
3. 任何下载/安装/替换权重均超出本任务批准范围，须单独 Change Request 由 Founder 裁决。
