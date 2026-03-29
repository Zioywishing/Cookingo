import { readBody } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { updateAdminRole } from "../../../services/admin/admin-role-service"
import { adminIdSchema, adminNonEmptyStringSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const updateRoleSchema = z.object({
  id: adminIdSchema,
  name: adminNonEmptyStringSchema,
  description: z.string().default(""),
  permissionCodes: z.array(adminNonEmptyStringSchema),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, AdminPermissionCode.Roles)
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
