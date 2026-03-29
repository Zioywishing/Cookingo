import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminAuth } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"
import { changeOwnAdminPassword } from "../../../services/admin/admin-user-service"

const changePasswordSchema = z.object({
  newPassword: z.string().min(8),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminAuth(event)
  const body = changePasswordSchema.parse(await readBody(event))

  await changeOwnAdminPassword(useAdminDb(), {
    actorUserId: session.user.id,
    newPassword: body.newPassword,
  })

  return successResponse(true)
})
