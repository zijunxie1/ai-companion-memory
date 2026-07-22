-- ============================================================
-- V2 业务数据库初始化脚本
-- Docker PostgreSQL 启动时自动执行（docker-entrypoint-initdb.d）
-- ============================================================

-- 创建 mem0 历史数据库（与业务数据库独立）
CREATE DATABASE mem0_history;

-- ============================================================
-- 业务表：ai_companion 数据库（默认连接的数据库）
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id                VARCHAR PRIMARY KEY,
    nickname          VARCHAR,
    persona           JSONB,
    relationship_stage VARCHAR DEFAULT 'new',
    created_at        TIMESTAMP DEFAULT NOW()
);

-- 对话记录
CREATE TABLE IF NOT EXISTS conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR NOT NULL,
    role        VARCHAR NOT NULL,        -- 'user' | 'assistant'
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Trace 日志
CREATE TABLE IF NOT EXISTS traces (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR NOT NULL,
    conversation_id UUID REFERENCES conversations(id),
    user_input      TEXT NOT NULL,
    ai_reply        TEXT,
    used_memory     JSONB,                -- 本轮使用的 Memory 列表
    recall_reason   TEXT,                 -- 为什么召回这些
    memory_writes   JSONB,                -- 本轮写入的候选 Memory
    conflict_result JSONB,                -- 冲突处理结果
    prompt_version  VARCHAR,
    latency_ms      INTEGER,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_traces_user_id ON traces(user_id);
CREATE INDEX IF NOT EXISTS idx_traces_created_at ON traces(created_at);

-- 插入 Demo 用户
INSERT INTO users (id, nickname, persona, relationship_stage)
VALUES (
    'demo-alice',
    '小鹿',
    '{
        "name": "PList",
        "role": "深夜陪伴者",
        "personality": ["温柔", "有点俏皮", "不会爹味说教"],
        "tone": "像认识很久的朋友，不是客服",
        "boundary": "不做医疗诊断，不诱导情感依赖",
        "relationship_stage": "familiar"
    }'::jsonb,
    'familiar'
) ON CONFLICT (id) DO NOTHING;
