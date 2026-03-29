<script setup lang="ts">
defineProps<{
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
    <div class="left-block">
      <button class="menu-button" type="button" aria-label="Open menu" @click="$emit('toggle-menu')">
        菜单
      </button>
      <NuxtLink class="brand" to="/admin">
        <div class="brand-mark">
          C
        </div>
        <span class="brand-name">Cookingo-Admin</span>
      </NuxtLink>
    </div>

    <div class="user-block">
      <div class="identity">
        <strong>{{ displayName }}</strong>
        <span>{{ username }}</span>
      </div>
      <AdminBaseAdminButton size="sm" variant="ghost" @click="$emit('logout')">
        退出
      </AdminBaseAdminButton>
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--admin-border-subtle, #f3f4f6);
  background: var(--admin-bg-surface, #fff);
}

.left-block {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--admin-text-primary, #111827);
  text-decoration: none;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box, var(--admin-accent-gradient, linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)) border-box;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1rem;
  color: var(--admin-accent, #9c27b0);
}

.brand-name {
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.1rem;
  font-weight: 600;
}

.menu-button {
  display: none;
  min-height: 2.25rem;
  padding: 0 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--admin-border-medium, #e5e7eb);
  background: transparent;
  color: var(--admin-text-primary, #111827);
}

.user-block {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.identity {
  display: grid;
  gap: 0.1rem;
  text-align: right;
}

.identity strong {
  font-size: 0.82rem;
  font-weight: 600;
}

.identity span {
  font-size: 0.72rem;
  color: var(--admin-text-tertiary, #9ca3af);
}

@media (max-width: 920px) {
  .menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .admin-topbar {
    padding: 0 1rem;
  }

  .identity span {
    display: none;
  }
}
</style>
