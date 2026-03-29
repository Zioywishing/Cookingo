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
  <AdminBaseAdminSection
    title="安全操作"
    description="执行启停用与密码重置等高风险后台操作。"
    tone="danger"
  >
    <div v-if="user" class="actions">
      <AdminBaseAdminButton
        type="button"
        variant="danger"
        :loading="pending"
        @click="emit('status', user.status === 'active' ? 'disabled' : 'active')"
      >
        {{ user.status === "active" ? "禁用用户" : "启用用户" }}
      </AdminBaseAdminButton>

      <div class="password-row">
        <AdminBaseAdminField label="重置密码" hint="请输入新的后台登录密码。">
          <AdminBaseAdminInput v-model="password" type="password" placeholder="输入新密码" />
        </AdminBaseAdminField>
        <AdminBaseAdminButton type="button" variant="primary" :disabled="!password" :loading="pending" @click="emit('resetPassword', password)">
          重置密码
        </AdminBaseAdminButton>
      </div>
    </div>
  </AdminBaseAdminSection>
</template>

<style scoped>
.actions {
  display: grid;
  gap: 1rem;
}

.password-row {
  display: grid;
  gap: 0.85rem;
}
</style>
