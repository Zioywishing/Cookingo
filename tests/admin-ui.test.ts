import { describe, expect, test } from "bun:test"
import { computed } from "vue"

import {
  formatAdminPermissionGroupLabel,
  resolveAdminBadgeTone,
} from "../app/composables/useAdminUi"
import { useAdminNavigation } from "../app/composables/useAdminNavigation"
import { AdminPermissionCode } from "../shared/admin/domain"

Object.assign(globalThis, { computed })

describe("useAdminNavigation", () => {
  test("groups permitted admin navigation items by overview, iam and security sections", () => {
    const groups = useAdminNavigation((code) => [
      AdminPermissionCode.Dashboard,
      AdminPermissionCode.Users,
      AdminPermissionCode.Roles,
      AdminPermissionCode.LoginLogs,
      AdminPermissionCode.AuditLogs,
    ].includes(code)).value

    expect(groups).toEqual([
      {
        label: "Overview",
        items: [{ title: "后台首页", to: "/admin" }],
      },
      {
        label: "IAM",
        items: [
          { title: "用户管理", to: "/admin/users" },
          { title: "角色管理", to: "/admin/roles" },
        ],
      },
      {
        label: "Security",
        items: [
          { title: "登录日志", to: "/admin/login-logs" },
          { title: "操作审计", to: "/admin/audit-logs" },
        ],
      },
    ])
  })

  test("filters out navigation groups that have no permitted items", () => {
    const groups = useAdminNavigation((code) => [
      AdminPermissionCode.Dashboard,
      AdminPermissionCode.Users,
    ].includes(code)).value

    expect(groups).toEqual([
      {
        label: "Overview",
        items: [{ title: "后台首页", to: "/admin" }],
      },
      {
        label: "IAM",
        items: [{ title: "用户管理", to: "/admin/users" }],
      },
    ])
  })
})

describe("resolveAdminBadgeTone", () => {
  test("maps common admin statuses to consistent badge tones", () => {
    expect(resolveAdminBadgeTone("active")).toBe("success")
    expect(resolveAdminBadgeTone("success")).toBe("success")
    expect(resolveAdminBadgeTone("pending")).toBe("warning")
    expect(resolveAdminBadgeTone("disabled")).toBe("danger")
    expect(resolveAdminBadgeTone("failure")).toBe("danger")
    expect(resolveAdminBadgeTone("unknown")).toBe("neutral")
  })
})

describe("formatAdminPermissionGroupLabel", () => {
  test("formats known admin permission group labels", () => {
    expect(formatAdminPermissionGroupLabel("overview")).toBe("Overview")
    expect(formatAdminPermissionGroupLabel("iam")).toBe("IAM")
    expect(formatAdminPermissionGroupLabel("security")).toBe("Security")
    expect(formatAdminPermissionGroupLabel("custom-group")).toBe("Custom Group")
  })
})
