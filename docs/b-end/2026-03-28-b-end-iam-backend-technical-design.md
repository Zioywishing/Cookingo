# Cookingo B 端 IAM 后端技术方案（v2）

## 1. 目标

本方案用于定义 Cookingo 第一版 B 端 IAM 底座的后端技术实现方案。

本方案在已确认需求基础上，锁定第一版可落地实现的关键技术决策，包括：

- 后端数据层与迁移策略
- 认证与鉴权方案
- Bun + SQLite + Drizzle 的工程组织方式
- 后端目录职责、错误码、分页与时间格式规范
- 第一版测试边界与验收口径

本方案只定义后端技术方案，不展开前端实现细节。

## 2. 技术基线

第一版后端技术基线如下：

- 运行时：Bun 环境下的 Nuxt/Nitro Server（Bun-only，不保证 Node 兼容）
- 数据库：SQLite（基于 Bun 内置 `bun:sqlite`）
- 数据访问层：Drizzle ORM（Bun SQLite 适配）
- 登录态：JWT + HttpOnly Cookie
- 旧令牌失效机制：`tokenVersion`
- 表结构变更方式：Drizzle migration
- 基础数据初始化方式：幂等 seed

本方案明确不采用：

- 服务端会话表作为第一版主方案
- JWT + refresh token 双令牌模型
- 自动建表替代正式 migration
- 多租户与复杂权限范围设计

## 3. 新增依赖审查清单

### 3.1 必须新增依赖

- `drizzle-orm`（dependencies）
  - 用途：ORM 建模、查询构建、类型安全映射
  - 影响范围：运行时
- `jose`（dependencies）
  - 用途：JWT 签发与验签
  - 影响范围：运行时
- `zod`（dependencies）
  - 用途：后端请求参数与边界校验
  - 影响范围：运行时
- `drizzle-kit`（devDependencies）
  - 用途：migration 生成与执行
  - 影响范围：开发时

### 3.2 明确不新增依赖

- `better-sqlite3`
  - 不引入原因：第一版运行时锁定 Bun，SQLite 驱动统一使用 Bun 内置 `bun:sqlite`

### 3.3 依赖版本与治理建议

- 依赖版本建议使用兼容区间并在 lockfile 中固定实际安装版本
- 每次升级依赖时需补充回归验证：
  - migration 可执行
  - 登录与鉴权链路可用
  - API 统一返回结构不变

## 4. 数据层设计

### 4.1 数据库职责

数据库承载后台 IAM 与安全运维的全部核心数据。

第一版数据库覆盖的数据域包括：

- 后台用户
- 后台角色
- 页面权限点
- 用户角色关系
- 角色权限关系
- 登录日志
- 操作审计

第一版不建立独立会话表。

### 4.2 核心数据表

第一版使用以下数据表：

- `admin_user`
- `admin_role`
- `admin_permission`
- `admin_user_role`
- `admin_role_permission`
- `admin_login_log`
- `admin_audit_log`

### 4.3 表字段设计

#### `admin_user`

字段包括：

- `id`
- `username`
- `display_name`
- `password_hash`
- `status`
- `token_version`
- `last_login_at`
- `password_changed_at`
- `created_at`
- `updated_at`

约束包括：

- `username` 唯一
- `status` 仅允许 `active`、`disabled`
- `token_version` 为正整数

#### `admin_role`

字段包括：

- `id`
- `name`
- `code`
- `description`
- `is_system`
- `created_at`
- `updated_at`

约束包括：

- `code` 唯一

#### `admin_permission`

字段包括：

- `id`
- `code`
- `name`
- `group_key`
- `route_path`
- `description`
- `created_at`

约束包括：

- `code` 唯一

#### `admin_user_role`

字段包括：

- `id`
- `user_id`
- `role_id`
- `created_at`

约束包括：

- `user_id + role_id` 联合唯一

#### `admin_role_permission`

字段包括：

- `id`
- `role_id`
- `permission_id`
- `created_at`

约束包括：

- `role_id + permission_id` 联合唯一

#### `admin_login_log`

字段包括：

- `id`
- `username`
- `user_id`
- `result`
- `reason`
- `ip`
- `user_agent`
- `created_at`

#### `admin_audit_log`

字段包括：

- `id`
- `actor_user_id`
- `action`
- `target_type`
- `target_id`
- `summary`
- `created_at`

### 4.4 主键与时间字段策略

