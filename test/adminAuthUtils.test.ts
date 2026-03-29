import { describe, expect, test } from "bun:test"

describe("admin auth utils", () => {
  test("signs and verifies the minimal admin jwt payload", async () => {
    const { signAdminJwt, verifyAdminJwt } = await import("../server/utils/auth/jwt")

    const token = await signAdminJwt(
      {
        sub: "user_1",
        username: "root",
        tokenVersion: 3,
      },
      {
        secret: "test-secret-1234567890",
        ttlDays: 14,
      },
    )

    const payload = await verifyAdminJwt(token, {
      secret: "test-secret-1234567890",
    })

    expect(payload.sub).toBe("user_1")
    expect(payload.username).toBe("root")
    expect(payload.tokenVersion).toBe(3)
    expect(payload.exp).toBeNumber()
  })

  test("builds secure cookie defaults for admin session", async () => {
    const { getAdminCookieOptions } = await import("../server/utils/auth/cookie")

    const cookieOptions = getAdminCookieOptions({
      cookieName: "cookingo_admin_token",
      ttlDays: 14,
      secure: true,
    })

    expect(cookieOptions.httpOnly).toBe(true)
    expect(cookieOptions.sameSite).toBe("lax")
    expect(cookieOptions.path).toBe("/")
    expect(cookieOptions.secure).toBe(true)
    expect(cookieOptions.maxAge).toBe(14 * 24 * 60 * 60)
  })

  test("flags tokens for renewal only inside the renewal window", async () => {
    const { shouldRenewAdminSession } = await import("../server/utils/auth/jwt")

    const now = Date.UTC(2026, 2, 29, 0, 0, 0)
    const expiresSoon = Math.floor((now + 6 * 24 * 60 * 60 * 1000) / 1000)
    const expiresLater = Math.floor((now + 8 * 24 * 60 * 60 * 1000) / 1000)

    expect(shouldRenewAdminSession(expiresSoon, 7, now)).toBe(true)
    expect(shouldRenewAdminSession(expiresLater, 7, now)).toBe(false)
  })
})
