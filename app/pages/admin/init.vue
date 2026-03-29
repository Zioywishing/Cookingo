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
const feedback = useAdminRequestFeedback()
const form = reactive({
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
})
const pending = ref(false)

async function handleSubmit() {
  if (!form.password || form.password !== form.confirmPassword) {
    feedback.showError("两次输入的密码不一致")
    return
  }

  pending.value = true

  try {
    const response = await $fetch<ApiResponse<unknown>>("/api/admin/post/initAdmin", {
      method: "POST",
      body: {
        username: form.username,
        displayName: form.displayName,
        password: form.password,
      },
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    })

    if (response.code === 0) {
      initStatus.markInitialized()
      feedback.showSuccess("初始化成功，正在跳转登录页")
      await router.push("/admin/login")
      return
    }

    if (response.code === 40901) {
      initStatus.markInitialized()
      feedback.showSuccess("系统已初始化，正在跳转登录页")
      await router.push("/admin/login")
      return
    }

    feedback.handleResponse(response, {
      errorMessage: "初始化后台失败",
      silentSuccess: true,
    })
  }
  catch (error) {
    feedback.showCaughtError(error, "初始化后台失败")
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="初始化管理后台" description="系统首次部署后，请先创建首个超级管理员账号。" />

    <AdminBaseAdminCard title="Create Super Admin" description="完成初始化后，系统会跳转到登录页。" class="auth-card">
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
      <p class="hint">
        密码要求：至少 8 位，且包含大小写字母、数字与特殊字符。
      </p>
      <AdminBaseAdminButton type="button" variant="primary" block :loading="pending" @click="handleSubmit">
        初始化管理后台
      </AdminBaseAdminButton>
    </AdminBaseAdminCard>
  </AdminShellAdminPageContainer>
</template>

<style scoped>
.auth-card {
  max-width: 34rem;
}

.grid {
  display: grid;
  gap: 0.9rem;
}

.hint {
  color: var(--admin-text-secondary, #4b5563);
}
</style>
