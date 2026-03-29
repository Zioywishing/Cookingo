import { desc } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminAuditLog } from "../../db/schema"

export function createAdminAuditLog(
  db: AdminDb,
  values: typeof adminAuditLog.$inferInsert,
) {
  db.insert(adminAuditLog).values(values).run()
}

export function listAdminAuditLogs(db: AdminDb) {
  return db.select().from(adminAuditLog).orderBy(desc(adminAuditLog.createdAt)).all()
}
