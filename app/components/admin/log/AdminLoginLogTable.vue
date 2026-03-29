<script setup lang="ts">
import type { AdminLoginLogItem } from "#shared/types/admin"

defineProps<{
  items: AdminLoginLogItem[]
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
            <th>结果</th>
            <th>原因</th>
            <th>IP</th>
            <th>userAgent</th>
            <th>时间</th>
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
            <td>{{ item.result }}</td>
            <td>{{ item.reason || "-" }}</td>
            <td>{{ item.ip || "-" }}</td>
            <td>{{ item.userAgent || "-" }}</td>
            <td>{{ item.createdAt }}</td>
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
  min-width: 860px;
}

th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  text-align: left;
}
</style>
