<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
  loading?: boolean
  block?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}>(), {
  variant: "secondary",
  size: "md",
  loading: false,
  block: false,
  disabled: false,
  type: "button",
})
</script>

<template>
  <button
    class="admin-button"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
    :disabled="disabled || loading"
    :type="type"
  >
    <span v-if="loading" class="loading-dot" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.admin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.admin-button:hover:not(:disabled),
.admin-button:focus-visible:not(:disabled) {
  transform: translateY(-1px);
}

.admin-button:focus-visible {
  outline: 2px solid rgba(156, 39, 176, 0.2);
  outline-offset: 2px;
}

.admin-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.admin-button.is-block {
  width: 100%;
}

.admin-button.is-sm {
  min-height: 2.25rem;
  padding: 0 0.9rem;
}

.admin-button.is-md {
  min-height: 2.75rem;
  padding: 0 1.2rem;
}

.admin-button.is-primary {
  background: var(--admin-accent-gradient, linear-gradient(135deg, #e91e63 0%, #9c27b0 100%));
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.18);
  color: #fff;
}

.admin-button.is-primary:hover:not(:disabled),
.admin-button.is-primary:focus-visible:not(:disabled) {
  box-shadow: 0 14px 28px rgba(233, 30, 99, 0.24);
}

.admin-button.is-secondary {
  border-color: var(--admin-border-medium, #e5e7eb);
  background: var(--admin-bg-surface, #fff);
  color: var(--admin-text-primary, #111827);
}

.admin-button.is-secondary:hover:not(:disabled),
.admin-button.is-secondary:focus-visible:not(:disabled) {
  border-color: rgba(156, 39, 176, 0.28);
  color: var(--admin-accent, #9c27b0);
}

.admin-button.is-ghost {
  background: transparent;
  color: var(--admin-text-secondary, #4b5563);
}

.admin-button.is-ghost:hover:not(:disabled),
.admin-button.is-ghost:focus-visible:not(:disabled) {
  background: rgba(156, 39, 176, 0.05);
  color: var(--admin-accent, #9c27b0);
}

.admin-button.is-danger {
  border-color: rgba(233, 30, 99, 0.18);
  background: rgba(233, 30, 99, 0.06);
  color: #be185d;
}

.admin-button.is-danger:hover:not(:disabled),
.admin-button.is-danger:focus-visible:not(:disabled) {
  background: rgba(233, 30, 99, 0.1);
}

.loading-dot {
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
