# Admin Message Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a layout-scoped admin message center so all admin child pages use top-center stacked popup messages for request failures, runtime errors, and action success feedback.

**Architecture:** Keep the admin API composables as pure data-access helpers, and add a new `useAdminMessageCenter` + `useAdminRequestFeedback` layer that is mounted once by `app/layouts/admin.vue`. Admin pages and dialogs will stop rendering inline error text and instead route both action responses and `useAsyncData` load failures through the shared message center.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, existing admin shell components, existing Bun file-based tests

---

## File Map

- Create: `app/composables/useAdminMessageCenter.ts`
- Create: `app/composables/useAdminRequestFeedback.ts`
- Create: `app/components/admin/shell/AdminMessageCenter.vue`
- Modify: `app/layouts/admin.vue`
- Modify: `app/pages/admin/login.vue`
- Modify: `app/pages/admin/init.vue`
- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/users/[id].vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `app/pages/admin/roles/[id].vue`
- Modify: `app/pages/admin/login-logs.vue`
- Modify: `app/pages/admin/audit-logs.vue`
- Modify: `app/components/admin/user/AdminUserCreateDialog.vue`
- Modify: `app/components/admin/role/AdminRoleCreateDialog.vue`
- Test: `test/adminMessageCenter.test.ts`
- Test: `test/adminPages.test.ts`

### Task 1: Build the shared message center state

**Files:**
- Create: `app/composables/useAdminMessageCenter.ts`
- Modify: `test/adminMessageCenter.test.ts`

- [ ] **Step 1: Write the failing message center test**

```ts
test("creates stacked admin message items with default duration", () => {
  const source = readProjectFile("app/composables/useAdminMessageCenter.ts")

  expect(source).toContain('type AdminMessageType = "success" | "error" | "info"')
  expect(source).toContain('duration: 2000')
  expect(source).toContain('useState("admin-message-center"')
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: FAIL because `useAdminMessageCenter.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal shared message center**

```ts
export function useAdminMessageCenter() {
  const messages = useState<AdminMessageItem[]>("admin-message-center", () => [])

  function show(message: string, options?: Partial<Pick<AdminMessageItem, "type" | "duration">>) {
    const item = {
      id: crypto.randomUUID(),
      type: options?.type ?? "info",
      message,
      duration: options?.duration ?? 2000,
    }

    messages.value = [...messages.value, item]
    return item.id
  }
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminMessageCenter.ts test/adminMessageCenter.test.ts
git commit -m "feat: add admin message center state"
```

### Task 2: Render the top-center stacked message component in the admin layout

**Files:**
- Create: `app/components/admin/shell/AdminMessageCenter.vue`
- Modify: `app/layouts/admin.vue`
- Modify: `test/adminMessageCenter.test.ts`

- [ ] **Step 1: Write the failing layout/component test**

```ts
test("mounts the admin message center in the admin layout", () => {
  expect(readProjectFile("app/components/admin/shell/AdminMessageCenter.vue")).toContain("TransitionGroup")
  expect(readProjectFile("app/components/admin/shell/AdminMessageCenter.vue")).toContain("Teleport")
  expect(readProjectFile("app/layouts/admin.vue")).toContain("<AdminShellAdminMessageCenter")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: FAIL because the component is not created and the layout does not mount it.

- [ ] **Step 3: Implement the message center component and layout wiring**

```vue
<Teleport to="body">
  <TransitionGroup name="admin-message" tag="div" class="admin-message-center">
    <article v-for="item in messages" :key="item.id" class="message-card">
      <p>{{ item.message }}</p>
      <button type="button" @click="remove(item.id)">关闭</button>
    </article>
  </TransitionGroup>
</Teleport>
```

```vue
<div class="admin-layout">
  <AdminShellAdminMessageCenter />
  <slot />
