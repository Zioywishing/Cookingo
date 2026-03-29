<script setup lang="ts">
import type { AdminUserDetail } from "#shared/types/admin"
import { resolveAdminBadgeTone } from "~/composables/useAdminUi"

const props = defineProps<{
  user: AdminUserDetail | null
  pending?: boolean
}>()

const emit = defineEmits<{
  save: [displayName: string]
}>()

const form = reactive({
  displayName: "",
})

watch(
  () => props.user?.displayName,
  (value) => {
    form.displayName = value || ""
  },
  { immediate: true },
)
</script>

<template>
  <AdminBaseAdminSection title="基础信息" description="维护当前后台用户的基础资料与登录概况。">
    <div v-if="user" class="grid">
      <AdminBaseAdminField label="用户名">
        <AdminBaseAdminInput :model-value="user.username" disabled />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="显示名">
        <AdminBaseAdminInput v-model="form.displayName" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="状态">
        <div class="status-row">
          <AdminBaseAdminBadge :tone="resolveAdminBadgeTone(user.status)">
            {{ user.status }}
          </AdminBaseAdminBadge>
        </div>
      </AdminBaseAdminField>
      <AdminBaseAdminField label="最近登录">
        <AdminBaseAdminInput :model-value="user.lastLoginAt || '-'" disabled />
      </AdminBaseAdminField>
    </div>
    <div class="actions">
      <AdminBaseAdminButton type="button" variant="primary" :loading="pending" @click="emit('save', form.displayName)">
        保存基础信息
      </AdminBaseAdminButton>
    </div>
  </AdminBaseAdminSection>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 0.9rem;
}

.status-row {
  display: flex;
  align-items: center;
  min-height: 2.9rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
}
</style>
