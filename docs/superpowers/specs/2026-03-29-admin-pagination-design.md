# Cookingo Admin 列表分页改造方案

## 1. 文档目标

本文档用于定义 Cookingo Admin 当前 4 个列表页的前端分页改造方案。

本次方案覆盖：

- `/admin/users`
- `/admin/roles`
- `/admin/login-logs`
- `/admin/audit-logs`

目标是让这些页面真正支持分页交互，而不是只消费分页接口的第一页数据。

## 2. 当前现状

### 2.1 后端现状

以下接口已经按统一协议支持分页：

- `GET /api/admin/get/users`
- `GET /api/admin/get/roles`
- `GET /api/admin/get/loginLogs`
- `GET /api/admin/get/auditLogs`

后端统一返回：

```ts
interface ApiPageData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

### 2.2 前端现状

当前前端请求层已经支持传入 `page` 和 `pageSize`：

- `app/composables/useAdminUsers.ts`
- `app/composables/useAdminRoles.ts`
- `app/composables/useAdminLogs.ts`

但页面层和表格层仍存在以下问题：

- 页面没有本地 `page`、`pageSize` 状态
- 页面调用列表接口时始终使用默认第一页
- 表格组件没有分页栏
- 表格组件没有页码切换事件
- `total / page / pageSize` 没有在 UI 层使用

结果是：后端已分页，前端仍只能看第一页。

## 3. 约束与确认结论

本次方案基于以下已确认约束：

- 分页状态只保留在页面本地，不同步到 URL query
- `pageSize` 固定选项为 `20 / 50 / 100`
- loading 状态需要由表格组件层承接
- `/admin/**` 页面统一不支持 SSR

## 4. 设计决策

### 4.1 Admin 路由统一关闭 SSR

既然目标是“所有 admin 页面都不需要支持 SSR”，则不应只在单个页面的 `useAsyncData` 中添加 `server: false`。

本次统一在 `nuxt.config.ts` 中通过 `routeRules` 配置：

```ts
routeRules: {
  "/admin/**": {
    ssr: false,
  },
}
```

这样可以保证：

- `/admin/login`
- `/admin/init`
- `/admin`
- `/admin/users`
- `/admin/roles`
- `/admin/login-logs`
- `/admin/audit-logs`
- 以及详情页

全部按同一策略运行，避免同一后台系统内部出现 SSR/CSR 混用。

### 4.2 分页状态放在页面，不下沉到基础表格

分页状态属于页面级数据编排，不属于基础展示组件职责。

因此：

- 页面持有 `page` 和 `pageSize`
- 页面负责触发刷新
- 表格组件只负责展示分页栏和派发交互事件
- 基础表格 `AdminTable` 只负责提供可复用容器和 footer 插槽

这样可以避免 `AdminTable` 变成强耦合的“数据表 + 分页状态管理器”。

### 4.3 增加通用分页组件

新增通用组件：

- `app/components/admin/base/AdminPagination.vue`

职责：

- 展示总数
- 展示当前页与总页数
- 提供上一页/下一页按钮
- 提供 `pageSize` 选择器
- 在 `pending` 时禁用交互

该组件不直接请求数据，只通过事件把意图抛给页面。

### 4.4 表格组件统一承接 loading + 分页 footer

保留现有 `AdminTable` 的 loading 行和 empty state。

新增 `footer` 插槽，让业务表格可以在同一张卡片内挂载分页栏。

这样带来两个好处：

- loading 仍由表格主体统一处理
- 分页栏在视觉上与表格保持一致，不需要页面额外拼装卡片容器

## 5. 目录与文件改动

### 5.1 配置层

- Modify: `nuxt.config.ts`

### 5.2 基础组件层

- Create: `app/components/admin/base/AdminPagination.vue`
- Modify: `app/components/admin/base/AdminTable.vue`

### 5.3 业务表格层

- Modify: `app/components/admin/user/AdminUserTable.vue`
- Modify: `app/components/admin/role/AdminRoleTable.vue`
- Modify: `app/components/admin/log/AdminLoginLogTable.vue`
- Modify: `app/components/admin/log/AdminAuditLogTable.vue`

### 5.4 页面层

- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `app/pages/admin/login-logs.vue`
- Modify: `app/pages/admin/audit-logs.vue`

### 5.5 测试

- Modify: `test/adminFoundationConfig.test.ts`
- Modify: `test/adminPages.test.ts`

## 6. 组件与数据流设计

### 6.1 `AdminPagination.vue`

建议 props：

```ts
{
  page: number
  pageSize: number
  total: number
  pending?: boolean
}
```

建议 emits：

```ts
{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}
```

派生值：

- `totalPages = Math.max(1, Math.ceil(total / pageSize))`
- `canPrev = page > 1 && !pending`
- `canNext = page < totalPages && !pending`

交互规则：

- 点击上一页时发出 `update:page(page - 1)`
- 点击下一页时发出 `update:page(page + 1)`
- 切换 `pageSize` 时发出 `update:pageSize(nextPageSize)`

视觉文案：

- `共 {total} 条`
- `第 {page} / {totalPages} 页`

### 6.2 `AdminTable.vue`

保留当前 props：

- `pending`
- `empty`
- `colCount`
- `loadingText`
- `emptyTitle`
- `emptyDescription`

新增能力：

- 增加可选 `footer` 插槽
- 表格主体维持现有 loading/empty/default 三态
- footer 仅在有内容时展示

### 6.3 业务表格组件

四个业务表格组件统一新增 props：

```ts
{
  page: number
  pageSize: number
  total: number
  pending?: boolean
}
```

统一新增 emits：

```ts
{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}
```

内部通过 `AdminTable` 的 `footer` 插槽挂载 `AdminPagination`。

这样页面调用形态可以统一为：

```vue
<AdminUserTable
  :items="pageData?.items || []"
  :page="page"
  :page-size="pageSize"
  :total="pageData?.total || 0"
  :pending="pending"
  @update:page="handlePageChange"
  @update:pageSize="handlePageSizeChange"
/>
```

## 7. 页面行为设计

### 7.1 页面本地状态

四个页面统一维护：

```ts
const page = ref(1)
const pageSize = ref(20)
```

页面请求函数统一改为：

```ts
() => api.listXxx(page.value, pageSize.value)
```

### 7.2 切页行为

页面提供：

- `handlePageChange(nextPage: number)`
- `handlePageSizeChange(nextPageSize: number)`

规则：

- 改页码时直接刷新
- 改 `pageSize` 时，先重置 `page = 1`，再刷新
- `pending` 时分页栏禁用，页面无需额外防重

### 7.3 创建和删除后的页码修正

用户列表、角色列表在新建/删除后会刷新列表。

规则：

- 新建后保留当前页并刷新
- 删除后若当前页被删空且当前页大于 1，则先回退到上一页再刷新

这个规则主要适用于角色页，避免用户删除当前页最后一条记录后停留在空页。

### 7.4 useAsyncData 的使用方式

由于 `/admin/**` 已通过 `routeRules` 关闭 SSR，页面仍可继续使用 `useAsyncData`。

不强制在每页额外设置 `server: false`，避免重复配置。

## 8. 测试策略

本次优先延续仓库现有“读文件断言”测试风格，不额外引入组件测试框架。

### 8.1 配置测试

扩展 `test/adminFoundationConfig.test.ts`，验证：

- `nuxt.config.ts` 含 `routeRules`
- `nuxt.config.ts` 含 `"/admin/**"`
- `nuxt.config.ts` 含 `ssr: false`

### 8.2 页面与组件测试

扩展 `test/adminPages.test.ts`，验证：

- 列表页使用本地 `page` 和 `pageSize`
- 列表页请求函数读取本地分页状态
- 列表页向表格组件传入 `page / pageSize / total`
- 表格组件包含 `update:page` 和 `update:pageSize`
- `AdminTable` 含 footer 插槽
- 新增 `AdminPagination.vue`

## 9. 非目标

本次不包含：

- URL query 分页同步
- 搜索、筛选、排序
- 页码直接跳转输入框
- 无限滚动
- 将分页逻辑抽成 `usePagination` composable

这些能力在当前规模下都不是必要条件。

## 10. 预期结果

完成后，Admin 4 个列表页将具备一致的分页行为：

- 真正支持翻页
- 支持 `20 / 50 / 100` 每页条数切换
- loading 状态统一由表格层承接
- admin 全站统一按 CSR 运行，不再为 SSR 做额外适配

该方案保持对现有目录结构和组件语义的最小扩展，后续新增后台分页列表页时，可继续复用同一套模式。
