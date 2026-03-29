import type {
  AdminAuthorization,
  AdminSessionPayload,
  AdminSessionUser,
  AdminUserDetail,
  AdminUserListItem,
  AdminRoleSummary,
} from "~~/shared/types/admin"

import { adminUser } from "../../db/schema"

type AdminUserRecord = typeof adminUser.$inferSelect

interface AdminUserWithRoles {
  user: AdminUserRecord
  roles: AdminRoleSummary[]
}

export function serializeAdminSessionUser(user: Pick<AdminUserRecord, "id" | "username" | "displayName" | "status">): AdminSessionUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    status: user.status as AdminSessionUser["status"],
  }
}

export function serializeAdminSessionPayload(input: {
  user: AdminUserRecord
  authorization: {
    roleCodes: string[]
    permissions: string[]
  }
}): AdminSessionPayload {
  return {
    user: serializeAdminSessionUser(input.user),
    authorization: {
      roleCodes: input.authorization.roleCodes,
      permissions: input.authorization.permissions as AdminAuthorization["permissions"],
    },
  }
}

export function serializeAdminUserListItem(input: AdminUserWithRoles): AdminUserListItem {
  return {
    ...serializeAdminSessionUser(input.user),
    roles: input.roles,
    lastLoginAt: input.user.lastLoginAt,
    createdAt: input.user.createdAt,
    updatedAt: input.user.updatedAt,
  }
}

export function serializeAdminUserDetail(input: AdminUserWithRoles): AdminUserDetail {
  return {
    ...serializeAdminUserListItem(input),
    passwordChangedAt: input.user.passwordChangedAt,
  }
}
