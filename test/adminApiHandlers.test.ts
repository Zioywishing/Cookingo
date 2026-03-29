import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin api handlers", () => {
  test("adds the required admin route files", () => {
    const routes = [
      "server/api/admin/post/initAdmin.ts",
      "server/api/admin/post/login.ts",
      "server/api/admin/post/logout.ts",
      "server/api/admin/get/currentUser.ts",
      "server/api/admin/put/changePassword.ts",
      "server/api/admin/get/users.ts",
      "server/api/admin/get/userDetail.ts",
      "server/api/admin/post/users.ts",
      "server/api/admin/put/user.ts",
      "server/api/admin/put/userStatus.ts",
      "server/api/admin/put/userPassword.ts",
      "server/api/admin/put/userRoles.ts",
      "server/api/admin/get/roles.ts",
      "server/api/admin/get/roleDetail.ts",
      "server/api/admin/post/roles.ts",
      "server/api/admin/put/role.ts",
      "server/api/admin/delete/role.ts",
      "server/api/admin/get/permissions.ts",
      "server/api/admin/get/loginLogs.ts",
      "server/api/admin/get/auditLogs.ts",
    ]

    for (const route of routes) {
      expect(existsSync(resolve(projectRoot, route))).toBe(true)
    }
  })

  test("protects key handlers with admin permission checks and zod parsing", () => {
    const usersHandler = readProjectFile("server/api/admin/get/users.ts")
    const loginLogsHandler = readProjectFile("server/api/admin/get/loginLogs.ts")
    const auditLogsHandler = readProjectFile("server/api/admin/get/auditLogs.ts")
    const createUserHandler = readProjectFile("server/api/admin/post/users.ts")

    expect(usersHandler).toContain('requireAdminPermission(event, "admin.users")')
    expect(loginLogsHandler).toContain('requireAdminPermission(event, "admin.login-logs")')
    expect(auditLogsHandler).toContain('requireAdminPermission(event, "admin.audit-logs")')
    expect(createUserHandler).toContain("z.object(")
    expect(createUserHandler).toContain("successResponse")
  })
})
