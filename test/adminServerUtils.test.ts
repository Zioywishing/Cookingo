import { afterEach, describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"

import { adminAuditLog } from "../server/db/schema"
import { createTempAdminDb } from "./helpers/admin-test-db"

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup()
  }
})

describe("admin server utilities", () => {
  test("provides shared admin pagination, password, and status schemas", async () => {
    const { AdminUserStatus } = await import("../shared/admin/domain")
    const {
      adminPasswordSchema,
      adminUserStatusSchema,
      createAdminPaginationQuerySchema,
    } = await import("../server/utils/admin/schemas")

    expect(createAdminPaginationQuerySchema().parse({})).toEqual({
      page: 1,
      pageSize: 20,
    })
    expect(() => createAdminPaginationQuerySchema().parse({ pageSize: 101 })).toThrow()
    expect(adminPasswordSchema.parse("12345678")).toBe("12345678")
    expect(adminUserStatusSchema.parse(AdminUserStatus.Active)).toBe(AdminUserStatus.Active)
  })

  test("creates one shared default payload for new admin users", async () => {
    const { AdminUserStatus } = await import("../shared/admin/domain")
    const { createInitialAdminUserFields } = await import("../server/utils/admin/user-record")
    const now = "2026-03-29T00:00:00.000Z"

    expect(createInitialAdminUserFields(now)).toEqual({
      status: AdminUserStatus.Active,
      tokenVersion: 1,
      lastLoginAt: null,
      passwordChangedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  })

  test("writes admin audit logs through a shared helper and constants", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { AdminAuditAction, AdminAuditTargetType, writeAdminAuditLog } = await import("../server/utils/admin/audit")

    writeAdminAuditLog(fixture.db, {
      actorUserId: "system",
      action: AdminAuditAction.UserCreate,
      targetType: AdminAuditTargetType.User,
      targetId: "user_1",
      summary: "created admin user root",
      createdAt: "2026-03-29T00:00:00.000Z",
    })

    const record = fixture.db
      .select()
      .from(adminAuditLog)
      .where(eq(adminAuditLog.targetId, "user_1"))
      .get()

    expect(record).toMatchObject({
      actorUserId: "system",
      action: AdminAuditAction.UserCreate,
      targetType: AdminAuditTargetType.User,
      targetId: "user_1",
      summary: "created admin user root",
      createdAt: "2026-03-29T00:00:00.000Z",
    })
  })
})
