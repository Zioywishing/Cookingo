import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const adminPermission = sqliteTable(
  "admin_permission",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    groupKey: text("group_key").notNull(),
    routePath: text("route_path").notNull(),
    description: text("description").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("admin_permission_code_unique").on(table.code),
    index("admin_permission_created_at_idx").on(table.createdAt),
  ],
)
