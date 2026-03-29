import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { initializeAdminSystem } from "../../../services/admin/admin-init-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { successResponse } from "../../../utils/api-response"

const initAdminSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().min(1),
  password: z.string().min(8),
})

export default defineAdminApiHandler(async (event) => {
  const body = initAdminSchema.parse(await readBody(event))
  const user = await initializeAdminSystem(useAdminDb(), body)

  return successResponse(user)
})
