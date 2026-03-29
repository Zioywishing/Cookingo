import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { ROOT_ROLE_CODE } from "../server/utils/admin/permissions";
import * as schema from "../server/db/schema";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

function createTempAdminDb() {
  const dir = mkdtempSync(join(tmpdir(), "cookingo-admin-seed-"));
  const sqlitePath = join(dir, "admin.sqlite");
  const client = new Database(sqlitePath, { create: true });
  const db = drizzle(client, { schema });

  migrate(db, {
    migrationsFolder: resolve(import.meta.dir, "../server/db/migrations"),
  });

  tempDirs.push(dir);

  return { client, db };
}

describe("admin seed", () => {
  test("creates base permissions and root role idempotently", async () => {
    const { client, db } = createTempAdminDb();
    const { seedAdminBaseData } = await import("../server/db/seed");

    seedAdminBaseData(db);
    seedAdminBaseData(db);

    const permissions = db.select().from(schema.adminPermission).all();
    const roles = db.select().from(schema.adminRole).where(eq(schema.adminRole.code, ROOT_ROLE_CODE)).all();
    const rolePermissions = db.select().from(schema.adminRolePermission).all();

    expect(permissions.length).toBe(5);
    expect(roles).toHaveLength(1);
    expect(rolePermissions.length).toBe(5);

    client.close();
  });
});
