import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminAuth } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

export default defineAdminApiHandler(async (event) => {
  const session = await requireAdminAuth(event)

  return successResponse({
    user: session.user,
    authorization: session.authorization,
  })
})
