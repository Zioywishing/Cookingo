export const AdminUserStatus = {
  Active: "active",
  Disabled: "disabled",
} as const

export type AdminUserStatus = (typeof AdminUserStatus)[keyof typeof AdminUserStatus]

export const AdminPermissionCode = {
  Dashboard: "admin.dashboard",
  Users: "admin.users",
  Roles: "admin.roles",
  LoginLogs: "admin.login-logs",
  AuditLogs: "admin.audit-logs",
} as const

export type AdminPermissionCode =
  (typeof AdminPermissionCode)[keyof typeof AdminPermissionCode]

export interface AdminRoleSummary {
  id: string
  code: string
  name: string
}

export interface AdminCurrentUser {
  id: string
  username: string
  displayName: string
  status: AdminUserStatus
  roleCodes: string[]
  permissions: AdminPermissionCode[]
}

export interface AdminPermissionItem {
  code: AdminPermissionCode
  name: string
  groupKey: string
  routePath: string
  description: string
}

export interface AdminSessionUser {
  id: string
  username: string
  displayName: string
  status: AdminUserStatus
}

export interface AdminSessionState {
  user: AdminSessionUser | null
  roleCodes: string[]
  permissions: AdminPermissionCode[]
}

export interface AdminPageMeta {
  title: string
  description: string
}

export const AdminPageMetaByPath = {
  "/admin/init": {
    title: "初始化管理后台",
    description: "创建首个超级管理员账号。",
  },
  "/admin/login": {
    title: "登录后台",
    description: "使用管理员账号进入后台。",
  },
  "/admin": {
    title: "后台首页",
    description: "查看当前登录身份与可访问模块。",
  },
  "/admin/users": {
    title: "用户管理",
    description: "创建、查看和维护后台账号。",
  },
  "/admin/roles": {
    title: "角色管理",
    description: "配置角色信息与后台页面权限。",
  },
  "/admin/login-logs": {
    title: "登录日志",
    description: "查看后台登录成功与失败记录。",
  },
  "/admin/audit-logs": {
    title: "操作审计",
    description: "查看后台关键操作审计记录。",
  },
} as const satisfies Record<string, AdminPageMeta>

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
