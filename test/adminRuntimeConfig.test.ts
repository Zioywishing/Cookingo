import { afterEach, describe, expect, test } from "bun:test"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
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
})
