import { describe, expect, test } from "bun:test";
import {
  AdminPermissionCode,
  AdminUserStatus,
} from "../shared/types/admin";
import * as AdminErrorCodes from "../server/utils/admin/error-codes";
import { ADMIN_PERMISSION_SEED } from "../server/utils/admin/permissions";

describe("admin domain types", () => {
  test("exports the canonical admin statuses and permission codes", () => {
    expect(AdminUserStatus.Active).toBe("active");
    expect(AdminUserStatus.Disabled).toBe("disabled");

    expect(AdminPermissionCode.Dashboard).toBe("admin.dashboard");
    expect(AdminPermissionCode.Users).toBe("admin.users");
    expect(AdminPermissionCode.Roles).toBe("admin.roles");
    expect(AdminPermissionCode.LoginLogs).toBe("admin.login-logs");
    expect(AdminPermissionCode.AuditLogs).toBe("admin.audit-logs");
  });

  test("centralizes the admin error codes and permissions seed", () => {
    expect(AdminErrorCodes.ADMIN_AUTH_INVALID).toBe(40101);
    expect(AdminErrorCodes.ADMIN_USER_DUPLICATE_USERNAME).toBe(40902);

    expect(ADMIN_PERMISSION_SEED).toHaveLength(5);
    const canonicalCodes = new Set(Object.values(AdminPermissionCode));
    for (const seed of ADMIN_PERMISSION_SEED) {
      expect(canonicalCodes.has(seed.code)).toBe(true);
    }
  });
});
