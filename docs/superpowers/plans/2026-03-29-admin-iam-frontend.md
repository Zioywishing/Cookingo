# Admin IAM Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the IAM一期后台前端，包括初始化页、登录态恢复、权限路由守卫、响应式后台壳层，以及用户/角色/日志页面，并补齐对应的 `initStatus` 后端接口。

**Architecture:** 在现有 Nuxt 4 `app/` 分层内实现，状态层只用 `useState + composables`，不引入 Pinia。后端新增一个轻量 `GET /api/admin/get/initStatus`，前端通过 `useAdminInitStatus` 与 `useAdminSession` 分离“系统初始化阶段”和“登录会话阶段”，再由 `admin-init` / `admin-auth` middleware 与 `admin` layout 串起来。

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Bun test, Nitro server handlers, Zod, existing shared types

---

## File Map

### Backend

- Create: `server/api/admin/get/initStatus.ts`
- Modify: `server/services/admin/admin-init-service.ts`
- Test: `test/adminApiHandlers.test.ts`
- Test: `test/adminServices.test.ts`

### Shared Types

- Modify: `shared/types/admin.ts`

### Frontend Core

- Create: `app/composables/useAdminInitStatus.ts`
- Create: `app/composables/useAdminSession.ts`
- Create: `app/middleware/admin-init.ts`
- Create: `app/middleware/admin-auth.ts`
- Create: `app/components/admin/shell/AdminTopbar.vue`
- Create: `app/components/admin/shell/AdminSidebar.vue`
- Create: `app/components/admin/shell/AdminSidebarNav.vue`
- Create: `app/components/admin/shell/AdminMobileSidebar.vue`
- Create: `app/components/admin/shell/AdminPageContainer.vue`
- Create: `app/components/admin/shell/AdminPageHeader.vue`
- Modify: `app/layouts/admin.vue`
- Test: `test/adminFrontendShell.test.ts`

### Frontend Domain Composables

- Create: `app/composables/useAdminUsers.ts`
- Create: `app/composables/useAdminRoles.ts`
- Create: `app/composables/useAdminLogs.ts`

### Pages and Page Components

- Create: `app/pages/admin/init.vue`
- Create: `app/pages/admin/login.vue`
- Modify: `app/pages/admin/index.vue`
- Create: `app/pages/admin/users.vue`
- Create: `app/pages/admin/users/[id].vue`
- Create: `app/pages/admin/roles.vue`
- Create: `app/pages/admin/roles/[id].vue`
- Create: `app/pages/admin/login-logs.vue`
- Create: `app/pages/admin/audit-logs.vue`
- Create: `app/components/admin/user/AdminUserCreateDialog.vue`
- Create: `app/components/admin/user/AdminUserProfileCard.vue`
- Create: `app/components/admin/user/AdminUserRolePanel.vue`
- Create: `app/components/admin/user/AdminUserSecurityPanel.vue`
- Create: `app/components/admin/user/AdminUserTable.vue`
- Create: `app/components/admin/role/AdminRoleCreateDialog.vue`
- Create: `app/components/admin/role/AdminRoleForm.vue`
- Create: `app/components/admin/role/AdminRoleTable.vue`
- Create: `app/components/admin/role/AdminPermissionGroup.vue`
- Create: `app/components/admin/log/AdminLoginLogTable.vue`
- Create: `app/components/admin/log/AdminAuditLogTable.vue`
- Test: `test/adminPages.test.ts`

## Task 1: Add `initStatus` backend support

**Files:**
- Modify: `server/services/admin/admin-init-service.ts`
- Create: `server/api/admin/get/initStatus.ts`
- Modify: `test/adminServices.test.ts`
- Modify: `test/adminApiHandlers.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// test/adminServices.test.ts
test("reports whether the admin system has been initialized", async () => {
  const { createTestAdminDb } = await import("./helpers/admin-test-db")
  const { getAdminInitStatus, initializeAdminSystem } = await import("../server/services/admin/admin-init-service")

  const db = createTestAdminDb()
  expect(await getAdminInitStatus(db)).toEqual({ initialized: false })

  await initializeAdminSystem(db, {
    username: "root",
    displayName: "Root",
    password: "Admin123!",
  })

  expect(await getAdminInitStatus(db)).toEqual({ initialized: true })
})

// test/adminApiHandlers.test.ts
test("adds the init status route under the admin get handlers", () => {
  expect(readProjectFile("server/api/admin/get/initStatus.ts")).toContain("getAdminInitStatus")
  expect(readProjectFile("server/api/admin/get/initStatus.ts")).toContain("successResponse")
})
```

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `bun test test/adminServices.test.ts test/adminApiHandlers.test.ts`
Expected: FAIL because `getAdminInitStatus` and `server/api/admin/get/initStatus.ts` do not exist yet.

