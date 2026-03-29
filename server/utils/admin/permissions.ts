import { AdminPermissionDefinitions } from "~~/shared/admin/domain"
import type { AdminPermissionItem } from "~~/shared/types"

export const ROOT_ROLE_CODE = "root"

export const ADMIN_PERMISSION_SEED: AdminPermissionItem[] = AdminPermissionDefinitions.map((item) => ({
  code: item.code,
  name: item.name,
  groupKey: item.groupKey,
  routePath: item.routePath,
  description: item.description,
}))
