# TASK-006 第三轮 Spike — 方案 B 模型事实报告（model-facts.md）

```yaml
doc_type: 模型事实报告（DRAFT v1.1 §4.0 / 实施计划 v1.1 §3.3；Founder 批准下载后产出）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
decision_id: D-T006-R3-B-MODEL（Founder 2026-08-13 裁决：批准 B-1）
model_selected: BAAI/bge-reranker-base
fixed_revision: 2cfc18c9415c912f9d8155881c133215df768a70
report_date: 2026-08-13（Asia/Shanghai）
reported_by: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
download_method: huggingface_hub snapshot_download（revision 固定，allow_patterns 精确，cache_dir=/tmp/fastembed_cache）
```

---

## 1. 模型名称与版本

| 项 | 值 |
|---|---|
| 模型仓库 | `BAAI/bge-reranker-base` |
| 固定版本（HF revision sha） | `2cfc18c9415c912f9d8155881c133215df768a70` |
| 架构 | `XLMRobertaForSequenceClassification`（xlm-roberta） |
| 官方定位 | BGE cross-encoder reranker base（FlagEmbedding 系） |
| 许可证 | **mit**（按模型卡 `cardData.license` 标注，非仓库许可证） |

## 2. 实际下载文件清单与 SHA-256（仅 FastEmbed 所需 ONNX + tokenizer + 配置）

| 文件（相对路径） | 大小 | SHA-256 |
|---|---|---|
| `onnx/model.onnx` | 1112459588 B（1112.46 MB） | `15b9a8c3da82eddf263df571281166e00e9308fe19d077084b642ebfcaf06d2b` |
| `tokenizer.json` | 17098107 B（17.1 MB） | `9eb652ac4e40cc093272bbbe0f55d521cf67570060227109b5cdc20945a4489e` |
| `config.json` | 799 B | `289adf7ada1eb6b4afa7589a48a032d45a076cf2e46dcdb3b4cabc33be14f708` |
| `tokenizer_config.json` | 443 B | `a1d6bc8734a6f635dc158508bef000f8e2e5a759c7d92f984b2c86e5ff53425b` |
| `special_tokens_map.json` | 279 B | `d5469a60db23249c7f8945013d78df30b44b6bf686c6bb4740f4223f77b1b535` |

- **总大小**：1129559216 B = 1129.56 MB = **1.13 GB**（≤ Founder 授权上限 1.2GB ✅）
- **下载来源**：HuggingFace Hub，repo `BAAI/bge-reranker-base`，revision `2cfc18c...`（HTTP 200，etag `ae4ec7e1...`）
- **完整性核验**：`onnx/model.onnx` 的 SHA-256 与 HF API 返回的 LFS oid `15b9a8c3da82eddf263df571281166e00e9308fe19d077084b642ebfcaf06d2b` **完全一致** ✅

## 3. 未下载文件（遵守 Founder 禁止清单）

| 禁止项 | 状态 |
|---|---|
| `model.safetensors`（1112.2 MB） | ✅ 未下载（allow_patterns 排除） |
| `pytorch_model.bin`（1112.3 MB） | ✅ 未下载（allow_patterns 排除） |
| `sentencepiece.bpe.model`（5.1 MB） | ✅ 未下载（fastembed tokenizer 用 tokenizer.json，无需） |
| v2-m3 或其他模型 | ✅ 未下载 |
| torch / sentence-transformers 依赖 | ✅ 未安装 |

## 4. 运行接口（本机已核验）

- **接口**：`fastembed.rerank.cross_encoder.TextCrossEncoder`（fastembed **0.8.0**）
- **推理引擎**：ONNX Runtime（onnxruntime **1.27.0**，已预装；无需 torch/sentence-transformers）
- **调用签名**：`TextCrossEncoder('BAAI/bge-reranker-base').rerank(query, documents, batch_size=...)` → Iterable[float]
- **缓存目录**：`/tmp/fastembed_cache/models--BAAI--bge-reranker-base/snapshots/2cfc18c...`
- **输出**：原始 logit 分数（非 0-1，范围约 ±10；正式实验需 sigmoid 归一化 + 校准集定阈值，见实施计划 §4）

## 5. 最小推理检查结果（合成文本，非正式实验数据）

| 查询 | 候选记忆 | 分数 | 判定 |
|---|---|---|---|
| "我今天心情很差，失眠了" | 用户长期失眠，晚上很难入睡 | **1.5863** | 相关（高分）✅ |
| 同上 | 用户喜欢橘猫，猫很可爱 | -10.1953 | 无关（负分）✅ |
| 同上 | 今天天气不错 | -5.0415 | 无关（负分）✅ |
| "今天天气不错" | 用户长期失眠，晚上很难入睡 | -10.1936 | 无关（负分）✅ |
| 同上 | 用户喜欢橘猫，猫很可爱 | -9.8846 | 无关（负分）✅ |
| 同上 | 今天天气不错 | **10.3057** | 相关（高分）✅ |

- **检查通过**：本地加载成功，合成文本推理正常，相关/无关分离方向正确（含 R1 核心场景"失眠 vs 天气"的语义区分）；
- **说明**：此为最小加载检查（6 对合成文本），非正式评估；正式判断质量以 S4 主实验同一冻结候选池实测为准（🔬 待测）。

## 6. 资源需求（本机实测口径）

| 项 | 值 |
|---|---|
| 磁盘占用 | 1.13 GB（ONNX + tokenizer + config） |
| 内存/CPU | 🔬 待 S7 延迟/资源测量实测（不预设淘汰阈值） |

## 7. 结论

方案 B-1 `BAAI/bge-reranker-base` 已按 Founder 裁决下载完成并核验通过：固定版本 `2cfc18c...`、仅 ONNX+tokenizer+config（1.13GB ≤ 1.2GB）、SHA-256 与 LFS oid 一致、零新增依赖、最小推理检查通过。

**下一步（S0.3 门）**：B-1 就绪不代表可直接进入 S1。下一步必须先执行 **S0.3 方案 C 连通检查**（P5-B DeepSeek 连通性只读核验，仅当 C 已获外部调用授权时执行）；**只有 S0.3 成功后才进入 S1 冻结统一测试题；S0.3 失败则只停止 C，A/B 不受影响、独立继续**。
