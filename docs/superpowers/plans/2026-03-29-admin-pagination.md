# Admin Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `/admin/users`、`/admin/roles`、`/admin/login-logs`、`/admin/audit-logs` 增加真正可交互的前端分页，并统一关闭 `/admin/**` 的 SSR。

**Architecture:** 在 `nuxt.config.ts` 用 `routeRules` 将 `/admin/**` 固定为 `ssr: false`，列表页继续使用 `useAsyncData` 但改为读取页面本地 `page/pageSize`。新增通用 `AdminPagination` 组件，`AdminTable` 提供 footer 插槽，四个业务表格通过事件把翻页意图抛回页面。

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, existing admin base components, Bun test

---

## File Map

### Config

- Modify: `nuxt.config.ts`
- Test: `test/adminFoundationConfig.test.ts`

### Base Components

- Create: `app/components/admin/base/AdminPagination.vue`
- Modify: `app/components/admin/base/AdminTable.vue`
- Test: `test/adminPages.test.ts`

### Domain Tables

- Modify: `app/components/admin/user/AdminUserTable.vue`
- Modify: `app/components/admin/role/AdminRoleTable.vue`
- Modify: `app/components/admin/log/AdminLoginLogTable.vue`
- Modify: `app/components/admin/log/AdminAuditLogTable.vue`
- Test: `test/adminPages.test.ts`

### Pages

- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `app/pages/admin/login-logs.vue`
- Modify: `app/pages/admin/audit-logs.vue`
- Test: `test/adminPages.test.ts`

## Task 1: Disable SSR for the admin route tree

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `test/adminFoundationConfig.test.ts`

- [ ] **Step 1: Write the failing config test**

```ts
test("disables SSR for the admin route tree", () => {
  const nuxtConfig = readProjectFile("nuxt.config.ts")

  expect(nuxtConfig).toContain("routeRules")
  expect(nuxtConfig).toContain('"/admin/**"')
  expect(nuxtConfig).toContain("ssr: false")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminFoundationConfig.test.ts`
Expected: FAIL because `nuxt.config.ts` does not declare admin `routeRules` yet.

- [ ] **Step 3: Implement the route rule**

```ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  routeRules: {
    "/admin/**": {
      ssr: false,
    },
  },
  runtimeConfig: {
    // existing runtime config
  },
})
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminFoundationConfig.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts test/adminFoundationConfig.test.ts
git commit -m "feat: disable ssr for admin routes"
```

## Task 2: Add the shared admin pagination component and table footer slot

