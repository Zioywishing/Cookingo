import { sql } from "drizzle-orm"
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const adminUser = sqliteTable(
  "admin_user",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    status: text("status").notNull(),
    tokenVersion: integer("token_version").notNull(),
    lastLoginAt: text("last_login_at"),
    passwordChangedAt: text("password_changed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("admin_user_username_unique").on(table.username),
    index("admin_user_created_at_idx").on(table.createdAt),
    check(
      "admin_user_status_check",
      sql`${table.status} in ('active', 'disabled')`,
    ),
    check("admin_user_token_version_check", sql`${table.tokenVersion} > 0`),
  ],
)
