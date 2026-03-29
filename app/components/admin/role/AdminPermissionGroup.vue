<script setup lang="ts">
import type { AdminPermissionItem } from "#shared/types/admin"
import { formatAdminPermissionGroupLabel } from "~/composables/useAdminUi"

defineProps<{
  groupKey: string
  items: AdminPermissionItem[]
  selectedCodes: string[]
}>()

const emit = defineEmits<{
  toggle: [code: string]
}>()
</script>

<template>
  <AdminBaseAdminCard :title="formatAdminPermissionGroupLabel(groupKey)" muted padding="md">
    <div class="items">
      <label v-for="item in items" :key="item.code" class="item">
        <input
          :checked="selectedCodes.includes(item.code)"
          type="checkbox"
          @change="emit('toggle', item.code)"
        >
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.description }} · {{ item.routePath }}</p>
        </div>
      </label>
    </div>
  </AdminBaseAdminCard>
</template>

<style scoped>
.items {
  display: grid;
  gap: 0.75rem;
}

.item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  padding: 0.95rem;
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  border-radius: 0.75rem;
  background: var(--admin-bg-surface, #fff);
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
  line-height: 1.6;
}
</style>
