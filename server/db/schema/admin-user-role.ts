import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const adminUserRole = sqliteTable(
  "admin_user_role",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    roleId: text("role_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("admin_user_role_user_role_unique").on(table.userId, table.roleId),
    index("admin_user_role_user_id_idx").on(table.userId),
    index("admin_user_role_role_id_idx").on(table.roleId),
  ],
)
