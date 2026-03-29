import type { AdminDb } from "../../db/seed"
import { createAdminAuditLog } from "../../repositories/admin/admin-audit-log-repository"

import { createAdminId } from "./id"
import { getNowIso } from "./time"

export const AdminAuditTargetType = {
  User: "admin_user",
  Role: "admin_role",
} as const

export const AdminAuditAction = {
  UserCreate: "admin.user.create",
  UserAssignRoles: "admin.user.assign_roles",
  UserResetPassword: "admin.user.reset_password",
  UserSetStatus: "admin.user.set_status",
  UserUpdateProfile: "admin.user.update_profile",
  RoleCreate: "admin.role.create",
  RoleUpdate: "admin.role.update",
  RoleDelete: "admin.role.delete",
} as const

export function writeAdminAuditLog(
  db: AdminDb,
  input: {
    actorUserId: string
    action: string
    targetType: string
    targetId: string
    summary: string
    createdAt?: string
  },
) {
  createAdminAuditLog(db, {
    id: createAdminId(),
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    createdAt: input.createdAt || getNowIso(),
  })
}
