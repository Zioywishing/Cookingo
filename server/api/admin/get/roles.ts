import { getQuery } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { listAdminRoles } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { pageResponse } from "../../../utils/api-response"

const rolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, "admin.roles")

  const query = rolesQuerySchema.parse(getQuery(event))
  const result = await listAdminRoles(useAdminDb(), query)

  return pageResponse(result.items, result.total, result.page, result.pageSize)
})
