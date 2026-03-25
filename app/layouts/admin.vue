<template>
  <div class="admin-layout">
    <div class="shell">
      <header class="topbar">
        <div>
          <p class="label">Cookingo Admin</p>
          <h1>管理后台</h1>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  padding: 40px 20px;
  background:
    linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(29, 78, 216, 0.9)),
    #0f172a;
  color: #e5eefb;
}

.shell {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.topbar {
  margin-bottom: 18px;
  padding: 24px 28px;
  border: 1px solid rgba(191, 219, 254, 0.16);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.46);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.28);
}

.label {
  margin: 0 0 10px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 2.6rem);
}

.content {
  display: block;
}

@media (max-width: 640px) {
  .admin-layout {
    padding: 18px 14px;
  }

  .topbar {
    padding: 18px 16px;
    border-radius: 20px;
  }
}
</style>
