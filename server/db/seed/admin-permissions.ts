import { eq, inArray } from "drizzle-orm"

import type { ReturnTypeCreateAdminDbClient } from "./types"
import { createAdminId } from "../../utils/admin/id"
import { ADMIN_PERMISSION_SEED, ROOT_ROLE_CODE } from "../../utils/admin/permissions"
import { getNowIso } from "../../utils/admin/time"
import { adminPermission, adminRole, adminRolePermission } from "../schema"

export function seedAdminPermissions(db: ReturnTypeCreateAdminDbClient) {
  const now = getNowIso()

  db.insert(adminPermission)
    .values(
      ADMIN_PERMISSION_SEED.map((permission) => ({
        id: createAdminId(),
        code: permission.code,
        name: permission.name,
        groupKey: permission.groupKey,
        routePath: permission.routePath,
        description: permission.description,
        createdAt: now,
      })),
    )
    .onConflictDoNothing({ target: adminPermission.code })
    .run()

  db.insert(adminRole)
    .values({
      id: createAdminId(),
      name: "超级管理员",
      code: ROOT_ROLE_CODE,
      description: "系统保留超级管理员角色",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: adminRole.code })
    .run()

  const rootRole = db.select().from(adminRole).where(eq(adminRole.code, ROOT_ROLE_CODE)).get()

  if (!rootRole) {
    throw new Error("root role missing after seed")
  }

  const permissions = db.select().from(adminPermission).where(
    inArray(
      adminPermission.code,
      ADMIN_PERMISSION_SEED.map((permission) => permission.code),
    ),
  ).all()

  db.insert(adminRolePermission)
    .values(
      permissions.map((permission) => ({
        id: createAdminId(),
        roleId: rootRole.id,
        permissionId: permission.id,
        createdAt: now,
      })),
    )
    .onConflictDoNothing({
      target: [adminRolePermission.roleId, adminRolePermission.permissionId],
    })
    .run()
}
