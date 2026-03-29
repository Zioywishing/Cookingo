import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { loginAdmin } from "../../../services/admin/admin-auth-service"
import { defineAdminApiHandler, getRequestMeta } from "../../../utils/admin/api-handler"
import { writeAdminSessionCookie } from "../../../utils/auth/cookie"
import { signAdminJwt } from "../../../utils/auth/jwt"
import { successResponse } from "../../../utils/api-response"

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export default defineAdminApiHandler(async (event) => {
  const body = loginSchema.parse(await readBody(event))
  const runtimeConfig = useRuntimeConfig()
  const result = await loginAdmin(useAdminDb(), {
    ...body,
    ...getRequestMeta(event),
  })
  const token = await signAdminJwt(result.tokenPayload, {
    secret: runtimeConfig.adminJwtSecret,
    ttlDays: runtimeConfig.adminJwtTtlDays,
  })

  writeAdminSessionCookie(event, runtimeConfig.adminJwtCookieName, token, {
    ttlDays: runtimeConfig.adminJwtTtlDays,
    secure: process.env.NODE_ENV === "production",
  })

  return successResponse({
    user: result.user,
    authorization: result.authorization,
  })
})
