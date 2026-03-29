import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const adminRolePermission = sqliteTable(
  "admin_role_permission",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id").notNull(),
    permissionId: text("permission_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("admin_role_permission_role_permission_unique").on(
      table.roleId,
      table.permissionId,
    ),
    index("admin_role_permission_role_id_idx").on(table.roleId),
    index("admin_role_permission_permission_id_idx").on(table.permissionId),
  ],
)
