<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-init"],
  adminPageTitle: "登录后台",
  adminPageDescription: "使用管理员账号进入后台。",
})

const route = useRoute()
const router = useRouter()
const session = useAdminSession()
const feedback = useAdminRequestFeedback()
const form = reactive({
  username: "",
  password: "",
})
const pending = ref(false)

await session.ensureLoaded()

if (session.user.value) {
  await navigateTo(session.resolveHomePath())
}

async function handleSubmit() {
  pending.value = true

  const response = await feedback.run(
    () => session.login(form.username, form.password),
    {
      errorMessage: "登录失败",
      silentSuccess: true,
    },
  )

  pending.value = false

  if (!response) {
    return
  }

  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : session.resolveHomePath()
  await router.push(redirect)
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="登录后台" description="系统已完成初始化，请使用管理员账号登录。" />

    <AdminBaseAdminCard title="Welcome Back" description="使用管理员账号进入 Cookingo 后台。" class="auth-card">
      <div class="grid">
        <AdminBaseAdminField label="用户名">
          <AdminBaseAdminInput v-model="form.username" placeholder="请输入用户名" />
        </AdminBaseAdminField>
        <AdminBaseAdminField label="密码">
          <AdminBaseAdminInput v-model="form.password" type="password" placeholder="请输入密码" />
        </AdminBaseAdminField>
      </div>
      <AdminBaseAdminButton type="button" variant="primary" block :loading="pending" @click="handleSubmit">
        登录后台
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
</style>
