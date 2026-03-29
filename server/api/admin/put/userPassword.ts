import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { resetAdminUserPassword } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userPasswordSchema = z.object({
  id: z.string().min(1),
  newPassword: z.string().min(8),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.users")
  const body = userPasswordSchema.parse(await readBody(event))

  await resetAdminUserPassword(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    newPassword: body.newPassword,
  })

  return successResponse(true)
})
