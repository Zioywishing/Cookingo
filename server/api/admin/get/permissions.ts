import { AdminPermissionCode } from "~~/shared/admin/domain"

import { useAdminDb } from "../../../db/client"
import { getAllAdminPermissions } from "../../../services/admin/admin-role-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { requireAdminPermission } from "../../../utils/auth/admin-session"
import { successResponse } from "../../../utils/api-response"

export default defineAdminApiHandler(async (event) => {
  await requireAdminPermission(event, AdminPermissionCode.Roles)

  return successResponse(await getAllAdminPermissions(useAdminDb()))
})
