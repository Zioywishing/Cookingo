import type {
  AdminPageMeta as AdminPageMetaBase,
  AdminPermissionCode as AdminPermissionCodeBase,
  AdminUserStatus as AdminUserStatusBase,
} from "../admin/domain"

export type { AdminPermissionCode, AdminUserStatus } from "../admin/domain"
export type AdminPageMeta = AdminPageMetaBase

export interface AdminRoleSummary {
  id: string
  code: string
  name: string
}

export interface AdminCurrentUser {
  id: string
  username: string
  displayName: string
  status: AdminUserStatusBase
  roleCodes: string[]
  permissions: AdminPermissionCodeBase[]
}

export interface AdminPermissionItem {
  code: AdminPermissionCodeBase
  name: string
  groupKey: string
  routePath: string
  description: string
}

export interface AdminSessionUser {
  id: string
  username: string
  displayName: string
  status: AdminUserStatusBase
}

export interface AdminAuthorization {
  roleCodes: string[]
  permissions: AdminPermissionCodeBase[]
}

export interface AdminSessionPayload {
  user: AdminSessionUser
  authorization: AdminAuthorization
}

export interface AdminInitStatusData {
  initialized: boolean
}

export interface AdminSessionState {
  user: AdminSessionUser | null
  roleCodes: string[]
  permissions: AdminPermissionCodeBase[]
}

export interface AdminUserListItem extends AdminSessionUser {
  roles: AdminRoleSummary[]
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserDetail extends AdminUserListItem {
  passwordChangedAt: string | null
}

export interface AdminRoleListItem extends AdminRoleSummary {
  description: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminRoleDetail extends AdminRoleListItem {
  permissions: AdminPermissionItem[]
}

export interface AdminLoginLogItem {
  id: string
  username: string
  userId: string | null
  result: "success" | "failure"
  reason: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
}

export interface AdminAuditLogItem {
  id: string
  actorUserId: string
  action: string
  targetType: string
  targetId: string
  summary: string
  createdAt: string
}
