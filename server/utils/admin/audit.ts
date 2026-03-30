import type { AdminDb } from "../../db/seed"
import { createAdminAuditLog } from "../../repositories/admin/admin-audit-log-repository"

import { createAdminId } from "./id"
import { getNowIso } from "./time"

export const AdminAuditTargetType = {
  User: "admin_user",
  Role: "admin_role",
} as const
export type AdminAuditTargetTypeValue = (typeof AdminAuditTargetType)[keyof typeof AdminAuditTargetType]

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
export type AdminAuditActionValue = (typeof AdminAuditAction)[keyof typeof AdminAuditAction]

export function writeAdminAuditLog(
  db: AdminDb,
  input: {
    actorUserId: string
    action: AdminAuditActionValue
    targetType: AdminAuditTargetTypeValue
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
    createdAt: input.createdAt ?? getNowIso(),
  })
}
