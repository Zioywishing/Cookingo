<script setup lang="ts">
import type { AdminAuditLogItem } from "#shared/types/admin"

defineProps<{
  items: AdminAuditLogItem[]
  page: number
  pageSize: number
  total: number
  pending?: boolean
}>()

const emit = defineEmits<{
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()
</script>

<template>
  <AdminBaseAdminTable
    :col-count="6"
    :empty="!items.length"
    :pending="pending"
    empty-title="暂无审计日志"
    empty-description="关键后台操作出现后会在这里沉淀审计记录。"
  >
    <template #head>
      <tr>
        <th>Actor</th>
        <th>Action</th>
        <th>Target Type</th>
        <th>Target ID</th>
        <th>Summary</th>
        <th>时间</th>
      </tr>
    </template>

    <tr v-for="item in items" :key="item.id">
      <td class="cell-strong">{{ item.actorUserId }}</td>
      <td>
        <AdminBaseAdminBadge tone="neutral">
          {{ item.action }}
        </AdminBaseAdminBadge>
      </td>
      <td>{{ item.targetType }}</td>
      <td>{{ item.targetId }}</td>
      <td>{{ item.summary }}</td>
      <td>{{ item.createdAt }}</td>
    </tr>

    <template #footer>
      <AdminBaseAdminPagination
        :page="page"
        :page-size="pageSize"
        :total="total"
        :pending="pending"
        @update:page="emit('update:page', $event)"
        @update:pageSize="emit('update:pageSize', $event)"
      />
    </template>
  </AdminBaseAdminTable>
</template>

<style scoped>
.cell-strong {
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}
</style>
