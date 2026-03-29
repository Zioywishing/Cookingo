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
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 16px;
  color: rgba(226, 232, 240, 0.8);
  text-decoration: none;
  background: rgba(15, 23, 42, 0.24);
  border: 1px solid transparent;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.24);
  transform: translateX(2px);
}

.nav-link.is-active {
  color: #f8fafc;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.24), rgba(59, 130, 246, 0.22));
  border-color: rgba(125, 211, 252, 0.3);
}
</style>