**Files:**
- Create: `app/components/admin/base/AdminPagination.vue`
- Modify: `app/components/admin/base/AdminTable.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing page/component assertions**

```ts
test("adds a reusable admin pagination component and table footer slot", () => {
  expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("update:page")
  expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("update:pageSize")
  expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("[20, 50, 100]")
  expect(readProjectFile("app/components/admin/base/AdminTable.vue")).toContain('name="footer"')
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because `AdminPagination.vue` and the `footer` slot do not exist yet.

- [ ] **Step 3: Implement the minimal base components**

```vue
<!-- app/components/admin/base/AdminPagination.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  pending?: boolean
}>(), {
  pending: false,
})

const emit = defineEmits<{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()

const pageSizeOptions = [20, 50, 100]
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>
```

```vue
<!-- app/components/admin/base/AdminTable.vue -->
<template>
  <AdminBaseAdminCard class="admin-table-card" padding="md">
    <div class="table-scroll">
      <!-- existing table -->
    </div>
    <div v-if="$slots.footer" class="table-footer">
      <slot name="footer" />
    </div>
  </AdminBaseAdminCard>
</template>
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/base/AdminPagination.vue app/components/admin/base/AdminTable.vue test/adminPages.test.ts
git commit -m "feat: add reusable admin pagination"
```

## Task 3: Wire pagination through the admin table components

**Files:**
- Modify: `app/components/admin/user/AdminUserTable.vue`
- Modify: `app/components/admin/role/AdminRoleTable.vue`
- Modify: `app/components/admin/log/AdminLoginLogTable.vue`
- Modify: `app/components/admin/log/AdminAuditLogTable.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing assertions for table props and emits**

```ts
test("wires pagination props through admin list table components", () => {
  const userTable = readProjectFile("app/components/admin/user/AdminUserTable.vue")
  const roleTable = readProjectFile("app/components/admin/role/AdminRoleTable.vue")
  const loginLogTable = readProjectFile("app/components/admin/log/AdminLoginLogTable.vue")
  const auditLogTable = readProjectFile("app/components/admin/log/AdminAuditLogTable.vue")

  for (const source of [userTable, roleTable, loginLogTable, auditLogTable]) {
    expect(source).toContain("page: number")
    expect(source).toContain("pageSize: number")
    expect(source).toContain("total: number")
    expect(source).toContain("update:page")
    expect(source).toContain("update:pageSize")
    expect(source).toContain("<AdminBaseAdminPagination")
  }
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the table components still only accept `items` and `pending`.

- [ ] **Step 3: Implement the table wiring**

```vue
<script setup lang="ts">
defineProps<{
  items: AdminUserListItem[]
  page: number
  pageSize: number
  total: number
  pending?: boolean
}>()

const emit = defineEmits<{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()
</script>

<template>
  <AdminBaseAdminTable ...>
    <template #head>
      <!-- existing head -->
    </template>

    <!-- existing rows -->

    <template #footer>
      <AdminBaseAdminPagination
        :page="page"
        :page-size="pageSize"
        :total="total"
        :pending="pending"
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </template>
  </AdminBaseAdminTable>
</template>
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/user/AdminUserTable.vue app/components/admin/role/AdminRoleTable.vue app/components/admin/log/AdminLoginLogTable.vue app/components/admin/log/AdminAuditLogTable.vue test/adminPages.test.ts
git commit -m "feat: add pagination footers to admin tables"
```

## Task 4: Add local pagination state to the admin list pages

**Files:**
- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `app/pages/admin/login-logs.vue`
- Modify: `app/pages/admin/audit-logs.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing assertions for page-local pagination**

```ts
test("keeps admin list pagination in page-local state", () => {
  const usersPage = readProjectFile("app/pages/admin/users/index.vue")
  const rolesPage = readProjectFile("app/pages/admin/roles/index.vue")
  const loginLogsPage = readProjectFile("app/pages/admin/login-logs.vue")
  const auditLogsPage = readProjectFile("app/pages/admin/audit-logs.vue")

  for (const source of [usersPage, rolesPage, loginLogsPage, auditLogsPage]) {
    expect(source).toContain("const page = ref(1)")
    expect(source).toContain("const pageSize = ref(20)")
    expect(source).toContain("page.value")
    expect(source).toContain("pageSize.value")
    expect(source).toContain("@update:page")
    expect(source).toContain("@update:pageSize")
  }
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the list pages still use the default first-page fetch.

- [ ] **Step 3: Implement local pagination state in the pages**

```ts
const page = ref(1)
const pageSize = ref(20)

const { data: pageData, pending, refresh } = await useAsyncData("admin-users-page", () =>
  feedback.load(() => usersApi.listUsers(page.value, pageSize.value), {
    errorMessage: "加载用户列表失败",
    fallback: emptyUsersPage,
  }),
)

async function handlePageChange(nextPage: number) {
  if (nextPage === page.value) {
    return
  }

  page.value = nextPage
  await refresh()
}

async function handlePageSizeChange(nextPageSize: number) {
  if (nextPageSize === pageSize.value) {
    return
  }

  pageSize.value = nextPageSize
  page.value = 1
  await refresh()
}
```

- [ ] **Step 4: Add post-mutation page correction where needed**

```ts
async function handleDeleteRole(id: string) {
  const response = await feedback.run(() => rolesApi.deleteRole(id), {
    successMessage: "角色删除成功",
    errorMessage: "删除角色失败",
  })

  if (!response) {
    return
  }

  const currentItems = pageData.value?.items || []

  if (currentItems.length <= 1 && page.value > 1) {
    page.value -= 1
  }

  await refresh()
}
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/pages/admin/users/index.vue app/pages/admin/roles/index.vue app/pages/admin/login-logs.vue app/pages/admin/audit-logs.vue test/adminPages.test.ts
git commit -m "feat: add local pagination state to admin pages"
```

## Task 5: Run verification and polish

**Files:**
- Verify only touched files from the tasks above

- [ ] **Step 1: Run targeted tests**

Run: `bun test test/adminFoundationConfig.test.ts test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 2: Run repository quality checks**

Run: `bun quality-check`
Expected: PASS without TypeScript or lint errors

- [ ] **Step 3: Manually verify the pagination flows**

Run:

```bash
bun run dev
```

Check:

- `/admin/users` can move between pages
- `/admin/roles` can switch `20 / 50 / 100`
- `/admin/login-logs` and `/admin/audit-logs` disable controls while pending
- `/admin/**` routes render in CSR mode with no SSR dependency

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts app/components/admin/base/AdminPagination.vue app/components/admin/base/AdminTable.vue app/components/admin/user/AdminUserTable.vue app/components/admin/role/AdminRoleTable.vue app/components/admin/log/AdminLoginLogTable.vue app/components/admin/log/AdminAuditLogTable.vue app/pages/admin/users/index.vue app/pages/admin/roles/index.vue app/pages/admin/login-logs.vue app/pages/admin/audit-logs.vue test/adminFoundationConfig.test.ts test/adminPages.test.ts
git commit -m "feat: add admin list pagination"
```
