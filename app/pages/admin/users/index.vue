<script setup lang="ts">
import { AdminPageMetaByPath, AdminPermissionCode } from "#shared/admin/domain"

const pageMeta = AdminPageMetaByPath["/admin/users"]!
const feedback = useAdminRequestFeedback()
const emptyUsersPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
}

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Users,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const usersApi = useAdminUsers()
const createOpen = ref(false)
const createPending = ref(false)

const {
  data: pageData,
  pending,
  refresh,
} = await useAsyncData("admin-users-page", () =>
  feedback.load(() => usersApi.listUsers(), {
    errorMessage: "加载用户列表失败",
    fallback: emptyUsersPage,
  }),
)

async function handleCreateUser(payload: {
  username: string
  displayName: string
  password: string
}) {
  createPending.value = true
  const response = await feedback.run(() => usersApi.createUser(payload), {
    successMessage: "用户创建成功",
    errorMessage: "创建用户失败",
  })
  createPending.value = false

  if (!response) {
    return
  }

  createOpen.value = false
  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="用户管理" description="创建、查看和维护后台账号。" />

    <AdminBaseAdminToolbar>
      <AdminBaseAdminButton type="button" variant="primary" @click="createOpen = true">
        新建用户
      </AdminBaseAdminButton>
    </AdminBaseAdminToolbar>

    <AdminUserTable :items="pageData?.items || []" :pending="pending" />

    <AdminUserCreateDialog
      :open="createOpen"
      :pending="createPending"
      @close="createOpen = false"
      @submit="handleCreateUser"
    />
  </AdminShellAdminPageContainer>
</template>
