# Server Project Rules

## 后端接口返回格式

- 所有后端接口都必须返回统一结构：`{ code: number; data: unknown; msg: string }`
- 成功响应默认使用 `code: 0`
- 成功响应默认使用 `msg: "success"`，如有明确业务语义可覆盖
- 业务数据统一放在 `data` 字段中，不要直接返回裸字符串、裸数组或裸对象

示例：

```ts
{
  code: 0,
  data: "hello-world",
  msg: "success"
}
```

## 类型定义位置

- 后端接口相关的共享类型统一定义在 `shared/types/api.ts`
- 后端实现中如果需要引用统一接口返回类型，直接从 `~~/shared/types/api` 导入
- 不要在各个接口文件里重复定义响应结构类型

示例：

```ts
import type { ApiResponse } from "~~/shared/types/api"
```

## API 目录分组约定

- 后端接口统一放在 `server/api/admin` 下
- `admin` 下再按 HTTP 方法分组：`get`、`post`、`put`、`delete` 等
- 不要直接放在 `server/api` 根目录
- 接口方法变更时，文件同步移动到对应目录
- 文件名保持语义化、尽量简短

示例：

```text
server/api/
  admin/
    get/
      recipeList.ts
    post/
      createRecipe.ts
```

## API 命名与分页协议约定

- 后端 API 文件名采用动作风格命名，保持语义明确且简短
- 仅允许放在 `server/api/admin/<method>/*`，不要在其他目录定义后台接口
- 所有分页接口必须统一使用 `page`、`pageSize` 作为请求参数
- 所有分页接口必须统一返回 `data: { items, total, page, pageSize }`
- 不允许同项目内混用 `list/items/records` 等不同字段名

执行要求：

- 用户列表、角色列表、登录日志、审计日志以及后续新增分页接口都必须遵守统一分页协议
- 若历史接口与此协议不一致，改造时优先对齐此协议

## 服务端职责分层约定

- 后端实现必须优先按职责拆分，不要把 API 文件直接写成“读参数 + 查库 + 业务判断 + 日志审计”混合体
- API handler、repository、service、auth utility、admin utility 的职责边界必须清晰
- 若当前任务涉及后端结构设计或新增后端能力，优先复用以下语义目录，不要临时发明新的平级层级

目录语义如下：

- `server/api/admin/*`：接口入口层，只负责参数读取、调用鉴权、调用 service、返回统一响应
- `server/db/*`：数据库初始化、schema 聚合、migration/seed 支撑
- `server/repositories/admin/*`：数据访问层，只负责数据库读写与查询封装
- `server/services/admin/*`：业务规则层，负责状态变更、业务编排、审计和日志写入时机
- `server/utils/auth/*`：JWT、Cookie、当前用户恢复、通用鉴权辅助
- `server/utils/admin/*`：admin 域错误码、密码规则、admin 域通用帮助函数

执行要求：

- API handler 不要直接承载复杂业务规则
- API handler 不要直接编写复杂数据库查询
- repository 不要处理 HTTP 语义
- repository 不要直接承担权限判断
- service 不要直接依赖请求对象
- 登录日志应在认证相关 service 中写入
- 操作审计应在真正执行状态变更的 service 中写入

## SQLite / Cloudflare D1 兼容约束

- 当前项目后端若采用 SQLite 落地，必须默认以“未来可能迁移到 Cloudflare D1”为兼容前提
- 当前项目第一版运行时基线为 Bun + SQLite（`bun:sqlite`），不保证 Node 兼容
- 实现上必须规避 D1 不友好的能力

执行要求：

- 不要依赖存储过程、触发器、视图承载核心业务逻辑
- 不要依赖复杂事务嵌套或长事务
- 不要依赖 SQLite 私有扩展能力
- 不要依赖未来迁移到 D1 时难兼容的高级 SQL 特性
- 业务约束优先通过应用层逻辑、显式唯一约束和普通索引实现
- 初始化与 seed 逻辑由应用层实现，不要依赖数据库脚本系统
- 表结构演进必须通过正式 migration 管理，不要以运行时代码自动建表替代 migration

## 时间字段写入约定

- 后端时间字段统一由应用层写入 UTC ISO 字符串
- 推荐格式：`YYYY-MM-DDTHH:mm:ss.sssZ`（例如 `2026-03-29T08:30:00.000Z`）
- 不要混用本地时间字符串、秒级时间戳和毫秒时间戳

执行要求：

- `created_at`、`updated_at`、`last_login_at`、`password_changed_at` 等时间字段遵循统一格式
- 查询与排序逻辑应基于统一格式实现，避免时区歧义

## 错误码约定

- `code: 0` 表示请求成功
- 非 `0` 的 `code` 都表示请求失败
- 错误码必须是稳定的整数，不能使用字符串、布尔值或 `null`
- 同一类错误必须复用同一个错误码，不要在不同接口中随意定义
- `msg` 用于提供给前端和日志查看的可读错误说明
- `data` 在失败场景下默认返回 `null`，除非该错误明确需要附带额外信息
- admin 域错误码常量统一定义在 `server/utils/admin/error-codes.ts`
- handler、service、repository 中禁止写错误码数字字面量（魔法数字）

当前基础错误码分层如下：

- `0`: 成功
- `400xx`: 请求参数或请求格式错误
- `401xx`: 鉴权失败或登录态失效
- `403xx`: 无权限访问
- `404xx`: 请求的资源不存在
- `409xx`: 资源冲突或状态冲突
- `422xx`: 业务校验不通过
- `429xx`: 请求过于频繁或触发限流
- `500xx`: 服务端内部错误

示例：

```ts
{
  code: 40401,
  data: null,
  msg: "recipe not found"
}
```
