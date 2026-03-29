import { readBody } from "h3"
import { z } from "zod"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { createAdminUser, getAdminUserDetail } from "../../../services/admin/admin-user-service"
import { adminNonEmptyStringSchema, adminPasswordSchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { serializeAdminUserDetail } from "../../../utils/admin/contracts"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

const createUserSchema = z.object({
  username: adminNonEmptyStringSchema,
  displayName: adminNonEmptyStringSchema,
  password: adminPasswordSchema,
})

export default defineAdminApiHandler(async (event) => {
  const db = useAdminDb()
  const session = await requireAdminPermission(event, AdminPermissionCode.Users)
  const body = createUserSchema.parse(await readBody(event))
  const user = await createAdminUser(db, {
    actorUserId: session.user.id,
    ...body,
  })
  const detail = await getAdminUserDetail(db, user.id)

  return successResponse(serializeAdminUserDetail(detail))
})
