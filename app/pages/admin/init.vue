<script setup lang="ts">
import type { ApiResponse } from "#shared/types/api"

definePageMeta({
  layout: "admin",
  middleware: ["admin-init"],
  adminPageTitle: "初始化管理后台",
  adminPageDescription: "创建首个超级管理员账号。",
})

const router = useRouter()
const initStatus = useAdminInitStatus()
const form = reactive({
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
})
const pending = ref(false)
const errorMessage = ref("")

async function handleSubmit() {
  if (!form.password || form.password !== form.confirmPassword) {
    errorMessage.value = "两次输入的密码不一致"
    return
  }

  pending.value = true
  errorMessage.value = ""

  const response = await $fetch<ApiResponse<unknown>>("/api/admin/post/initAdmin", {
    method: "POST",
    body: {
      username: form.username,
      displayName: form.displayName,
      password: form.password,
    },
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
  })

  pending.value = false

  if (response.code === 0) {
    initStatus.markInitialized()
    await router.push("/admin/login")
    return
  }

  if (response.code === 40901) {
    initStatus.markInitialized()
    await router.push("/admin/login")
    return
  }

  errorMessage.value = response.msg
}
</script>

<template>
  <AdminPageContainer>
    <AdminPageHeader title="初始化管理后台" description="系统首次部署后，请先创建首个超级管理员账号。" />

    <section class="card">
      <div class="grid">
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.displayName" placeholder="显示名" />
        <input v-model="form.password" type="password" placeholder="密码" />
        <input v-model="form.confirmPassword" type="password" placeholder="确认密码" />
      </div>
      <p class="hint">
        密码要求：至少 8 位，且包含大小写字母、数字与特殊字符。
      </p>
      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
      <button type="button" :disabled="pending" @click="handleSubmit">
        {{ pending ? "初始化中..." : "初始化管理后台" }}
      </button>
    </section>
  </AdminPageContainer>
</template>

<style scoped>
.card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  background: rgba(15, 23, 42, 0.48);
}

.grid {
  display: grid;
  gap: 12px;
}

input {
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}

.hint {
  color: #cbd5e1;
}

.error {
  color: #fca5a5;
}
</style>
