<script setup lang="ts">
import type { AdminRoleListItem } from "#shared/types/admin"

defineProps<{
  items: AdminRoleListItem[]
  page: number
  pageSize: number
  total: number
  pending?: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
  "update:page": [page: number]
  "update:pageSize": [pageSize: number]
}>()
</script>

<template>
  <AdminBaseAdminTable
    :col-count="5"
    :empty="!items.length"
    :pending="pending"
    empty-title="暂无角色"
    empty-description="创建角色后，可以在这里继续分配后台页面权限。"
  >
    <template #head>
      <tr>
        <th>角色名</th>
        <th>编码</th>
        <th>描述</th>
        <th>系统角色</th>
        <th>操作</th>
      </tr>
    </template>

    <tr v-for="item in items" :key="item.id">
      <td class="cell-strong">{{ item.name }}</td>
      <td>{{ item.code }}</td>
      <td>{{ item.description || "-" }}</td>
      <td>
        <AdminBaseAdminBadge :tone="item.isSystem ? 'warning' : 'neutral'">
          {{ item.isSystem ? "System" : "Custom" }}
        </AdminBaseAdminBadge>
      </td>
      <td class="actions">
        <NuxtLink :to="`/admin/roles/${item.id}`" class="link-button">
          查看详情
        </NuxtLink>
        <AdminBaseAdminButton variant="danger" size="sm" @click="emit('delete', item.id)">
          删除
        </AdminBaseAdminButton>
      </td>
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

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.link-button {
  color: var(--admin-accent, #9c27b0);
  font-weight: 600;
  text-decoration: none;
}
</style>
