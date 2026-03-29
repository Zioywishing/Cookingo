import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin pages", () => {
  test("creates init, login, and management route files", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain("初始化管理后台")
    expect(readProjectFile("app/pages/admin/login.vue")).toContain("登录后台")
    expect(readProjectFile("app/pages/admin/users.vue")).toContain("用户管理")
    expect(readProjectFile("app/pages/admin/users/[id].vue")).toContain("用户详情")
    expect(readProjectFile("app/pages/admin/roles.vue")).toContain("角色管理")
    expect(readProjectFile("app/pages/admin/roles/[id].vue")).toContain("角色详情")
    expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain("登录日志")
    expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain("操作审计")
  })

  test("keeps admin routes on the admin layout with init and auth middleware", () => {
    expect(readProjectFile("app/pages/admin/init.vue")).toContain('middleware: ["admin-init"]')
    expect(readProjectFile("app/pages/admin/login.vue")).toContain('middleware: ["admin-init"]')
    expect(readProjectFile("app/pages/admin/users.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/roles.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/login-logs.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
    expect(readProjectFile("app/pages/admin/audit-logs.vue")).toContain('middleware: ["admin-init", "admin-auth"]')
  })
})
