<script setup lang="ts">
import { AdminPageMetaByPath, AdminPermissionCode } from "#shared/admin/domain"

const pageMeta = AdminPageMetaByPath["/admin/audit-logs"]!
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
  adminPermission: AdminPermissionCode.AuditLogs,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const logsApi = useAdminLogs()
const { data: pageData, pending } = await useAsyncData("admin-audit-logs-page", () =>
  feedback.load(() => logsApi.listAuditLogs(), {
    errorMessage: "加载操作审计失败",
    fallback: emptyPageData,
  }),
)
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="操作审计" description="查看后台关键行为审计记录。" />
    <AdminLogAdminAuditLogTable :items="pageData?.items || []" :pending="pending" />
  </AdminShellAdminPageContainer>
</template>
