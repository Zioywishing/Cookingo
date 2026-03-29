import { afterEach, describe, expect, test } from "bun:test"

import { ADMIN_ROLE_NOT_FOUND } from "../server/utils/admin/error-codes"
import { getAdminUserRoles } from "../server/repositories/admin/admin-user-repository"
import { createTempAdminDb } from "./helpers/admin-test-db"

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup()
  }
})

describe("admin user role assignment validation", () => {
  test("rejects missing role ids instead of partially overwriting user roles", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())
    fixture.seed()

    const { createAdminRole } = await import("../server/services/admin/admin-role-service")
    const { assignAdminUserRoles, createAdminUser } = await import("../server/services/admin/admin-user-service")

    const role = await createAdminRole(fixture.db, {
      actorUserId: "system",
      name: "Editors",
      code: "editors",
      description: "Editors role",
      permissionCodes: ["admin.users"],
    })
    const user = await createAdminUser(fixture.db, {
      actorUserId: "system",
      username: "mia",
      displayName: "Mia",
      password: "Strong!123",
    })

    await assignAdminUserRoles(fixture.db, {
      actorUserId: "system",
      targetUserId: user.id,
      roleIds: [role.id],
    })

    await expect(
      assignAdminUserRoles(fixture.db, {
        actorUserId: "system",
        targetUserId: user.id,
        roleIds: [role.id, "role_missing"],
      }),
    ).rejects.toMatchObject({
      code: ADMIN_ROLE_NOT_FOUND,
    })

    expect(getAdminUserRoles(fixture.db, user.id)).toEqual([
      {
        id: role.id,
        code: role.code,
        name: role.name,
      },
    ])
  })
})
