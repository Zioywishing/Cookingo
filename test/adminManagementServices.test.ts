import { afterEach, describe, expect, test } from "bun:test"

import { ADMIN_ROLE_IN_USE } from "../server/utils/admin/error-codes"
import { createTempAdminDb } from "./helpers/admin-test-db"

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup()
  }
})

describe("admin management services", () => {
  test("blocks deleting roles that are still assigned to users", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())
    fixture.seed()

    const { createAdminUser, assignAdminUserRoles } = await import("../server/services/admin/admin-user-service")
    const { createAdminRole, deleteAdminRole } = await import("../server/services/admin/admin-role-service")

    const role = await createAdminRole(fixture.db, {
      actorUserId: "system",
      name: "Editors",
      code: "editors",
      description: "Editors role",
      permissionCodes: ["admin.users"],
    })

    const user = await createAdminUser(fixture.db, {
      actorUserId: "system",
      username: "mary",
      displayName: "Mary",
      password: "Strong!123",
    })

    await assignAdminUserRoles(fixture.db, {
      actorUserId: "system",
      targetUserId: user.id,
      roleIds: [role.id],
    })

    await expect(
      deleteAdminRole(fixture.db, {
        actorUserId: "system",
        roleId: role.id,
      }),
    ).rejects.toMatchObject({ code: ADMIN_ROLE_IN_USE })
  })

  test("returns paginated login and audit logs", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { initializeAdminSystem } = await import("../server/services/admin/admin-init-service")
    const { loginAdmin } = await import("../server/services/admin/admin-auth-service")
    const { listAdminAuditLogs, listAdminLoginLogs } = await import("../server/services/admin/admin-log-service")
    const { createAdminUser } = await import("../server/services/admin/admin-user-service")

    const root = await initializeAdminSystem(fixture.db, {
      username: "root",
      displayName: "Root",
      password: "Strong!123",
    })

    await loginAdmin(fixture.db, {
      username: "root",
      password: "Strong!123",
      ip: "127.0.0.1",
      userAgent: "bun:test",
    })

    await createAdminUser(fixture.db, {
      actorUserId: root.id,
      username: "jack",
      displayName: "Jack",
      password: "Strong!123",
    })

    const loginLogs = await listAdminLoginLogs(fixture.db, {
      page: 1,
      pageSize: 10,
    })
    const auditLogs = await listAdminAuditLogs(fixture.db, {
      page: 1,
      pageSize: 10,
    })

    expect(loginLogs.total).toBe(1)
    expect(loginLogs.items).toHaveLength(1)
    expect(auditLogs.total).toBeGreaterThanOrEqual(1)
    expect(auditLogs.page).toBe(1)
    expect(auditLogs.pageSize).toBe(10)
  })
})
