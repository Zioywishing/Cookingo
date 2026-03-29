import { getQuery } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { getAdminUserDetail } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userDetailQuerySchema = z.object({
  id: z.string().min(1),
})

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, "admin.users")

  const query = userDetailQuerySchema.parse(getQuery(event))
  const detail = await getAdminUserDetail(useAdminDb(), query.id)

  return successResponse(detail)
})
