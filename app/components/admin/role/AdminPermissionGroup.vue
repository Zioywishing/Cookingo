<script setup lang="ts">
import type { AdminPermissionItem } from "#shared/types/admin"

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
  <section class="group-card">
    <h4>{{ groupKey }}</h4>
    <div class="items">
      <label v-for="item in items" :key="item.code" class="item">
        <input
          :checked="selectedCodes.includes(item.code)"
          type="checkbox"
          @change="emit('toggle', item.code)"
        />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.description }} · {{ item.routePath }}</p>
        </div>
      </label>
    </div>
  </section>
</template>

<style scoped>
.group-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.52);
}

h4 {
  margin: 0 0 12px;
  text-transform: capitalize;
}

.items {
  display: grid;
  gap: 10px;
}

.item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
}

p {
  margin: 6px 0 0;
  color: #cbd5e1;
}
</style>
