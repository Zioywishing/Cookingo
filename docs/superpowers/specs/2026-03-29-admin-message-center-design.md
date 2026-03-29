# Admin Message Center Design

## 1. Goal

为 `app/layouts/admin.vue` 下的所有子页面提供统一的消息提示机制。

目标包括：

- 所有请求错误统一以顶部居中弹出消息提示，不再依赖页面内联红字
- 所有“保存成功 / 创建成功 / 删除成功 / 更新成功”等动作结果统一以弹出消息提示
- 后台子页面首屏加载失败也统一通过该机制提示
- 消息支持多条堆叠显示，默认 2 秒自动消失

本设计只覆盖 `admin` 布局子树，不扩展到站点其他前端区域。

## 2. Scope

### 2.1 In Scope

- `/admin/login`
- `/admin/init`
- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/roles`
- `/admin/roles/[id]`
- `/admin/login-logs`
- `/admin/audit-logs`
- 这些页面内的创建、保存、删除、状态修改、重置密码、退出登录等动作反馈
- 这些页面依赖的首屏 `useAsyncData` 加载失败反馈
- admin 子树内可捕获的普通运行时错误反馈

### 2.2 Out of Scope

- 非 `admin` 布局页面的消息提示统一
- 服务器在布局挂载前发生的致命 SSR 错误
- 字段级校验 UI 重构
- 后端响应协议调整

## 3. UX Rules

消息交互规则固定如下：

- 消息位置：视口顶部中间
- 消息形态：类似 `el-message` 的浮层卡片
- 堆叠方式：支持多条同时存在，垂直堆叠
- 自动关闭：默认 2000ms
- 手动关闭：支持关闭按钮
- 动画：轻微向下位移淡入，向上收起淡出
- 层级：必须高于当前 admin 弹窗层

消息类型至少包含：

- `success`
- `error`
- `info`

本期不引入确认型 toast、常驻通知、操作撤销、进度型消息。

## 4. Current Problems

当前 admin 错误反馈存在以下问题：

- 登录页和初始化页在卡片内通过 `<p class="error">` 展示错误
- 用户创建和角色创建在弹窗底部通过 `<p class="error">` 展示错误
- 用户详情、角色详情中的保存类动作没有统一成功提示
- 多数页面对 `$fetch` 抛出的请求异常没有统一兜底
- 首屏 `useAsyncData` 加载失败缺少统一的用户可见反馈

这导致 admin 子树内的错误反馈形态不一致，也无法满足“所有成功/失败都走统一弹出提示”的需求。

## 5. Recommended Architecture

推荐采用“布局挂载单例消息中心 + admin 专用请求反馈包装 composable”的两层结构。

### 5.1 Message Center Layer

新增一个 admin 专用消息中心，负责：

- 管理消息队列
- 渲染顶部居中堆叠消息
- 定时自动移除
- 管理手动关闭
- 控制入场 / 离场动画

该能力通过 `useState` 存储在 admin 前端运行态中，`admin` 布局只挂载一次渲染组件。

### 5.2 Request Feedback Layer

新增一个 admin 请求反馈包装 composable，负责：

- 统一处理 `ApiResponse.code !== 0` 的业务失败提示
- 统一处理 `$fetch` 抛出的请求异常提示
- 统一触发成功提示
- 为页面动作请求和首屏加载请求提供一致入口

这样 API composable 仍保持“数据访问层”职责，UI 反馈规则不下沉到 `useAdminUsers`、`useAdminRoles`、`useAdminSession`、`useAdminLogs` 内部。

## 6. File Design

### 6.1 New Files

- `app/composables/useAdminMessageCenter.ts`
- `app/composables/useAdminRequestFeedback.ts`
- `app/components/admin/shell/AdminMessageCenter.vue`

### 6.2 Modified Files

- `app/layouts/admin.vue`
- `app/pages/admin/login.vue`
- `app/pages/admin/init.vue`
- `app/pages/admin/users/index.vue`
- `app/pages/admin/users/[id].vue`
- `app/pages/admin/roles/index.vue`
- `app/pages/admin/roles/[id].vue`
- `app/pages/admin/login-logs.vue`
- `app/pages/admin/audit-logs.vue`
- `app/components/admin/user/AdminUserCreateDialog.vue`
- `app/components/admin/role/AdminRoleCreateDialog.vue`

如实现过程中需要共享类型，可补充：

- `shared/types/admin-message.ts`

仅在发现前端跨文件类型已明显重复时新增，不为这次任务额外创造无收益层级。

## 7. State Model

`useAdminMessageCenter.ts` 维护统一消息队列。

建议状态结构：

```ts
type AdminMessageType = "success" | "error" | "info"

