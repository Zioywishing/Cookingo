export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return
  }

  const initPath = "/admin/init"
  const loginPath = "/admin/login"
  const initStatus = useAdminInitStatus()
  const initialized = await initStatus.ensureLoaded()

  if (!initialized && to.path !== initPath) {
    return navigateTo(initPath)
  }

  if (initialized && to.path === initPath) {
    return navigateTo(loginPath)
  }
})
