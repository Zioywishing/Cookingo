<script setup lang="ts">
import type { AdminUserDetail, AdminUserStatus } from "#shared/types/admin"

defineProps<{
  user: AdminUserDetail | null
  pending?: boolean
}>()

const emit = defineEmits<{
  status: [status: AdminUserStatus]
  resetPassword: [password: string]
}>()

const password = ref("")
</script>

<template>
  <section class="card">
    <h3>安全操作</h3>
    <div v-if="user" class="actions">
      <button type="button" :disabled="pending" @click="emit('status', user.status === 'active' ? 'disabled' : 'active')">
        {{ user.status === "active" ? "禁用用户" : "启用用户" }}
      </button>

      <div class="password-row">
        <input v-model="password" type="password" placeholder="输入新密码" />
        <button type="button" :disabled="pending || !password" @click="emit('resetPassword', password)">
          重置密码
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(248, 113, 113, 0.18);
  background: rgba(127, 29, 29, 0.12);
}

.actions {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.password-row {
  display: grid;
  gap: 10px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}
</style>
