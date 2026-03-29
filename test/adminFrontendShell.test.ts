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
    const adminFonts = readProjectFile("app/assets/css/admin-fonts.css")

    expect(layout).toContain("AdminShellAdminMessageCenter")
    expect(layout).toContain("AdminShellAdminSidebar")
    expect(layout).toContain("AdminShellAdminMobileSidebar")
    expect(layout).toContain("AdminShellAdminTopbar")
    expect(layout).toContain("useAdminNavigation")
    expect(layout).toContain("overflow-y: auto")
    expect(layout).toContain("scrollbar-width: thin")
    expect(layout).toContain('import "~/assets/css/admin-fonts.css"')
    expect(layout).not.toContain("fonts.googleapis.com")
    expect(adminFonts).toContain("@font-face")
    expect(adminFonts).toContain("font-family: \"Inter\"")
    expect(adminFonts).toContain("font-family: \"Playfair Display\"")
    expect(mobileSidebar).toContain("position: fixed")
  })

  test("unwraps admin session refs before passing identity to the topbar", () => {
    const layout = readProjectFile("app/layouts/admin.vue")

    expect(layout).toContain("const currentDisplayName = computed(() => session.user.value?.displayName || \"未登录\")")
    expect(layout).toContain("const currentUsername = computed(() => session.user.value?.username || \"guest\")")
    expect(layout).toContain(':display-name="currentDisplayName"')
    expect(layout).toContain(':username="currentUsername"')
  })

  test("captures runtime errors in the layout and routes them to the message center", () => {
    const layout = readProjectFile("app/layouts/admin.vue")

    expect(layout).toContain("useAdminMessageCenter")
    expect(layout).toContain("onErrorCaptured((error)")
    expect(layout).toContain("messageCenter.error(\"页面执行出现异常，请稍后重试\")")
  })

  test("uses generated component names for nested admin components", () => {
    const roleForm = readProjectFile("app/components/admin/role/AdminRoleForm.vue")
    const sidebar = readProjectFile("app/components/admin/shell/AdminSidebar.vue")
    const mobileSidebar = readProjectFile("app/components/admin/shell/AdminMobileSidebar.vue")

    expect(roleForm).toContain("<AdminRoleAdminPermissionGroup")
    expect(sidebar).toContain("<AdminShellAdminSidebarNav")
    expect(mobileSidebar).toContain("<AdminShellAdminSidebarNav")
  })

  test("uses explicit keydown handling instead of missing onKeyStroke helper", () => {
    const mobileSidebar = readProjectFile("app/components/admin/shell/AdminMobileSidebar.vue")

    expect(mobileSidebar).not.toContain("onKeyStroke(")
    expect(mobileSidebar).toContain("function handleKeydown(event: KeyboardEvent)")
    expect(mobileSidebar).toContain('document.addEventListener("keydown", handleKeydown)')
    expect(mobileSidebar).toContain('document.removeEventListener("keydown", handleKeydown)')
  })
})
