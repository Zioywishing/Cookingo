import { desc, eq } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminLoginLog } from "../../db/schema"

export function createAdminLoginLog(
  db: AdminDb,
  values: typeof adminLoginLog.$inferInsert,
) {
  db.insert(adminLoginLog).values(values).run()
}

export function listAdminLoginLogs(db: AdminDb) {
  return db.select().from(adminLoginLog).orderBy(desc(adminLoginLog.createdAt)).all()
}

export function listAdminLoginLogsByUserId(db: AdminDb, userId: string) {
  return db.select().from(adminLoginLog).where(eq(adminLoginLog.userId, userId)).all()
}
