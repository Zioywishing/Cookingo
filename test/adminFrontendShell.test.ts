import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const projectRoot = resolve(import.meta.dir, "..")

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8")
}

describe("admin frontend shell", () => {
  test("adds init and session composables", () => {
    expect(readProjectFile("app/composables/useAdminInitStatus.ts")).toContain("admin-init-ready")
    expect(readProjectFile("app/composables/useAdminInitStatus.ts")).toContain("/api/admin/get/initStatus")
    expect(readProjectFile("app/composables/useAdminSession.ts")).toContain("/api/admin/get/currentUser")
    expect(readProjectFile("app/composables/useAdminSession.ts")).toContain("/api/admin/post/login")
  })

  test("adds init and auth middleware", () => {
    expect(readProjectFile("app/middleware/admin-init.ts")).toContain('"/admin/init"')
    expect(readProjectFile("app/middleware/admin-init.ts")).toContain('"/admin/login"')
    expect(readProjectFile("app/middleware/admin-auth.ts")).toContain("navigateTo")
    expect(readProjectFile("app/middleware/admin-auth.ts")).toContain("adminPermission")
  })

  test("upgrades the admin layout to use a responsive sidebar shell", () => {
    const layout = readProjectFile("app/layouts/admin.vue")
    const mobileSidebar = readProjectFile("app/components/admin/shell/AdminMobileSidebar.vue")

    expect(layout).toContain("AdminSidebar")
    expect(layout).toContain("AdminMobileSidebar")
    expect(layout).toContain("AdminTopbar")
    expect(mobileSidebar).toContain("position: fixed")
  })
})
