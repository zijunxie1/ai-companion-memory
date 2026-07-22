"""
mem0 Server — Python FastAPI 包装 mem0 库 (v2.0.x API)
提供 REST API 供 Next.js 调用

端点：
  POST   /memories        — 添加记忆（从对话文本抽取）
  GET    /memories/<uid>  — 获取用户所有记忆
  POST   /memories/search — 语义搜索记忆
  PUT    /memories/<id>   — 更新记忆内容
  DELETE /memories/<id>   — 删除记忆
  GET    /health          — 健康检查
"""

import os
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mem0 import Memory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="mem0-server", version="1.0.0")


def _build_config() -> dict:
    """从环境变量构建 mem0 配置，不硬编码任何连接信息。"""
    return {
        "vector_store": {
            "provider": "qdrant",
            "config": {
                "url": os.environ.get("MEM0_VECTOR_STORE_URL", "http://qdrant:6333"),
                "collection_name": "ai_companion_memories",
                "embedding_model_dims": 512,  # bge-small-zh-v1.5 = 512 维
            },
        },
        # FastEmbed: 本地 embedding，无需 API Key
        # DeepSeek 不提供 embedding API，用 fastembed 替代
        "embedder": {
            "provider": "fastembed",
            "config": {
                "model": "BAAI/bge-small-zh-v1.5",  # 中英文双语 embedding
            },
        },
        # LLM: DeepSeek（仅用于 Memory 抽取，不用于生成——生成由 Dify 负责）
        "llm": {
            "provider": os.environ.get("MEM0_LLM_PROVIDER", "openai"),
            "config": {
                "model": os.environ.get("MEM0_LLM_MODEL", "deepseek-chat"),
                "api_key": os.environ.get("MEM0_LLM_API_KEY", ""),
                "openai_base_url": os.environ.get("MEM0_LLM_BASE_URL") or None,
            },
        },
        "history_db": {
            "host": os.environ.get("MEM0_HISTORY_DB_HOST", "postgres"),
            "port": int(os.environ.get("MEM0_HISTORY_DB_PORT", "5432")),
            "user": os.environ.get("MEM0_HISTORY_DB_USER", "postgres"),
            "password": os.environ.get("MEM0_HISTORY_DB_PASSWORD", "postgres"),
            "dbname": os.environ.get("MEM0_HISTORY_DB_NAME", "mem0_history"),
        },
    }


# 延迟初始化——避免启动时连接失败导致容器 crash
_memory: Optional[Memory] = None


def get_memory() -> Memory:
    global _memory
    if _memory is None:
        logger.info("Initializing mem0 Memory instance...")
        _memory = Memory.from_config(_build_config())
        logger.info("mem0 Memory initialized successfully.")
    return _memory


# ── Pydantic 模型 ──────────────────────────────────────────


class AddMemoryRequest(BaseModel):
    user_id: str
    text: str
    metadata: dict = {}


class SearchMemoryRequest(BaseModel):
    user_id: str
    query: str
    limit: int = 5


class UpdateMemoryRequest(BaseModel):
    content: str


# ── 端点 ───────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/memories")
def add_memory(req: AddMemoryRequest):
    try:
        result = get_memory().add(
            req.text,
            user_id=req.user_id,
            metadata=req.metadata or None,
        )
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"add_memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/memories/{user_id}")
def get_all_memories(user_id: str):
    try:
        memories = get_memory().get_all(filters={"user_id": user_id})
        return {"memories": memories}
    except Exception as e:
        logger.error(f"get_all_memories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/memories/search")
def search_memories(req: SearchMemoryRequest):
    try:
        memories = get_memory().search(
            query=req.query,
            filters={"user_id": req.user_id},
            top_k=req.limit,
        )
        return {"memories": memories}
    except Exception as e:
        logger.error(f"search_memories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/memories/{memory_id}")
def update_memory(memory_id: str, req: UpdateMemoryRequest):
    try:
        get_memory().update(memory_id=memory_id, content=req.content)
        return {"success": True, "memory_id": memory_id}
    except Exception as e:
        logger.error(f"update_memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/memories/{memory_id}")
def delete_memory(memory_id: str):
    try:
        get_memory().delete(memory_id=memory_id)
        return {"success": True, "memory_id": memory_id}
    except Exception as e:
        logger.error(f"delete_memory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
