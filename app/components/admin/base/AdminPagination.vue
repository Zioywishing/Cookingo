<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  pending?: boolean
}>(), {
  pending: false,
})

const emit = defineEmits<{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()

const pageSizeOptions = [20, 50, 100]
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const canGoPrev = computed(() => props.page > 1 && !props.pending)
const canGoNext = computed(() => props.page < totalPages.value && !props.pending)

function handlePrev() {
  if (!canGoPrev.value) {
    return
  }

  emit("update:page", props.page - 1)
}

function handleNext() {
  if (!canGoNext.value) {
    return
  }

  emit("update:page", props.page + 1)
}

function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const nextPageSize = Number(target.value)

  if (Number.isNaN(nextPageSize) || nextPageSize === props.pageSize || props.pending) {
    return
  }

  emit("update:pageSize", nextPageSize)
}
</script>

<template>
  <div class="pagination">
    <div class="meta">
      <span>共 {{ total }} 条</span>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
    </div>

    <div class="controls">
      <label class="page-size">
        <span>每页</span>
        <select :value="pageSize" :disabled="pending" @change="handlePageSizeChange">
          <option v-for="option in pageSizeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <AdminBaseAdminButton type="button" variant="ghost" size="sm" :disabled="!canGoPrev" @click="handlePrev">
        上一页
      </AdminBaseAdminButton>
      <AdminBaseAdminButton type="button" variant="ghost" size="sm" :disabled="!canGoNext" @click="handleNext">
        下一页
      </AdminBaseAdminButton>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--admin-text-tertiary, #9ca3af);
  font-size: 0.875rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.page-size {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--admin-text-secondary, #4b5563);
  font-size: 0.875rem;
}

.page-size select {
  min-width: 4.75rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--admin-border-default, #e5e7eb);
  border-radius: 999px;
  background: var(--admin-surface, #ffffff);
  color: var(--admin-text-primary, #111827);
}

.page-size select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .pagination {
    align-items: stretch;
  }

  .controls {
    justify-content: space-between;
  }
}
</style>
