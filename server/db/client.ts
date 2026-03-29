import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

import * as schema from "./schema"

export function createAdminDbClient(sqliteFilePath: string) {
  const client = new Database(sqliteFilePath, { create: true })

  return drizzle(client, { schema })
}

export function useAdminDb() {
  const runtimeConfig = useRuntimeConfig()

  return createAdminDbClient(runtimeConfig.sqliteFilePath)
}
