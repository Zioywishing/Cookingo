import type { AdminDb } from "../../db/seed"
import {
  countAdminAuditLogs,
  listAdminAuditLogs as listAuditRows,
} from "../../repositories/admin/admin-audit-log-repository"
import {
  countAdminLoginLogs,
  listAdminLoginLogs as listLoginRows,
} from "../../repositories/admin/admin-login-log-repository"

export async function listAdminLoginLogs(
  db: AdminDb,
  input: {
    page: number
    pageSize: number
  },
) {
  return {
    items: listLoginRows(db, input.page, input.pageSize),
    total: countAdminLoginLogs(db),
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
  return {
    items: listAuditRows(db, input.page, input.pageSize),
    total: countAdminAuditLogs(db),
    page: input.page,
    pageSize: input.pageSize,
  }
}
