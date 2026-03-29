<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Roles,
  adminPageTitle: "角色管理",
  adminPageDescription: "创建角色并配置后台页面权限。",
})

const rolesApi = useAdminRoles()
const createOpen = ref(false)
const createPending = ref(false)
const createErrorMessage = ref("")

const {
  data: pageData,
  pending,
  refresh,
} = await useAsyncData("admin-roles-page", () => rolesApi.listRoles())
const { data: rolePermissions } = await useAsyncData("admin-role-permissions", () => rolesApi.listPermissions())

async function handleCreateRole(payload: {
  name: string
  code: string
  description: string
  permissionCodes: string[]
}) {
  createPending.value = true
  createErrorMessage.value = ""
  const response = await rolesApi.createRole(payload)
  createPending.value = false

  if (response.code !== 0) {
    createErrorMessage.value = response.msg
    return
  }

  createOpen.value = false
  await refresh()
}

async function handleDeleteRole(id: string) {
  await rolesApi.deleteRole(id)
  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="角色管理" description="创建角色并配置后台页面权限。" />

    <div class="toolbar">
      <button type="button" @click="createOpen = true">
        新建角色
      </button>
    </div>

    <AdminRoleTable :items="pageData?.items || []" :pending="pending" @delete="handleDeleteRole" />

    <AdminRoleCreateDialog
      :open="createOpen"
      :permissions="rolePermissions || []"
      :pending="createPending"
      :error-message="createErrorMessage"
      @close="createOpen = false"
      @submit="handleCreateRole"
    />
  </AdminShellAdminPageContainer>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
