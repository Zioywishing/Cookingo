import { AdminPermissionCode } from "../../../shared/types/admin";

export const ADMIN_PERMISSION_SEED = [
  { code: AdminPermissionCode.Dashboard, name: "后台首页", groupKey: "overview", routePath: "/admin" },
  { code: AdminPermissionCode.Users, name: "用户管理", groupKey: "iam", routePath: "/admin/users" },
  { code: AdminPermissionCode.Roles, name: "角色管理", groupKey: "iam", routePath: "/admin/roles" },
  { code: AdminPermissionCode.LoginLogs, name: "登录日志", groupKey: "security", routePath: "/admin/login-logs" },
  { code: AdminPermissionCode.AuditLogs, name: "操作审计", groupKey: "security", routePath: "/admin/audit-logs" },
] as const;
