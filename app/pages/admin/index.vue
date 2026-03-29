<script setup lang="ts">
import {
  AdminNavigationSchema,
  AdminPageMetaByPath,
  AdminPermissionCode,
} from "#shared/admin/domain"

const pageMeta = AdminPageMetaByPath["/admin"]!

definePageMeta({
  layout: 'admin',
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Dashboard,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const session = useAdminSession()

const currentDisplayName = computed(() => session.user.value?.displayName || "未登录")
const currentUsername = computed(() => session.user.value?.username || "guest")
const permissionCount = computed(() => session.permissions.value.length)

const availableModules = computed(() => {
  return AdminNavigationSchema
    .filter((item) => item.permission !== AdminPermissionCode.Dashboard)
    .filter((item) => session.hasPermission(item.permission))
    .map((item) => ({
      title: item.title,
      path: item.to,
      description: item.description,
    }))
})
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="后台首页" description="当前为 IAM 一期后台底座，优先承载登录、权限、用户、角色与安全运维能力。" />

    <div class="stats-grid">
      <AdminBaseAdminCard padding="md" title="Current Operator">
        <p class="stat-value">
          {{ currentDisplayName }}
        </p>
        <p class="stat-meta">
          账号：{{ currentUsername }}
        </p>
      </AdminBaseAdminCard>
      <AdminBaseAdminCard padding="md" title="Page Permissions">
        <p class="stat-value">
          {{ permissionCount }}
        </p>
        <p class="stat-meta">
          当前拥有的后台页面权限数
        </p>
      </AdminBaseAdminCard>
      <AdminBaseAdminCard padding="md" title="Available Modules">
        <p class="stat-value">
          {{ availableModules.length }}
        </p>
        <p class="stat-meta">
          当前账号可直接访问的管理模块
        </p>
      </AdminBaseAdminCard>
    </div>

    <AdminBaseAdminCard class="overview-card">
      <div class="intro">
        <div>
          <p class="eyebrow">
            Admin Overview
          </p>
          <h2>{{ currentDisplayName }}</h2>
          <p class="description">
            当前账号：{{ currentUsername }}。你可以从下方模块快速进入用户、角色与安全审计工作区。
          </p>
        </div>
        <AdminBaseAdminBadge tone="neutral">
          IAM Phase 1
        </AdminBaseAdminBadge>
      </div>

      <div class="modules">
        <NuxtLink v-for="module in availableModules" :key="module.path" :to="module.path" class="module-card">
          <span class="module-kicker">Module</span>
          <h3>{{ module.title }}</h3>
          <p>{{ module.description }}</p>
        </NuxtLink>
      </div>
    </AdminBaseAdminCard>
  </AdminShellAdminPageContainer>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stat-value {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}

.stat-meta {
  margin: 0.35rem 0 0;
  color: var(--admin-text-secondary, #4b5563);
}

.overview-card {
  overflow: hidden;
}

.intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: clamp(2rem, 5vw, 2.6rem);
  font-weight: 600;
}

.eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

.description {
  margin: 0.8rem 0 0;
  max-width: 42rem;
  line-height: 1.7;
  color: var(--admin-text-secondary, #4b5563);
}

.modules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.8rem;
}

.module-card {
  display: block;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  background: linear-gradient(180deg, #fff, #fcfcfd);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.module-card:hover,
.module-card:focus-visible {
  border-color: rgba(156, 39, 176, 0.18);
  box-shadow: 0 16px 36px rgba(17, 24, 39, 0.06);
  transform: translateY(-2px);
  outline: none;
}

.module-kicker {
  display: inline-flex;
  margin-bottom: 0.7rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

h3 {
  margin: 0 0 0.45rem;
  font-size: 1.02rem;
  color: var(--admin-text-primary, #111827);
}

.module-card p {
  margin: 0;
  line-height: 1.7;
  color: var(--admin-text-secondary, #4b5563);
}

@media (max-width: 960px) {
  .stats-grid,
  .modules {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .stats-grid,
  .modules {
    grid-template-columns: 1fr;
  }

  .intro {
    flex-direction: column;
  }
}
</style>
