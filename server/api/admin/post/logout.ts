import { clearAdminSessionCookie } from "../../../utils/auth/cookie"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { successResponse } from "../../../utils/api-response"

export default defineAdminApiHandler((event) => {
  const runtimeConfig = useRuntimeConfig()

  clearAdminSessionCookie(event, runtimeConfig.adminJwtCookieName)

  return successResponse(true)
})
