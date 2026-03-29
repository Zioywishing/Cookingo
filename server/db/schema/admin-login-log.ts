import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const adminLoginLog = sqliteTable(
  "admin_login_log",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    userId: text("user_id"),
    result: text("result").notNull(),
    reason: text("reason"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("admin_login_log_created_at_idx").on(table.createdAt),
    index("admin_login_log_username_idx").on(table.username),
  ],
)
