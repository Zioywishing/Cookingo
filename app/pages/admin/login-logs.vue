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
const page = ref(1)
const pageSize = ref(20)

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.LoginLogs,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const logsApi = useAdminLogs()
const { data: pageData, pending, refresh } = await useAsyncData("admin-login-logs-page", () =>
  feedback.load(() => logsApi.listLoginLogs(page.value, pageSize.value), {
    errorMessage: "加载登录日志失败",
    fallback: emptyPageData,
  }),
)

async function handlePageChange(nextPage: number) {
  if (nextPage === page.value) {
    return
  }

  page.value = nextPage
  await refresh()
}

async function handlePageSizeChange(nextPageSize: number) {
  if (nextPageSize === pageSize.value) {
    return
  }

  pageSize.value = nextPageSize
  page.value = 1
  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="登录日志" description="查看后台登录成功与失败记录。" />
    <AdminLogAdminLoginLogTable
      :items="pageData?.items || []"
      :page="page"
      :page-size="pageSize"
      :total="pageData?.total || 0"
      :pending="pending"
      @update:page="handlePageChange"
      @update:pageSize="handlePageSizeChange"
    />
  </AdminShellAdminPageContainer>
</template>
