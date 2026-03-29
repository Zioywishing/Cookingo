import {
  ADMIN_SYSTEM_ALREADY_INITIALIZED,
} from "../../utils/admin/error-codes"
import { AdminDomainError } from "../../utils/admin/errors"
import { createAdminId } from "../../utils/admin/id"
import { hashAdminPassword } from "../../utils/admin/password"
import { ROOT_ROLE_CODE } from "../../utils/admin/permissions"
import { getNowIso } from "../../utils/admin/time"
import { seedAdminBaseData } from "../../db/seed"
import { createAdminUserRecord, countAdminUsers, createAdminUserRoles } from "../../repositories/admin/admin-user-repository"
import { getAdminRoleByCode } from "../../repositories/admin/admin-role-repository"

import type { AdminDb } from "../../db/seed"

export async function getAdminInitStatus(db: AdminDb) {
  seedAdminBaseData(db)

  return {
    initialized: countAdminUsers(db) > 0,
  }
}

export async function initializeAdminSystem(
  db: AdminDb,
  input: {
    username: string
    displayName: string
    password: string
  },
) {
  seedAdminBaseData(db)

  if (countAdminUsers(db) > 0) {
    throw new AdminDomainError(
      ADMIN_SYSTEM_ALREADY_INITIALIZED,
      "system already initialized",
    )
  }

  const now = getNowIso()
  const rootRole = getAdminRoleByCode(db, ROOT_ROLE_CODE)

  if (!rootRole) {
    throw new Error("root role missing")
  }

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

  createAdminUserRoles(db, [
    {
      id: createAdminId(),
      userId: user.id,
      roleId: rootRole.id,
      createdAt: now,
    },
  ])

  return user
}