- 主键统一采用应用层生成的字符串 ID（`cuid2`）
- 时间字段统一由应用层写入 UTC ISO 字符串（例如 `2026-03-29T08:30:00.000Z`）
- 不依赖数据库方言特有自动更新时间机制

### 4.5 索引策略

第一版至少建立以下索引或唯一约束：

- `admin_user.username`
- `admin_role.code`
- `admin_permission.code`
- `admin_user_role(user_id, role_id)`
- `admin_role_permission(role_id, permission_id)`
- `admin_login_log.created_at`
- `admin_audit_log.created_at`

如有需要，可补充：

- `admin_login_log.username`
- `admin_audit_log.actor_user_id`

## 5. D1 兼容导向约束

第一版运行时为 Bun + SQLite，但实现上需规避 Cloudflare D1 不友好的能力，确保未来迁移成本可控。

约束如下：

- 不依赖存储过程、触发器、视图承载核心业务逻辑
- 不依赖复杂事务嵌套或长事务
- 不依赖 SQLite 私有扩展能力
- 不依赖未来迁移到 D1 时难兼容的高级 SQL 特性
- 业务约束优先通过应用层逻辑、显式唯一约束和普通索引实现
- 初始化与 seed 逻辑由应用层实现，不依赖数据库脚本系统

## 6. 认证与鉴权设计

### 6.1 登录方式

第一版采用：

- `username + password`
- 基础密码复杂度校验（最小 8 位，必须包含大小写字母、数字、特殊字符）
- HttpOnly Cookie 保存 JWT

### 6.2 JWT 载荷

JWT 载荷保持最小化，仅包含：

- `sub`
- `username`
- `tokenVersion`
- `iat`
- `exp`

JWT 中不保存角色列表与权限集合。

### 6.3 Cookie 策略

登录态只通过 HttpOnly Cookie 存储，要求如下：

- 显式设置 `SameSite=Lax`
- 显式设置 `Path`
- 显式设置过期时间
- 生产环境启用 `Secure`

### 6.4 鉴权流程

后台接口鉴权统一执行以下流程：

1. 从 Cookie 读取 JWT
2. 校验 JWT 签名与过期时间
3. 解析用户 ID 与 `tokenVersion`
4. 查询用户当前记录
5. 校验用户存在且状态为 `active`
6. 校验数据库 `tokenVersion` 与 JWT 中一致
7. 查询用户最终权限集合
8. 按接口要求的后台权限编码做授权判断

### 6.5 `tokenVersion` 规则

`tokenVersion` 用于实现旧令牌整体失效。

以下行为必须递增 `tokenVersion`：

- 管理员重置用户密码
- 用户修改自己的密码
- 用户被禁用

用户创建时 `tokenVersion` 初始值为正整数起始值。

### 6.6 会话生命周期

- JWT/Cookie 有效期：14 天
- 滑动续期：当剩余有效期小于 7 天时自动续签并刷新 Cookie

### 6.7 退出登录

第一版退出登录通过清除登录 Cookie 完成。

第一版不建立 JWT 黑名单表，也不在普通退出场景中额外递增 `tokenVersion`。

## 7. 初始化、迁移与 seed 策略

### 7.1 migration

所有表结构变更统一通过 Drizzle migration 管理。

禁止使用运行时代码自动建表替代 migration。

### 7.2 seed

第一版采用“幂等 seed”策略。

适合走 seed 的内容包括：

- 系统内置权限点
- 系统保留角色的基础数据

seed 必须可重复执行，重复执行不得产生重复数据。

### 7.3 超级管理员初始化

首个超级管理员不通过 seed 自动创建，而通过初始化接口完成。

规则如下：

- 初始化接口常驻可访问
- 当系统中不存在任何后台用户时，允许初始化
- 一旦已存在后台用户，初始化接口返回 `40901`

### 7.4 启动策略

应用启动时可执行一次基础数据幂等检查，确保权限点等系统必需数据存在。

启动逻辑不负责偷偷创建超级管理员账号。

## 8. 服务端职责分层

### 8.1 目标

服务端必须避免“接口文件直接查库并混入全部业务规则”的实现方式。

后端职责边界必须清晰，便于后续维护与测试。

### 8.2 目录分层

- `server/api/admin/*`
- `server/db/*`
- `server/repositories/admin/*`
- `server/services/admin/*`
- `server/utils/auth/*`
- `server/utils/admin/*`

### 8.3 各层职责

#### API Handler 层

负责：

- 读取请求参数
- 调用认证与授权能力
- 调用对应 service
- 返回统一 `ApiResponse`

不负责：

