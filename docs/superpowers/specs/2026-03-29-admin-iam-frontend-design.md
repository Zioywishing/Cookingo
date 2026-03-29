# Cookingo Admin IAM 一期前端技术方案

## 1. 文档目标

本文档用于定义 Cookingo Admin IAM 一期的前端实现方案。

方案基于以下输入共同收敛：

- `docs/b-end/2026-03-28-b-end-iam-foundation-design.md`
- `docs/b-end/2026-03-28-b-end-iam-backend-technical-design.md`
- 当前仓库内已落地的真实后端接口与共享类型

本文档只覆盖 IAM 一期前端，不扩展到后续业务后台模块。

## 2. 范围与非目标

### 2.1 本期范围

本期页面范围包含：

- `/admin/init`
- `/admin/login`
- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/roles`
- `/admin/roles/[id]`
- `/admin/login-logs`
- `/admin/audit-logs`

本期能力范围包含：

- 系统初始化状态判断与首个管理员初始化
- 登录、退出、当前会话恢复
- 基于权限的后台菜单展示
- 基于权限的页面访问拦截
- 用户管理
- 角色与权限管理
- 登录日志查询
- 操作审计查询
- 桌面端与移动端兼容后台布局

### 2.2 非目标

本期不包含：

- 菜谱、分类、审核、配置等业务后台模块
- 动作级权限、字段级权限、数据范围权限
- 搜索、筛选、导出、批量操作
- 后台统计大盘
- 初始化成功后的自动登录
- 用户名回填型审计日志增强

## 3. 真实后端基线

### 3.1 接口访问前缀

真实后端接口通过 Nuxt/Nitro 暴露为 `/api/admin/...`，前端请求应统一使用该前缀。

### 3.2 统一响应协议

后端统一返回：

```ts
interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg: string
}
```

分页接口统一返回：

```ts
interface ApiPageData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

### 3.3 已存在真实接口

认证与会话：

- `POST /api/admin/post/initAdmin`
- `POST /api/admin/post/login`
- `POST /api/admin/post/logout`
- `GET /api/admin/get/currentUser`

用户管理：

- `GET /api/admin/get/users`
- `GET /api/admin/get/userDetail`
- `POST /api/admin/post/users`
- `PUT /api/admin/put/user`
- `PUT /api/admin/put/userRoles`
- `PUT /api/admin/put/userStatus`
- `PUT /api/admin/put/userPassword`
- `PUT /api/admin/put/changePassword`

角色与权限：

- `GET /api/admin/get/roles`
- `GET /api/admin/get/roleDetail`
- `GET /api/admin/get/permissions`
- `POST /api/admin/post/roles`
- `PUT /api/admin/put/role`
- `DELETE /api/admin/delete/role`

日志：

- `GET /api/admin/get/loginLogs`
- `GET /api/admin/get/auditLogs`

### 3.4 建议补充接口

为支持 `/admin/init` 页面，需要新增：

- `GET /api/admin/get/initStatus`

返回结构：

```ts
{
  code: 0,
  data: {
    initialized: boolean
  },
  msg: "success"
}
```

设计约束：

- 放在 `server/api/admin/get/initStatus.ts`
- 不要求登录态
- 不要求权限
- service 层只判断当前后台用户数是否大于 0

## 4. 前端必须适配的真实差异

前端方案必须按真实实现做隔离，不能直接假设后端已经输出理想 DTO。

### 4.1 用户对象存在敏感字段泄漏风险

当前以下接口返回的用户对象包含原始表字段：

- `POST /api/admin/post/initAdmin`
- `POST /api/admin/post/login`
- `POST /api/admin/post/users`
- `GET /api/admin/get/currentUser`

这些对象可能带有以下前端不应直接消费的字段：

- `passwordHash`
- `tokenVersion`

前端必须通过 adapter 丢弃敏感字段，只向页面暴露安全视图模型。

### 4.2 角色列表没有使用人数

当前角色列表接口只返回角色基础字段，不返回“已绑定用户数”，因此角色列表页不展示使用人数。

### 4.3 审计日志没有操作者用户名

当前审计日志仅返回 `actorUserId`，不返回操作者用户名，因此一期直接展示用户 ID，不做用户名反查。

### 4.4 角色编码不可编辑

当前 `PUT /api/admin/put/role` 不支持更新 `code`，因此角色 `code` 在前端视为创建后只读。

## 5. 目录与文件组织

遵循当前项目 Nuxt 4 `app/` 分层，不新增非约定目录。

建议新增或调整如下文件：

