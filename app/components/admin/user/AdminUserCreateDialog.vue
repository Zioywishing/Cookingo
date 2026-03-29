<script setup lang="ts">
const props = defineProps<{
  open: boolean
  pending?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: {
    username: string
    displayName: string
    password: string
  }]
}>()

const form = reactive({
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
})

function handleSubmit() {
  if (!form.password || form.password !== form.confirmPassword) {
    return
  }

  emit("submit", {
    username: form.username,
    displayName: form.displayName,
    password: form.password,
  })
}

watch(
  () => props.open,
  (value) => {
    if (!value) {
      form.username = ""
      form.displayName = ""
      form.password = ""
      form.confirmPassword = ""
    }
  },
)
</script>

<template>
  <div v-if="open" class="dialog-layer">
    <button class="dialog-backdrop" type="button" aria-label="Close dialog" @click="emit('close')" />
    <div class="dialog-panel">
      <h3>新建用户</h3>
      <div class="grid">
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.displayName" placeholder="显示名" />
        <input v-model="form.password" type="password" placeholder="密码" />
        <input v-model="form.confirmPassword" type="password" placeholder="确认密码" />
      </div>
      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
      <div class="actions">
        <button type="button" @click="emit('close')">
          取消
        </button>
        <button type="button" :disabled="pending" @click="handleSubmit">
          {{ pending ? "提交中..." : "创建用户" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-layer,
.dialog-backdrop {
  position: fixed;
  inset: 0;
}

.dialog-layer {
  z-index: 45;
}

.dialog-backdrop {
  border: 0;
  background: rgba(2, 6, 23, 0.6);
}

.dialog-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(92vw, 480px);
  padding: 24px;
  border-radius: 24px;
  background: #0f172a;
  transform: translate(-50%, -50%);
}

.grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.error {
  color: #fca5a5;
}
</style>
