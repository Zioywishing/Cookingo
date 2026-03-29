import { resolveRuntimeEnv } from "./server/utils/admin/runtime-config"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  routeRules: {
    "/admin/**": {
      ssr: false,
    },
  },
  runtimeConfig: {
    adminJwtSecret: resolveRuntimeEnv("NUXT_ADMIN_JWT_SECRET"),
    adminJwtCookieName: resolveRuntimeEnv("NUXT_ADMIN_JWT_COOKIE_NAME", {
      fallback: "cookingo_admin_token",
    }),
    adminJwtTtlDays: Number(resolveRuntimeEnv("NUXT_ADMIN_JWT_TTL_DAYS", {
      fallback: "14",
    })),
    adminJwtRenewBeforeDays: Number(resolveRuntimeEnv("NUXT_ADMIN_JWT_RENEW_BEFORE_DAYS", {
      fallback: "7",
    })),
    sqliteFilePath: resolveRuntimeEnv("NUXT_SQLITE_FILE_PATH", {
      fallback: "./data/cookingo.sqlite",
    }),
  },
})
