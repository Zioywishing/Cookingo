import { z } from "zod"

import { AdminUserStatus } from "~~/shared/admin/domain"

import {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_FIRST_PAGE,
  ADMIN_MAX_PAGE_SIZE,
  ADMIN_PASSWORD_MIN_LENGTH,
} from "./constants"

export const adminIdSchema = z.string().min(1)
export const adminNonEmptyStringSchema = z.string().min(1)
export const adminPasswordSchema = z.string().min(ADMIN_PASSWORD_MIN_LENGTH)
export const adminUserStatusSchema = z.enum([
  AdminUserStatus.Active,
  AdminUserStatus.Disabled,
])

export function createAdminPaginationQuerySchema() {
  return z.object({
    page: z.coerce.number().int().min(ADMIN_FIRST_PAGE).default(ADMIN_FIRST_PAGE),
    pageSize: z.coerce.number().int().min(ADMIN_FIRST_PAGE).max(ADMIN_MAX_PAGE_SIZE).default(ADMIN_DEFAULT_PAGE_SIZE),
  })
}
