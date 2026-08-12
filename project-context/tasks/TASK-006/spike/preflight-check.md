# TASK-006 Spike — 预装检查记录（preflight-check）

```yaml
doc_type: 预装检查记录（DRAFT v1.2 §5.4 / 实施计划 S0 产物）
spike_id: TASK-006-SPIKE-LOCAL-GATE
check_date: 2026-08-12（Asia/Shanghai）
checker: Builder（TASK-006｜Builder｜本地相关性 Gate Spike）
plan_commit: 7b425e0
conclusion: 全部通过（P1—P6）；两处环境事实修正已如实记录
```

## 核验结果

| # | 检查项 | 结果 | 证据（命令输出摘要） |
|---|---|---|---|
| P1 | mem0-server 运行中且 loopback 可达 | ✅ | 容器 `v2-mem0-server` Up 3 hours；**host 端口实为 8100**（容器内 8900 → host 8100，`docker port` 实测）；`curl http://127.0.0.1:8100/openapi.json` → HTTP 200 |
| P2 | mem0 版本 | ✅ | `docker exec v2-mem0-server python -c "import mem0;print(mem0.__version__)"` → **2.0.13** |
| P3 | PostgreSQL（ai_companion）loopback 可达、评测表存在 | ✅ | `v2-postgres` Up（healthy）；pg_isready 接受连接；`select count(*) from eval_cases` → **8**（只读） |
| P4 | Node/npm 现有依赖满足脚本运行（不新增依赖） | ✅ | node **v22.23.2**（≥22，满足项目 --experimental-strip-types）；npm 12.0.2；`pg` 经主检出 `E:\正式作品\v2\app\node_modules` 解析可用（**worktree 本身无 node_modules，只读复用主检出已预装依赖，不安装任何包**） |
| P5 | 本地 embedding 模型缓存存在 | ✅ | 容器内 `/tmp/fastembed_cache/models--Qdrant--bge-small-zh-v1.5/snapshots/46fbe35fd4374a00fee7de77dfddaeb6dd6a2c59/model_optimized.onnx` 存在；**模型 = Qdrant/bge-small-zh-v1.5（BAAI/bge-small-zh-v1.5 的 HF 镜像托管，512 维，与 mem0-server main.py:36 一致）**；未实例化、未触发任何下载 |
| P6 | 网络边界：脚本环境确认仅 loopback | ✅ | `HTTP_PROXY/HTTPS_PROXY/ALL_PROXY=http://127.0.0.1:7890`（loopback 本机代理）；`NO_PROXY=127.0.0.1,localhost,::1`（loopback 直连绕过代理）；脚本 fetch 白名单仅 127.0.0.1/::1/localhost，另以 fetch 包装运行期审计兜底 |

## 环境事实修正记录（与实施计划 §16 附录的差异）

1. **mem0 host 端口 = 8100**（实施计划附录按 compose 默认写 8900；实测 `docker port v2-mem0-server` = `8900/tcp -> 0.0.0.0:8100`）。所有脚本 `config.mjs` 的 MEM0_BASE_URL 使用 `http://127.0.0.1:8100`。
2. **pg 依赖解析路径 = 主检出 `E:\正式作品\v2\app\node_modules`**（worktree 无 node_modules；只读复用，符合"使用已预装 Node 现有依赖"，不安装、不写入）。

## 结论

- 五项组件全部已预装且可用；**未发生任何下载、安装或运行时拉取**；
- 依据 DRAFT v1.2 §5.4：预装检查通过，进入 holdout 数据冻结（步骤①）。
