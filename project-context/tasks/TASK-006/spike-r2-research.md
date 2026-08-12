# TASK-006｜第二轮 Spike 候选机制 — 公开方案调研报告（只读）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/tasks/TASK-006/local-gate-spike-draft.md（v1.2，第一轮权威方案）
  - project-context/tasks/TASK-006/spike-stop-cr.md（CR-T006-SPIKE-STOP-01，DECIDED-A）
  - project-context/tasks/TASK-006/spike/（第一轮证据：词法不可分 R1 / 手工词表覆盖不足 R2）
doc_type: 调研报告（只读公开资料；不安装依赖、不下载模型、不运行代码、不接触用户数据、不预先选定方案）
task_id: TASK-006（内部第二轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R2）
status: 调研完成（供 DRAFT v1.2 候选范围修订依据）
research_by: operational-chief-2026-08-12-01（执行 Chief）
research_date: 2026-08-12
method: 只读抓取开源仓库 README / HuggingFace 模型卡 / 论文元数据（curl，无安装无运行）
scope: 本地召回重排（reranking）、相关性过滤、多信号融合；聚焦成熟开源项目与权威论文
```

---

## 1. 调研范围与方法

- **问题**：本地（无用户数据外发）召回后的**相关性重排/过滤**与**多信号融合**，如何针对第一轮失败根因（R1 词法不可分 / R2 手工词表覆盖不足）选择候选机制；
- **只读约束**：全程未安装依赖、未下载模型、未运行任何代码、未接触用户数据；仅抓取公开文档；
- **对比维度**（Founder 要求）：问题匹配度 / 纯本地能力 / 中文支持 / 许可证 / 依赖与模型 / 延迟资源 / 数据边界 / 可复用部分。

## 2. 代表性方案（4 个，超过要求的 3 个）

### 方案 1：BGE-Reranker（BAAI / FlagEmbedding）—— cross-encoder 相关性重排

| 维度 | 事实（来源：FlagEmbedding GitHub README + HF 模型卡，2026-08-12 抓取） |
|---|---|
| 问题匹配度 | **高**：官方定位即"embedding 检索后对 top-k 文档重排"；直接输出 query+document 的相关性分数（非向量相似度），正对"相关性过滤"需求；对"语义上是否相关"的判别力显著强于双编码器余弦 |
| 纯本地能力 | ✅ 完全本地推理（cross-encoder 前向）；无 API 依赖 |
| 中文支持 | ✅ bge-reranker-base/large（xlm-roberta）明确支持中英；v2-m3 多语言；v2-minicpm-layerwise 中英表现好且 8–40 层可选加速 |
| 许可证 | ✅ 分两层记录（批准约束 8：仓库许可证 ≠ 模型许可证）：FlagEmbedding **代码仓库** MIT；**具体权重以各自 HuggingFace 模型卡为准**——如 bge-reranker-v2-m3 模型卡标 apache-2.0；bge-reranker-base/large 模型卡许可须以模型卡实际标注为准（本报告不代断）；学术/商用授权以模型卡条款为准 |
| 依赖与模型 | 需要 cross-encoder 模型权重（本地缓存）；**fastembed（Qdrant）原生支持 `TextCrossEncoder.rerank(query, documents)`**——项目 mem0-server 已用 fastembed，推理能力可能在本地依赖链中；**但 reranker 权重 ≠ 已缓存的 bge-small-zh-v1.5 embedding 权重，是否已缓存属预装检查项** |
| 延迟资源 | base 版"lightweight, fast inference"（官方）；CPU 可跑；确切毫秒数需预装检查后实测（DRAFT §6 口径） |
| 数据边界 | ✅ 无外发；输入仅本地合成数据 |
| 可复用部分 | 思路可作为候选 A 的方向参考：**本地 cross-encoder 相关性重排**；fastembed 接口与 reranker 权重是否可用/已缓存，**均属待预装检查核验的事实**（§5.4 P5），不得表述为既成事实 |

### 方案 2：ColBERT / ColBERTv2（Stanford）—— late-interaction 多向量检索

| 维度 | 事实（来源：stanford-futuredata/ColBERT README + arXiv 2112.01488，2026-08-12 抓取） |
|---|---|
| 问题匹配度 | 中-高：token 级 late interaction 交互质量超单向量模型；但它是**检索模型**（替代 embedding 检索），非"召回后过滤"；对本任务（已有 mem0 召回、需过滤）属间接参考 |
| 纯本地能力 | ✅ 本地可跑（需 GPU 更佳） |
| 中文支持 | ⚠️ 原生以英文/多语言 BERT 为主，中文需选多语言 checkpoint；非专门中文优化 |
| 许可证 | MIT（仓库） |
| 依赖与模型 | 需 ColBERT checkpoint + 索引；**权重需下载（不满足"仅已预装"约束）**；空间占用大（v2 压缩后仍 6–10× 单向量） |
| 延迟资源 | 检索延迟低（tens of ms，GPU），但**需 GPU/较大内存**；本项目 CPU 环境风险高 |
| 数据边界 | ✅ 无外发 |
| 可复用部分 | 思路参考：**token 级交互比单向量余弦有更强判别力**（佐证候选 A 需"非单一余弦"的交互结构）；但整体落地成本高，**不建议作为本 Spike 候选**（需新模型/新索引） |

### 方案 3：RRF（Reciprocal Rank Fusion，Cormack et al. SIGIR 2009）—— 多信号排序融合

| 维度 | 事实（来源：ACM DOI 10.1145/161468.161470 元数据 + Weaviate hybrid search 文档，2026-08-12 抓取） |
|---|---|
| 问题匹配度 | 中：经典的多检索信号融合（BM25 + 语义等），用于合并多个排序列表；**不直接输出"相关性分数"**，而是融合排序；对"融合词法+语义信号"有用，但单信号（仅 mem0）下价值有限 |
| 纯本地能力 | ✅ 纯算法、零模型、零推理 |
| 中文支持 | ✅ 语言无关（基于排序位置） |
| 许可证 | ✅ 论文方法（方法本身无许可限制）；现代实现（Weaviate 等）随各自仓库许可 |
| 依赖与模型 | ✅ 零依赖、零模型（排序位置计算） |
| 延迟资源 | 极低（O(n log n) 排序融合） |
| 数据边界 | ✅ 无外发 |
| 可复用部分 | 思路参考：**多信号融合框架**——若后续引入 BM25（本地词法，自动 IDF 无需手工词表）作为第二信号，RRF 可融合"词法 + 语义"；**可作为候选 B 的备选融合层，或作为未来 CR 选项；本 DRAFT 不将其作为第二实现**（避免多架构选项，遵循 Founder Review 1 第 2 条"候选 B 只能选定一种可执行方法"） |

### 方案 4：sentence-transformers CrossEncoder（UKPLab）—— 重排框架参照

| 维度 | 事实（来源：UKPLab/sentence-transformers README，2026-08-12 抓取） |
|---|---|
| 问题匹配度 | 高（框架层面）：提供 CrossEncoder + `model.rank()` 重排 API，是 cross-encoder 重排的通用实现参照 |
| 纯本地能力 | ✅ 本地推理 |
| 中文支持 | ⚠️ 取决于所选预训练模型（ms-marco 系列偏英文；中文需另选） |
| 许可证 | ✅ MIT |
| 依赖与模型 | Python 库 + 预训练权重（需安装/下载 → 不满足"仅已预装"约束，除非现有依赖链已含） |
| 延迟资源 | 同 cross-encoder 一般水平 |
| 数据边界 | ✅ 无外发 |
| 可复用部分 | 概念参照：确认 cross-encoder 重排为业界标准做法；**具体实现以 fastembed TextCrossEncoder（项目已用 fastembed）为准，不引入新 Python 依赖** |

## 3. 对比结论（→ 候选 A/B 保留/替换/重新定义判断）

| 判断项 | 结论 | 依据 |
|---|---|---|
| 候选 A 处理 | **重新定义**：从"手搓多维交互特征"改为**本地 cross-encoder 相关性重排（bge-reranker 系方向，经 fastembed TextCrossEncoder 本地推理）** | 方案 1/4：cross-encoder 重排是成熟标准做法，直接输出相关性分数，判别力强于手搓交互特征；fastembed 接口与 reranker 权重是否可用/已缓存，**均属待预装检查核验的事实**（§5.4 P5），不得表述为既成事实；保留非冗余诊断 + "单一余弦=冗余基线"纪律 |
| 候选 B 处理 | **保留方向、收敛实现**：保留"数据驱动主题空间（k-means 原型聚类）"为唯一方法（针对 R2 不依赖手工词表）；**不引入 RRF 或 ColBERT 作为第二实现** | 方案 2/3：ColBERT 需新模型新索引（违反"仅已预装"）；RRF 是融合层而非词表替代，且 Founder Review 1 第 2 条要求候选 B 单一方法；k-means 数据驱动空间对"未见过表达"（如"下雨"）经 embedding 自然映射，不因词表未命中归零 |
| 候选 A/B 独立性 | 不变 | 各自适用门独立；A 降级不影响 B（DRAFT v1.1 §8） |
| 新依赖/模型 | **不下载、不安装、不替换**（约束 4/5）：候选 A 的 reranker 权重属"预装检查"项——**是否已缓存属待核验事实**，若未缓存则只停止候选 A 并提交依赖裁决，不自行下载；候选 B 依赖的 fastembed embedding 能力是否可用同样待预装检查核验 | DRAFT §5.4 预装检查纪律 + Founder 裁决 A"不下载不安装" |
| 数据边界 | 不变 | 仅合成数据 + loopback + 零外发 |

## 4. 证据来源清单（全部只读抓取，2026-08-12）

1. BAAI FlagEmbedding：`https://github.com/FlagOpen/FlagEmbedding`（README：MIT、bge-reranker-base/large、v2-m3、minicpm-layerwise）；
2. HF bge-reranker-v2-m3 模型卡：`https://huggingface.co/BAAI/bge-reranker-v2-m3`（apache-2.0、multilingual、中文/英文适用、层加速）；
3. Stanford ColBERT：`https://github.com/stanford-futuredata/ColBERT` + arXiv:2112.01488（ColBERTv2，late interaction，压缩 6–10×）；
4. RRF：Cormack et al., SIGIR 2009, DOI 10.1145/161468.161470（ACM 元数据确认）；Weaviate hybrid search 文档（RRF 为默认融合）；
5. fastembed（Qdrant）：`https://github.com/qdrant/fastembed`（README 确认 `fastembed.rerank.cross_encoder.TextCrossEncoder.rerank(query, documents)`）；
6. UKPLab sentence-transformers：`https://github.com/UKPLab/sentence-transformers`（MIT、CrossEncoder.rank 重排 API）。

## 5. 本报告边界

- 只读调研，未安装/未下载/未运行/未接触用户数据；未预先选定方案；
- 具体延迟/资源数值（bge-reranker-base CPU 实测）不在本报告——须在预装检查通过后按 DRAFT §6 口径实测；
- reranker 权重是否已缓存于本地 fastembed 缓存目录，属预装检查 P5 的核验项，本报告不假设已缓存。
