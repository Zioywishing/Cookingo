<script setup lang="ts">
import { AdminPageMetaByPath, AdminPermissionCode } from "#shared/admin/domain"

const pageMeta = AdminPageMetaByPath["/admin/roles"]!
const feedback = useAdminRequestFeedback()
const emptyRolesPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
}

definePageMeta({
  layout: "admin",
  middleware: ["admin-init", "admin-auth"],
  adminPermission: AdminPermissionCode.Roles,
  adminPageTitle: pageMeta.title,
  adminPageDescription: pageMeta.description,
})

const rolesApi = useAdminRoles()
const createOpen = ref(false)
const createPending = ref(false)

const {
  data: pageData,
  pending,
  refresh,
} = await useAsyncData("admin-roles-page", () =>
  feedback.load(() => rolesApi.listRoles(), {
    errorMessage: "加载角色列表失败",
    fallback: emptyRolesPage,
  }),
)
const { data: rolePermissions } = await useAsyncData("admin-role-permissions", () =>
  feedback.load(() => rolesApi.listPermissions(), {
    errorMessage: "加载角色权限失败",
    fallback: [],
  }),
)

async function handleCreateRole(payload: {
  name: string
  code: string
  description: string
  permissionCodes: string[]
}) {
  createPending.value = true
  const response = await feedback.run(() => rolesApi.createRole(payload), {
    successMessage: "角色创建成功",
    errorMessage: "创建角色失败",
  })
  createPending.value = false

  if (!response) {
    return
  }

  createOpen.value = false
  await refresh()
}

async function handleDeleteRole(id: string) {
  const response = await feedback.run(() => rolesApi.deleteRole(id), {
    successMessage: "角色删除成功",
    errorMessage: "删除角色失败",
  })

  if (!response) {
    return
  }

  await refresh()
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="角色管理" description="创建角色并配置后台页面权限。" />

    <AdminBaseAdminToolbar>
      <AdminBaseAdminButton type="button" variant="primary" @click="createOpen = true">
        新建角色
      </AdminBaseAdminButton>
    </AdminBaseAdminToolbar>

    <AdminRoleTable :items="pageData?.items || []" :pending="pending" @delete="handleDeleteRole" />

    <AdminRoleCreateDialog
      :open="createOpen"
      :permissions="rolePermissions || []"
      :pending="createPending"
      @close="createOpen = false"
      @submit="handleCreateRole"
    />
  </AdminShellAdminPageContainer>
</template>
