<script setup lang="ts">
import "~/assets/css/admin-fonts.css"

const route = useRoute()
const router = useRouter()
const session = useAdminSession()
const messageCenter = useAdminMessageCenter()
const feedback = useAdminRequestFeedback()
const mobileOpen = ref(false)
const isAuthPage = computed(() => ["/admin/login", "/admin/init"].includes(route.path))
const currentDisplayName = computed(() => session.user.value?.displayName || "未登录")
const currentUsername = computed(() => session.user.value?.username || "guest")
const navGroups = useAdminNavigation(session.hasPermission)

onErrorCaptured((error) => {
  console.error(error)
  messageCenter.error("页面执行出现异常，请稍后重试")
  return false
})

async function handleLogout() {
  const result = await feedback.run(async () => {
    await session.logout()
    return true
  }, {
    successMessage: "退出登录成功",
    errorMessage: "退出登录失败",
  })

  if (!result) {
    return
  }

  mobileOpen.value = false
  await router.push("/admin/login")
}
</script>

<template>
  <div class="admin-layout">
    <AdminShellAdminMessageCenter />

    <div v-if="isAuthPage" class="admin-auth-shell">
      <div class="auth-brand">
        <div class="brand-mark">
          C
        </div>
        <div>
          <p class="brand-label">
            Cookingo Admin
          </p>
          <h1>IAM Console</h1>
        </div>
      </div>

      <main class="admin-auth-content">
        <slot />
      </main>
    </div>

    <div v-else class="admin-shell">
      <AdminShellAdminTopbar
        class="shell-topbar"
        :display-name="currentDisplayName"
        :username="currentUsername"
        @toggle-menu="mobileOpen = true"
        @logout="handleLogout"
      />
      <AdminShellAdminSidebar class="shell-sidebar" :groups="navGroups" />
      <AdminShellAdminMobileSidebar :groups="navGroups" :open="mobileOpen" @close="mobileOpen = false" />

      <div class="admin-main">
        <main class="admin-content">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f9fafb;
  color: #111827;
  --admin-accent-strong: #e91e63;
  --admin-accent: #9c27b0;
  --admin-accent-gradient: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
  --admin-bg-canvas: #f9fafb;
  --admin-bg-surface: #ffffff;
  --admin-bg-muted: #f9fafb;
  --admin-border-subtle: #f3f4f6;
  --admin-border-medium: #e5e7eb;
  --admin-text-primary: #111827;
  --admin-text-secondary: #4b5563;
  --admin-text-tertiary: #9ca3af;
  --admin-font-serif: "Playfair Display", Georgia, serif;
  --admin-font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-family: var(--admin-font-sans);
}

.admin-auth-shell {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  background:
    radial-gradient(circle at top center, rgba(233, 30, 99, 0.08), transparent 18rem),
    radial-gradient(circle at bottom right, rgba(156, 39, 176, 0.08), transparent 20rem),
    var(--admin-bg-canvas);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: min(100%, 34rem);
  margin-bottom: 1.5rem;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: linear-gradient(#fff, #fff) padding-box, var(--admin-accent-gradient) border-box;
  font-family: var(--admin-font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--admin-accent);
}

.brand-label {
  margin: 0 0 0.15rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary);
}

.auth-brand h1 {
  margin: 0;
  font-family: var(--admin-font-serif);
  font-size: 1.7rem;
  font-weight: 600;
}

.admin-auth-content {
  width: min(100%, 34rem);
}

.admin-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: 64px minmax(0, 1fr);
  min-height: 100vh;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  overflow: hidden;
}

.shell-topbar {
  grid-column: 1 / -1;
}

.shell-sidebar {
  grid-row: 2;
  min-height: 0;
}

.admin-main {
  min-width: 0;
  min-height: 0;
  grid-column: 2;
  grid-row: 2;
}

.admin-content {
  display: block;
  min-height: 0;
  height: 100%;
  padding: 2rem 3rem 3rem;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 39, 176, 0.28) transparent;
  box-sizing: border-box;
}

.admin-content::-webkit-scrollbar {
  width: 0.65rem;
}

.admin-content::-webkit-scrollbar-track {
  background: transparent;
}

.admin-content::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(156, 39, 176, 0.28);
  background-clip: padding-box;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 39, 176, 0.42);
  background-clip: padding-box;
}

@media (max-width: 920px) {
  .admin-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 64px minmax(0, 1fr);
  }

  .admin-main {
    grid-column: 1;
  }

  .admin-content {
    padding: 1.5rem 1rem 2rem;
  }

  .auth-brand {
    width: min(100%, 32rem);
  }

  .admin-auth-content {
    width: min(100%, 32rem);
  }
}
</style>
