import { mkdirSync } from "node:fs"
import { dirname } from "node:path"

import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { createAdminDbClient } from "./client"
import {
  ADMIN_MIGRATIONS_FOLDER,
  resolveAdminSqliteFilePath,
} from "../utils/admin/runtime-config"

const sqliteFilePath = resolveAdminSqliteFilePath()

mkdirSync(dirname(sqliteFilePath), { recursive: true })

const db = createAdminDbClient(sqliteFilePath)

migrate(db, {
  migrationsFolder: ADMIN_MIGRATIONS_FOLDER,
})
