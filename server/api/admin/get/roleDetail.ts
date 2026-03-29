import { getQuery } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { getAdminRoleDetail } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const roleDetailQuerySchema = z.object({
  id: z.string().min(1),
})

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, "admin.roles")

  const query = roleDetailQuerySchema.parse(getQuery(event))
  const role = await getAdminRoleDetail(useAdminDb(), query.id)

  return successResponse(role)
})
