import { getQuery } from "h3"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { listAdminRoles } from "../../../services/admin/admin-role-service"
import { createAdminPaginationQuerySchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { pageResponse } from "../../../utils/api-response"

const rolesQuerySchema = createAdminPaginationQuerySchema()

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.Roles)

  const query = rolesQuerySchema.parse(getQuery(event))
  const result = await listAdminRoles(useAdminDb(), query)

  return pageResponse(result.items, result.total, result.page, result.pageSize)
})
