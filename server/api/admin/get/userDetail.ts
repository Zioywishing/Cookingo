import { getQuery } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { getAdminUserDetail } from "../../../services/admin/admin-user-service"
import { adminIdSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { serializeAdminUserDetail } from "../../../utils/admin/contracts"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userDetailQuerySchema = z.object({
  id: adminIdSchema,
})

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.Users)

  const query = userDetailQuerySchema.parse(getQuery(event))
  const detail = await getAdminUserDetail(useAdminDb(), query.id)

  return successResponse(serializeAdminUserDetail(detail))
})