</div>
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/shell/AdminMessageCenter.vue app/layouts/admin.vue test/adminMessageCenter.test.ts
git commit -m "feat: mount admin message center"
```

### Task 3: Add admin request feedback wrappers

**Files:**
- Create: `app/composables/useAdminRequestFeedback.ts`
- Modify: `test/adminMessageCenter.test.ts`

- [ ] **Step 1: Write the failing wrapper test**

```ts
test("adds admin request feedback helpers for action and load flows", () => {
  const source = readProjectFile("app/composables/useAdminRequestFeedback.ts")

  expect(source).toContain("handleResponse")
  expect(source).toContain("run(")
  expect(source).toContain("load(")
  expect(source).toContain("response.code !== 0")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: FAIL because `useAdminRequestFeedback.ts` does not exist yet.

- [ ] **Step 3: Implement the wrapper composable**

```ts
export function useAdminRequestFeedback() {
  const messageCenter = useAdminMessageCenter()

  function handleResponse<T>(response: ApiResponse<T>, options?: HandleResponseOptions) {
    if (response.code !== 0) {
      messageCenter.error(response.msg || options?.errorMessage || "请求失败，请稍后重试")
      return false
    }

    if (!options?.silentSuccess && options?.successMessage) {
      messageCenter.success(options.successMessage)
    }

    return true
  }
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminMessageCenter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdminRequestFeedback.ts test/adminMessageCenter.test.ts
git commit -m "feat: add admin request feedback helpers"
```

### Task 4: Replace inline auth-page errors with popup feedback

**Files:**
- Modify: `app/pages/admin/login.vue`
- Modify: `app/pages/admin/init.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing auth-page migration test**

```ts
test("removes inline auth-page error blocks and uses admin request feedback", () => {
  expect(readProjectFile("app/pages/admin/login.vue")).not.toContain('class="error"')
  expect(readProjectFile("app/pages/admin/login.vue")).toContain("useAdminRequestFeedback")
  expect(readProjectFile("app/pages/admin/init.vue")).not.toContain('class="error"')
  expect(readProjectFile("app/pages/admin/init.vue")).toContain("showError")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the auth pages still render inline error text.

- [ ] **Step 3: Implement the auth-page migration**

```ts
const feedback = useAdminRequestFeedback()

if (!form.password || form.password !== form.confirmPassword) {
  feedback.showError("两次输入的密码不一致")
  return
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/admin/login.vue app/pages/admin/init.vue test/adminPages.test.ts
git commit -m "refactor: route admin auth pages through popup feedback"
```

### Task 5: Remove dialog-inline error rendering and use popup feedback for create flows

**Files:**
- Modify: `app/components/admin/user/AdminUserCreateDialog.vue`
- Modify: `app/components/admin/role/AdminRoleCreateDialog.vue`
- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing create-flow test**

```ts
test("removes create-dialog error props and uses popup feedback in list pages", () => {
  expect(readProjectFile("app/components/admin/user/AdminUserCreateDialog.vue")).not.toContain("errorMessage")
  expect(readProjectFile("app/components/admin/role/AdminRoleCreateDialog.vue")).not.toContain("errorMessage")
  expect(readProjectFile("app/pages/admin/users/index.vue")).toContain('successMessage: "用户创建成功"')
  expect(readProjectFile("app/pages/admin/roles/index.vue")).toContain('successMessage: "角色创建成功"')
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the dialogs and list pages still use inline `errorMessage`.

- [ ] **Step 3: Implement the create-flow migration**

```ts
const feedback = useAdminRequestFeedback()
const response = await rolesApi.createRole(payload)

if (!feedback.handleResponse(response, { successMessage: "角色创建成功" })) {
  return
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/admin/user/AdminUserCreateDialog.vue app/components/admin/role/AdminRoleCreateDialog.vue app/pages/admin/users/index.vue app/pages/admin/roles/index.vue test/adminPages.test.ts
git commit -m "refactor: use popup feedback for admin create flows"
```

### Task 6: Add success and failure feedback for detail-page actions

**Files:**
- Modify: `app/pages/admin/users/[id].vue`
- Modify: `app/pages/admin/roles/[id].vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing detail-action test**

```ts
test("adds popup success feedback for admin detail-page mutations", () => {
  expect(readProjectFile("app/pages/admin/users/[id].vue")).toContain("用户信息保存成功")
  expect(readProjectFile("app/pages/admin/users/[id].vue")).toContain("密码重置成功")
  expect(readProjectFile("app/pages/admin/roles/[id].vue")).toContain("角色权限保存成功")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because the detail pages do not send success feedback yet.

- [ ] **Step 3: Implement the detail-page action wrappers**

```ts
await feedback.run(
  () => usersApi.updateStatus({ id: userId, status }),
  {
    successMessage: "用户状态更新成功",
    errorMessage: "更新用户状态失败",
  },
)
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/admin/users/[id].vue app/pages/admin/roles/[id].vue test/adminPages.test.ts
git commit -m "feat: add popup feedback for admin detail actions"
```

### Task 7: Route list-page and log-page load failures through popup feedback

**Files:**
- Modify: `app/pages/admin/users/index.vue`
- Modify: `app/pages/admin/roles/index.vue`
- Modify: `app/pages/admin/users/[id].vue`
- Modify: `app/pages/admin/roles/[id].vue`
- Modify: `app/pages/admin/login-logs.vue`
- Modify: `app/pages/admin/audit-logs.vue`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing load-wrapper test**

```ts
test("routes admin page loads through load feedback wrappers", () => {
  expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain("feedback.load")
  expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain("feedback.load")
  expect(readProjectFile("app/pages/admin/users/index.vue")).toContain("加载用户列表失败")
  expect(readProjectFile("app/pages/admin/roles/[id].vue")).toContain("加载角色详情失败")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/adminPages.test.ts`
Expected: FAIL because page loads still call raw `useAsyncData` handlers.

- [ ] **Step 3: Implement the load-failure wrappers**

```ts
const { data: pageData, pending } = await useAsyncData("admin-login-logs-page", () =>
  feedback.load(() => logsApi.listLoginLogs(), {
    errorMessage: "加载登录日志失败",
    fallback: { items: [], total: 0, page: 1, pageSize: 20 },
  }),
)
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/adminPages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/admin/users/index.vue app/pages/admin/roles/index.vue app/pages/admin/users/[id].vue app/pages/admin/roles/[id].vue app/pages/admin/login-logs.vue app/pages/admin/audit-logs.vue test/adminPages.test.ts
git commit -m "feat: surface admin load failures through popup feedback"
```

### Task 8: Add layout-level runtime error feedback and run final verification

**Files:**
- Modify: `app/layouts/admin.vue`
- Modify: `test/adminMessageCenter.test.ts`
- Modify: `test/adminPages.test.ts`

- [ ] **Step 1: Write the failing runtime-error and wiring test**

```ts
test("captures admin runtime errors at the layout level", () => {
  expect(readProjectFile("app/layouts/admin.vue")).toContain("onErrorCaptured")
  expect(readProjectFile("app/layouts/admin.vue")).toContain("页面执行出现异常，请稍后重试")
})
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run: `bun test test/adminMessageCenter.test.ts test/adminPages.test.ts`
Expected: FAIL because the layout does not capture runtime errors yet.

- [ ] **Step 3: Implement the layout error capture and final wiring cleanup**

```ts
const messageCenter = useAdminMessageCenter()

onErrorCaptured((error) => {
  console.error(error)
  messageCenter.error("页面执行出现异常，请稍后重试")
  return false
})
```

- [ ] **Step 4: Run final verification**

Run: `bun test test/adminMessageCenter.test.ts test/adminPages.test.ts`
Expected: PASS

Run: `bun test`
Expected: PASS, or existing unrelated failures only.

- [ ] **Step 5: Commit**

```bash
git add app/layouts/admin.vue test/adminMessageCenter.test.ts test/adminPages.test.ts
git commit -m "feat: finalize admin message center feedback flow"
```
