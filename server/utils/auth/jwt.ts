import { jwtVerify, SignJWT } from "jose"

import { ADMIN_JWT_ALGORITHM } from "../admin/constants"
import { ADMIN_JWT_SECRET_REQUIRED_MESSAGE } from "../admin/error-messages"
import { shouldRenewToken } from "../admin/time"

export interface AdminJwtPayload {
  sub: string
  username: string
  tokenVersion: number
  iat?: number
  exp?: number
}

function getJwtSecret(secret: string) {
  if (!secret) {
    throw new Error(ADMIN_JWT_SECRET_REQUIRED_MESSAGE)
  }

  return new TextEncoder().encode(secret)
}

export async function signAdminJwt(
  payload: Pick<AdminJwtPayload, "sub" | "username" | "tokenVersion">,
  options: {
    secret: string
    ttlDays: number
  },
) {
  return new SignJWT({
    username: payload.username,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: ADMIN_JWT_ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${options.ttlDays}d`)
    .sign(getJwtSecret(options.secret))
}

export async function verifyAdminJwt(
  token: string,
  options: { secret: string },
): Promise<AdminJwtPayload> {
  const result = await jwtVerify(token, getJwtSecret(options.secret), {
    algorithms: [ADMIN_JWT_ALGORITHM],
  })

  return {
    sub: String(result.payload.sub),
    username: String(result.payload.username),
    tokenVersion: Number(result.payload.tokenVersion),
    iat: result.payload.iat,
    exp: result.payload.exp,
  }
}

export function shouldRenewAdminSession(expiresAtSeconds: number, renewBeforeDays: number, now?: number) {
  return shouldRenewToken(expiresAtSeconds, renewBeforeDays, now)
}
