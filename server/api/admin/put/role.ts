import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { updateAdminRole } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  permissionCodes: z.array(z.string().min(1)),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.roles")
  const body = updateRoleSchema.parse(await readBody(event))

  await updateAdminRole(useAdminDb(), {
    actorUserId: session.user.id,
    roleId: body.id,
    name: body.name,
    description: body.description,
    permissionCodes: body.permissionCodes,
  })

  return successResponse(true)
})
