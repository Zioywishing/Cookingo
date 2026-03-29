// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  runtimeConfig: {
    adminJwtSecret: process.env.NUXT_ADMIN_JWT_SECRET || "",
    adminJwtCookieName: process.env.NUXT_ADMIN_JWT_COOKIE_NAME || "cookingo_admin_token",
    adminJwtTtlDays: Number(process.env.NUXT_ADMIN_JWT_TTL_DAYS || "14"),
    adminJwtRenewBeforeDays: Number(process.env.NUXT_ADMIN_JWT_RENEW_BEFORE_DAYS || "7"),
    sqliteFilePath: process.env.NUXT_SQLITE_FILE_PATH || "./data/cookingo.sqlite",
  },
})
