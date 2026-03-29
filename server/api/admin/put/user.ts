import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { updateAdminUserProfile } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const updateUserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.users")
  const body = updateUserSchema.parse(await readBody(event))

  await updateAdminUserProfile(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    displayName: body.displayName,
  })

  return successResponse(true)
})
