<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.AuditLogs,
  adminPageTitle: "操作审计",
  adminPageDescription: "查看后台关键行为审计记录。",
})

const logsApi = useAdminLogs()
const { data: pageData, pending } = await useAsyncData("admin-audit-logs-page", () => logsApi.listAuditLogs())
</script>

<template>
  <AdminPageContainer>
    <AdminPageHeader title="操作审计" description="查看后台关键行为审计记录。" />
    <AdminAuditLogTable :items="pageData?.items || []" :pending="pending" />
  </AdminPageContainer>
</template>
