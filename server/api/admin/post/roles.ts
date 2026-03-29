import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { createAdminRole } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const createRoleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().default(""),
  permissionCodes: z.array(z.string().min(1)),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.roles")
  const body = createRoleSchema.parse(await readBody(event))
  const role = await createAdminRole(useAdminDb(), {
    actorUserId: session.user.id,
    ...body,
  })

  return successResponse(role)
})
