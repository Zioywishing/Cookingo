export const ADMIN_PERMISSION_SEED = [
  { code: "admin.dashboard", name: "后台首页", groupKey: "overview", routePath: "/admin" },
  { code: "admin.users", name: "用户管理", groupKey: "iam", routePath: "/admin/users" },
  { code: "admin.roles", name: "角色管理", groupKey: "iam", routePath: "/admin/roles" },
  { code: "admin.login-logs", name: "登录日志", groupKey: "security", routePath: "/admin/login-logs" },
  { code: "admin.audit-logs", name: "操作审计", groupKey: "security", routePath: "/admin/audit-logs" },
] as const;
