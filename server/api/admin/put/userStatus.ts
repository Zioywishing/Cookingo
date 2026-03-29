import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { setAdminUserStatus } from "../../../services/admin/admin-user-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const userStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "disabled"]),
})

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminPermission(event, "admin.users")
  const body = userStatusSchema.parse(await readBody(event))

  await setAdminUserStatus(useAdminDb(), {
    actorUserId: session.user.id,
    targetUserId: body.id,
    status: body.status,
  })

  return successResponse(true)
})
