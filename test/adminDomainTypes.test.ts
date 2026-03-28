import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin domain types", () => {
  test("exports admin status and permission codes from shared types", () => {
    const sharedAdmin = readProjectFile("shared/types/admin.ts");
    const sharedIndex = readProjectFile("shared/types/index.ts");

    expect(sharedAdmin).toContain("AdminUserStatus");
    expect(sharedAdmin).toContain("AdminPermissionCode");
    expect(sharedIndex).toContain('export * from "./admin"');
  });

  test("centralizes admin error codes and permission seeds", () => {
    const errorCodes = readProjectFile("server/utils/admin/error-codes.ts");
    const permissions = readProjectFile("server/utils/admin/permissions.ts");

    expect(errorCodes).toContain("ADMIN_AUTH_INVALID");
    expect(errorCodes).toContain("ADMIN_USER_DUPLICATE_USERNAME");
    expect(permissions).toContain("admin.dashboard");
    expect(permissions).toContain("admin.users");
    expect(permissions).toContain("admin.roles");
  });
});
