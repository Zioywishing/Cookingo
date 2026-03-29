import { getQuery } from "h3"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { listAdminAuditLogs } from "../../../services/admin/admin-log-service"
import { createAdminPaginationQuerySchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { pageResponse } from "../../../utils/api-response"

const auditLogsQuerySchema = createAdminPaginationQuerySchema()

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.AuditLogs)

  const query = auditLogsQuerySchema.parse(getQuery(event))
  const result = await listAdminAuditLogs(useAdminDb(), query)

  return pageResponse(result.items, result.total, result.page, result.pageSize)
})
