# TASK-003 V2.1 静态设计原型

本目录是评测台的历史静态设计母版，用于视觉系统、信息层级和交互参考；它不是正式运行产品，也不是当前数据事实来源。

## 正式产品

```text
E:\正式作品\v2\app
http://127.0.0.1:3000/eval
```

## 重要边界

- `index.html` 使用固定评测快照，不会读取 PostgreSQL 或最新 Eval Run。
- 静态快照保留了当时的 Case 映射；当前正式产品以数据库 migration 和 `/api/eval/cases` 为准，禁止从本原型复制 Case 编号或固定数字。
- 迁移设计时只复用 Token、布局、组件、信息层级、响应式和交互手感。
- 最终只维护 `3000` 的真实产品；本目录冻结为设计与审查证据。

## 本地运行

```powershell
Set-Location 'E:\正式作品\prototypes\task-003-eval-console-v2.1'
npm install
npm run build
python -m http.server 8765 --bind 127.0.0.1
```

访问：`http://127.0.0.1:8765/index.html`

## 审查材料

```text
E:\正式作品\project-context\tasks\TASK-003\static-prototype-review-v2.1
```
