<script setup lang="ts">
import { AdminPermissionCode } from "#shared/types/admin"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Roles,
  adminPageTitle: "角色详情",
  adminPageDescription: "编辑角色信息并配置后台页面权限。",
})

const route = useRoute()
const roleId = String(route.params.id || "")
const rolesApi = useAdminRoles()
const pendingAction = ref(false)

const { data: roleDetail, pending, refresh } = await useAsyncData(
  `admin-role-detail:${roleId}`,
  () => rolesApi.getRoleDetail(roleId),
)

const { data: permissions } = await useAsyncData("admin-role-detail-permissions", () => rolesApi.listPermissions())

async function handleSaveRole(payload: {
  name: string
  description: string
  permissionCodes: string[]
}) {
  pendingAction.value = true
  await rolesApi.updateRole({
    id: roleId,
    ...payload,
  })
  pendingAction.value = false
  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="角色详情" description="编辑角色信息并配置后台页面权限。" />

    <AdminRoleForm :role="roleDetail || null" :permissions="permissions || []" :pending="pending || pendingAction" @save="handleSaveRole" />
  </AdminShellAdminPageContainer>
</template>
