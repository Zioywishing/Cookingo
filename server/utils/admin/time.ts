export function getNowIso() {
  return new Date().toISOString()
}

export function getFutureDateIso(days: number) {
  const date = new Date()

  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString()
}

export function shouldRenewToken(expiresAtSeconds: number, renewBeforeDays: number, now = Date.now()) {
  const renewBeforeMs = renewBeforeDays * 24 * 60 * 60 * 1000

  return expiresAtSeconds * 1000 - now < renewBeforeMs
}
