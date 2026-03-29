<script setup lang="ts">
import type { AdminPermissionItem, AdminRoleDetail } from "#shared/types/admin"

const props = defineProps<{
  role: AdminRoleDetail | null
  permissions: AdminPermissionItem[]
  pending?: boolean
}>()

const emit = defineEmits<{
  save: [payload: {
    name: string
    description: string
    permissionCodes: string[]
  }]
}>()

const form = reactive({
  name: "",
  description: "",
  permissionCodes: [] as string[],
})

watch(
  () => props.role,
  (value) => {
    form.name = value?.name || ""
    form.description = value?.description || ""
    form.permissionCodes = value?.permissions.map((permission) => permission.code) || []
  },
  { immediate: true },
)

function togglePermission(code: string) {
  form.permissionCodes = form.permissionCodes.includes(code)
    ? form.permissionCodes.filter((item) => item !== code)
    : [...form.permissionCodes, code]
}
</script>

<template>
  <div class="role-form">
    <AdminBaseAdminSection title="角色信息" description="维护角色名称、编码与说明信息。">
      <div v-if="role" class="grid">
        <AdminBaseAdminField label="角色名">
          <AdminBaseAdminInput v-model="form.name" />
        </AdminBaseAdminField>
        <AdminBaseAdminField label="角色编码">
          <AdminBaseAdminInput :model-value="role.code" disabled />
        </AdminBaseAdminField>
        <AdminBaseAdminField label="描述">
          <AdminBaseAdminInput v-model="form.description" />
        </AdminBaseAdminField>
      </div>
    </AdminBaseAdminSection>

    <AdminBaseAdminSection title="页面权限" description="按权限组配置该角色可访问的后台能力。">
      <AdminRoleAdminPermissionGroup
        v-for="group in ['overview', 'iam', 'security']"
        :key="group"
        :group-key="group"
        :items="permissions.filter((item) => item.groupKey === group)"
        :selected-codes="form.permissionCodes"
        @toggle="togglePermission"
      />
    </AdminBaseAdminSection>

    <div class="actions">
      <AdminBaseAdminButton type="button" variant="primary" :loading="pending" @click="emit('save', { ...form })">
        保存角色
      </AdminBaseAdminButton>
    </div>
  </div>
</template>

<style scoped>
.role-form {
  display: grid;
  gap: 1rem;
}

.grid,
.permissions {
  display: grid;
  gap: 0.9rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
