import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { assignAdminUserRoles } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userRolesSchema = z.object({
  id: z.string().min(1),
  roleIds: z.array(z.string().min(1)),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.users")
  const body = userRolesSchema.parse(await readBody(event))

  await assignAdminUserRoles(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    roleIds: body.roleIds,
  })

  return successResponse(true)
})
