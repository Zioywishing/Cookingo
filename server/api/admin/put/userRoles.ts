import { readBody } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { assignAdminUserRoles } from "../../../services/admin/admin-user-service"
import { adminIdSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userRolesSchema = z.object({
  id: adminIdSchema,
  roleIds: z.array(adminIdSchema),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, AdminPermissionCode.Users)
  const body = userRolesSchema.parse(await readBody(event))

  await assignAdminUserRoles(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    roleIds: body.roleIds,
  })

  return successResponse(true)
})
