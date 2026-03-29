import {
  ADMIN_AUTH_BAD_CREDENTIALS,
  ADMIN_AUTH_DISABLED,
  ADMIN_AUTH_INVALID,
} from "../../utils/admin/error-codes"
import {
  ADMIN_ACTIVE_USER_STATUS,
  AdminLoginReason,
  AdminLoginResult,
} from "../../utils/admin/constants"
import {
  ADMIN_AUTH_BAD_CREDENTIALS_MESSAGE,
  ADMIN_AUTH_DISABLED_MESSAGE,
  ADMIN_AUTH_INVALID_MESSAGE,
} from "../../utils/admin/error-messages"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { verifyAdminPassword } from "../../utils/admin/password"
import { ADMIN_PERMISSION_SEED, ROOT_ROLE_CODE } from "../../utils/admin/permissions"
import { getNowIso } from "../../utils/admin/time"
import { createAdminLoginLog } from "../../repositories/admin/admin-login-log-repository"
import { getAdminPermissionCodesForRoleIds } from "../../repositories/admin/admin-role-repository"
import { getAdminUserById, getAdminUserByUsername, getAdminUserRoles, updateAdminUserFields } from "../../repositories/admin/admin-user-repository"

import type { AdminDb } from "../../db/seed"
import type { AdminJwtPayload } from "../../utils/auth/jwt"

async function writeLoginAttempt(
  db: AdminDb,
  input: {
    username: string
    userId?: string | null
    result: (typeof AdminLoginResult)[keyof typeof AdminLoginResult]
    reason?: string | null
    ip?: string | null
    userAgent?: string | null
  },
) {
  createAdminLoginLog(db, {
    id: createAdminId(),
    username: input.username,
    userId: input.userId || null,
    result: input.result,
    reason: input.reason || null,
    ip: input.ip || null,
    userAgent: input.userAgent || null,
    createdAt: getNowIso(),
  })
}

export async function getAdminUserAuthorization(
  db: AdminDb,
  userId: string,
  roleCodeOverrides?: string[],
) {
  const roles = getAdminUserRoles(db, userId)
  const roleCodes = roleCodeOverrides || roles.map((role) => role.code)

  if (roleCodes.includes(ROOT_ROLE_CODE)) {
    return {
      roleCodes,
      permissions: ADMIN_PERMISSION_SEED.map((permission) => permission.code).sort(),
    }
  }

  const permissionRows = getAdminPermissionCodesForRoleIds(
    db,
    roles.map((role) => role.id),
  )

  return {
    roleCodes,
    permissions: [...new Set(permissionRows.map((row) => row.code))].sort(),
  }
}

export async function loginAdmin(
  db: AdminDb,
  input: {
    username: string
    password: string
    ip?: string | null
    userAgent?: string | null
  },
) {
  const user = getAdminUserByUsername(db, input.username)

  if (!user) {
    await writeLoginAttempt(db, {
      username: input.username,
      result: AdminLoginResult.Failure,
      reason: AdminLoginReason.BadCredentials,
      ip: input.ip,
      userAgent: input.userAgent,
    })

    throw new AdminDomainError(
      ADMIN_AUTH_BAD_CREDENTIALS,
      ADMIN_AUTH_BAD_CREDENTIALS_MESSAGE,
    )
  }

  if (user.status !== ADMIN_ACTIVE_USER_STATUS) {
    await writeLoginAttempt(db, {
      username: input.username,
      userId: user.id,
      result: AdminLoginResult.Failure,
      reason: AdminLoginReason.Disabled,
      ip: input.ip,
      userAgent: input.userAgent,
    })

    throw new AdminDomainError(ADMIN_AUTH_DISABLED, ADMIN_AUTH_DISABLED_MESSAGE)
  }

  const passwordValid = await verifyAdminPassword(input.password, user.passwordHash)

  if (!passwordValid) {
    await writeLoginAttempt(db, {
      username: input.username,
      userId: user.id,
      result: AdminLoginResult.Failure,
      reason: AdminLoginReason.BadCredentials,
      ip: input.ip,
      userAgent: input.userAgent,
    })

    throw new AdminDomainError(
      ADMIN_AUTH_BAD_CREDENTIALS,
      ADMIN_AUTH_BAD_CREDENTIALS_MESSAGE,
    )
  }

  updateAdminUserFields(db, user.id, {
    lastLoginAt: getNowIso(),
    updatedAt: getNowIso(),
  })

  await writeLoginAttempt(db, {
    username: input.username,
    userId: user.id,
    result: AdminLoginResult.Success,
    reason: null,
    ip: input.ip,
    userAgent: input.userAgent,
  })

  const authorization = await getAdminUserAuthorization(db, user.id)

  return {
    user,
    authorization,
    tokenPayload: {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    },
  }
}

export async function authenticateAdminSession(db: AdminDb, tokenPayload: AdminJwtPayload) {
  const user = getAdminUserById(db, tokenPayload.sub)

  if (!user || user.status !== ADMIN_ACTIVE_USER_STATUS || user.tokenVersion !== tokenPayload.tokenVersion) {
    throw new AdminDomainError(ADMIN_AUTH_INVALID, ADMIN_AUTH_INVALID_MESSAGE)
  }

  const authorization = await getAdminUserAuthorization(db, user.id)

  return {
    user,
    authorization,
  }
}
