<script setup lang="ts">
import { AdminUserStatus, AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Users,
  adminPageTitle: "用户详情",
  adminPageDescription: "查看并维护后台用户信息、角色和安全设置。",
})

const route = useRoute()
const userId = String(route.params.id || "")
const usersApi = useAdminUsers()
const pendingAction = ref(false)

const { data: userDetail, pending, refresh } = await useAsyncData(
  `admin-user-detail:${userId}`,
  () => usersApi.getUserDetail(userId),
)

const { data: roleOptions } = await useAsyncData("admin-user-role-options", () => usersApi.listRoleOptions())

async function handleSaveProfile(displayName: string) {
  pendingAction.value = true
  await usersApi.updateProfile({
    id: userId,
    displayName,
  })
  pendingAction.value = false
  await refresh()
}

async function handleSaveRoles(roleIds: string[]) {
  pendingAction.value = true
  await usersApi.updateRoles({
    id: userId,
    roleIds,
  })
  pendingAction.value = false
  await refresh()
}

async function handleStatus(status: AdminUserStatus) {
  pendingAction.value = true
  await usersApi.updateStatus({
    id: userId,
    status,
  })
  pendingAction.value = false
  await refresh()
}

async function handleResetPassword(password: string) {
  pendingAction.value = true
  await usersApi.resetPassword({
    id: userId,
    newPassword: password,
  })
  pendingAction.value = false
}
</script>

<template>
  <AdminPageContainer>
    <AdminPageHeader title="用户详情" description="查看并维护后台用户信息、角色和安全设置。" />

    <AdminUserProfileCard :user="userDetail || null" :pending="pending || pendingAction" @save="handleSaveProfile" />
    <AdminUserRolePanel
      :roles="roleOptions || []"
      :selected-role-ids="userDetail?.roles.map((role) => role.id) || []"
      :pending="pendingAction"
      @save="handleSaveRoles"
    />
    <AdminUserSecurityPanel :user="userDetail || null" :pending="pendingAction" @status="handleStatus" @reset-password="handleResetPassword" />
  </AdminPageContainer>
</template>
