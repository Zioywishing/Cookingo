<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <header class="admin-page-header">
    <p class="eyebrow">Admin Workspace</p>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </header>
</template>

<style scoped>
.admin-page-header {
  display: grid;
  gap: 0.35rem;
}

h2 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: clamp(1.8rem, 4vw, 2.25rem);
  font-weight: 600;
}

p {
  margin: 0;
  max-width: 42rem;
  line-height: 1.6;
  color: var(--admin-text-secondary, #4b5563);
}

.eyebrow {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}
</style>
