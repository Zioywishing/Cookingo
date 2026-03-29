<script setup lang="ts">
const feedback = useAdminRequestFeedback()

const props = defineProps<{
  open: boolean
  pending?: boolean
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
    feedback.showError("两次输入的密码不一致")
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
  <AdminBaseAdminDialog
    :open="open"
    title="新建用户"
    description=""
    max-width="30rem"
    @close="emit('close')"
  >
    <div class="grid">
      <AdminBaseAdminField label="用户名">
        <AdminBaseAdminInput v-model="form.username" placeholder="请输入用户名" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="显示名">
        <AdminBaseAdminInput v-model="form.displayName" placeholder="请输入显示名" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="密码">
        <AdminBaseAdminInput v-model="form.password" type="password" placeholder="请输入密码" />
      </AdminBaseAdminField>
      <AdminBaseAdminField label="确认密码">
        <AdminBaseAdminInput v-model="form.confirmPassword" type="password" placeholder="再次输入密码" />
      </AdminBaseAdminField>
    </div>

    <template #actions>
      <AdminBaseAdminButton variant="ghost" @click="emit('close')">
        取消
      </AdminBaseAdminButton>
      <AdminBaseAdminButton variant="primary" :loading="pending" @click="handleSubmit">
        创建用户
      </AdminBaseAdminButton>
    </template>
  </AdminBaseAdminDialog>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 0.9rem;
}
</style>
