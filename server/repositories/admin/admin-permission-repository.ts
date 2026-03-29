import { eq, inArray } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminPermission } from "../../db/schema"

export function getAdminPermissionByCode(db: AdminDb, code: string) {
  return db.select().from(adminPermission).where(eq(adminPermission.code, code)).get()
}

export function getAdminPermissionsByCodes(db: AdminDb, codes: string[]) {
  if (codes.length === 0) {
    return []
  }

  return db.select().from(adminPermission).where(inArray(adminPermission.code, codes)).all()
}

export function listAdminPermissions(db: AdminDb) {
  return db.select().from(adminPermission).all()
}
