<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: 'admin',
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Dashboard,
  adminPageTitle: "后台首页",
  adminPageDescription: "查看当前登录身份与可访问模块。",
})

const session = useAdminSession()

const currentDisplayName = computed(() => session.user.value?.displayName || "未登录")
const currentUsername = computed(() => session.user.value?.username || "guest")
const permissionCount = computed(() => session.permissions.value.length)

const availableModules = computed(() => {
  const modules = [
    { title: "用户管理", path: "/admin/users", code: AdminPermissionCode.Users, description: "创建、授权和维护后台账号。" },
    { title: "角色管理", path: "/admin/roles", code: AdminPermissionCode.Roles, description: "配置角色信息与后台页面权限。" },
    { title: "登录日志", path: "/admin/login-logs", code: AdminPermissionCode.LoginLogs, description: "查看后台登录成功与失败记录。" },
    { title: "操作审计", path: "/admin/audit-logs", code: AdminPermissionCode.AuditLogs, description: "查看后台关键行为审计记录。" },
  ]

  return modules.filter((item) => session.hasPermission(item.code))
})
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="后台首页" description="当前为 IAM 一期后台底座，优先承载登录、权限、用户、角色与安全运维能力。" />

    <section class="panel">
      <div class="intro">
        <h2>{{ currentDisplayName }}</h2>
        <p class="description">
          当前账号：{{ currentUsername }} · 当前拥有 {{ permissionCount }} 个页面权限。
        </p>
      </div>

      <div class="modules">
        <NuxtLink v-for="module in availableModules" :key="module.path" :to="module.path" class="module-card">
          <h3>{{ module.title }}</h3>
          <p>{{ module.description }}</p>
        </NuxtLink>
      </div>
    </section>
  </AdminShellAdminPageContainer>
</template>

<style scoped>
.panel {
  padding: 32px;
  border: 1px solid rgba(191, 219, 254, 0.2);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.52);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.35);
}

.intro {
  max-width: 720px;
}

h2 {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 3rem);
}

.description {
  margin: 18px 0 0;
  line-height: 1.8;
  color: #cbd5e1;
}

.modules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 32px;
}

.module-card {
  display: block;
  padding: 20px;
  border-radius: 22px;
  background: rgba(30, 41, 59, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
  text-decoration: none;
  color: inherit;
}

h3 {
  margin: 0 0 10px;
  font-size: 1.02rem;
}

.module-card p {
  margin: 0;
  line-height: 1.7;
  color: #cbd5e1;
}

@media (max-width: 820px) {
  .modules {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 22px 18px;
    border-radius: 22px;
  }
}
</style>
