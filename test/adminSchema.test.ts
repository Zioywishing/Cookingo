import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { getTableName } from "drizzle-orm";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe("admin drizzle schema", () => {
  test("declares all IAM tables", async () => {
    const schema = await import("../server/db/schema");

    expect(getTableName(schema.adminUser)).toBe("admin_user");
    expect(getTableName(schema.adminRole)).toBe("admin_role");
    expect(getTableName(schema.adminPermission)).toBe("admin_permission");
    expect(getTableName(schema.adminUserRole)).toBe("admin_user_role");
    expect(getTableName(schema.adminRolePermission)).toBe("admin_role_permission");
    expect(getTableName(schema.adminLoginLog)).toBe("admin_login_log");
    expect(getTableName(schema.adminAuditLog)).toBe("admin_audit_log");
  });

  test("ships an initial migration for the admin tables", () => {
    const migrationDir = resolve(import.meta.dir, "../server/db/migrations");

    expect(existsSync(migrationDir)).toBe(true);

    const sqlFiles = readdirSync(migrationDir).filter((file) => file.endsWith(".sql"));

    expect(sqlFiles.length).toBeGreaterThan(0);

    const migrationSql = readFileSync(join(migrationDir, sqlFiles[0]), "utf8");

    expect(migrationSql).toContain("CREATE TABLE");
    expect(migrationSql).toContain("admin_user");
    expect(migrationSql).toContain("admin_role");
    expect(migrationSql).toContain("admin_permission");
  });
});
