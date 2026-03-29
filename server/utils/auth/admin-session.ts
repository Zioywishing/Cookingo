import type { H3Event } from "h3"

import { useAdminDb } from "../../db/client"
import { authenticateAdminSession } from "../../services/admin/admin-auth-service"
import { ADMIN_AUTH_INVALID, ADMIN_PERMISSION_DENIED } from "../admin/error-codes"
import {
  ADMIN_AUTH_INVALID_MESSAGE,
  ADMIN_PERMISSION_DENIED_MESSAGE,
} from "../admin/error-messages"
import { AdminDomainError } from "../admin/errors"
import {
  readAdminSessionCookie,
  shouldUseSecureAdminSessionCookie,
  writeAdminSessionCookie,
} from "./cookie"
import { shouldRenewAdminSession, signAdminJwt, verifyAdminJwt } from "./jwt"

export async function requireAdminAuth(event: H3Event) {
  if (event.context.adminAuth) {
    return event.context.adminAuth
  }

  const runtimeConfig = useRuntimeConfig()
  const token = readAdminSessionCookie(event, runtimeConfig.adminJwtCookieName)

  if (!token) {
    throw new AdminDomainError(ADMIN_AUTH_INVALID, ADMIN_AUTH_INVALID_MESSAGE)
  }

  const tokenPayload = await verifyAdminJwt(token, {
    secret: runtimeConfig.adminJwtSecret,
  })
  const db = useAdminDb()
  const session = await authenticateAdminSession(db, tokenPayload)

  if (
    tokenPayload.exp
    && shouldRenewAdminSession(
      tokenPayload.exp,
      runtimeConfig.adminJwtRenewBeforeDays,
    )
  ) {
    const renewedToken = await signAdminJwt(
      {
        sub: session.user.id,
        username: session.user.username,
        tokenVersion: session.user.tokenVersion,
      },
      {
        secret: runtimeConfig.adminJwtSecret,
        ttlDays: runtimeConfig.adminJwtTtlDays,
      },
    )

    writeAdminSessionCookie(
      event,
      runtimeConfig.adminJwtCookieName,
      renewedToken,
      {
        ttlDays: runtimeConfig.adminJwtTtlDays,
        secure: shouldUseSecureAdminSessionCookie(),
      },
    )
  }

  event.context.adminAuth = session
  return session
}

export async function requireAdminPermission(event: H3Event, permissionCode: string) {
  const session = await requireAdminAuth(event)

  if (!session.authorization.permissions.includes(permissionCode)) {
    throw new AdminDomainError(ADMIN_PERMISSION_DENIED, ADMIN_PERMISSION_DENIED_MESSAGE)
  }

  return session
}
