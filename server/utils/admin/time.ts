import {
  ADMIN_MILLISECONDS_PER_DAY,
  ADMIN_MILLISECONDS_PER_SECOND,
} from "./constants"

export function getNowIso() {
  return new Date().toISOString()
}

export function getFutureDateIso(days: number) {
  const date = new Date()

  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString()
}

export function shouldRenewToken(expiresAtSeconds: number, renewBeforeDays: number, now = Date.now()) {
  const renewBeforeMs = renewBeforeDays * ADMIN_MILLISECONDS_PER_DAY

  return expiresAtSeconds * ADMIN_MILLISECONDS_PER_SECOND - now < renewBeforeMs
}
