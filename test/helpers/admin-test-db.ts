import { Database } from "bun:sqlite"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import * as schema from "../../server/db/schema"
import { seedAdminBaseData } from "../../server/db/seed"

export function createTempAdminDb() {
  const dir = mkdtempSync(join(tmpdir(), "cookingo-admin-test-"))
  const sqlitePath = join(dir, "admin.sqlite")
  const client = new Database(sqlitePath, { create: true })
  const db = drizzle(client, { schema })

  migrate(db, {
    migrationsFolder: resolve(import.meta.dir, "../../server/db/migrations"),
  })

  return {
    dir,
    client,
    db,
    seed() {
      seedAdminBaseData(db)
    },
    cleanup() {
      client.close()
      rmSync(dir, { force: true, recursive: true })
    },
  }
}
