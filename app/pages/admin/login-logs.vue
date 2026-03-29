<script setup lang="ts">
import { AdminPageMetaByPath, AdminPermissionCode } from "#shared/admin/domain"

const pageMeta = AdminPageMetaByPath["/admin/login-logs"]!
const feedback = useAdminRequestFeedback()
const emptyPageData = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
}

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.LoginLogs,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const logsApi = useAdminLogs()
const { data: pageData, pending } = await useAsyncData("admin-login-logs-page", () =>
  feedback.load(() => logsApi.listLoginLogs(), {
    errorMessage: "加载登录日志失败",
    fallback: emptyPageData,
  }),
)
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="登录日志" description="查看后台登录成功与失败记录。" />
    <AdminLogAdminLoginLogTable :items="pageData?.items || []" :pending="pending" />
  </AdminShellAdminPageContainer>
</template>
