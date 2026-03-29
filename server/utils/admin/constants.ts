import { AdminUserStatus } from "~~/shared/admin/domain"

export const ADMIN_FIRST_PAGE = 1
export const ADMIN_DEFAULT_PAGE_SIZE = 20
export const ADMIN_MAX_PAGE_SIZE = 100
export const ADMIN_PASSWORD_MIN_LENGTH = 8
export const ADMIN_INITIAL_TOKEN_VERSION = 1
export const ADMIN_ROLE_OPTIONS_FALLBACK_PAGE_SIZE = 100

export const ADMIN_SECONDS_PER_DAY = 24 * 60 * 60
export const ADMIN_MILLISECONDS_PER_SECOND = 1000
export const ADMIN_MILLISECONDS_PER_DAY = ADMIN_SECONDS_PER_DAY * ADMIN_MILLISECONDS_PER_SECOND

export const ADMIN_JWT_ALGORITHM = "HS256" as const
export const ADMIN_SESSION_COOKIE_PATH = "/" as const
export const ADMIN_SESSION_COOKIE_SAME_SITE = "lax" as const
export const ADMIN_PRODUCTION_NODE_ENV = "production"

export const ADMIN_ACTIVE_USER_STATUS = AdminUserStatus.Active
export const ADMIN_DISABLED_USER_STATUS = AdminUserStatus.Disabled

export const AdminLoginResult = {
  Success: "success",
  Failure: "failure",
} as const

export const AdminLoginReason = {
  BadCredentials: "bad_credentials",
  Disabled: "disabled",
} as const
