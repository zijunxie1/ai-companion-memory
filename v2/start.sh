#!/bin/bash
# ============================================
# V2 一键启动脚本
# 用法：bash start.sh
# ============================================

echo "🚀 启动 V2 系统..."

# Step 1: 启动 Docker 容器
echo "📦 [1/2] 启动 Docker 容器（mem0 + PostgreSQL + Qdrant + Dify）..."
cd "E:/正式作品/v2"
docker compose up -d
echo "⏳ 等待容器就绪..."
sleep 8

# 检查容器状态
if docker ps --format "{{.Names}}" | grep -q "v2-mem0-server"; then
  echo "✅ Docker 容器已启动"
else
  echo "❌ Docker 容器启动失败，请检查 Docker Desktop 是否运行"
  exit 1
fi

# Step 2: 启动 Next.js 前端
echo "🖥️  [2/2] 启动 Next.js 前端..."
echo "📍 前端启动后请打开浏览器访问: http://localhost:3000"
echo "⚠️  请勿关闭此窗口"
echo ""
cd "E:/正式作品/v2/app"
npm run dev
