<script setup lang="ts">
import {
  AdminDetailPageMetaByKey,
  AdminPermissionCode,
} from "#shared/admin/domain"

const pageMeta = AdminDetailPageMetaByKey.roleDetail

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Roles,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const route = useRoute()
const roleId = String(route.params.id || "")
const rolesApi = useAdminRoles()
const feedback = useAdminRequestFeedback()
const pendingAction = ref(false)

const { data: roleDetail, pending, refresh } = await useAsyncData(
  `admin-role-detail:${roleId}`,
  () => feedback.load(() => rolesApi.getRoleDetail(roleId), {
    errorMessage: "加载角色详情失败",
    fallback: null,
  }),
)

const { data: permissions } = await useAsyncData("admin-role-detail-permissions", () =>
  feedback.load(() => rolesApi.listPermissions(), {
    errorMessage: "加载角色权限失败",
    fallback: [],
  }),
)

async function handleSaveRole(payload: {
  name: string
  description: string
  permissionCodes: string[]
}) {
  pendingAction.value = true
  const response = await feedback.run(() => rolesApi.updateRole({
    id: roleId,
    ...payload,
  }), {
    successMessage: "角色权限保存成功",
    errorMessage: "保存角色权限失败",
  })
  pendingAction.value = false

  if (!response) {
    return
  }

  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="角色详情" description="编辑角色信息并配置后台页面权限。" />

    <AdminRoleForm :role="roleDetail || null" :permissions="permissions || []" :pending="pending || pendingAction" @save="handleSaveRole" />
  </AdminShellAdminPageContainer>
</template>
