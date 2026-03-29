import { count, desc, eq } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminLoginLog } from "../../db/schema"

export function createAdminLoginLog(
  db: AdminDb,
  values: typeof adminLoginLog.$inferInsert,
) {
  db.insert(adminLoginLog).values(values).run()
}

export function countAdminLoginLogs(db: AdminDb) {
  return db.select({ value: count() }).from(adminLoginLog).get()?.value || 0
}

export function listAdminLoginLogs(db: AdminDb, page: number, pageSize: number) {
  return db
    .select()
    .from(adminLoginLog)
    .orderBy(desc(adminLoginLog.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()
}

export function listAdminLoginLogsByUserId(db: AdminDb, userId: string) {
  return db.select().from(adminLoginLog).where(eq(adminLoginLog.userId, userId)).all()
}
