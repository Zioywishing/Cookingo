<script setup lang="ts">
interface AdminNavItem {
  title: string
  to: string
}

defineProps<{
  items: AdminNavItem[]
}>()

const route = useRoute()
</script>

<template>
  <nav class="admin-sidebar-nav" aria-label="Admin Navigation">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-link"
      :class="{ 'is-active': route.path === item.to }"
    >
      <span>{{ item.title }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.admin-sidebar-nav {
  display: grid;
  gap: 0.2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 1.5rem;
  color: var(--admin-text-secondary, #4b5563);
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
  position: relative;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: var(--admin-accent, #9c27b0);
  background: rgba(156, 39, 176, 0.03);
  transform: translateX(2px);
  outline: none;
}

.nav-link.is-active {
  color: var(--admin-accent, #9c27b0);
  background: rgba(156, 39, 176, 0.05);
}

.nav-link.is-active::before {
  content: "";
  position: absolute;
  inset: 20% auto 20% 0;
  width: 3px;
  border-radius: 0 999px 999px 0;
  background: var(--admin-accent-gradient, linear-gradient(135deg, #e91e63 0%, #9c27b0 100%));
}
</style>
