<script setup lang="ts">
import type { AdminLoginLogItem } from "#shared/types/admin"

defineProps<{
  items: AdminLoginLogItem[]
  pending?: boolean
}>()
</script>

<template>
  <AdminBaseAdminTable
    :col-count="6"
    :empty="!items.length"
    :pending="pending"
    empty-title="暂无登录日志"
    empty-description="管理员登录成功与失败记录会展示在这里。"
  >
    <template #head>
      <tr>
        <th>用户名</th>
        <th>结果</th>
        <th>原因</th>
        <th>IP</th>
        <th>User Agent</th>
        <th>时间</th>
      </tr>
    </template>

    <tr v-for="item in items" :key="item.id">
      <td class="cell-strong">{{ item.username }}</td>
      <td>
        <AdminBaseAdminBadge :tone="item.result === 'success' ? 'success' : 'danger'">
          {{ item.result }}
        </AdminBaseAdminBadge>
      </td>
      <td>{{ item.reason || "-" }}</td>
      <td>{{ item.ip || "-" }}</td>
      <td class="cell-wrap">{{ item.userAgent || "-" }}</td>
      <td>{{ item.createdAt }}</td>
    </tr>
  </AdminBaseAdminTable>
</template>

<style scoped>
.cell-strong {
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}

.cell-wrap {
  max-width: 22rem;
  word-break: break-word;
}
</style>
