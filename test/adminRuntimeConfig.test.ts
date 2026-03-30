import { afterEach, describe, expect, test } from "bun:test"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { resolve } from "node:path"

const tempDirs: string[] = []

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()

    if (dir) {
      rmSync(dir, { recursive: true, force: true })
    }
  }
})

describe("admin runtime config helpers", () => {
  test("reads admin env values from .env.dev when process env is unset", async () => {
    const { resolveRuntimeEnv } = await import("../server/utils/admin/runtime-config")
    const cwd = mkdtempSync(resolve(tmpdir(), "cookingo-admin-env-"))
    tempDirs.push(cwd)

    writeFileSync(resolve(cwd, ".env.dev"), [
      "NUXT_ADMIN_JWT_SECRET=dev-secret-from-file",
      "NUXT_ADMIN_JWT_TTL_DAYS=21",
    ].join("\n"))

    const originalSecret = process.env.NUXT_ADMIN_JWT_SECRET
    const originalTtl = process.env.NUXT_ADMIN_JWT_TTL_DAYS

    delete process.env.NUXT_ADMIN_JWT_SECRET
    delete process.env.NUXT_ADMIN_JWT_TTL_DAYS

    try {
      expect(resolveRuntimeEnv("NUXT_ADMIN_JWT_SECRET", { cwd })).toBe("dev-secret-from-file")
      expect(resolveRuntimeEnv("NUXT_ADMIN_JWT_TTL_DAYS", { cwd })).toBe("21")
    }
    finally {
      if (originalSecret === undefined) {
        delete process.env.NUXT_ADMIN_JWT_SECRET
      }
      else {
        process.env.NUXT_ADMIN_JWT_SECRET = originalSecret
      }

      if (originalTtl === undefined) {
        delete process.env.NUXT_ADMIN_JWT_TTL_DAYS
      }
      else {
        process.env.NUXT_ADMIN_JWT_TTL_DAYS = originalTtl
      }
    }
  })

  test("prefers process env values over .env.dev values", async () => {
    const { resolveRuntimeEnv } = await import("../server/utils/admin/runtime-config")
    const cwd = mkdtempSync(resolve(tmpdir(), "cookingo-admin-env-"))
    tempDirs.push(cwd)

    writeFileSync(resolve(cwd, ".env.dev"), "NUXT_ADMIN_JWT_SECRET=dev-secret-from-file\n")

    const originalSecret = process.env.NUXT_ADMIN_JWT_SECRET
    process.env.NUXT_ADMIN_JWT_SECRET = "secret-from-process"

    try {
      expect(resolveRuntimeEnv("NUXT_ADMIN_JWT_SECRET", { cwd })).toBe("secret-from-process")
    }
    finally {
      if (originalSecret === undefined) {
        delete process.env.NUXT_ADMIN_JWT_SECRET
      }
      else {
        process.env.NUXT_ADMIN_JWT_SECRET = originalSecret
      }
    }
  })

  test("centralizes sqlite path and env file defaults for admin runtime consumers", async () => {
    const {
      ADMIN_DEFAULT_SQLITE_FILE_PATH,
      ADMIN_RUNTIME_ENV_FILES,
      resolveAdminSqliteFilePath,
    } = await import("../server/utils/admin/runtime-config")
    const cwd = mkdtempSync(resolve(tmpdir(), "cookingo-admin-env-"))
    tempDirs.push(cwd)

    const migrateSource = readFileSync(resolve(import.meta.dir, "../server/db/migrate.ts"), "utf8")
    const seedSource = readFileSync(resolve(import.meta.dir, "../server/db/seed/index.ts"), "utf8")
    const originalSqliteFilePath = process.env.NUXT_SQLITE_FILE_PATH

    delete process.env.NUXT_SQLITE_FILE_PATH

    try {
      expect(ADMIN_RUNTIME_ENV_FILES).toEqual([".env.dev", ".env"])
      expect(resolveAdminSqliteFilePath({ cwd })).toBe(ADMIN_DEFAULT_SQLITE_FILE_PATH)
      expect(migrateSource).toContain("resolveAdminSqliteFilePath")
      expect(seedSource).toContain("resolveAdminSqliteFilePath")
    }
    finally {
      if (originalSqliteFilePath === undefined) {
        delete process.env.NUXT_SQLITE_FILE_PATH
      }
      else {
        process.env.NUXT_SQLITE_FILE_PATH = originalSqliteFilePath
      }
    }
  })
})
