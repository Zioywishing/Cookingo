<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Users,
  adminPageTitle: "用户管理",
  adminPageDescription: "创建、查看和维护后台账号。",
})

const usersApi = useAdminUsers()
const createOpen = ref(false)
const createPending = ref(false)
const createErrorMessage = ref("")

const {
  data: pageData,
  pending,
  refresh,
} = await useAsyncData("admin-users-page", () => usersApi.listUsers())

async function handleCreateUser(payload: {
  username: string
  displayName: string
  password: string
}) {
  createPending.value = true
  createErrorMessage.value = ""
  const response = await usersApi.createUser(payload)
  createPending.value = false

  if (response.code !== 0) {
    createErrorMessage.value = response.msg
    return
  }

  createOpen.value = false
  await refresh()
}
</script>

<template>
  <AdminPageContainer>
    <AdminPageHeader title="用户管理" description="创建、查看和维护后台账号。" />

    <div class="toolbar">
      <button type="button" @click="createOpen = true">
        新建用户
      </button>
    </div>

    <AdminUserTable :items="pageData?.items || []" :pending="pending" />

    <AdminUserCreateDialog
      :open="createOpen"
      :pending="createPending"
      :error-message="createErrorMessage"
      @close="createOpen = false"
      @submit="handleCreateUser"
    />
  </AdminPageContainer>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
