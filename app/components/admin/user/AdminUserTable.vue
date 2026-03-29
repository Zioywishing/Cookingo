<script setup lang="ts">
import type { AdminUserListItem } from "#shared/types/admin"

defineProps<{
  items: AdminUserListItem[]
  pending?: boolean
}>()
</script>

<template>
  <section class="table-card">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>显示名</th>
            <th>状态</th>
            <th>角色</th>
            <th>最近登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="6">
              加载中...
            </td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.username }}</td>
            <td>{{ item.displayName }}</td>
            <td>{{ item.status }}</td>
            <td>{{ item.roles.map((role) => role.name).join(" / ") || "-" }}</td>
            <td>{{ item.lastLoginAt || "-" }}</td>
            <td>
              <NuxtLink :to="`/admin/users/${item.id}`">
                查看详情
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-card {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.44);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  text-align: left;
}
</style>
