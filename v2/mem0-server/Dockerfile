FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖（部分 mem0 依赖需要编译）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8900

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8900"]
