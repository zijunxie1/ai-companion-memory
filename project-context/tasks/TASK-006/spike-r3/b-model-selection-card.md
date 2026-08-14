# TASK-006｜第三轮 Spike 方案 B 模型选择决策卡（D-T006-R3-B-MODEL）

```yaml
required_reading:
  - AGENTS.md
  - project-context/context-manifest.md
  - project-context/CHIEF-BOOTSTRAP.md
  - project-context/current-state.md
  - project-context/decision-register.md
  - project-context/tasks/TASK-006/spike-r3-candidate-draft.md（v1.1，APPROVED，§4 方案 B）
  - project-context/tasks/TASK-006/spike-r3-builder-handoff.md
  - project-context/tasks/TASK-006/spike-r3/implementation-plan.md（v1.1，§3.3 模型事实报告要求）
  - project-context/tasks/TASK-006/spike-r3/preflight-check.md（P5-A 结论：无 reranker 权重）
  - project-context/tasks/TASK-006/spike-r2-research.md（第二轮调研，方向依据）
doc_type: 单问题决策卡（Founder 裁决用；只读形成，无下载、无实例化、无外部模型调用）
decision_id: D-T006-R3-B-MODEL
task_id: TASK-006（内部第三轮 Spike：TASK-006-SPIKE-LOCAL-GATE-R3）
status: NEEDS_DECISION（等待 Founder 裁决；本卡不请求下载授权）
prepared_by: Builder（TASK-006｜Builder｜第三轮检索后相关性判断对照 Spike）
prepared_date: 2026-08-13
method: 只读核验（容器内 fastembed/mem0 源码 + HuggingFace 模型卡元数据 API，无下载无实例化无外部模型调用）
spike_id: TASK-006-SPIKE-LOCAL-GATE-R3
```

> **本卡唯一问题**：方案 B 若获下载授权，应下载哪一个 cross-encoder 模型（候选 B-1 `bge-reranker-base` vs 候选 B-2 `bge-reranker-v2-m3`）？
> **本卡不请求下载授权**——Founder 裁决后，Builder 才按裁决执行（若授权下载）。
> **冻结纪律**：本卡形成期间未进入 S1、未创建/查看 holdout、未运行 A/C 正式实验、未下载任何权重、未发起任何外部模型调用。

---

## 1. 一句话结论

**推荐候选 B-1 `BAAI/bge-reranker-base`**：它是本机 fastembed 0.8.0 与 mem0 2.0.13 两条路径**唯一同时原生支持**的 cross-encoder，走 ONNX 推理（onnxruntime 1.27.0 已预装），无需新增 torch/sentence-transformers 依赖，1.04GB 权重；候选 B-2 `bge-reranker-v2-m3` 虽模型卡标 apache-2.0 且多语言，但 **fastembed 0.8.0 不支持**、mem0 内置 reranker 依赖的 sentence-transformers/torch **本机未预装**，落地需新增重依赖，不满足"仅已预装组件"的路线 B 精神。

---

## 2. 两个候选逐项对比（只读核验事实）

| 对比项 | 候选 B-1：BAAI/bge-reranker-base | 候选 B-2：BAAI/bge-reranker-v2-m3 |
|---|---|---|
| **准确模型仓库** | `BAAI/bge-reranker-base` | `BAAI/bge-reranker-v2-m3` |
| **固定版本（HF sha）** | `2cfc18c9415c912f9d8155881c133215df768a70`（lastModified 2024-06-24） | `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`（lastModified 2024-06-24） |
| **实际下载文件及总大小** | `model.safetensors` = **1.11GB** + `pytorch_model.bin` 1.11GB + tokenizer 约 0.03GB（fastembed 走 ONNX 需约 **1.04GB**，见下） | `model.safetensors` = **2.27GB** + tokenizer 约 0.03GB（无独立 pytorch_model.bin） |
| **模型自身许可证** | 模型卡 `cardData.license` = **mit**（⚠️ 第二轮已核验：仓库 MIT ≠ 模型卡许可；此处按模型卡实际标注 = mit） | 模型卡 `cardData.license` = **apache-2.0** |
| **中文相关性证据** | 模型卡 `language = [en, zh]`；C-MTEB 中文 reranking benchmark：CMedQAv1 MAP 81.27 / CMedQAv2 MAP 84.10（📖 公开 benchmark，非本项目实测） | 模型卡 `language = [multilingual]`（含中英）；无 C-MTEB 中文 reranking 指标（`model-index = null`，中文证据弱于 B-1 的显式 zh 标注） |
| **fastembed 0.8.0 兼容路径** | ✅ **原生支持**：`CROSS_ENCODER_REGISTRY` 含 `BAAI/bge-reranker-base`（size=1.04GB），走 ONNX providers | ❌ **不支持**：registry 无 v2-m3（实测 `list_supported_models()` 仅 6 个，无 v2-m3） |
| **mem0 2.0.13 兼容路径** | ✅ **原生默认**：`HuggingFaceRerankerConfig.model` 默认值 = `BAAI/bge-reranker-base` | ⚠️ 需显式改配置 `model=BAAI/bge-reranker-v2-m3`；但该 provider 依赖 sentence-transformers（见下） |
| **本机运行依赖** | fastembed 路径：onnxruntime **1.27.0 已预装**；无需 torch/sentence-transformers | mem0 内置 huggingface/sentence_transformer provider 依赖 **sentence-transformers + torch，本机均未预装**（实测 `import sentence_transformers` / `import torch` 均 ModuleNotFoundError） |
| **预计磁盘** | 约 1.04GB（ONNX）或 1.11GB（safetensors） | 2.27GB safetensors +（若走 sentence-transformers 需额外安装 torch 数百 MB） |
| **预计内存/CPU** | base 系"lightweight, fast inference"官方定位；具体数值待实测（🔬，不预设） | 567M 参数（模型卡）；体积与内存占用更大，具体待实测（🔬，不预设） |
| **落地新增依赖** | **零新增**（fastembed ONNX + onnxruntime 已预装） | **需新增 sentence-transformers + torch**（未预装，违反"仅已预装组件"路线 B 精神） |

