<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="admin-empty-state">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.admin-empty-state {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  padding: 1.75rem 1rem;
}

h3 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.15rem;
}

p {
  margin: 0;
  color: var(--admin-text-secondary, #4b5563);
  line-height: 1.6;
}
</style>
