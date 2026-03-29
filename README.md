# Cookingo

Cookingo 是一个纯 AI Coding 项目。

我们的目标是做一个有生命力的菜谱网站。
它不只是一个菜品列表，而是一个更温暖、更鲜活、更让人想下厨的地方。

## 目标

- 全程以 AI Coding 为核心方式进行构建
- 做一个有生命力的菜谱网站
- 带来更温暖、直观、有食欲的烹饪体验

## 安装

```bash
bun i
```

## 本地环境

复制或直接使用本地开发环境文件：

```bash
cp .env.example .env.dev
```

当前 B 端 IAM 基座默认使用以下配置：

```env
NUXT_ADMIN_JWT_SECRET=replace-with-strong-secret
NUXT_ADMIN_JWT_COOKIE_NAME=cookingo_admin_token
NUXT_ADMIN_JWT_TTL_DAYS=14
NUXT_ADMIN_JWT_RENEW_BEFORE_DAYS=7
NUXT_SQLITE_FILE_PATH=./data/cookingo.sqlite
```

## 初始化

首次启动前执行数据库迁移和基础 seed：

```bash
bun run db:migrate
bun run db:seed
```

说明：

- `db:migrate` 会创建 IAM 所需表结构
- `db:seed` 会幂等写入系统权限点和 `root` 系统角色
- 首个超级管理员不会通过 seed 自动创建，需走初始化接口

## 开发

```bash
bun dev
```

启动后，首次部署环境需要调用一次初始化接口创建超级管理员：

```bash
curl -X POST http://localhost:3000/api/admin/post/initAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "root",
    "displayName": "Super Admin",
    "password": "Strong!123"
  }'
```

初始化成功后即可继续使用后台登录接口：

```bash
POST /api/admin/post/login
```
