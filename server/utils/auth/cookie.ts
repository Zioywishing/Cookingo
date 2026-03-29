import type { CookieSerializeOptions, H3Event } from "h3"
import { deleteCookie, getCookie, setCookie } from "h3"

export function getAdminCookieOptions(options: {
  cookieName: string
  ttlDays: number
  secure: boolean
}): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: options.secure,
    maxAge: options.ttlDays * 24 * 60 * 60,
  }
}

export function readAdminSessionCookie(event: H3Event, cookieName: string) {
  return getCookie(event, cookieName)
}

export function writeAdminSessionCookie(
  event: H3Event,
  cookieName: string,
  token: string,
  options: {
    ttlDays: number
    secure: boolean
  },
) {
  setCookie(event, cookieName, token, getAdminCookieOptions({
    cookieName,
    ttlDays: options.ttlDays,
    secure: options.secure,
  }))
}

export function clearAdminSessionCookie(event: H3Event, cookieName: string) {
  deleteCookie(event, cookieName, {
    path: "/",
  })
}
