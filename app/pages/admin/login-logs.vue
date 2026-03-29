<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.LoginLogs,
  adminPageTitle: "登录日志",
  adminPageDescription: "查看后台登录成功与失败记录。",
})

const logsApi = useAdminLogs()
const { data: pageData, pending } = await useAsyncData("admin-login-logs-page", () => logsApi.listLoginLogs())
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="登录日志" description="查看后台登录成功与失败记录。" />
    <AdminLogAdminLoginLogTable :items="pageData?.items || []" :pending="pending" />
  </AdminShellAdminPageContainer>
</template>
