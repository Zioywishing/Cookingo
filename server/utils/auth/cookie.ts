import type { CookieSerializeOptions } from "cookie-es"
import type { H3Event } from "h3"
import { deleteCookie, getCookie, setCookie } from "h3"

import {
  ADMIN_PRODUCTION_NODE_ENV,
  ADMIN_SECONDS_PER_DAY,
  ADMIN_SESSION_COOKIE_PATH,
  ADMIN_SESSION_COOKIE_SAME_SITE,
} from "../admin/constants"

export function getAdminCookieOptions(options: {
  cookieName: string
  ttlDays: number
  secure: boolean
}): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: ADMIN_SESSION_COOKIE_SAME_SITE,
    path: ADMIN_SESSION_COOKIE_PATH,
    secure: options.secure,
    maxAge: options.ttlDays * ADMIN_SECONDS_PER_DAY,
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
    path: ADMIN_SESSION_COOKIE_PATH,
  })
}

export function shouldUseSecureAdminSessionCookie(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === ADMIN_PRODUCTION_NODE_ENV
}