- `app/pages/admin/init.vue`
- `app/pages/admin/login.vue`
- `app/pages/admin/index.vue`
- `app/pages/admin/users.vue`
- `app/pages/admin/users/[id].vue`
- `app/pages/admin/roles.vue`
- `app/pages/admin/roles/[id].vue`
- `app/pages/admin/login-logs.vue`
- `app/pages/admin/audit-logs.vue`
- `app/layouts/admin.vue`
- `app/middleware/admin-init.ts`
- `app/middleware/admin-auth.ts`
- `app/composables/useAdminInitStatus.ts`
- `app/composables/useAdminSession.ts`
- `app/composables/useAdminUsers.ts`
- `app/composables/useAdminRoles.ts`
- `app/composables/useAdminLogs.ts`
- `app/components/admin/shell/AdminTopbar.vue`
- `app/components/admin/shell/AdminSidebar.vue`
- `app/components/admin/shell/AdminSidebarNav.vue`
- `app/components/admin/shell/AdminMobileSidebar.vue`
- `app/components/admin/shell/AdminPageContainer.vue`
- `app/components/admin/shell/AdminPageHeader.vue`
- `app/components/admin/user/AdminUserCreateDialog.vue`
- `app/components/admin/user/AdminUserProfileCard.vue`
- `app/components/admin/user/AdminUserRolePanel.vue`
- `app/components/admin/user/AdminUserSecurityPanel.vue`
- `app/components/admin/user/AdminUserTable.vue`
- `app/components/admin/role/AdminRoleCreateDialog.vue`
- `app/components/admin/role/AdminRoleForm.vue`
- `app/components/admin/role/AdminRoleTable.vue`
- `app/components/admin/role/AdminPermissionGroup.vue`
- `app/components/admin/log/AdminLoginLogTable.vue`
- `app/components/admin/log/AdminAuditLogTable.vue`

共享类型建议扩展在：

- `shared/types/admin.ts`

## 6. 核心状态设计

### 6.1 初始化状态

新增 `useAdminInitStatus()`，只负责判断系统是否已初始化。

状态：

- `initialized: boolean | null`
- `loaded: boolean`
- `pending: boolean`

方法：

- `ensureLoaded(force?: boolean)`
- `markInitialized()`
- `clearFalseCache()`

缓存策略：

- 首次访问 `/admin/*` 时读取 `GET /api/admin/get/initStatus`
- 一旦返回 `initialized = true`，立刻写入强缓存
- 强缓存通过 `useCookie("admin-init-ready")` 与 `useState` 共同维护
- 命中 `true` 后后续后台路由切换不再重复请求该接口
- `initialized = false` 不做长期强缓存，只保留当前运行态
- 初始化成功后前端直接执行 `markInitialized()`，切换状态并跳转登录页

采用该策略的原因：

- `true` 对系统而言是不可逆状态，适合强缓存
- `false` 是过渡状态，不应长期缓存

### 6.2 会话状态

新增 `useAdminSession()`，只负责当前登录用户与权限集合。

状态：

- `user: AdminSessionUser | null`
- `permissions: AdminPermissionCode[]`
- `roleCodes: string[]`
- `loaded: boolean`
- `pending: boolean`

方法：

- `ensureLoaded()`
- `refresh()`
- `login(username, password)`
- `logout()`
- `clear()`
- `hasPermission(code)`
- `resolveHomePath()`

会话状态不负责初始化判断，避免两条流程相互污染。

## 7. 路由守卫设计

### 7.1 `admin-init`

`app/middleware/admin-init.ts` 用于所有 `/admin/*` 页面。

规则：

- 非 `/admin/*` 路由不处理
- 若系统未初始化：
  - `/admin/init` 放行
  - 其他 `/admin/*` 一律跳转 `/admin/init`
- 若系统已初始化：
  - `/admin/init` 跳转 `/admin/login`
  - 其他后台页面继续放行

### 7.2 `admin-auth`

`app/middleware/admin-auth.ts` 只用于受保护页面，不用于 `/admin/init`、`/admin/login`。

规则：

- 调用 `useAdminSession().ensureLoaded()`
- 未登录时跳转 `/admin/login?redirect=当前路径`
- 已登录但无目标页面权限时，跳转 `resolveHomePath()`
- 若用户没有任何后台页面权限，清空会话并跳回登录页

### 7.3 页面 meta 约定

受保护页面统一使用：

```ts
definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Users,
})
```

公共页面：

```ts
definePageMeta({
  layout: "admin",
  middleware: ["admin-init"],
})
```

## 8. Layout 与导航设计

### 8.1 总体结构

后台统一使用 `app/layouts/admin.vue`，壳层结构固定为：

- 顶部栏
- 侧边栏
- 主内容区

页面标题与用户区归属顶部栏，导航归属侧边栏，页面具体内容归属主区域。

### 8.2 桌面端布局

桌面端结构：

- 左侧固定宽度侧边栏
- 右侧为顶部栏与主区域
- 主区域滚动，不制造多重滚动容器

建议侧边栏宽度：

- `240px` 到 `264px`

