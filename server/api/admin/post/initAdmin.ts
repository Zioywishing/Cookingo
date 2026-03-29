import { readBody } from "h3"
import { z } from "zod"

import { useAdminDb } from "../../../db/client"
import { initializeAdminSystem } from "../../../services/admin/admin-init-service"
import { getAdminUserDetail } from "../../../services/admin/admin-user-service"
import { adminNonEmptyStringSchema, adminPasswordSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { serializeAdminUserDetail } from "../../../utils/admin/contracts"
import { successResponse } from "../../../utils/api-response"

const initAdminSchema = z.object({
  username: adminNonEmptyStringSchema,
  displayName: adminNonEmptyStringSchema,
  password: adminPasswordSchema,
})

export default defineAdminApiHandler(async (event) => {
  const db = useAdminDb()
  const body = initAdminSchema.parse(await readBody(event))
  const user = await initializeAdminSystem(db, body)
  const detail = await getAdminUserDetail(db, user.id)

  return successResponse(serializeAdminUserDetail(detail))
})
