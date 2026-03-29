<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: "",
  description: "",
})
</script>

<template>
  <div class="admin-toolbar">
    <div v-if="title || description" class="toolbar-meta">
      <h3 v-if="title">
        {{ title }}
      </h3>
      <p v-if="description">
        {{ description }}
      </p>
    </div>

    <div class="toolbar-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.toolbar-meta {
  display: grid;
  gap: 0.35rem;
}

h3 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.05rem;
}

p {
  margin: 0;
  color: var(--admin-text-secondary, #4b5563);
  line-height: 1.5;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

@media (max-width: 640px) {
  .admin-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    margin-left: 0;
    justify-content: flex-start;
  }
}
</style>
