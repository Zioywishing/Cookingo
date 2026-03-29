import { and, count, eq, inArray } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminRole, adminUser, adminUserRole } from "../../db/schema"

export function countAdminUsers(db: AdminDb) {
  const result = db.select({ value: count() }).from(adminUser).get()

  return result?.value || 0
}

export function createAdminUserRecord(
  db: AdminDb,
  values: typeof adminUser.$inferInsert,
) {
  db.insert(adminUser).values(values).run()
  return values
}

export function getAdminUserById(db: AdminDb, userId: string) {
  return db.select().from(adminUser).where(eq(adminUser.id, userId)).get()
}

export function getAdminUserByUsername(db: AdminDb, username: string) {
  return db.select().from(adminUser).where(eq(adminUser.username, username)).get()
}

export function updateAdminUserFields(
  db: AdminDb,
  userId: string,
  values: Partial<typeof adminUser.$inferInsert>,
) {
  db.update(adminUser).set(values).where(eq(adminUser.id, userId)).run()
}

export function replaceAdminUserRoles(
  db: AdminDb,
  userId: string,
  values: Array<typeof adminUserRole.$inferInsert>,
) {
  db.delete(adminUserRole).where(eq(adminUserRole.userId, userId)).run()

  if (values.length > 0) {
    db.insert(adminUserRole).values(values).run()
  }
}

export function createAdminUserRoles(
  db: AdminDb,
  values: Array<typeof adminUserRole.$inferInsert>,
) {
  if (values.length > 0) {
    db.insert(adminUserRole).values(values).run()
  }
}

export function getAdminUserRoleRows(db: AdminDb, userId: string) {
  return db.select().from(adminUserRole).where(eq(adminUserRole.userId, userId)).all()
}

export function getAdminUserRoles(db: AdminDb, userId: string) {
  return db
    .select({
      id: adminRole.id,
      code: adminRole.code,
      name: adminRole.name,
    })
    .from(adminUserRole)
    .innerJoin(adminRole, eq(adminUserRole.roleId, adminRole.id))
    .where(eq(adminUserRole.userId, userId))
    .all()
}

export function adminUserHasRole(db: AdminDb, userId: string, roleId: string) {
  return db
    .select({ id: adminUserRole.id })
    .from(adminUserRole)
    .where(and(eq(adminUserRole.userId, userId), eq(adminUserRole.roleId, roleId)))
    .get()
}

export function getUsersByRoleId(db: AdminDb, roleId: string) {
  return db.select().from(adminUserRole).where(eq(adminUserRole.roleId, roleId)).all()
}

export function getAdminUsersByIds(db: AdminDb, userIds: string[]) {
  if (userIds.length === 0) {
    return []
  }

  return db.select().from(adminUser).where(inArray(adminUser.id, userIds)).all()
}

export function listAdminUsers(db: AdminDb, page: number, pageSize: number) {
  return db
    .select()
    .from(adminUser)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()
}
