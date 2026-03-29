<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  tone?: "default" | "danger"
}>(), {
  description: "",
  tone: "default",
})
</script>

<template>
  <AdminBaseAdminCard :title="title" :description="description" :tone="tone">
    <template #header>
      <div class="section-header">
        <div>
          <h3>{{ title }}</h3>
          <p v-if="description">
            {{ description }}
          </p>
        </div>
        <slot name="actions" />
      </div>
    </template>

    <slot />
  </AdminBaseAdminCard>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

h3 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.2rem;
  font-weight: 600;
}

p {
  margin: 0.4rem 0 0;
  color: var(--admin-text-secondary, #4b5563);
  line-height: 1.6;
}
</style>
