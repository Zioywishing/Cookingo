import { count, desc } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminAuditLog } from "../../db/schema"

export function createAdminAuditLog(
  db: AdminDb,
  values: typeof adminAuditLog.$inferInsert,
) {
  db.insert(adminAuditLog).values(values).run()
}

export function countAdminAuditLogs(db: AdminDb) {
  return db.select({ value: count() }).from(adminAuditLog).get()?.value || 0
}

export function listAdminAuditLogs(db: AdminDb, page: number, pageSize: number) {
  return db
    .select()
    .from(adminAuditLog)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()
}
