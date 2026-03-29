import { readBody } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { setAdminUserStatus } from "../../../services/admin/admin-user-service"
import { adminIdSchema, adminUserStatusSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userStatusSchema = z.object({
  id: adminIdSchema,
  status: adminUserStatusSchema,
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, AdminPermissionCode.Users)
  const body = userStatusSchema.parse(await readBody(event))

  await setAdminUserStatus(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    status: body.status,
  })

  return successResponse(true)
})
