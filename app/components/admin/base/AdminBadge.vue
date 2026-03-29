<script setup lang="ts">
withDefaults(defineProps<{
  tone?: "neutral" | "success" | "warning" | "danger"
}>(), {
  tone: "neutral",
})
</script>

<template>
  <span class="admin-badge" :class="`is-${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 1.75rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-badge.is-neutral {
  background: rgba(75, 85, 99, 0.08);
  color: var(--admin-text-secondary, #4b5563);
}

.admin-badge.is-success {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.admin-badge.is-warning {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.admin-badge.is-danger {
  background: rgba(233, 30, 99, 0.12);
  color: #be185d;
}
</style>
