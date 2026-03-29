import { getQuery } from "h3"

import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { listAdminUsers } from "../../../services/admin/admin-user-service"
import { createAdminPaginationQuerySchema } from "../../../utils/admin/schemas"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { serializeAdminUserListItem } from "../../../utils/admin/contracts"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { pageResponse } from "../../../utils/api-response"

const usersQuerySchema = createAdminPaginationQuerySchema()

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.Users)

  const query = usersQuerySchema.parse(getQuery(event))
  const result = await listAdminUsers(useAdminDb(), query)

  return pageResponse(
    result.items.map((item) => serializeAdminUserListItem(item)),
    result.total,
    result.page,
    result.pageSize,
  )
})
