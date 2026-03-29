export interface AdminPageMeta {
  title: string
  description: string
}

export enum AdminRoutePath {
  Init = "/admin/init",
  Login = "/admin/login",
  Dashboard = "/admin",
  Users = "/admin/users",
  Roles = "/admin/roles",
  LoginLogs = "/admin/login-logs",
  AuditLogs = "/admin/audit-logs",
  UserDetailPrefix = "/admin/users/",
  RoleDetailPrefix = "/admin/roles/",
}

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

export type AdminPermissionCode = (typeof AdminPermissionCode)[keyof typeof AdminPermissionCode]

export const AdminPermissionGroupLabelByKey = {
  overview: "Overview",
  iam: "IAM",
  security: "Security",
} as const

export type AdminPermissionGroupKey = keyof typeof AdminPermissionGroupLabelByKey
export type AdminPermissionGroupLabel = (typeof AdminPermissionGroupLabelByKey)[AdminPermissionGroupKey]

export interface AdminPermissionDefinition {
  code: AdminPermissionCode
  name: string
  groupKey: AdminPermissionGroupKey
  routePath: AdminRoutePath
  description: string
}

export interface AdminNavigationItem {
  groupKey: AdminPermissionGroupKey
  groupLabel: AdminPermissionGroupLabel
  title: string
  to: AdminRoutePath
  permission: AdminPermissionCode
  description: string
}

export const AdminPermissionDefinitions: AdminPermissionDefinition[] = [
  {
    code: AdminPermissionCode.Dashboard,
    name: "后台首页",
    groupKey: "overview",
    routePath: AdminRoutePath.Dashboard,
    description: "查看当前登录身份与可访问模块。",
  },
  {
    code: AdminPermissionCode.Users,
    name: "用户管理",
    groupKey: "iam",
    routePath: AdminRoutePath.Users,
    description: "创建、查看和维护后台账号。",
  },
  {
    code: AdminPermissionCode.Roles,
    name: "角色管理",
    groupKey: "iam",
    routePath: AdminRoutePath.Roles,
    description: "创建角色并配置后台页面权限。",
  },
  {
    code: AdminPermissionCode.LoginLogs,
    name: "登录日志",
    groupKey: "security",
    routePath: AdminRoutePath.LoginLogs,
    description: "查看后台登录成功与失败记录。",
  },
  {
    code: AdminPermissionCode.AuditLogs,
    name: "操作审计",
    groupKey: "security",
    routePath: AdminRoutePath.AuditLogs,
    description: "查看后台关键行为审计记录。",
  },
] as const

export const AdminNavigationSchema: AdminNavigationItem[] = AdminPermissionDefinitions.map((item) => ({
  groupKey: item.groupKey,
  groupLabel: AdminPermissionGroupLabelByKey[item.groupKey],
  title: item.name,
  to: item.routePath,
  permission: item.code,
  description: item.description,
}))

export const AdminPermissionRouteEntries: Array<{
  code: AdminPermissionCode
  path: AdminRoutePath
}> = AdminPermissionDefinitions.map(({ code, routePath }) => ({
  code,
  path: routePath,
}))

export const AdminPageMetaByPath: Record<string, AdminPageMeta> = {
  [AdminRoutePath.Init]: {
    title: "初始化管理后台",
    description: "创建首个超级管理员账号。",
  },
  [AdminRoutePath.Login]: {
    title: "登录后台",
    description: "使用管理员账号进入后台。",
  },
  [AdminRoutePath.Dashboard]: {
    title: "后台首页",
    description: "查看当前登录身份与可访问模块。",
  },
  [AdminRoutePath.Users]: {
    title: "用户管理",
    description: "创建、查看和维护后台账号。",
  },
  [AdminRoutePath.Roles]: {
    title: "角色管理",
    description: "创建角色并配置后台页面权限。",
  },
  [AdminRoutePath.LoginLogs]: {
    title: "登录日志",
    description: "查看后台登录成功与失败记录。",
  },
  [AdminRoutePath.AuditLogs]: {
    title: "操作审计",
    description: "查看后台关键行为审计记录。",
  },
}

export const AdminDetailPageMetaByKey = {
  userDetail: {
    title: "用户详情",
    description: "查看并维护后台用户信息、角色和安全设置。",
  },
  roleDetail: {
    title: "角色详情",
    description: "编辑角色信息并配置后台页面权限。",
  },
} as const satisfies Record<string, AdminPageMeta>

export function resolveAdminPageMeta(path: string): AdminPageMeta {
  if (path.startsWith(AdminRoutePath.UserDetailPrefix)) {
    return AdminDetailPageMetaByKey.userDetail
  }

  if (path.startsWith(AdminRoutePath.RoleDetailPrefix)) {
    return AdminDetailPageMetaByKey.roleDetail
  }

  return AdminPageMetaByPath[path] ?? AdminPageMetaByPath[AdminRoutePath.Dashboard]!
}