- [ ] **Step 3: Implement the minimal backend support**

```ts
// server/services/admin/admin-init-service.ts
export async function getAdminInitStatus(db: AdminDb) {
  seedAdminBaseData(db)
  return {
    initialized: countAdminUsers(db) > 0,
  }
}

// server/api/admin/get/initStatus.ts
import { useAdminDb } from "../../../db/client"
import { getAdminInitStatus } from "../../../services/admin/admin-init-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { successResponse } from "../../../utils/api-response"

export default defineAdminApiHandler(async () => {
  return successResponse(await getAdminInitStatus(useAdminDb()))
})
```

- [ ] **Step 4: Run targeted tests to verify they pass**

Run: `bun test test/adminServices.test.ts test/adminApiHandlers.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/services/admin/admin-init-service.ts server/api/admin/get/initStatus.ts test/adminServices.test.ts test/adminApiHandlers.test.ts
git commit -m "feat: add admin init status api"
```

## Task 2: Add shared admin frontend types

**Files:**
- Modify: `shared/types/admin.ts`
- Modify: `test/adminDomainTypes.test.ts`

- [ ] **Step 1: Write the failing type export test**

```ts
test("exports frontend-safe admin session and page models", async () => {
  const adminTypes = await import("../shared/types/admin")

  expect(adminTypes.AdminPermissionCode.Users).toBe("admin.users")
  expect(typeof adminTypes.createAdminPageTitleMap).toBe("function")
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminDomainTypes.test.ts`
Expected: FAIL because the new safe admin frontend exports do not exist.

- [ ] **Step 3: Implement the shared types and constants**

```ts
// shared/types/admin.ts
export interface AdminSessionUser {
  id: string
  username: string
  displayName: string
  status: AdminUserStatus
}

export interface AdminSessionState {
  user: AdminSessionUser | null
  roleCodes: string[]
  permissions: AdminPermissionCode[]
}

export function createAdminPageTitleMap() {
  return {
    "/admin/init": { title: "初始化管理后台", description: "创建首个超级管理员账号。" },
    "/admin/login": { title: "登录后台", description: "使用管理员账号进入后台。" },
  } as const
}
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminDomainTypes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/types/admin.ts test/adminDomainTypes.test.ts
git commit -m "feat: add admin frontend shared types"
```

## Task 3: Build init/session composables and route middleware

**Files:**
- Create: `app/composables/useAdminInitStatus.ts`
- Create: `app/composables/useAdminSession.ts`
- Create: `app/middleware/admin-init.ts`
- Create: `app/middleware/admin-auth.ts`
- Create: `test/adminFrontendShell.test.ts`

- [ ] **Step 1: Write the failing shell and middleware tests**

```ts
import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), "utf8")

describe("admin frontend shell", () => {
  test("adds init and session composables", () => {
    expect(readProjectFile("app/composables/useAdminInitStatus.ts")).toContain("admin-init-ready")
    expect(readProjectFile("app/composables/useAdminSession.ts")).toContain("/api/admin/get/currentUser")
  })

  test("adds init and auth middleware", () => {
    expect(readProjectFile("app/middleware/admin-init.ts")).toContain('"/admin/init"')
    expect(readProjectFile("app/middleware/admin-auth.ts")).toContain("adminPermission")
  })
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: FAIL because the composables and middleware do not exist yet.

- [ ] **Step 3: Implement the init/session composables and middleware**

```ts
// app/composables/useAdminInitStatus.ts
export function useAdminInitStatus() {
  const cookie = useCookie<boolean | null>("admin-init-ready", { default: () => null })
  const initialized = useState<boolean | null>("admin-init-ready", () => cookie.value)
  const loaded = useState("admin-init-loaded", () => initialized.value === true)
  const pending = useState("admin-init-pending", () => false)

  async function ensureLoaded(force = false) {
    // fetch /api/admin/get/initStatus and promote true into cookie + state
  }

  function markInitialized() {
    cookie.value = true
    initialized.value = true
    loaded.value = true
  }

  return { initialized, loaded, pending, ensureLoaded, markInitialized }
}

// app/composables/useAdminSession.ts
export function useAdminSession() {
  const user = useState<AdminSessionUser | null>("admin-session-user", () => null)
  const permissions = useState<AdminPermissionCode[]>("admin-session-permissions", () => [])

  async function ensureLoaded() {}
  async function login(username: string, password: string) {}
  async function logout() {}
  function clear() {}
  function hasPermission(code: AdminPermissionCode) {}
  function resolveHomePath() {}

  return { user, permissions, ensureLoaded, login, logout, clear, hasPermission, resolveHomePath }
}