### 8.3 移动端布局

移动端结构：

- 侧边栏默认隐藏
- 顶部栏左侧显示菜单按钮
- 点击按钮后弹出覆盖式导航抽层
- 抽层不占据主区域宽度

行为约束：

- 抽层使用 `position: fixed`
- 打开时带半透明遮罩
- 背景滚动锁定
- 点击遮罩、切换路由、按 `Esc` 都关闭抽层

建议抽层宽度：

- `min(82vw, 320px)`

### 8.4 顶部栏内容

顶部栏负责：

- 当前页面标题
- 可选副标题
- 当前用户展示名
- 当前用户名
- 退出按钮
- 移动端菜单按钮

窄屏下用户名可折叠，仅保留展示名或简版身份信息。

### 8.5 菜单生成

后台菜单不依赖 `/api/admin/get/permissions` 动态生成，而是以前端静态配置为主，再根据当前用户权限做过滤。

原因：

- `/api/admin/get/permissions` 本身要求 `admin.roles` 权限
- 全局导航不应依赖单个页面权限接口

一期固定菜单：

- `/admin`
- `/admin/users`
- `/admin/roles`
- `/admin/login-logs`
- `/admin/audit-logs`

## 9. API Adapter 与前端类型设计

### 9.1 适配原则

页面和组件不直接消费后端原始响应，统一消费前端安全视图模型。

建议在 composable 内部收敛 adapter：

- `mapAdminSessionResponse`
- `mapAdminUserListItem`
- `mapAdminUserDetail`
- `mapAdminRoleListItem`
- `mapAdminRoleDetail`
- `mapAdminLoginLogItem`
- `mapAdminAuditLogItem`

### 9.2 共享类型建议

建议在 `shared/types/admin.ts` 新增或扩展：

- `AdminSessionUser`
- `AdminSessionState`
- `AdminUserListItem`
- `AdminUserDetail`
- `AdminRoleListItem`
- `AdminRoleDetail`
- `AdminLoginLogItem`
- `AdminAuditLogItem`

这些类型仅暴露前端所需字段，不暴露后端原始数据库字段。

### 9.3 时间字段策略

所有时间字段在前端保留原始 UTC ISO 字符串，页面只做展示格式化，不在前端做业务推导。

后台页展示时间统一建议按 `UTC+8` 渲染，并在页面或全局说明中显式收敛时区口径，避免 SSR 与客户端口径不一致。

## 10. 页面设计

### 10.1 `/admin/init`

用途：

- 系统未初始化时创建首个超级管理员

表单字段：

- `username`
- `displayName`
- `password`
- `confirmPassword`

页面行为：

1. 进入页面先执行 `useAdminInitStatus().ensureLoaded()`
2. 若已初始化，跳转 `/admin/login`
3. 提交调用 `POST /api/admin/post/initAdmin`
4. 成功后执行 `markInitialized()`
5. 成功提示后跳转 `/admin/login`
6. 若收到 `40901`，说明系统已被其他人初始化，切换为已初始化态并跳登录页
7. 若收到 `42201`，在密码区域展示复杂度校验错误

不自动登录，保持初始化与登录两条流程解耦。

### 10.2 `/admin/login`

用途：

- 已初始化系统的后台登录入口

表单字段：

- `username`
- `password`

页面行为：

1. 先经过 `admin-init`
2. 若已有会话，直接跳转 `resolveHomePath()`
3. 提交时调用 `login()`
4. 成功后优先跳转 `redirect`
5. 无 `redirect` 时跳转 `resolveHomePath()`

### 10.3 `/admin`

用途：

- IAM 一期后台首页与概览占位页

展示内容：

- 当前登录用户信息
- 当前角色摘要
- 权限数量
- 可访问模块快捷入口
- 一期后台说明

不做统计图表，不伪造业务大盘。

### 10.4 `/admin/users`

数据来源：

- `GET /api/admin/get/users?page=&pageSize=`

表格字段：

- 用户名
- 显示名
- 状态
- 角色
- 最近登录时间
- 创建时间
- 操作

页面行为：

- 新建用户走弹窗或抽屉
- 列表操作只保留“查看详情”
- 不在列表直接做禁用和重置密码，降低误操作风险

创建用户表单字段：

- `username`
- `displayName`
- `password`
- `confirmPassword`

### 10.5 `/admin/users/[id]`

数据来源：

- `GET /api/admin/get/userDetail?id=...`
- `GET /api/admin/get/roles?page=1&pageSize=100`

页面区块：

- 基础信息区
- 角色配置区
- 安全操作区

基础信息区：

- 用户名只读
- 显示名可编辑
- 状态只读展示
- 最近登录时间只读
- 创建时间只读

角色配置区：

- 使用多选角色列表
- 保存时调用 `PUT /api/admin/put/userRoles`

安全操作区：

