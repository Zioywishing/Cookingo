import { mkdirSync } from "node:fs"
import { dirname } from "node:path"

import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { createAdminDbClient } from "./client"

const sqliteFilePath = process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite"

mkdirSync(dirname(sqliteFilePath), { recursive: true })

const db = createAdminDbClient(sqliteFilePath)

migrate(db, {
  migrationsFolder: "./server/db/migrations",
})
