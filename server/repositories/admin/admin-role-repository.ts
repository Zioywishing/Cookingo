import { count, eq, inArray } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminPermission, adminRole, adminRolePermission } from "../../db/schema"

export function getAdminRoleByCode(db: AdminDb, code: string) {
  return db.select().from(adminRole).where(eq(adminRole.code, code)).get()
}

export function getAdminRoleById(db: AdminDb, roleId: string) {
  return db.select().from(adminRole).where(eq(adminRole.id, roleId)).get()
}

export function getAdminRolesByIds(db: AdminDb, roleIds: string[]) {
  if (roleIds.length === 0) {
    return []
  }

  return db.select().from(adminRole).where(inArray(adminRole.id, roleIds)).all()
}

export function createAdminRoleRecord(
  db: AdminDb,
  values: typeof adminRole.$inferInsert,
) {
  db.insert(adminRole).values(values).run()
  return values
}

export function updateAdminRoleFields(
  db: AdminDb,
  roleId: string,
  values: Partial<typeof adminRole.$inferInsert>,
) {
  db.update(adminRole).set(values).where(eq(adminRole.id, roleId)).run()
}

export function deleteAdminRoleRecord(db: AdminDb, roleId: string) {
  db.delete(adminRole).where(eq(adminRole.id, roleId)).run()
}

export function countAdminRoles(db: AdminDb) {
  const result = db.select({ value: count() }).from(adminRole).get()

  return result?.value || 0
}

export function listAdminRoles(db: AdminDb, page: number, pageSize: number) {
  return db
    .select()
    .from(adminRole)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()
}

export function replaceAdminRolePermissions(
  db: AdminDb,
  roleId: string,
  values: Array<typeof adminRolePermission.$inferInsert>,
) {
  db.delete(adminRolePermission).where(eq(adminRolePermission.roleId, roleId)).run()

  if (values.length > 0) {
    db.insert(adminRolePermission).values(values).run()
  }
}

export function getAdminPermissionCodesForRoleIds(db: AdminDb, roleIds: string[]) {
  if (roleIds.length === 0) {
    return []
  }

  return db
    .select({
      code: adminPermission.code,
    })
    .from(adminRolePermission)
    .innerJoin(adminPermission, eq(adminRolePermission.permissionId, adminPermission.id))
    .where(inArray(adminRolePermission.roleId, roleIds))
    .all()
}

export function getAdminPermissionsForRoleId(db: AdminDb, roleId: string) {
  return db
    .select({
      id: adminPermission.id,
      code: adminPermission.code,
      name: adminPermission.name,
      groupKey: adminPermission.groupKey,
      routePath: adminPermission.routePath,
      description: adminPermission.description,
    })
    .from(adminRolePermission)
    .innerJoin(adminPermission, eq(adminRolePermission.permissionId, adminPermission.id))
    .where(eq(adminRolePermission.roleId, roleId))
    .all()
}
