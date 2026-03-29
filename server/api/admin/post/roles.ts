import { readBody } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { createAdminRole } from "../../../services/admin/admin-role-service"
import { adminNonEmptyStringSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const createRoleSchema = z.object({
  name: adminNonEmptyStringSchema,
  code: adminNonEmptyStringSchema,
  description: z.string().default(""),
  permissionCodes: z.array(adminNonEmptyStringSchema),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, AdminPermissionCode.Roles)
  const body = createRoleSchema.parse(await readBody(event))
  const role = await createAdminRole(useAdminDb(), {
    actorUserId: session.user.id,
    ...body,
  })

  return successResponse(role)
})