---

## 3. 关键事实链（只读核验证据）

1. **fastembed 0.8.0 支持面**（容器内实测）：`TextCrossEncoder.list_supported_models()` = `[Xenova/ms-marco-MiniLM-L-6-v2, Xenova/ms-marco-MiniLM-L-12-v2, BAAI/bge-reranker-base, jinaai/jina-reranker-v1-tiny-en, jinaai/jina-reranker-v1-turbo-en, jinaai/jina-reranker-v2-base-multilingual]` —— **含 base、不含 v2-m3**；
2. **mem0 2.0.13 内置 reranker**（容器内实测源码）：`HuggingFaceRerankerConfig.model` 默认值 = `BAAI/bge-reranker-base`；`RerankerFactory` 支持 5 provider（cohere / sentence_transformer / zero_entropy / llm_reranker / huggingface）；
3. **本机预装依赖**（容器内实测）：`onnxruntime = 1.27.0` 已预装；`sentence_transformers`、`torch` **均未预装**；
4. **fastembed 推理方式**：`TextCrossEncoder.__init__` 走 `OnnxProvider`，ONNX 推理无需 torch；
5. **模型卡元数据**（HuggingFace API，只读）：base `sha=2cfc18c...`、license=mit、language=[en,zh]、C-MTEB 中文指标；v2-m3 `sha=953dc6f6...`、license=apache-2.0、language=[multilingual]、model-index=null；
6. **文件大小**（HF API tree，只读）：base `model.safetensors`=1.11GB；v2-m3 `model.safetensors`=2.27GB。

---

## 4. 推荐选择及理由

**推荐：候选 B-1 `BAAI/bge-reranker-base`。**

理由（按 Founder 要求逐项）：

1. **本机兼容性决定性**：base 是 fastembed 0.8.0 与 mem0 2.0.13 两条路径**唯一同时原生支持**的模型；v2-m3 需新增 sentence-transformers + torch 重依赖，落地成本与风险显著更高；
2. **依赖最小化（路线 B 精神）**：base 走 fastembed ONNX，onnxruntime 已预装，**零新增依赖**；v2-m3 无 fastembed 支持，且 mem0 内置路径依赖未预装的 sentence-transformers/torch；
3. **中文相关性证据更实**：base 模型卡显式 `language=[en, zh]` 且有 C-MTEB 中文 reranking benchmark；v2-m3 仅标 multilingual、`model-index=null`（本项目中文效果两者均 🔬 待实测，但 base 的公开中文证据更具体）；
4. **体积/资源更轻**：base 约 1.04GB（ONNX）vs v2-m3 2.27GB；
5. **许可证均可用**：base=mit、v2-m3=apache-2.0，两者均允许作品集项目使用（按各自模型卡标注记录，不由我作法律结论）。

> **诚实声明**：base 的 mit 与 v2-m3 的 apache-2.0 均为模型卡标注事实；本项目中文效果（"失眠↔橘猫 vs 天气↔橘猫"分离能力）尚无项目内证据（🔬 待 Spike 实测）。本推荐基于**本机兼容性与依赖最小化**，不宣称 base 中文效果必然优于 v2-m3。

---

## 5. 若 Founder 裁决下载 base，Builder 的后续动作（预声明，不提前执行）

1. 产出 `spike-r3/model-facts.md`（模型事实报告，按实施计划 §3.3 六项：名称/版本/哈希/许可证/缓存来源/运行接口/资源需求）；
2. 经 Founder 明确批准后，才下载权重到 fastembed 缓存目录；
3. 下载后进入 S1 冻结候选池（届时三种方案参数已备齐，按 Founder 规定顺序：先 B 模型裁决 → 三方案备齐 → 冻结测试题 → 校准调参 → 各方案一次性正式测试）。

---

## 6. 待 Founder 裁决

| 选项 | 内容 |
|---|---|
| 选项 1 | 批准下载候选 B-1 `BAAI/bge-reranker-base`（推荐） |
| 选项 2 | 批准下载候选 B-2 `BAAI/bge-reranker-v2-m3`（需新增 sentence-transformers + torch） |
| 选项 3 | 两个都下载、都测（成本翻倍，不推荐） |
| 选项 4 | 方案 B 维持不下载，仅 A/C 对照（部分证据） |
