import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { ZodError } from "zod"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin api contracts", () => {
  test("serializes admin session and user payloads without sensitive fields", async () => {
    const {
      serializeAdminSessionPayload,
      serializeAdminUserDetail,
      serializeAdminUserListItem,
    } = await import("../server/utils/admin/contracts")

    const user = {
      id: "user_1",
      username: "root",
      displayName: "Root",
      passwordHash: "hashed-secret",
      status: "active" as const,
      tokenVersion: 9,
      lastLoginAt: "2026-03-29T08:00:00.000Z",
      passwordChangedAt: "2026-03-29T07:00:00.000Z",
      createdAt: "2026-03-29T06:00:00.000Z",
      updatedAt: "2026-03-29T09:00:00.000Z",
    }
    const roles = [
      {
        id: "role_root",
        code: "root",
        name: "Root",
      },
    ]

    const sessionPayload = serializeAdminSessionPayload({
      user,
      authorization: {
        roleCodes: ["root"],
        permissions: ["admin.users"],
      },
    })
    const listItem = serializeAdminUserListItem({
      user,
      roles,
    })
    const detail = serializeAdminUserDetail({
      user,
      roles,
    })

    expect(sessionPayload).toEqual({
      user: {
        id: "user_1",
        username: "root",
        displayName: "Root",
        status: "active",
      },
      authorization: {
        roleCodes: ["root"],
        permissions: ["admin.users"],
      },
    })
    expect(listItem).toEqual({
      id: "user_1",
      username: "root",
      displayName: "Root",
      status: "active",
      roles,
      lastLoginAt: "2026-03-29T08:00:00.000Z",
      createdAt: "2026-03-29T06:00:00.000Z",
      updatedAt: "2026-03-29T09:00:00.000Z",
    })
    expect(detail).toEqual({
      ...listItem,
      passwordChangedAt: "2026-03-29T07:00:00.000Z",
    })
    expect("passwordHash" in sessionPayload.user).toBe(false)
    expect("tokenVersion" in sessionPayload.user).toBe(false)
    expect("passwordHash" in listItem).toBe(false)
    expect("tokenVersion" in listItem).toBe(false)
    expect("passwordHash" in detail).toBe(false)
    expect("tokenVersion" in detail).toBe(false)
  })

  test("maps zod request validation failures to 400xx codes", async () => {
    const { createAdminErrorResponse } = await import("../server/utils/admin/api-handler")

    expect(createAdminErrorResponse(new ZodError([]))).toEqual({
      code: 40001,
      data: null,
      msg: "request params invalid",
    })
  })

  test("keeps pagination in repositories instead of slicing full log arrays in services", () => {
    const loginLogRepository = readProjectFile("server/repositories/admin/admin-login-log-repository.ts")
    const auditLogRepository = readProjectFile("server/repositories/admin/admin-audit-log-repository.ts")
    const logService = readProjectFile("server/services/admin/admin-log-service.ts")

    expect(loginLogRepository).toContain(".limit(pageSize)")
    expect(loginLogRepository).toContain(".offset((page - 1) * pageSize)")
    expect(auditLogRepository).toContain(".limit(pageSize)")
    expect(auditLogRepository).toContain(".offset((page - 1) * pageSize)")
    expect(logService).toContain("countAdminLoginLogs")
    expect(logService).toContain("countAdminAuditLogs")
    expect(logService).not.toContain(".slice(")
  })
})
