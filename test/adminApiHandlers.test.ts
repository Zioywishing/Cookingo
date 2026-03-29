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
      "server/api/admin/get/initStatus.ts",
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
    const initStatusHandler = readProjectFile("server/api/admin/get/initStatus.ts")
    const usersHandler = readProjectFile("server/api/admin/get/users.ts")
    const loginLogsHandler = readProjectFile("server/api/admin/get/loginLogs.ts")
    const auditLogsHandler = readProjectFile("server/api/admin/get/auditLogs.ts")
    const createUserHandler = readProjectFile("server/api/admin/post/users.ts")

    expect(initStatusHandler).toContain("getAdminInitStatus")
    expect(initStatusHandler).toContain("successResponse")
    expect(usersHandler).toContain("createAdminPaginationQuerySchema")
    expect(usersHandler).toContain("AdminPermissionCode.Users")
    expect(loginLogsHandler).toContain("createAdminPaginationQuerySchema")
    expect(loginLogsHandler).toContain("AdminPermissionCode.LoginLogs")
    expect(auditLogsHandler).toContain("createAdminPaginationQuerySchema")
    expect(auditLogsHandler).toContain("AdminPermissionCode.AuditLogs")
    expect(createUserHandler).toContain("z.object(")
    expect(createUserHandler).toContain("adminPasswordSchema")
    expect(createUserHandler).toContain("successResponse")
  })
})
