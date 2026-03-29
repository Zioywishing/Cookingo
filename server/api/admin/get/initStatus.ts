import { useAdminDb } from "../../../db/client"
import { getAdminInitStatus } from "../../../services/admin/admin-init-service"
import { defineAdminApiHandler } from "../../../utils/admin/api-handler"
import { successResponse } from "../../../utils/api-response"

export default defineAdminApiHandler(async () => {
  return successResponse(await getAdminInitStatus(useAdminDb()))
})
