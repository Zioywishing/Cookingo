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
  <section class="card">
    <h3>角色配置</h3>
    <div class="options">
      <label v-for="role in roles" :key="role.id" class="option">
        <input
          :checked="localRoleIds.includes(role.id)"
          type="checkbox"
          @change="toggleRole(role.id)"
        />
        <div>
          <strong>{{ role.name }}</strong>
          <p>{{ role.description || role.code }}</p>
        </div>
      </label>
    </div>
    <button type="button" :disabled="pending" @click="emit('save', localRoleIds)">
      {{ pending ? "保存中..." : "保存角色配置" }}
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

.options {
  display: grid;
  gap: 10px;
  margin: 18px 0;
}

.option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.56);
}

p {
  margin: 6px 0 0;
  color: #cbd5e1;
}
</style>
