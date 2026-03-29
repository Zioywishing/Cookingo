<script setup lang="ts">
import type { AdminRoleListItem } from "#shared/types/admin"

defineProps<{
  items: AdminRoleListItem[]
  pending?: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()
</script>

<template>
  <section class="table-card">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>角色名</th>
            <th>编码</th>
            <th>描述</th>
            <th>系统角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="5">
              加载中...
            </td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.description || "-" }}</td>
            <td>{{ item.isSystem ? "是" : "否" }}</td>
            <td class="actions">
              <NuxtLink :to="`/admin/roles/${item.id}`">
                查看详情
              </NuxtLink>
              <button type="button" @click="emit('delete', item.id)">
                删除
              </button>
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

.actions {
  display: flex;
  gap: 10px;
}
</style>
