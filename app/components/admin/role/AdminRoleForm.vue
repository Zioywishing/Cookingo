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
  <section class="card">
    <h3>角色详情</h3>
    <div v-if="role" class="grid">
      <label>
        <span>角色名</span>
        <input v-model="form.name" />
      </label>
      <label>
        <span>角色编码</span>
        <input :value="role.code" disabled />
      </label>
      <label>
        <span>描述</span>
        <input v-model="form.description" />
      </label>
    </div>

    <div class="permissions">
      <AdminRoleAdminPermissionGroup
        v-for="group in ['overview', 'iam', 'security']"
        :key="group"
        :group-key="group"
        :items="permissions.filter((item) => item.groupKey === group)"
        :selected-codes="form.permissionCodes"
        @toggle="togglePermission"
      />
    </div>

    <button type="button" :disabled="pending" @click="emit('save', { ...form })">
      {{ pending ? "保存中..." : "保存角色" }}
    </button>
  </section>
</template>

<style scoped>
.card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.44);
}

.grid,
.permissions {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

label {
  display: grid;
  gap: 6px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}
</style>
