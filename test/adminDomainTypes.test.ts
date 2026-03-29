import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("admin domain types and helpers", () => {
  test("exports admin domain types from shared index", () => {
    const sharedAdmin = readProjectFile("shared/types/admin.ts");
    const sharedApi = readProjectFile("shared/types/api.ts");
    const sharedIndex = readProjectFile("shared/types/index.ts");

    expect(sharedAdmin).toContain("AdminUserStatus");
    expect(sharedAdmin).toContain("AdminPermissionCode");
    expect(sharedAdmin).toContain("AdminCurrentUser");
    expect(sharedAdmin).toContain("AdminSessionUser");
    expect(sharedAdmin).toContain("AdminSessionState");
    expect(sharedAdmin).toContain("AdminPageMetaByPath");
    expect(sharedApi).toContain("ApiPageData");
    expect(sharedIndex).toContain('export * from "./admin"');
  });

  test("provides response helpers for success, failure, and pagination", () => {
    const apiResponse = readProjectFile("server/utils/api-response.ts");

    expect(apiResponse).toContain("successResponse");
    expect(apiResponse).toContain("failureResponse");
    expect(apiResponse).toContain("pageResponse");
  });

  test("centralizes admin error codes and permission seeds", () => {
    const errorCodes = readProjectFile("server/utils/admin/error-codes.ts");
    const permissions = readProjectFile("server/utils/admin/permissions.ts");

    expect(errorCodes).toContain("ADMIN_AUTH_INVALID");
    expect(errorCodes).toContain("ADMIN_SYSTEM_ALREADY_INITIALIZED");
    expect(errorCodes).toContain("ADMIN_INTERNAL_ERROR");
    expect(permissions).toContain("admin.dashboard");
    expect(permissions).toContain("admin.users");
    expect(permissions).toContain("admin.roles");
    expect(permissions).toContain("ROOT_ROLE_CODE");
  });
});
