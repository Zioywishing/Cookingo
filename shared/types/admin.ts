export const AdminUserStatus = {
  Active: "active",
  Disabled: "disabled",
} as const;

export type AdminUserStatus = (typeof AdminUserStatus)[keyof typeof AdminUserStatus];

export const AdminPermissionCode = {
  Dashboard: "admin.dashboard",
  Users: "admin.users",
  Roles: "admin.roles",
  LoginLogs: "admin.login-logs",
  AuditLogs: "admin.audit-logs",
} as const;

export type AdminPermissionCode = (typeof AdminPermissionCode)[keyof typeof AdminPermissionCode];

export interface AdminCurrentUser {
  id: string;
  username: string;
  displayName: string;
  status: AdminUserStatus;
  roleCodes: string[];
  permissions: AdminPermissionCode[];
}
