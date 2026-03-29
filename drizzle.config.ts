import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./server/db/schema/index.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite",
  },
})
