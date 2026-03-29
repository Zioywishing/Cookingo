<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  padding?: "md" | "lg"
  muted?: boolean
  tone?: "default" | "danger"
  tag?: string
}>(), {
  title: "",
  description: "",
  padding: "lg",
  muted: false,
  tone: "default",
  tag: "section",
})
</script>

<template>
  <component :is="tag" class="admin-card" :class="[`is-${padding}`, `is-${tone}`, { 'is-muted': muted }]">
    <header v-if="title || description || $slots.header" class="admin-card-header">
      <slot name="header">
        <div>
          <h3 v-if="title">
            {{ title }}
          </h3>
          <p v-if="description">
            {{ description }}
          </p>
        </div>
      </slot>
    </header>

    <div class="admin-card-body">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.admin-card {
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  border-radius: 0.75rem;
  background: var(--admin-bg-surface, #fff);
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.04);
}

.admin-card.is-md {
  padding: 1.25rem;
}

.admin-card.is-lg {
  padding: 1.5rem;
}

.admin-card.is-muted {
  background: var(--admin-bg-muted, #f9fafb);
}

.admin-card.is-danger {
  border-color: rgba(233, 30, 99, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(253, 242, 248, 0.72));
}

.admin-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

h3 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.18rem;
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}

p {
  margin: 0.4rem 0 0;
  color: var(--admin-text-secondary, #4b5563);
  line-height: 1.6;
}

.admin-card-body {
  min-width: 0;
}
</style>
