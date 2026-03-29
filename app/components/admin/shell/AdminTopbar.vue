<script setup lang="ts">
defineProps<{
  title: string
  description: string
  displayName: string
  username: string
}>()

defineEmits<{
  "toggle-menu": []
  logout: []
}>()
</script>

<template>
  <header class="admin-topbar">
    <div class="title-block">
      <button class="menu-button" type="button" aria-label="Open menu" @click="$emit('toggle-menu')">
        菜单
      </button>
      <div>
        <p class="eyebrow">Cookingo Admin</p>
        <h1>{{ title }}</h1>
        <p class="description">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="user-block">
      <div class="identity">
        <strong>{{ displayName }}</strong>
        <span>{{ username }}</span>
      </div>
      <button class="logout-button" type="button" @click="$emit('logout')">
        退出
      </button>
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
  padding: 24px 28px;
  border: 1px solid rgba(191, 219, 254, 0.16);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.52);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.28);
}

.title-block {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.menu-button {
  display: none;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.48);
  color: #f8fafc;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
}

h1 {
  margin: 0;
  font-size: clamp(1.55rem, 4vw, 2.4rem);
}

.description {
  margin: 12px 0 0;
  line-height: 1.7;
  color: #cbd5e1;
}

.user-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.identity {
  display: grid;
  gap: 4px;
  text-align: right;
}

.identity strong {
  font-size: 0.98rem;
}

.identity span {
  color: #cbd5e1;
}

.logout-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.48);
  color: #f8fafc;
}

@media (max-width: 920px) {
  .menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 760px) {
  .admin-topbar {
    flex-direction: column;
    padding: 20px 18px;
  }

  .user-block {
    width: 100%;
    justify-content: space-between;
  }

  .identity {
    text-align: left;
  }
}

@media (max-width: 520px) {
  .identity span {
    display: none;
  }
}
</style>