// app/middleware/admin-init.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return
  }
  // redirect between /admin/init and /admin/login based on init status
})

// app/middleware/admin-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin") || ["/admin/init", "/admin/login"].includes(to.path)) {
    return
  }
  // load session and enforce adminPermission page meta
})
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminInitStatus.ts app/composables/useAdminSession.ts app/middleware/admin-init.ts app/middleware/admin-auth.ts test/adminFrontendShell.test.ts
git commit -m "feat: add admin init and auth state"
```

## Task 4: Build the responsive admin shell layout

**Files:**
- Create: `app/components/admin/shell/AdminTopbar.vue`
- Create: `app/components/admin/shell/AdminSidebar.vue`
- Create: `app/components/admin/shell/AdminSidebarNav.vue`
- Create: `app/components/admin/shell/AdminMobileSidebar.vue`
- Create: `app/components/admin/shell/AdminPageContainer.vue`
- Create: `app/components/admin/shell/AdminPageHeader.vue`
- Modify: `app/layouts/admin.vue`
- Modify: `test/adminFrontendShell.test.ts`

- [ ] **Step 1: Extend the shell test for layout structure**

```ts
test("upgrades the admin layout to use a responsive sidebar shell", () => {
  const layout = readProjectFile("app/layouts/admin.vue")

  expect(layout).toContain("AdminSidebar")
  expect(layout).toContain("AdminMobileSidebar")
  expect(layout).toContain("AdminTopbar")
  expect(layout).toContain("position: fixed")
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: FAIL because the responsive shell components and layout structure are still missing.

- [ ] **Step 3: Implement the responsive shell**

```vue
<!-- app/layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar :items="navItems" />
    <AdminMobileSidebar :items="navItems" v-model:open="mobileOpen" />
    <div class="admin-main">
      <AdminTopbar :title="pageMeta.title" :description="pageMeta.description" @toggle-menu="mobileOpen = true" />
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminFrontendShell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/shell app/layouts/admin.vue test/adminFrontendShell.test.ts
git commit -m "feat: add responsive admin shell"
```

## Task 5: Add init, login, and dashboard pages

**Files:**
- Create: `app/pages/admin/init.vue`
- Create: `app/pages/admin/login.vue`
- Modify: `app/pages/admin/index.vue`
- Create: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing page structure test**

```ts
describe("admin pages", () => {
  test("creates the init and login entry pages", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain("初始化管理后台")
    expect(readProjectFile("app/pages/admin/login.vue")).toContain("登录后台")
  })

  test("keeps admin entry routes on the admin layout with init middleware", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain('middleware: ["admin-init"]')
    expect(readProjectFile("app/pages/admin/login.vue")).toContain('middleware: ["admin-init"]')
  })
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the new entry pages do not exist yet.

- [ ] **Step 3: Implement the entry pages and dashboard**

```vue
<!-- app/pages/admin/init.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin-init"] })
</script>

<template>
  <AdminPageContainer>
    <AdminPageHeader title="初始化管理后台" description="创建首个超级管理员账号。" />
  </AdminPageContainer>
</template>

<!-- app/pages/admin/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin-init"] })
</script>
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/admin/init.vue app/pages/admin/login.vue app/pages/admin/index.vue test/adminPages.test.ts
git commit -m "feat: add admin init and login pages"
```

## Task 6: Add users and roles pages plus domain composables

**Files:**
- Create: `app/composables/useAdminUsers.ts`
- Create: `app/composables/useAdminRoles.ts`
- Create: `app/pages/admin/users.vue`
- Create: `app/pages/admin/users/[id].vue`
- Create: `app/pages/admin/roles.vue`
- Create: `app/pages/admin/roles/[id].vue`
- Create: `app/components/admin/user/AdminUserCreateDialog.vue`
- Create: `app/components/admin/user/AdminUserProfileCard.vue`
- Create: `app/components/admin/user/AdminUserRolePanel.vue`
- Create: `app/components/admin/user/AdminUserSecurityPanel.vue`
- Create: `app/components/admin/user/AdminUserTable.vue`
- Create: `app/components/admin/role/AdminRoleCreateDialog.vue`
- Create: `app/components/admin/role/AdminRoleForm.vue`
- Create: `app/components/admin/role/AdminRoleTable.vue`
- Create: `app/components/admin/role/AdminPermissionGroup.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Extend the page test for users and roles pages**

```ts
test("creates the user and role management pages", () => {
  expect(readProjectFile("app/pages/admin/users.vue")).toContain("用户管理")
  expect(readProjectFile("app/pages/admin/users/[id].vue")).toContain("AdminUserProfileCard")
  expect(readProjectFile("app/pages/admin/roles.vue")).toContain("角色管理")
  expect(readProjectFile("app/pages/admin/roles/[id].vue")).toContain("AdminRoleForm")
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the users and roles pages/components do not exist yet.

- [ ] **Step 3: Implement the domain composables and pages**

```ts
// app/composables/useAdminUsers.ts
export function useAdminUsers() {
  async function listUsers(page = 1, pageSize = 20) {
    return await $fetch("/api/admin/get/users", { query: { page, pageSize } })
  }

  async function getUserDetail(id: string) {}
  async function createUser(payload: { username: string; displayName: string; password: string }) {}
  async function updateProfile(payload: { id: string; displayName: string }) {}
  async function updateRoles(payload: { id: string; roleIds: string[] }) {}
  async function updateStatus(payload: { id: string; status: "active" | "disabled" }) {}
  async function resetPassword(payload: { id: string; newPassword: string }) {}

  return { listUsers, getUserDetail, createUser, updateProfile, updateRoles, updateStatus, resetPassword }
}

// app/composables/useAdminRoles.ts
export function useAdminRoles() {
  async function listRoles(page = 1, pageSize = 20) {
    return await $fetch("/api/admin/get/roles", { query: { page, pageSize } })
  }

  async function getRoleDetail(id: string) {}
  async function createRole(payload: { name: string; code: string; description: string; permissionCodes: string[] }) {}
  async function updateRole(payload: { id: string; name: string; description: string; permissionCodes: string[] }) {}
  async function deleteRole(id: string) {}
  async function listPermissions() {}

  return { listRoles, getRoleDetail, createRole, updateRole, deleteRole, listPermissions }
}
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminUsers.ts app/composables/useAdminRoles.ts app/pages/admin/users.vue app/pages/admin/users/[id].vue app/pages/admin/roles.vue app/pages/admin/roles/[id].vue app/components/admin/user app/components/admin/role test/adminPages.test.ts
git commit -m "feat: add admin user and role pages"
```

## Task 7: Add login log and audit log pages

**Files:**
- Create: `app/composables/useAdminLogs.ts`
- Create: `app/pages/admin/login-logs.vue`
- Create: `app/pages/admin/audit-logs.vue`
- Create: `app/components/admin/log/AdminLoginLogTable.vue`
- Create: `app/components/admin/log/AdminAuditLogTable.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Extend the page test for log pages**

```ts
test("creates the log and audit pages", () => {
  expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain("登录日志")
  expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain("操作审计")
  expect(readProjectFile("app/components/admin/log/AdminLoginLogTable.vue")).toContain("userAgent")
  expect(readProjectFile("app/components/admin/log/AdminAuditLogTable.vue")).toContain("actorUserId")
})
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the log pages and log composable do not exist yet.

- [ ] **Step 3: Implement the log composable and pages**

```ts
// app/composables/useAdminLogs.ts
export function useAdminLogs() {
  async function listLoginLogs(page = 1, pageSize = 20) {
    return await $fetch("/api/admin/get/loginLogs", { query: { page, pageSize } })
  }

  async function listAuditLogs(page = 1, pageSize = 20) {
    return await $fetch("/api/admin/get/auditLogs", { query: { page, pageSize } })
  }

  return {
    listLoginLogs,
    listAuditLogs,
  }
}
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminLogs.ts app/pages/admin/login-logs.vue app/pages/admin/audit-logs.vue app/components/admin/log test/adminPages.test.ts
git commit -m "feat: add admin log pages"
```

## Task 8: Verify the integrated admin frontend

**Files:**
- Modify: `docs/b-end/2026-03-28-b-end-iam-foundation-design.md`
- Modify: `docs/b-end/2026-03-28-b-end-iam-backend-technical-design.md`

- [ ] **Step 1: Run the targeted tests**

Run: `bun test test/adminApiHandlers.test.ts test/adminServices.test.ts test/adminDomainTypes.test.ts test/adminFrontendShell.test.ts test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full suite**

Run: `bun test`
Expected: PASS

- [ ] **Step 3: Update the existing backend docs to mention `/admin/init` and `GET /api/admin/get/initStatus`**

```md
- `/admin/init`
- `GET /api/admin/get/initStatus`
```

- [ ] **Step 4: Run the full suite again after the doc touch**

Run: `bun test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/b-end/2026-03-28-b-end-iam-foundation-design.md docs/b-end/2026-03-28-b-end-iam-backend-technical-design.md test/adminApiHandlers.test.ts test/adminServices.test.ts test/adminDomainTypes.test.ts test/adminFrontendShell.test.ts test/adminPages.test.ts app server shared
git commit -m "feat: implement admin iam frontend"
```
