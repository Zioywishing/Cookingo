<script setup lang="ts">
interface AdminNavItemGroup {
  label: string
  items: {
    title: string
    to: string
  }[]
}

defineProps<{
  groups: AdminNavItemGroup[]
}>()
</script>

<template>
  <aside class="admin-sidebar">
    <section v-for="group in groups" :key="group.label" class="nav-group">
      <p class="nav-label">
        {{ group.label }}
      </p>
      <AdminShellAdminSidebarNav :items="group.items" />
    </section>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 1.5rem 0;
  border-right: 1px solid var(--admin-border-subtle, #f3f4f6);
  background: var(--admin-bg-surface, #fff);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0 1.5rem 1.5rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

h2 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.25rem;
  font-weight: 600;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box, var(--admin-accent-gradient, linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)) border-box;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1rem;
  color: var(--admin-accent, #9c27b0);
}

.nav-group + .nav-group {
  margin-top: 1rem;
}

.nav-label {
  margin: 0 0 0.7rem;
  padding: 0 1.5rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

@media (max-width: 920px) {
  .admin-sidebar {
    display: none;
  }
}
</style>
