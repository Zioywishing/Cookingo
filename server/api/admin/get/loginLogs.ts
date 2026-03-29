import { getQuery } from "h3"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { listAdminLoginLogs } from "../../../services/admin/admin-log-service"
import { createAdminPaginationQuerySchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { pageResponse } from "../../../utils/api-response"

const loginLogsQuerySchema = createAdminPaginationQuerySchema()

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.LoginLogs)

  const query = loginLogsQuerySchema.parse(getQuery(event))
  const result = await listAdminLoginLogs(useAdminDb(), query)

  return pageResponse(result.items, result.total, result.page, result.pageSize)
})
