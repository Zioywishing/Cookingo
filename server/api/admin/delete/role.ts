import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { deleteAdminRole } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const deleteRoleSchema = z.object({
  id: z.string().min(1),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.roles")
  const body = deleteRoleSchema.parse(await readBody(event))

  await deleteAdminRole(useAdminDb(), {
    actorUserId: session.user.id,
    roleId: body.id,
  })

  return successResponse(true)
})
