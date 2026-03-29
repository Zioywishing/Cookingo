import type { AdminPermissionCode } from "#shared/admin/domain"

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin") || to.path === "/admin/init" || to.path === "/admin/login") {
    return
  }

  const session = useAdminSession()
  await session.ensureLoaded()

  if (!session.user.value) {
    return navigateTo({
      path: "/admin/login",
      query: {
        redirect: to.fullPath,
      },
    })
  }

  const permissionCode = (to.meta as { adminPermission?: AdminPermissionCode }).adminPermission

  if (permissionCode && !session.hasPermission(permissionCode)) {
    const homePath = session.resolveHomePath()

    if (homePath === "/admin/login") {
      session.clear()
      return navigateTo("/admin/login")
    }

    if (homePath !== to.path) {
      return navigateTo(homePath)
    }
  }
})
