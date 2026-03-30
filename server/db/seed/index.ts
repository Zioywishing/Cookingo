import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite"

import { createAdminDbClient } from "../client"
import * as schema from "../schema"
import { resolveAdminSqliteFilePath } from "../../utils/admin/runtime-config"
import { seedAdminPermissions } from "./admin-permissions"

export type AdminDb = BunSQLiteDatabase<typeof schema>

export function seedAdminBaseData(db: AdminDb) {
  seedAdminPermissions(db)
}

if (import.meta.main) {
  const db = createAdminDbClient(resolveAdminSqliteFilePath())

  seedAdminBaseData(db)
}