- 启用 / 禁用
- 重置密码
- 高风险操作使用确认弹层

特殊要求：

- 若管理员禁用自己或重置自己的密码，前端需要接受当前会话失效并跳转登录页

### 10.6 `/admin/roles`

数据来源：

- `GET /api/admin/get/roles?page=&pageSize=`

表格字段：

- 角色名
- 编码
- 描述
- 系统角色
- 创建时间
- 操作

页面行为：

- 创建角色使用弹窗
- 删除角色在列表执行
- 一期不展示使用人数

创建角色字段：

- `name`
- `code`
- `description`
- `permissionCodes`

### 10.7 `/admin/roles/[id]`

数据来源：

- `GET /api/admin/get/roleDetail?id=...`
- `GET /api/admin/get/permissions`

页面区块：

- 基础信息区
- 权限配置区

规则：

- `code` 只读
- `name` 可编辑
- `description` 可编辑
- `isSystem` 只读展示
- 权限按 `groupKey` 分组展示

### 10.8 `/admin/login-logs`

数据来源：

- `GET /api/admin/get/loginLogs?page=&pageSize=`

表格字段：

- 用户名
- 结果
- 原因
- IP
- User-Agent
- 时间

展示规则：

- `result` 显示成功 / 失败状态标签
- `reason` 对 `bad_credentials`、`disabled`、`null` 做中文映射
- `userAgent` 长文本省略显示

### 10.9 `/admin/audit-logs`

数据来源：

- `GET /api/admin/get/auditLogs?page=&pageSize=`

表格字段：

- 操作者 ID
- 动作
- 目标类型
- 目标 ID
- 摘要
- 时间

展示规则：

- `action` 直接展示原始动作编码
- `summary` 作为主要可读信息
- 一期不做用户名回填

## 11. 错误处理方案

错误处理建议在 composable 中统一收口，页面只消费整理后的错误状态。

### 11.1 全局会话级

- `40101`：登录态无效

处理：

- 清空会话
- 保留目标路径
- 跳转 `/admin/login?redirect=...`

### 11.2 页面跳转级

- `40302`：无目标页面权限
- `40401`：用户不存在
- `40402`：角色不存在

处理：

- `40302`：跳转首个可访问页面
- `40401`：展示用户不存在页态
- `40402`：展示角色不存在页态

### 11.3 表单提示级

- `40102`：用户名或密码错误
- `40103`：账号已禁用
- `40901`：系统已初始化
- `40902`：用户名已存在
- `40903`：角色编码已存在
- `40904`：角色不可删除
- `42201`：密码复杂度不符合要求
- `42202`：请求参数不合法
- `50001`：后台内部错误

## 12. 交互细节约束

为了控制一期复杂度，交互上做以下约束：

- 分页接口采用一页一请求
- 不做筛选器与搜索框
- 新建用户与新建角色使用弹窗或抽屉
- 用户详情与角色详情使用独立路由页面
- 危险操作统一二次确认
- 提交按钮统一带 pending 态
- 表格在移动端允许横向滚动，不强行压缩所有列

## 13. 测试建议

### 13.1 路由与状态

至少验证：

- 未初始化访问 `/admin/login` 会跳 `/admin/init`
- 已初始化访问 `/admin/init` 会跳 `/admin/login`
- 未登录访问受保护页会跳登录页
- 已登录但无权限访问目标页会跳首个可访问页

### 13.2 关键交互

至少验证：

- 初始化成功后写入强缓存并跳转登录页
- 登录成功后恢复当前用户和菜单
- 退出后清空会话
- 用户详情和角色详情保存后能刷新页面数据
- 禁用自己或重置自己密码后会被踢回登录页

### 13.3 移动端

至少验证：

- 菜单按钮能打开抽层
- 抽层不会挤压主内容宽度
- 切换路由后抽层自动关闭
- 点击遮罩可关闭抽层

## 14. 实施顺序

建议按以下顺序落地：

1. 新增 `GET /api/admin/get/initStatus`
2. 扩展 `shared/types/admin.ts`
3. 实现 `useAdminInitStatus`
4. 实现 `useAdminSession`
5. 实现 `admin-init` 与 `admin-auth`
6. 重构 `app/layouts/admin.vue`
7. 实现 `/admin/init` 与 `/admin/login`
8. 实现 `/admin` 首页
9. 实现用户列表与用户详情
10. 实现角色列表与角色详情
11. 实现登录日志与审计日志
12. 最后统一补错误态、空态、加载态与移动端细节

## 15. 需要同步更新的现有文档

由于本次已确认一期需要包含初始化页，因此现有设计文档后续应同步修正：

- 信息架构新增 `/admin/init`
- 接口范围新增 `GET /api/admin/get/initStatus`

否则一期前端范围、后端补充接口与文档定义会产生偏差。