- 直接承载复杂业务规则
- 直接编写复杂数据库查询

#### Repository 层

负责：

- 数据库读写
- 查询封装
- 单表或关系表访问

不负责：

- HTTP 语义
- 权限判断
- 高层业务编排

#### Service 层

负责：

- 业务规则与状态变更
- 组合多个 repository 完成业务流程
- 审计记录与登录日志写入时机控制

不负责：

- 直接处理请求对象
- 直接依赖页面输入格式

#### Auth Utility 层

负责：

- JWT 签发与解析
- Cookie 读写
- 当前登录用户恢复
- 通用鉴权与授权辅助

#### Admin Utility 层

负责：

- admin 域错误码常量
- 密码复杂度校验
- 密码摘要与校验能力封装
- admin 域通用帮助函数

### 8.4 审计与日志写入位置

- 登录日志应在认证相关 service 中写入
- 操作审计应在真正执行状态变更的 service 中写入
- 不应让 API handler 分散编写日志与审计逻辑

### 8.5 超级管理员兜底策略

- `root` 永远拥有全量后台权限
- 即使 RBAC 配置被误改，`root` 仍可进入系统并修复配置

## 9. 接口组织与命名约束

后台接口统一收敛到：

- `server/api/admin/get`
- `server/api/admin/post`
- `server/api/admin/put`
- `server/api/admin/delete`

接口命名要求：

- 动作风格命名
- 语义明确
- 文件名简短
- 与能力域对应

后台接口必须统一返回：

`{ code, data, msg }`

错误场景下默认：

- `data: null`
- `code` 使用稳定整数错误码

## 10. 统一分页协议

所有分页接口必须统一使用以下协议：

- 请求参数：`page`、`pageSize`
- 响应结构：`data: { items, total, page, pageSize }`

该协议适用于：

- 用户列表
- 角色列表
- 登录日志列表
- 操作审计列表
- 其他后续新增分页接口

## 11. Admin 域错误码分配

admin 域预留以下稳定错误码：

- `40101` 未登录或登录态无效
- `40102` 用户名或密码错误
- `40103` 账号已被禁用
- `40301` 无后台访问权限
- `40302` 无目标页面权限
- `40401` 用户不存在
- `40402` 角色不存在
- `40403` 权限点不存在
- `40901` 系统已完成初始化
- `40902` 用户名已存在
- `40903` 角色编码已存在
- `40904` 角色仍被使用，无法删除
- `42201` 密码复杂度不符合要求
- `42202` 请求参数不合法
- `50001` 后台内部错误

执行约束：

- 错误码常量集中定义在 `server/utils/admin/error-codes.ts`
- handler、service、repository 禁止写错误码数字字面量
- 同类错误必须复用同一错误码

## 12. 测试策略

后端测试至少拆成三层：

- repository 层测试
- service 层测试
- API 层关键路径测试

### 12.1 repository 层

重点验证：

- 唯一约束
- 关系查询
- 列表与详情查询口径

### 12.2 service 层

重点验证：

- 初始化超级管理员只允许一次
- 登录成功与失败处理
- 禁用用户后旧 JWT 失效
- 重置密码后旧 JWT 失效
- 用户权限集合正确汇总
- 已绑定用户的角色不可删除
- 关键操作写入审计
- 登录成功与失败写入登录日志
- 滑动续期触发条件正确（剩余有效期 < 7 天）

### 12.3 API 层

重点验证：

- 统一 `ApiResponse` 结构
- 未登录返回稳定 `401xx`
- 无权限返回稳定 `403xx`
- 关键接口鉴权路径正确
- 分页接口统一返回 `{ items, total, page, pageSize }`

## 13. 非目标

以下内容不纳入本次后端技术方案范围：

- 多租户数据库模型
- 动作级与数据范围级权限
- refresh token 体系
- 独立认证服务拆分
- 审计 diff 持久化
- 复杂报表与导出系统
- 登录失败锁定策略（第一版仅记录日志）

## 14. 验收标准

满足以下条件时，可认为第一版后端技术方案落地完成：

- Bun + SQLite（`bun:sqlite`）+ Drizzle 能承载后台 IAM 主要数据域
- migration 与幂等 seed 方案明确且可执行
- JWT + HttpOnly Cookie 鉴权流程明确
- 14 天有效期 + 剩余不足 7 天自动续签机制明确
- `tokenVersion` 旧令牌失效机制明确
- 服务端职责分层明确
- D1 友好约束明确
- admin 域错误码、统一分页协议、时间格式规范、测试边界明确
