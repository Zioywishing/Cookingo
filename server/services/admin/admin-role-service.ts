import {
  ADMIN_PERMISSION_NOT_FOUND,
  ADMIN_ROLE_DUPLICATE_CODE,
  ADMIN_ROLE_IN_USE,
  ADMIN_ROLE_NOT_FOUND,
} from "../../utils/admin/error-codes"
import {
  ADMIN_FIRST_PAGE,
  ADMIN_ROLE_OPTIONS_FALLBACK_PAGE_SIZE,
} from "../../utils/admin/constants"
import {
  AdminAuditAction,
  AdminAuditTargetType,
  writeAdminAuditLog,
} from "../../utils/admin/audit"
import {
  ADMIN_PERMISSION_NOT_FOUND_MESSAGE,
  ADMIN_ROLE_DUPLICATE_CODE_MESSAGE,
  ADMIN_ROLE_IN_USE_MESSAGE,
  ADMIN_ROLE_NOT_FOUND_MESSAGE,
  ADMIN_ROLE_SYSTEM_DELETE_MESSAGE,
} from "../../utils/admin/error-messages"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { ROOT_ROLE_CODE } from "../../utils/admin/permissions"
import { getNowIso } from "../../utils/admin/time"
import { getAdminPermissionsByCodes, listAdminPermissions } from "../../repositories/admin/admin-permission-repository"
import { countAdminRoles, createAdminRoleRecord, deleteAdminRoleRecord, getAdminPermissionsForRoleId, getAdminRoleByCode, getAdminRoleById, listAdminRoles as listRoleRows, replaceAdminRolePermissions, updateAdminRoleFields } from "../../repositories/admin/admin-role-repository"
import { getUsersByRoleId } from "../../repositories/admin/admin-user-repository"

import type { AdminDb } from "../../db/seed"

function mapRolePermissions(
  roleId: string,
  permissionIds: string[],
) {
  const now = getNowIso()

  return permissionIds.map((permissionId) => ({
    id: createAdminId(),
    roleId,
    permissionId,
    createdAt: now,
  }))
}

export async function createAdminRole(
  db: AdminDb,
  input: {
    actorUserId: string
    name: string
    code: string
    description: string
    permissionCodes: string[]
  },
) {
  if (getAdminRoleByCode(db, input.code)) {
    throw new AdminDomainError(ADMIN_ROLE_DUPLICATE_CODE, ADMIN_ROLE_DUPLICATE_CODE_MESSAGE)
  }

  const permissions = getAdminPermissionsByCodes(db, input.permissionCodes)

  if (permissions.length !== input.permissionCodes.length) {
    throw new AdminDomainError(ADMIN_PERMISSION_NOT_FOUND, ADMIN_PERMISSION_NOT_FOUND_MESSAGE)
  }

  const now = getNowIso()
  const role = createAdminRoleRecord(db, {
    id: createAdminId(),
    name: input.name,
    code: input.code,
    description: input.description,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  })

  replaceAdminRolePermissions(
    db,
    role.id,
    mapRolePermissions(
      role.id,
      permissions.map((permission) => permission.id),
    ),
  )

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.RoleCreate,
    targetType: AdminAuditTargetType.Role,
    targetId: role.id,
    summary: `created role ${role.code}`,
  })

  return role
}

export async function updateAdminRole(
  db: AdminDb,
  input: {
    actorUserId: string
    roleId: string
    name: string
    description: string
    permissionCodes: string[]
  },
) {
  const role = getAdminRoleById(db, input.roleId)

  if (!role) {
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, ADMIN_ROLE_NOT_FOUND_MESSAGE)
  }

  const permissions = getAdminPermissionsByCodes(db, input.permissionCodes)

  if (permissions.length !== input.permissionCodes.length) {
    throw new AdminDomainError(ADMIN_PERMISSION_NOT_FOUND, ADMIN_PERMISSION_NOT_FOUND_MESSAGE)
  }

  updateAdminRoleFields(db, role.id, {
    name: input.name,
    description: input.description,
    updatedAt: getNowIso(),
  })

  replaceAdminRolePermissions(
    db,
    role.id,
    mapRolePermissions(
      role.id,
      permissions.map((permission) => permission.id),
    ),
  )

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.RoleUpdate,
    targetType: AdminAuditTargetType.Role,
    targetId: role.id,
    summary: `updated role ${role.code}`,
  })
}

export async function deleteAdminRole(
  db: AdminDb,
  input: {
    actorUserId: string
    roleId: string
  },
) {
  const role = getAdminRoleById(db, input.roleId)

  if (!role) {
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, ADMIN_ROLE_NOT_FOUND_MESSAGE)
  }

  if (role.code === ROOT_ROLE_CODE || role.isSystem) {
    throw new AdminDomainError(ADMIN_ROLE_IN_USE, ADMIN_ROLE_SYSTEM_DELETE_MESSAGE)
  }

  const assignedUsers = getUsersByRoleId(db, role.id)

  if (assignedUsers.length > 0) {
    throw new AdminDomainError(ADMIN_ROLE_IN_USE, ADMIN_ROLE_IN_USE_MESSAGE)
  }

  replaceAdminRolePermissions(db, role.id, [])
  deleteAdminRoleRecord(db, role.id)

  writeAdminAuditLog(db, {
    actorUserId: input.actorUserId,
    action: AdminAuditAction.RoleDelete,
    targetType: AdminAuditTargetType.Role,
    targetId: role.id,
    summary: `deleted role ${role.code}`,
  })
}

export async function listAdminRoles(
  db: AdminDb,
  input: {
    page: number
    pageSize: number
  },
) {
  return {
    items: listRoleRows(db, input.page, input.pageSize),
    total: countAdminRoles(db),
    page: input.page,
    pageSize: input.pageSize,
  }
}

export async function getAdminRoleDetail(db: AdminDb, roleId: string) {
  const role = getAdminRoleById(db, roleId)

  if (!role) {
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, ADMIN_ROLE_NOT_FOUND_MESSAGE)
  }

  return {
    ...role,
    permissions: getAdminPermissionsForRoleId(db, role.id),
  }
}

export async function getAdminRoleOptions(db: AdminDb) {
  return {
    items: listRoleRows(db, ADMIN_FIRST_PAGE, countAdminRoles(db) || ADMIN_ROLE_OPTIONS_FALLBACK_PAGE_SIZE),
    total: countAdminRoles(db),
  }
}

export async function getAllAdminPermissions(db: AdminDb) {
  return listAdminPermissions(db)
}
