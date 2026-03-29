import { afterEach, describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { ADMIN_AUTH_BAD_CREDENTIALS, ADMIN_AUTH_INVALID, ADMIN_SYSTEM_ALREADY_INITIALIZED } from "../server/utils/admin/error-codes"
import { ROOT_ROLE_CODE } from "../server/utils/admin/permissions"
import { adminLoginLog, adminPermission, adminRole, adminRolePermission, adminUser } from "../server/db/schema"
import { createAdminId } from "../server/utils/admin/id"
import { getNowIso } from "../server/utils/admin/time"
import { createTempAdminDb } from "./helpers/admin-test-db"

const cleanups: Array<() => void> = []
const projectRoot = resolve(import.meta.dir, "..")

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup()
  }
})

describe("admin services", () => {
  test("keeps admin user service free of unused auth-invalid imports", () => {
    const source = readFileSync(resolve(projectRoot, "server/services/admin/admin-user-service.ts"), "utf8")

    expect(source).not.toContain("ADMIN_AUTH_INVALID,")
  })

  test("reports whether the admin system has been initialized", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { getAdminInitStatus, initializeAdminSystem } = await import("../server/services/admin/admin-init-service")

    await expect(getAdminInitStatus(fixture.db)).resolves.toEqual({ initialized: false })

    await initializeAdminSystem(fixture.db, {
      username: "root",
      displayName: "Root",
      password: "Strong!123",
    })

    await expect(getAdminInitStatus(fixture.db)).resolves.toEqual({ initialized: true })
  })

  test("initializes the first admin only once", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { initializeAdminSystem } = await import("../server/services/admin/admin-init-service")

    const firstUser = await initializeAdminSystem(fixture.db, {
      username: "root",
      displayName: "Root",
      password: "Strong!123",
    })

    expect(firstUser.username).toBe("root")

    await expect(
      initializeAdminSystem(fixture.db, {
        username: "root2",
        displayName: "Root 2",
        password: "Strong!123",
      }),
    ).rejects.toMatchObject({ code: ADMIN_SYSTEM_ALREADY_INITIALIZED })
  })

  test("records successful and failed login attempts", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { initializeAdminSystem } = await import("../server/services/admin/admin-init-service")
    const { loginAdmin } = await import("../server/services/admin/admin-auth-service")

    await initializeAdminSystem(fixture.db, {
      username: "root",
      displayName: "Root",
      password: "Strong!123",
    })

    const loginResult = await loginAdmin(fixture.db, {
      username: "root",
      password: "Strong!123",
      ip: "127.0.0.1",
      userAgent: "bun:test",
    })

    expect(loginResult.user.username).toBe("root")
    expect(loginResult.tokenPayload.tokenVersion).toBe(1)

    await expect(
      loginAdmin(fixture.db, {
        username: "root",
        password: "Wrong!123",
        ip: "127.0.0.1",
        userAgent: "bun:test",
      }),
    ).rejects.toMatchObject({ code: ADMIN_AUTH_BAD_CREDENTIALS })

    const logs = fixture.db.select().from(adminLoginLog).all()

    expect(logs).toHaveLength(2)
    expect(logs.some((log) => log.result === "success")).toBe(true)
    expect(logs.some((log) => log.result === "failure")).toBe(true)
  })

  test("invalidates old token payloads after disable and password reset", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())

    const { initializeAdminSystem } = await import("../server/services/admin/admin-init-service")
    const { loginAdmin, authenticateAdminSession } = await import("../server/services/admin/admin-auth-service")
    const { resetAdminUserPassword, setAdminUserStatus } = await import("../server/services/admin/admin-user-service")

    const user = await initializeAdminSystem(fixture.db, {
      username: "root",
      displayName: "Root",
      password: "Strong!123",
    })

    const firstLogin = await loginAdmin(fixture.db, {
      username: "root",
      password: "Strong!123",
      ip: "127.0.0.1",
      userAgent: "bun:test",
    })

    await resetAdminUserPassword(fixture.db, {
      actorUserId: user.id,
      targetUserId: user.id,
      newPassword: "EvenStronger!123",
    })

    await expect(
      authenticateAdminSession(fixture.db, firstLogin.tokenPayload),
    ).rejects.toMatchObject({ code: ADMIN_AUTH_INVALID })

    const secondLogin = await loginAdmin(fixture.db, {
      username: "root",
      password: "EvenStronger!123",
      ip: "127.0.0.1",
      userAgent: "bun:test",
    })

    await setAdminUserStatus(fixture.db, {
      actorUserId: user.id,
      targetUserId: user.id,
      status: "disabled",
    })

    await expect(
      authenticateAdminSession(fixture.db, secondLogin.tokenPayload),
    ).rejects.toMatchObject({ code: ADMIN_AUTH_INVALID })
  })

  test("aggregates permissions for normal roles and keeps root as a full-access fallback", async () => {
    const fixture = createTempAdminDb()
    cleanups.push(() => fixture.cleanup())
    fixture.seed()

    const { createAdminUser, assignAdminUserRoles } = await import("../server/services/admin/admin-user-service")
    const { getAdminUserAuthorization } = await import("../server/services/admin/admin-auth-service")
    const { hashAdminPassword } = await import("../server/utils/admin/password")

    const now = getNowIso()
    const rootRole = fixture.db.select().from(adminRole).where(eq(adminRole.code, ROOT_ROLE_CODE)).get()
    const usersPermission = fixture.db
      .select()
      .from(adminPermission)
      .where(eq(adminPermission.code, "admin.users"))
      .get()

    if (!rootRole || !usersPermission) {
      throw new Error("seed missing root role or users permission")
    }

    const customRoleId = createAdminId()

    fixture.db.insert(adminRole).values({
      id: customRoleId,
      name: "用户管理员",
      code: "user-manager",
      description: "管理用户",
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    }).run()

    fixture.db.insert(adminRolePermission).values({
      id: createAdminId(),
      roleId: customRoleId,
      permissionId: usersPermission.id,
      createdAt: now,
    }).run()

    const normalUser = await createAdminUser(fixture.db, {
      actorUserId: "system",
      username: "alice",
      displayName: "Alice",
      password: "Strong!123",
    })

    await assignAdminUserRoles(fixture.db, {
      actorUserId: "system",
      targetUserId: normalUser.id,
      roleIds: [customRoleId],
    })

    const rootUserId = createAdminId()
    fixture.db.insert(adminUser).values({
      id: rootUserId,
      username: "root-fallback",
      displayName: "Root Fallback",
      passwordHash: await hashAdminPassword("Strong!123"),
      status: "active",
      tokenVersion: 1,
      lastLoginAt: null,
      passwordChangedAt: null,
      createdAt: now,
      updatedAt: now,
    }).run()

    const normalAuth = await getAdminUserAuthorization(fixture.db, normalUser.id)
    const rootAuth = await getAdminUserAuthorization(fixture.db, rootUserId, [ROOT_ROLE_CODE])

    expect(normalAuth.permissions).toEqual(["admin.users"])
    expect(rootAuth.permissions).toContain("admin.dashboard")
    expect(rootAuth.permissions).toContain("admin.audit-logs")
  })
})
