<script setup lang="ts">
import type { AdminPermissionItem } from "#shared/types/admin"

const props = defineProps<{
  open: boolean
  permissions: AdminPermissionItem[]
  pending?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: {
    name: string
    code: string
    description: string
    permissionCodes: string[]
  }]
}>()

const form = reactive({
  name: "",
  code: "",
  description: "",
  permissionCodes: [] as string[],
})

function togglePermission(code: string) {
  form.permissionCodes = form.permissionCodes.includes(code)
    ? form.permissionCodes.filter((item) => item !== code)
    : [...form.permissionCodes, code]
}

watch(
  () => props.open,
  (value) => {
    if (!value) {
      form.name = ""
      form.code = ""
      form.description = ""
      form.permissionCodes = []
    }
  },
)
</script>

<template>
  <AdminBaseAdminDialog
    :open="open"
    title="新建角色"
    description="创建新的后台角色，并绑定可访问页面权限。"
    @close="emit('close')"
  >
    <div class="grid">
      <AdminBaseAdminField label="角色名">
        <AdminBaseAdminInput v-model="form.name" placeholder="例如：内容运营" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="角色编码">
        <AdminBaseAdminInput v-model="form.code" placeholder="例如：content-manager" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="描述">
        <AdminBaseAdminInput v-model="form.description" placeholder="填写角色职责描述" />
      </AdminBaseAdminField>
    </div>

    <div class="permissions">
      <label v-for="permission in permissions" :key="permission.code" class="permission">
        <input
          :checked="form.permissionCodes.includes(permission.code)"
          type="checkbox"
          @change="togglePermission(permission.code)"
        >
        <span>{{ permission.name }}</span>
      </label>
    </div>

    <template #actions>
      <AdminBaseAdminButton variant="ghost" @click="emit('close')">
        取消
      </AdminBaseAdminButton>
      <AdminBaseAdminButton
        variant="primary"
        :loading="pending"
        @click="emit('submit', { ...form })"
      >
        创建角色
      </AdminBaseAdminButton>
    </template>
  </AdminBaseAdminDialog>
</template>

<style scoped>
.grid,
.permissions {
  display: grid;
  gap: 0.9rem;
}

.permission {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  border-radius: 0.75rem;
  background: var(--admin-bg-muted, #f9fafb);
}

input {
  accent-color: var(--admin-accent, #9c27b0);
}
</style>
