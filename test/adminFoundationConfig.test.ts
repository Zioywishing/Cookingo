import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin foundation configuration", () => {
  test("declares drizzle, auth, validation, and id dependencies", () => {
    const pkg = readProjectFile("package.json");
    const migrateScript = readProjectFile("server/db/migrate.ts");

    expect(pkg).toContain('"drizzle-orm"');
    expect(pkg).toContain('"drizzle-kit"');
    expect(pkg).toContain('"jose"');
    expect(pkg).toContain('"zod"');
    expect(pkg).toContain('"@paralleldrive/cuid2"');
    expect(pkg).not.toContain('"better-sqlite3"');
    expect(pkg).toContain('"db:migrate": "bun run server/db/migrate.ts"');
    expect(migrateScript).toContain("drizzle-orm/bun-sqlite/migrator");
  });

  test("declares runtime config and sqlite env examples", () => {
    const nuxtConfig = readProjectFile("nuxt.config.ts");
    const envExample = readProjectFile(".env.example");

    expect(nuxtConfig).toContain("runtimeConfig");
    expect(nuxtConfig).toContain("adminJwtSecret");
    expect(nuxtConfig).toContain("adminJwtCookieName");
    expect(nuxtConfig).toContain("adminJwtTtlDays");
    expect(nuxtConfig).toContain("adminJwtRenewBeforeDays");
    expect(nuxtConfig).toContain("sqliteFilePath");
    expect(envExample).toContain("NUXT_ADMIN_JWT_SECRET=");
    expect(envExample).toContain("NUXT_ADMIN_JWT_COOKIE_NAME=");
    expect(envExample).toContain("NUXT_ADMIN_JWT_TTL_DAYS=");
    expect(envExample).toContain("NUXT_ADMIN_JWT_RENEW_BEFORE_DAYS=");
    expect(envExample).toContain("NUXT_SQLITE_FILE_PATH=");
  });

  test("declares drizzle config for sqlite migrations", () => {
    const drizzleConfig = readProjectFile("drizzle.config.ts");

    expect(drizzleConfig).toContain("defineConfig");
    expect(drizzleConfig).toContain('dialect: "sqlite"');
    expect(drizzleConfig).toContain("server/db/schema/index.ts");
    expect(drizzleConfig).toContain("server/db/migrations");
  });
});
