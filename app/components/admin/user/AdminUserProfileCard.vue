<script setup lang="ts">
import type { AdminUserDetail } from "#shared/types/admin"

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
  <section class="card">
    <h3>基础信息</h3>
    <div v-if="user" class="grid">
      <label>
        <span>用户名</span>
        <input :value="user.username" disabled />
      </label>
      <label>
        <span>显示名</span>
        <input v-model="form.displayName" />
      </label>
      <label>
        <span>状态</span>
        <input :value="user.status" disabled />
      </label>
      <label>
        <span>最近登录</span>
        <input :value="user.lastLoginAt || '-'" disabled />
      </label>
    </div>
    <button type="button" :disabled="pending" @click="emit('save', form.displayName)">
      {{ pending ? "保存中..." : "保存基础信息" }}
    </button>
  </section>
</template>

<style scoped>
.card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.44);
}

.grid {
  display: grid;
  gap: 12px;
  margin: 18px 0;
}

label {
  display: grid;
  gap: 6px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}
</style>
