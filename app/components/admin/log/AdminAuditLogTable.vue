<script setup lang="ts">
import type { AdminAuditLogItem } from "#shared/types/admin"

defineProps<{
  items: AdminAuditLogItem[]
  pending?: boolean
}>()
</script>

<template>
  <section class="table-card">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>actorUserId</th>
            <th>action</th>
            <th>targetType</th>
            <th>targetId</th>
            <th>summary</th>
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
            <td>{{ item.actorUserId }}</td>
            <td>{{ item.action }}</td>
            <td>{{ item.targetType }}</td>
            <td>{{ item.targetId }}</td>
            <td>{{ item.summary }}</td>
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
