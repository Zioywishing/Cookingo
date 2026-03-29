<script setup lang="ts">
import type { AdminRoleListItem } from "#shared/types/admin"

const props = defineProps<{
  roles: AdminRoleListItem[]
  selectedRoleIds: string[]
  pending?: boolean
}>()

const emit = defineEmits<{
  save: [roleIds: string[]]
}>()

const localRoleIds = ref<string[]>([])

watch(
  () => props.selectedRoleIds,
  (value) => {
    localRoleIds.value = [...value]
  },
  { immediate: true },
)

function toggleRole(roleId: string) {
  localRoleIds.value = localRoleIds.value.includes(roleId)
    ? localRoleIds.value.filter((id) => id !== roleId)
    : [...localRoleIds.value, roleId]
}
</script>

<template>
  <AdminBaseAdminSection title="角色配置" description="为当前用户分配后台角色集合。">
    <div class="options">
      <label v-for="role in roles" :key="role.id" class="option">
        <input
          :checked="localRoleIds.includes(role.id)"
          type="checkbox"
          @change="toggleRole(role.id)"
        >
        <div>
          <strong>{{ role.name }}</strong>
          <p>{{ role.description || role.code }}</p>
        </div>
      </label>
    </div>
    <div class="actions">
      <AdminBaseAdminButton type="button" variant="primary" :loading="pending" @click="emit('save', localRoleIds)">
        保存角色配置
      </AdminBaseAdminButton>
    </div>
  </AdminBaseAdminSection>
</template>

<style scoped>
.options {
  display: grid;
  gap: 0.8rem;
}

.option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  border-radius: 0.75rem;
  background: var(--admin-bg-muted, #f9fafb);
}

input {
  margin-top: 0.15rem;
  accent-color: var(--admin-accent, #9c27b0);
}

strong {
  color: var(--admin-text-primary, #111827);
}

p {
  margin: 0.35rem 0 0;
  color: var(--admin-text-secondary, #4b5563);
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
}
</style>
