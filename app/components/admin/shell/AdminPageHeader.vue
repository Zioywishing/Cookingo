<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <header class="admin-page-header">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </header>
</template>

<style scoped>
.admin-page-header {
  padding: 24px 26px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.44);
}

h2 {
  margin: 0;
  font-size: 1.45rem;
}

p {
  margin: 10px 0 0;
  line-height: 1.7;
  color: #cbd5e1;
}
</style>
