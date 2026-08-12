# TASK-006 第二轮 Spike — S0 预装检查记录（preflight-check.md）

```yaml
check_stage: S0
spike_id: TASK-006-SPIKE-LOCAL-GATE-R2
branch: feature/task-006-r2-spike
checked_by: Builder（TASK-006｜Builder｜第二轮本地相关性 Gate Spike）
check_date: 2026-08-12
method: 只读命令核验（docker ps/port/exec、curl loopback、psql 只读、node -e 解析、find/ls 缓存目录、python import）
download_installed: 无（全程零下载、零安装、零实例化触发）
```

---

## 1. 共享依赖（两候选共同；P1–P4/P5-S/P6）

| # | 检查项 | 核验命令 | 结果 | 判定 |
|---|---|---|---|---|
| P1 | mem0-server 运行中 + loopback 可达 | `docker ps` / `docker port v2-mem0-server` / `curl http://127.0.0.1:8100/openapi.json` | 容器 Up 15 hours；host 端口 **8100**（容器内 8900，`8900/tcp -> 0.0.0.0:8100`）；loopback HTTP **200** | ✅ 通过 |
| P2 | mem0-server 版本 | `docker exec v2-mem0-server python -c "import mem0;print(__version__)"` | **2.0.13** | ✅ 通过 |
| P3 | PostgreSQL（ai_companion）loopback 可达 + 评测表存在 | `pg_isready -U postgres -d ai_companion` / `psql ... select count(*) from eval_cases`（只读） | accepting connections；**eval_cases = 8** | ✅ 通过 |
| P4 | Node/npm 版本 + pg 依赖可解析（复用主检出 node_modules，零安装） | `node --version` / `npm --version` / `node -e "createRequire('E:/正式作品/v2/app/package.json'); r('pg')"` | node **v22.23.2**；npm **12.0.2**；`pg ok` | ✅ 通过 |
| P5-S | fastembed embedding 缓存存在（候选 B 与 mem0 基线共同依赖） | `docker exec v2-mem0-server sh -c 'ls /tmp/fastembed_cache/models--Qdrant--bge-small-zh-v1.5/snapshots/*/'` | 目录存在：config.json / model_optimized.onnx / special_tokens_map.json / tokenizer.json / tokenizer_config.json | ✅ 通过（512 维 bge-small-zh-v1.5 缓存完好） |
| P6 | 网络边界：宿主代理 + 容器网络面 | `env \| grep -iE '^(http\|https\|all\|no)_proxy'` / `docker inspect ... .Config.Env` | 宿主代理：HTTP(S)/ALL_PROXY=http://127.0.0.1:7890、NO_PROXY=127.0.0.1,localhost,::1；**容器 env 含 `MEM0_LLM_BASE_URL=https://api.deepseek.com/v1` + `MEM0_LLM_API_KEY`** | ✅ 通过（**结论：REST `POST /memories` 一律禁用**，种子写入必须走 §11.3 零外发路径；脚本目标 URL 白名单仅 loopback） |

## 2. 候选 A 专属依赖（P5-A / P5-A2）

| # | 检查项 | 核验命令 | 结果 | 判定 |
|---|---|---|---|---|
| P5-A | fastembed 缓存目录是否含 **cross-encoder reranker 权重** | `docker exec v2-mem0-server sh -c 'ls -d /tmp/fastembed_cache/models--*reranker* /tmp/fastembed_cache/models--*cross*; find /tmp/fastembed_cache -maxdepth 2 -type d'` | **未发现任何 reranker/cross-encoder 权重目录**。缓存仅含：`models--Qdrant--bm25`（稀疏 BM25 索引，非 reranker）与 `models--Qdrant--bge-small-zh-v1.5`（embedding） | ❌ **P5-A 未通过** → 按 DRAFT §5.4 + §9.1-4：**候选 A 标记不可执行**（reranker 权重未缓存），候选 B 独立继续；**不下载、不安装、不替换权重** |
| P5-A2 | fastembed 版本 + TextCrossEncoder 接口可用性（仅 import，禁实例化） | `docker exec v2-mem0-server python -c "import fastembed;print(fastembed.__version__)"` / `from fastembed.rerank.cross_encoder import TextCrossEncoder` | fastembed **0.8.0**；`TextCrossEncoder import ok` | ✅ 接口可用（仅 import 级核验，未实例化）；**但无缓存权重 → 运行接口无权重可加载 → 候选 A 仍不可执行** |

## 3. 结论

- **共享依赖 P1–P4/P5-S/P6 全部通过**：候选 B（k-means 原型聚类）具备完整执行条件，独立可执行；本轮不开始候选 B 实验（Founder 指示）。
- **候选 A 专属依赖 P5-A 未通过**：缓存中无 cross-encoder reranker 权重（fastembed 0.8.0 接口可用但无权重可加载）→ 按已批准语义**只停候选 A**（候选级停止 §9.1-4），不触发整轮停止（候选 B 可独立继续）；**不下载、不安装、不替换权重**。
- 对应 `model-facts.md` 记录为 **N/A + 缺失证据**（见该文件）。
- 本检查全程只读：零下载、零安装、零实例化触发、零外发、零实测、零脚本写入、零 holdout。
