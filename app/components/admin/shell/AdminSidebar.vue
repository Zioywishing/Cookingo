<script setup lang="ts">
interface AdminNavItem {
  title: string
  to: string
}

defineProps<{
  items: AdminNavItem[]
}>()
</script>

<template>
  <aside class="admin-sidebar">
    <div class="brand">
      <p class="eyebrow">Cookingo Admin</p>
      <h2>IAM 一期</h2>
    </div>

    <AdminShellAdminSidebarNav :items="items" />
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 252px;
  padding: 28px 20px;
  border-radius: 30px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.72));
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.32);
}

.brand {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7dd3fc;
}

h2 {
  margin: 0;
  font-size: 1.45rem;
}

@media (max-width: 920px) {
  .admin-sidebar {
    display: none;
  }
}
</style>
