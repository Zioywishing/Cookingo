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
const form = reactive({
  username: "",
  password: "",
})
const pending = ref(false)
const errorMessage = ref("")

await session.ensureLoaded()

if (session.user.value) {
  await navigateTo(session.resolveHomePath())
}

async function handleSubmit() {
  pending.value = true
  errorMessage.value = ""

  const response = await session.login(form.username, form.password)

  pending.value = false

  if (response.code === 0) {
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : session.resolveHomePath()
    await router.push(redirect)
    return
  }

  errorMessage.value = response.msg
}
</script>

<template>
  <AdminShellAdminPageContainer>
    <AdminShellAdminPageHeader title="登录后台" description="系统已完成初始化，请使用管理员账号登录。" />

    <section class="card">
      <div class="grid">
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.password" type="password" placeholder="密码" />
      </div>
      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
      <button type="button" :disabled="pending" @click="handleSubmit">
        {{ pending ? "登录中..." : "登录后台" }}
      </button>
    </section>
  </AdminShellAdminPageContainer>
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

.error {
  color: #fca5a5;
}
</style>
