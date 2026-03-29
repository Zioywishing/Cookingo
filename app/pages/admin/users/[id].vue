<script setup lang="ts">
import {
  AdminDetailPageMetaByKey,
  AdminPermissionCode,
} from "#shared/admin/domain"
import type { AdminUserStatus } from "#shared/types/admin"

const pageMeta = AdminDetailPageMetaByKey.userDetail

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Users,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const route = useRoute()
const userId = String(route.params.id || "")
const usersApi = useAdminUsers()
const feedback = useAdminRequestFeedback()
const pendingAction = ref(false)

const { data: userDetail, pending, refresh } = await useAsyncData(
  `admin-user-detail:${userId}`,
  () => feedback.load(() => usersApi.getUserDetail(userId), {
    errorMessage: "加载用户详情失败",
    fallback: null,
  }),
)

const { data: roleOptions } = await useAsyncData("admin-user-role-options", () =>
  feedback.load(() => usersApi.listRoleOptions(), {
    errorMessage: "加载角色选项失败",
    fallback: [],
  }),
)

async function handleSaveProfile(displayName: string) {
  pendingAction.value = true
  const response = await feedback.run(() => usersApi.updateProfile({
    id: userId,
    displayName,
  }), {
    successMessage: "用户信息保存成功",
    errorMessage: "保存用户信息失败",
  })
  pendingAction.value = false

  if (!response) {
    return
  }

  await refresh()
}

async function handleSaveRoles(roleIds: string[]) {
  pendingAction.value = true
  const response = await feedback.run(() => usersApi.updateRoles({
    id: userId,
    roleIds,
  }), {
    successMessage: "用户角色保存成功",
    errorMessage: "保存用户角色失败",
  })
  pendingAction.value = false

  if (!response) {
    return
  }

  await refresh()
}

async function handleStatus(status: AdminUserStatus) {
  pendingAction.value = true
  const response = await feedback.run(() => usersApi.updateStatus({
    id: userId,
    status,
  }), {
    successMessage: "用户状态更新成功",
    errorMessage: "更新用户状态失败",
  })
  pendingAction.value = false

  if (!response) {
    return
  }

  await refresh()
}

async function handleResetPassword(password: string) {
  pendingAction.value = true
  await feedback.run(() => usersApi.resetPassword({
    id: userId,
    newPassword: password,
  }), {
    successMessage: "密码重置成功",
    errorMessage: "重置密码失败",
  })
  pendingAction.value = false
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="用户详情" description="查看并维护后台用户信息、角色和安全设置。" />

    <AdminUserProfileCard :user="userDetail || null" :pending="pending || pendingAction" @save="handleSaveProfile" />
    <AdminUserRolePanel
      :roles="roleOptions || []"
      :selected-role-ids="userDetail?.roles.map((role) => role.id) || []"
      :pending="pendingAction"
      @save="handleSaveRoles"
    />
    <AdminUserSecurityPanel :user="userDetail || null" :pending="pendingAction" @status="handleStatus" @reset-password="handleResetPassword" />
  </AdminShellAdminPageContainer>
</template>
