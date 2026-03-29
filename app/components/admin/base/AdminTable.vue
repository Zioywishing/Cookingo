<script setup lang="ts">
withDefaults(defineProps<{
  pending?: boolean
  empty?: boolean
  colCount: number
  loadingText?: string
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  pending: false,
  empty: false,
  loadingText: "加载中...",
  emptyTitle: "暂无数据",
  emptyDescription: "当前条件下没有可展示的数据。",
})
</script>

<template>
  <AdminBaseAdminCard class="admin-table-card" padding="md">
    <div class="table-scroll">
      <table class="admin-table">
        <thead>
          <slot name="head" />
        </thead>
        <tbody v-if="pending">
          <tr>
            <td :colspan="colCount" class="feedback-cell">
              {{ loadingText }}
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="empty">
          <tr>
            <td :colspan="colCount" class="empty-cell">
              <AdminBaseAdminEmptyState :title="emptyTitle" :description="emptyDescription" />
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <slot />
        </tbody>
      </table>
    </div>
  </AdminBaseAdminCard>
</template>

<style scoped>
.admin-table-card {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
  text-align: left;
}

.admin-table :deep(th) {
  padding: 0.85rem 1.1rem;
  background: var(--admin-bg-muted, #f9fafb);
  border-bottom: 1px solid var(--admin-border-subtle, #f3f4f6);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

.admin-table :deep(td) {
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--admin-border-subtle, #f3f4f6);
  color: var(--admin-text-secondary, #4b5563);
  vertical-align: top;
}

.admin-table :deep(tbody tr:hover td) {
  background: rgba(156, 39, 176, 0.018);
}

.admin-table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.feedback-cell,
.empty-cell {
  padding: 0;
}
</style>