interface AdminMessageItem {
  id: string
  type: AdminMessageType
  message: string
  duration: number
}
```

建议暴露方法：

- `messages`
- `show(message, options?)`
- `success(message, options?)`
- `error(message, options?)`
- `info(message, options?)`
- `remove(id)`
- `clear()`

实现约束：

- 默认时长为 `2000`
- 每条消息独立计时
- 组件卸载或页面切换不主动清空，避免跳转瞬间消息丢失
- 通过 `useState` 保证同一 admin 布局子树中的页面共用同一个消息源

## 8. Component Design

`AdminMessageCenter.vue` 负责纯展示。

设计要求：

- 使用 `Teleport` 渲染到 `body`
- 使用 `TransitionGroup` 管理多条动画
- 外层容器固定在顶部中间
- 单条消息卡片提供 icon 区、文本区、关闭按钮
- `error`、`success`、`info` 使用不同边框/背景/文字色，但遵循现有 admin 视觉变量
- `z-index` 高于 `AdminDialog.vue` 的 `60`
- 宽度响应式收敛，移动端不超出安全区域

组件不直接发请求，不解析接口响应，只消费 `useAdminMessageCenter()` 暴露的状态。

## 9. Request Feedback API

`useAdminRequestFeedback.ts` 负责封装常见请求流程。

建议提供以下 API：

### 9.1 Primitive Methods

- `showSuccess(message: string)`
- `showError(message: string)`

用于纯前端校验或页面内非请求型提示，例如“密码不一致”。

### 9.2 Response Handler

```ts
handleResponse(response, {
  successMessage,
  errorMessage,
  silentSuccess,
})
```

行为：

- `response.code === 0` 时，根据配置决定是否弹成功消息
- `response.code !== 0` 时优先弹 `response.msg`，没有时退回 `errorMessage`
- 返回布尔值或规范化结果，方便页面决定是否继续 `refresh()`、关闭弹窗或跳转

### 9.3 Async Wrapper

```ts
run(task, {
  successMessage,
  errorMessage,
  silentSuccess,
})
```

行为：

- 包住动作类请求的 `try/catch`
- 处理抛出的网络错误和运行时错误
- 返回原始结果或 `null`

### 9.4 Load Wrapper

```ts
load(task, {
  errorMessage,
  fallback,
})
```

行为：

- 用于 `useAsyncData` 的加载函数
- 请求成功时返回真实数据
- 请求失败时弹错误消息，并返回 `fallback`

这样可以避免页面首屏因为请求失败直接崩溃到内置错误页，同时满足“也包含请求错误”的要求。

## 10. Integration Rules

### 10.1 Layout

在 `app/layouts/admin.vue` 中：

- 挂载一次 `AdminShellAdminMessageCenter`
- 在布局范围内通过 `onErrorCaptured` 捕获可达的组件运行时错误
- 捕获后弹出通用错误提示，并保留 `console.error` 以便调试

通用提示文案建议为：

- `页面执行出现异常，请稍后重试`

不建议在这里吞掉所有异常栈，只做用户可见反馈补充。

### 10.2 Pages

页面中所有动作类请求统一改成：

- 先设置本地 `pending`
- 再通过 `run()` 或 `handleResponse()` 执行请求
- 成功后执行关闭弹窗、跳转、刷新列表等后续动作

不再保留页面内联 `errorMessage` 渲染。

### 10.3 Domain Composables

以下 composable 保持数据访问职责，不直接调用消息中心：

- `app/composables/useAdminSession.ts`
- `app/composables/useAdminUsers.ts`
- `app/composables/useAdminRoles.ts`
- `app/composables/useAdminLogs.ts`
- `app/composables/useAdminInitStatus.ts`

理由：

- 避免 API 层与 UI 表现强耦合
- 同一个 API 未来可在不同页面采用不同成功文案
- 页面更容易控制“是否刷新、是否跳转、是否静默成功”

## 11. Page-Level Migration Plan

### 11.1 Auth Pages

`/admin/login` 与 `/admin/init`：

- 移除 `<p class="error">`
- 密码不一致等前端校验改为 `showError()`
- 接口失败改为弹出错误消息
- 初始化成功不额外常驻说明，使用短成功消息后跳转登录页
- 登录成功不弹成功消息，直接跳转后台首页，减少噪音

### 11.2 Create Dialogs

用户创建与角色创建：

- 移除 `errorMessage` props
- 移除弹窗底部红字
- 创建失败直接弹错误消息
- 创建成功弹成功消息，再关闭弹窗并刷新列表

### 11.3 Detail Pages

用户详情与角色详情：

- 更新资料、更新角色、修改状态、重置密码、保存角色全部增加成功消息
- 请求异常统一增加失败消息

### 11.4 List / Log Pages

用户列表、角色列表、登录日志、审计日志：

- `useAsyncData` 加载失败时弹错误消息
- 页面继续渲染空列表或空态，不抛整页异常

## 12. Message Copy Rules

成功文案建议显式、短句、动作导向。

例如：

- `用户创建成功`
- `角色创建成功`
- `用户信息保存成功`
- `角色权限保存成功`
- `用户状态更新成功`
- `密码重置成功`
- `退出登录成功`

失败文案优先级：

1. 后端 `response.msg`
2. 页面传入的动作级兜底文案
3. 通用文案，如 `请求失败，请稍后重试`

首屏加载兜底文案应按页面语义命名，例如：

- `加载用户列表失败`
- `加载角色详情失败`
- `加载操作审计失败`

## 13. Risks and Constraints

### 13.1 Runtime Error Boundary Limit

布局内的 `onErrorCaptured` 只能覆盖组件树挂载后的可捕获运行时错误。

以下情况仍可能走 Nuxt 原生错误链路：

- 布局挂载前的 SSR 致命异常
- 路由初始化阶段直接终止渲染的错误

这类错误不作为本方案必须覆盖的对象。

### 13.2 Duplicate Message Risk

如果页面同时手动处理 `response.code !== 0`，又在包装器内部再次处理，会造成重复弹消息。

实施时必须统一入口，禁止页面和包装器双重提示同一次失败。

### 13.3 AsyncData Fallback Consistency

首屏加载失败后返回空数据，需要保证现有表格组件、详情组件都能安全消费空值或 `null`，不能因 fallback 结构不匹配引入新的渲染错误。

## 14. Testing Strategy

至少覆盖以下验证：

- 消息中心支持多条堆叠渲染
- 消息默认 2 秒自动消失
- 手动关闭可立即移除单条消息
- 登录页和初始化页不再渲染内联错误文本
- 用户创建、角色创建失败时弹错误消息
- 用户详情、角色详情成功保存时弹成功消息
- 日志和列表页加载失败时弹错误消息且页面仍可渲染
- 消息层级高于 admin 弹窗

测试优先级：

1. 组件和 composable 的静态结构测试
2. 页面接线测试
3. 必要的交互测试

## 15. Implementation Recommendation

实现顺序建议：

1. 先落消息中心 composable 与展示组件
2. 再接入 `admin.vue`
3. 再改造登录 / 初始化页
4. 再改造创建弹窗和详情页动作反馈
5. 最后处理列表页与日志页首屏加载失败反馈

这样可以先稳定底层能力，再批量替换页面上的旧错误反馈形态。
