import {
  ADMIN_AUTH_INVALID,
  ADMIN_USER_DUPLICATE_USERNAME,
  ADMIN_USER_NOT_FOUND,
} from "../../utils/admin/error-codes"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { hashAdminPassword } from "../../utils/admin/password"
import { getNowIso } from "../../utils/admin/time"
import { createAdminAuditLog } from "../../repositories/admin/admin-audit-log-repository"
import { getAdminRolesByIds } from "../../repositories/admin/admin-role-repository"
import { countAdminUsers, createAdminUserRecord, getAdminUserById, getAdminUserByUsername, getAdminUserRoles, listAdminUsers as listAdminUserRows, replaceAdminUserRoles, updateAdminUserFields } from "../../repositories/admin/admin-user-repository"

import type { AdminDb } from "../../db/seed"
import type { AdminUserStatus } from "~~/shared/types"

function writeAuditLog(
  db: AdminDb,
  input: {
    actorUserId: string
    action: string
    targetType: string
    targetId: string
    summary: string
  },
) {
  createAdminAuditLog(db, {
    id: createAdminId(),
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    createdAt: getNowIso(),
  })
}

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
    throw new AdminDomainError(ADMIN_USER_DUPLICATE_USERNAME, "username already exists")
  }

  const now = getNowIso()
  const user = createAdminUserRecord(db, {
    id: createAdminId(),
    username: input.username,
    displayName: input.displayName,
    passwordHash: await hashAdminPassword(input.password),
    status: "active",
    tokenVersion: 1,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: now,
    updatedAt: now,
  })

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.user.create",
    targetType: "admin_user",
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
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, "user not found")
  }

  const roles = getAdminRolesByIds(db, input.roleIds)
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

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.user.assign_roles",
    targetType: "admin_user",
    targetId: user.id,
    summary: `assigned ${roles.length} roles`,
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
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, "user not found")
  }

  const now = getNowIso()

  updateAdminUserFields(db, user.id, {
    passwordHash: await hashAdminPassword(input.newPassword),
    tokenVersion: user.tokenVersion + 1,
    passwordChangedAt: now,
    updatedAt: now,
  })

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.user.reset_password",
    targetType: "admin_user",
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
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, "user not found")
  }

  const now = getNowIso()

  updateAdminUserFields(db, user.id, {
    status: input.status,
    tokenVersion: input.status === "disabled" ? user.tokenVersion + 1 : user.tokenVersion,
    updatedAt: now,
  })

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.user.set_status",
    targetType: "admin_user",
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
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, "user not found")
  }

  updateAdminUserFields(db, user.id, {
    displayName: input.displayName,
    updatedAt: getNowIso(),
  })

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.user.update_profile",
    targetType: "admin_user",
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
      ...user,
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
    throw new AdminDomainError(ADMIN_USER_NOT_FOUND, "user not found")
  }

  return {
    ...user,
    roles: getAdminUserRoles(db, user.id),
  }
}
