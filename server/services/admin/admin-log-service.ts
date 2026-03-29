import { count } from "drizzle-orm"

import type { AdminDb } from "../../db/seed"
import { adminAuditLog, adminLoginLog } from "../../db/schema"
import { listAdminAuditLogs as listAuditRows } from "../../repositories/admin/admin-audit-log-repository"
import { listAdminLoginLogs as listLoginRows } from "../../repositories/admin/admin-login-log-repository"

export async function listAdminLoginLogs(
  db: AdminDb,
  input: {
    page: number
    pageSize: number
  },
) {
  const allRows = listLoginRows(db)

  return {
    items: allRows.slice((input.page - 1) * input.pageSize, input.page * input.pageSize),
    total: db.select({ value: count() }).from(adminLoginLog).get()?.value || 0,
    page: input.page,
    pageSize: input.pageSize,
  }
}

export async function listAdminAuditLogs(
  db: AdminDb,
  input: {
    page: number
    pageSize: number
  },
) {
  const allRows = listAuditRows(db)

  return {
    items: allRows.slice((input.page - 1) * input.pageSize, input.page * input.pageSize),
    total: db.select({ value: count() }).from(adminAuditLog).get()?.value || 0,
    page: input.page,
    pageSize: input.pageSize,
  }
}
