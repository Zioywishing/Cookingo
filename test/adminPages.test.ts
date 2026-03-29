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

  test("adds a reusable admin pagination component and table footer slot", () => {
    expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("update:page")
    expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("update:pageSize")
    expect(readProjectFile("app/components/admin/base/AdminPagination.vue")).toContain("[20, 50, 100]")
    expect(readProjectFile("app/components/admin/base/AdminTable.vue")).toContain("name=\"footer\"")
  })

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

  test("moves auth pages away from inline error text and into popup feedback", () => {
    const loginPage = readProjectFile("app/pages/admin/login.vue")
    const initPage = readProjectFile("app/pages/admin/init.vue")

    expect(loginPage).toContain("useAdminRequestFeedback")
    expect(loginPage).not.toContain("const errorMessage = ref(\"\")")
    expect(loginPage).not.toContain('class="error"')
    expect(initPage).toContain("useAdminRequestFeedback")
    expect(initPage).toContain("feedback.showError(\"两次输入的密码不一致\")")
    expect(initPage).not.toContain("const errorMessage = ref(\"\")")
    expect(initPage).not.toContain('class="error"')
  })

  test("removes dialog inline error props and uses popup feedback for create flows", () => {
    const usersPage = readProjectFile("app/pages/admin/users/index.vue")
    const rolesPage = readProjectFile("app/pages/admin/roles/index.vue")
    const userCreateDialog = readProjectFile("app/components/admin/user/AdminUserCreateDialog.vue")
    const roleCreateDialog = readProjectFile("app/components/admin/role/AdminRoleCreateDialog.vue")

    expect(usersPage).toContain("useAdminRequestFeedback")
    expect(usersPage).toContain("successMessage: \"用户创建成功\"")
    expect(usersPage).toContain("errorMessage: \"创建用户失败\"")
    expect(usersPage).not.toContain("createErrorMessage")
    expect(rolesPage).toContain("successMessage: \"角色创建成功\"")
    expect(rolesPage).toContain("errorMessage: \"创建角色失败\"")
    expect(rolesPage).toContain("successMessage: \"角色删除成功\"")
    expect(rolesPage).not.toContain("createErrorMessage")
    expect(userCreateDialog).not.toContain("errorMessage?: string")
    expect(userCreateDialog).not.toContain('class="error"')
    expect(roleCreateDialog).not.toContain("errorMessage?: string")
    expect(roleCreateDialog).not.toContain('class="error"')
  })

  test("adds popup feedback to admin detail pages and load wrappers", () => {
    const usersDetailPage = readProjectFile("app/pages/admin/users/[id].vue")
    const rolesDetailPage = readProjectFile("app/pages/admin/roles/[id].vue")
    const loginLogsPage = readProjectFile("app/pages/admin/login-logs.vue")
    const auditLogsPage = readProjectFile("app/pages/admin/audit-logs.vue")

    expect(usersDetailPage).toContain("useAdminRequestFeedback")
    expect(usersDetailPage).toContain("successMessage: \"用户信息保存成功\"")
    expect(usersDetailPage).toContain("successMessage: \"用户角色保存成功\"")
    expect(usersDetailPage).toContain("successMessage: \"用户状态更新成功\"")
    expect(usersDetailPage).toContain("successMessage: \"密码重置成功\"")
    expect(rolesDetailPage).toContain("successMessage: \"角色权限保存成功\"")
    expect(loginLogsPage).toContain("feedback.load")
    expect(loginLogsPage).toContain("errorMessage: \"加载登录日志失败\"")
    expect(auditLogsPage).toContain("feedback.load")
    expect(auditLogsPage).toContain("errorMessage: \"加载操作审计失败\"")
  })
})
