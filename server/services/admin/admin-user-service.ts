import {
  ADMIN_ROLE_NOT_FOUND,
  ADMIN_USER_DUPLICATE_USERNAME,
  ADMIN_USER_NOT_FOUND,
} from "../../utils/admin/error-codes"
import {
  ADMIN_DISABLED_USER_STATUS,
} from "../../utils/admin/constants"
import {
  AdminAuditAction,
  AdminAuditTargetType,
  writeAdminAuditLog,
} from "../../utils/admin/audit"
import {
  ADMIN_ROLE_NOT_FOUND_MESSAGE,
  ADMIN_USER_DUPLICATE_USERNAME_MESSAGE,
  ADMIN_USER_NOT_FOUND_MESSAGE,
} from "../../utils/admin/error-messages"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { hashAdminPassword } from "../../utils/admin/password"
import { getNowIso } from "../../utils/admin/time"
import {
  createInitialAdminUserFields,
  getNextAdminTokenVersion,
} from "../../utils/admin/user-record"
import { getAdminRolesByIds } from "../../repositories/admin/admin-role-repository"
import { countAdminUsers, createAdminUserRecord, getAdminUserById, getAdminUserByUsername, getAdminUserRoles, listAdminUsers as listAdminUserRows, replaceAdminUserRoles, updateAdminUserFields } from "../../repositories/admin/admin-user-repository"

import type { AdminDb } from "../../db/seed"
import type { AdminUserStatus } from "~~/shared/types"

export async function createAdminUser(
  db: AdminDb,
  input: {
    actorUserId: string
    username: string
    displayName: string
    password: string
  },
) {
  if (getAdminUserByUsername(db, input.username)) {
    throw new AdminDomainError(ADMIN_USER_DUPLICATE_USERNAME, ADMIN_USER_DUPLICATE_USERNAME_MESSAGE)
  }

  const now = getNowIso()
  const user = createAdminUserRecord(db, {
    id: createAdminId(),
    username: input.username,
    displayName: input.displayName,
    passwordHash: await hashAdminPassword(input.password),
    ...createInitialAdminUserFields(now),
  })

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.UserCreate,
    targetType: AdminAuditTargetType.User,
    targetId: user.id,
    summary: `created admin user ${user.username}`,
  })

  return user
}

export async function assignAdminUserRoles(
  db: AdminDb,
  input: {
    actorUserId: string
    targetUserId: string
    roleIds: string[]
  },
) {
  const user = getAdminUserById(db, input.targetUserId)

  if (!user) {
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, ADMIN_USER_NOT_FOUND_MESSAGE)
  }

  const roleIds = [...new Set(input.roleIds)]
  const roles = getAdminRolesByIds(db, roleIds)

  if (roles.length !== roleIds.length) {
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, ADMIN_ROLE_NOT_FOUND_MESSAGE)
  }

  const now = getNowIso()

  replaceAdminUserRoles(
    db,
    user.id,
    roles.map((role) => ({
      id: createAdminId(),
      userId: user.id,
      roleId: role.id,
      createdAt: now,
    })),
  )

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.UserAssignRoles,
    targetType: AdminAuditTargetType.User,
    targetId: user.id,
    summary: `assigned ${roleIds.length} roles`,
  })
}

export async function resetAdminUserPassword(
  db: AdminDb,
  input: {
    actorUserId: string
    targetUserId: string
    newPassword: string
  },
) {
  const user = getAdminUserById(db, input.targetUserId)

  if (!user) {
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, ADMIN_USER_NOT_FOUND_MESSAGE)
  }

  const now = getNowIso()

  updateAdminUserFields(db, user.id, {
    passwordHash: await hashAdminPassword(input.newPassword),
    tokenVersion: getNextAdminTokenVersion(user.tokenVersion),
    passwordChangedAt: now,
    updatedAt: now,
  })

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.UserResetPassword,
    targetType: AdminAuditTargetType.User,
    targetId: user.id,
    summary: `reset password for ${user.username}`,
  })
}

export async function changeOwnAdminPassword(
  db: AdminDb,
  input: {
    actorUserId: string
    newPassword: string
  },
) {
  return resetAdminUserPassword(db, {
    actorUserId: input.actorUserId,
    targetUserId: input.actorUserId,
    newPassword: input.newPassword,
  })
}

export async function setAdminUserStatus(
  db: AdminDb,
  input: {
    actorUserId: string
    targetUserId: string
    status: AdminUserStatus
  },
) {
  const user = getAdminUserById(db, input.targetUserId)

  if (!user) {
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, ADMIN_USER_NOT_FOUND_MESSAGE)
  }

  const now = getNowIso()

  updateAdminUserFields(db, user.id, {
    status: input.status,
    tokenVersion: input.status === ADMIN_DISABLED_USER_STATUS
      ? getNextAdminTokenVersion(user.tokenVersion)
      : user.tokenVersion,
    updatedAt: now,
  })

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.UserSetStatus,
    targetType: AdminAuditTargetType.User,
    targetId: user.id,
    summary: `set status to ${input.status}`,
  })
}

export async function updateAdminUserProfile(
  db: AdminDb,
  input: {
    actorUserId: string
    targetUserId: string
    displayName: string
  },
) {
  const user = getAdminUserById(db, input.targetUserId)

  if (!user) {
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, ADMIN_USER_NOT_FOUND_MESSAGE)
  }

  updateAdminUserFields(db, user.id, {
    displayName: input.displayName,
    updatedAt: getNowIso(),
  })

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.UserUpdateProfile,
    targetType: AdminAuditTargetType.User,
    targetId: user.id,
    summary: `updated display name to ${input.displayName}`,
  })
}

export async function listAdminUsers(
  db: AdminDb,
  input: {
    page: number
    pageSize: number
  },
) {
  return {
    items: listAdminUserRows(db, input.page, input.pageSize).map((user) => ({
      user,
      roles: getAdminUserRoles(db, user.id),
    })),
    total: countAdminUsers(db),
    page: input.page,
    pageSize: input.pageSize,
  }
}

export async function getAdminUserDetail(db: AdminDb, userId: string) {
  const user = getAdminUserById(db, userId)

  if (!user) {
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, ADMIN_USER_NOT_FOUND_MESSAGE)
  }

  return {
    user,
    roles: getAdminUserRoles(db, user.id),
  }
}
