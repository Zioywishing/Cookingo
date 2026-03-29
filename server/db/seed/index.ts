import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite"

import { createAdminDbClient } from "../client"
import * as schema from "../schema"
import { seedAdminPermissions } from "./admin-permissions"

export type AdminDb = BunSQLiteDatabase<typeof schema>

export function seedAdminBaseData(db: AdminDb) {
  seedAdminPermissions(db)
}

if (import.meta.main) {
  const db = createAdminDbClient(
    process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite",
  )

  seedAdminBaseData(db)
}
