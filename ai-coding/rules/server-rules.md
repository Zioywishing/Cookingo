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

## 错误码约定

- `code: 0` 表示请求成功
- 非 `0` 的 `code` 都表示请求失败
- 错误码必须是稳定的整数，不能使用字符串、布尔值或 `null`
- 同一类错误必须复用同一个错误码，不要在不同接口中随意定义
- `msg` 用于提供给前端和日志查看的可读错误说明
- `data` 在失败场景下默认返回 `null`，除非该错误明确需要附带额外信息

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
