import type { AdminPermissionItem } from "~~/shared/types"

export const ROOT_ROLE_CODE = "root"

export const ADMIN_PERMISSION_SEED: AdminPermissionItem[] = [
  {
    code: "admin.dashboard",
    name: "后台首页",
    groupKey: "overview",
    routePath: "/admin",
    description: "访问后台首页",
  },
  {
    code: "admin.users",
    name: "用户管理",
    groupKey: "iam",
    routePath: "/admin/users",
    description: "访问用户管理",
  },
  {
    code: "admin.roles",
    name: "角色管理",
    groupKey: "iam",
    routePath: "/admin/roles",
    description: "访问角色管理",
  },
  {
    code: "admin.login-logs",
    name: "登录日志",
    groupKey: "security",
    routePath: "/admin/login-logs",
    description: "访问登录日志",
  },
  {
    code: "admin.audit-logs",
    name: "操作审计",
    groupKey: "security",
    routePath: "/admin/audit-logs",
    description: "访问操作审计",
  },
]
