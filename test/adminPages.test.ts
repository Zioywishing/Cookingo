import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin pages", () => {
  test("creates init, login, and management route files", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain("初始化管理后台")
    expect(readProjectFile("app/pages/admin/login.vue")).toContain("登录后台")
    expect(readProjectFile("app/pages/admin/users/index.vue")).toContain("用户管理")
    expect(readProjectFile("app/pages/admin/users/[id].vue")).toContain("用户详情")
    expect(readProjectFile("app/pages/admin/roles/index.vue")).toContain("角色管理")
    expect(readProjectFile("app/pages/admin/roles/[id].vue")).toContain("角色详情")
    expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain("登录日志")
    expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain("操作审计")
  })

  test("keeps admin routes on the admin layout with init and auth middleware", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain('middleware: ["admin-init"]')
    expect(readProjectFile("app/pages/admin/login.vue")).toContain('middleware: ["admin-init"]')
    expect(readProjectFile("app/pages/admin/users/index.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/roles/index.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
  })

  test("keeps admin list pages on index routes so detail pages can render independently", () => {
    expect(existsSync(resolve(projectRoot, "app/pages/admin/users.vue"))).toBe(false)
    expect(existsSync(resolve(projectRoot, "app/pages/admin/roles.vue"))).toBe(false)
    expect(existsSync(resolve(projectRoot, "app/pages/admin/users/index.vue"))).toBe(true)
    expect(existsSync(resolve(projectRoot, "app/pages/admin/roles/index.vue"))).toBe(true)
  })

  test("reads real admin session values on the dashboard page", () => {
    const dashboardPage = readProjectFile("app/pages/admin/index.vue")

    expect(dashboardPage).toContain("const currentDisplayName = computed(() => session.user.value?.displayName || \"未登录\")")
    expect(dashboardPage).toContain("const currentUsername = computed(() => session.user.value?.username || \"guest\")")
    expect(dashboardPage).toContain("const permissionCount = computed(() => session.permissions.value.length)")
    expect(dashboardPage).toContain("{{ currentDisplayName }}")
    expect(dashboardPage).toContain("{{ currentUsername }}")
    expect(dashboardPage).toContain("{{ permissionCount }}")
  })

  test("uses the generated shell and log component names on admin pages", () => {
    const loginPage = readProjectFile("app/pages/admin/login.vue")
    const auditLogsPage = readProjectFile("app/pages/admin/audit-logs.vue")
    const loginLogsPage = readProjectFile("app/pages/admin/login-logs.vue")
    const rolesPage = readProjectFile("app/pages/admin/roles/index.vue")

    expect(loginPage).toContain("<AdminShellAdminPageContainer>")
    expect(loginPage).toContain("<AdminShellAdminPageHeader")
    expect(auditLogsPage).toContain("<AdminShellAdminPageContainer>")
    expect(auditLogsPage).toContain("<AdminShellAdminPageHeader")
    expect(auditLogsPage).toContain("<AdminLogAdminAuditLogTable")
    expect(loginLogsPage).toContain("<AdminLogAdminLoginLogTable")
    expect(rolesPage).toContain("useAsyncData(\"admin-role-permissions\"")
    expect(rolesPage).toContain(":permissions=\"rolePermissions || []\"")
  })
})
