import {
  ADMIN_PERMISSION_NOT_FOUND,
  ADMIN_ROLE_DUPLICATE_CODE,
  ADMIN_ROLE_IN_USE,
  ADMIN_ROLE_NOT_FOUND,
} from "../../utils/admin/error-codes"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { ROOT_ROLE_CODE } from "../../utils/admin/permissions"
import { getNowIso } from "../../utils/admin/time"
import { createAdminAuditLog } from "../../repositories/admin/admin-audit-log-repository"
import { getAdminPermissionsByCodes, listAdminPermissions } from "../../repositories/admin/admin-permission-repository"
import { countAdminRoles, createAdminRoleRecord, deleteAdminRoleRecord, getAdminPermissionsForRoleId, getAdminRoleByCode, getAdminRoleById, listAdminRoles as listRoleRows, replaceAdminRolePermissions, updateAdminRoleFields } from "../../repositories/admin/admin-role-repository"
import { getUsersByRoleId } from "../../repositories/admin/admin-user-repository"

import type { AdminDb } from "../../db/seed"

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
    throw new AdminDomainError(ADMIN_ROLE_DUPLICATE_CODE, "role code already exists")
  }

  const permissions = getAdminPermissionsByCodes(db, input.permissionCodes)

  if (permissions.length !== input.permissionCodes.length) {
    throw new AdminDomainError(ADMIN_PERMISSION_NOT_FOUND, "permission not found")
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

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.role.create",
    targetType: "admin_role",
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
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, "role not found")
  }

  const permissions = getAdminPermissionsByCodes(db, input.permissionCodes)

  if (permissions.length !== input.permissionCodes.length) {
    throw new AdminDomainError(ADMIN_PERMISSION_NOT_FOUND, "permission not found")
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

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.role.update",
    targetType: "admin_role",
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
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, "role not found")
  }

  if (role.code === ROOT_ROLE_CODE || role.isSystem) {
    throw new AdminDomainError(ADMIN_ROLE_IN_USE, "system role cannot be deleted")
  }

  const assignedUsers = getUsersByRoleId(db, role.id)

  if (assignedUsers.length > 0) {
    throw new AdminDomainError(ADMIN_ROLE_IN_USE, "role is in use")
  }

  replaceAdminRolePermissions(db, role.id, [])
  deleteAdminRoleRecord(db, role.id)

  writeAuditLog(db, {
    actorUserId: input.actorUserId,
    action: "admin.role.delete",
    targetType: "admin_role",
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
    throw new AdminDomainError(ADMIN_ROLE_NOT_FOUND, "role not found")
  }

  return {
    ...role,
    permissions: getAdminPermissionsForRoleId(db, role.id),
  }
}

export async function getAdminRoleOptions(db: AdminDb) {
  return {
    items: listRoleRows(db, 1, countAdminRoles(db) || 100),
    total: countAdminRoles(db),
  }
}

export async function getAllAdminPermissions(db: AdminDb) {
  return listAdminPermissions(db)
}
