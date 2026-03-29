<script setup lang="ts">
import type { AdminUserListItem } from "#shared/types/admin"
import { resolveAdminBadgeTone } from "~/composables/useAdminUi"

defineProps<{
  items: AdminUserListItem[]
  pending?: boolean
}>()
</script>

<template>
  <AdminBaseAdminTable
    :col-count="6"
    :empty="!items.length"
    :pending="pending"
    empty-title="暂无后台用户"
    empty-description="新建后台账号后，可以在这里继续查看资料与角色配置。"
  >
    <template #head>
      <tr>
        <th>用户名</th>
        <th>显示名</th>
        <th>状态</th>
        <th>角色</th>
        <th>最近登录</th>
        <th>操作</th>
      </tr>
    </template>

    <tr v-for="item in items" :key="item.id">
      <td class="cell-strong">{{ item.username }}</td>
      <td>{{ item.displayName }}</td>
      <td>
        <AdminBaseAdminBadge :tone="resolveAdminBadgeTone(item.status)">
          {{ item.status }}
        </AdminBaseAdminBadge>
      </td>
      <td>{{ item.roles.map((role) => role.name).join(" / ") || "-" }}</td>
      <td>{{ item.lastLoginAt || "-" }}</td>
      <td>
        <NuxtLink :to="`/admin/users/${item.id}`" class="link-button">
          查看详情
        </NuxtLink>
      </td>
    </tr>
  </AdminBaseAdminTable>
</template>

<style scoped>
.cell-strong {
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}

.link-button {
  color: var(--admin-accent, #9c27b0);
  font-weight: 600;
  text-decoration: none;
}
</style>
