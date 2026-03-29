<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

const route = useRoute()
const router = useRouter()
const session = useAdminSession()
const mobileOpen = ref(false)

const navItems = computed(() => {
  const items = [
    {
      title: "后台首页",
      to: "/admin",
      permission: AdminPermissionCode.Dashboard,
    },
    {
      title: "用户管理",
      to: "/admin/users",
      permission: AdminPermissionCode.Users,
    },
    {
      title: "角色管理",
      to: "/admin/roles",
      permission: AdminPermissionCode.Roles,
    },
    {
      title: "登录日志",
      to: "/admin/login-logs",
      permission: AdminPermissionCode.LoginLogs,
    },
    {
      title: "操作审计",
      to: "/admin/audit-logs",
      permission: AdminPermissionCode.AuditLogs,
    },
  ]

  return items
    .filter((item) => session.hasPermission(item.permission))
    .map(({ title, to }) => ({ title, to }))
})

const pageMeta = computed(() => {
  const meta = route.meta as {
    adminPageTitle?: string
    adminPageDescription?: string
  }

  return {
    title: meta.adminPageTitle || session.resolvePageMeta(route.path).title,
    description: meta.adminPageDescription || session.resolvePageMeta(route.path).description,
  }
})

async function handleLogout() {
  await session.logout()
  mobileOpen.value = false
  await router.push("/admin/login")
}
</script>

<template>
  <div class="admin-layout">
    <div class="admin-shell">
      <AdminSidebar :items="navItems" />
      <AdminMobileSidebar :items="navItems" :open="mobileOpen" @close="mobileOpen = false" />

      <div class="admin-main">
        <AdminTopbar
          :title="pageMeta.title"
          :description="pageMeta.description"
          :display-name="session.user?.displayName || '未登录'"
          :username="session.user?.username || 'guest'"
          @toggle-menu="mobileOpen = true"
          @logout="handleLogout"
        />

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
  padding: 28px 20px;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92)),
    #020617;
  color: #e5eefb;
}

.admin-shell {
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  gap: 22px;
  width: min(100%, 1320px);
  margin: 0 auto;
}

.admin-main {
  min-width: 0;
}

.admin-content {
  display: block;
}

@media (max-width: 920px) {
  .admin-layout {
    padding: 18px 14px 24px;
  }

  .admin-shell {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
