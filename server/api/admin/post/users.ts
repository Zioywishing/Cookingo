import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { createAdminUser } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const createUserSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().min(1),
  password: z.string().min(8),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.users")
  const body = createUserSchema.parse(await readBody(event))
  const user = await createAdminUser(useAdminDb(), {
    actorUserId: session.user.id,
    ...body,
  })

  return successResponse(user)
})
