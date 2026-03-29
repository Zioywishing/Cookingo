<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  hint?: string
  error?: string
}>(), {
  label: "",
  hint: "",
  error: "",
})
</script>

<template>
  <label class="admin-field">
    <span v-if="label" class="field-label">{{ label }}</span>
    <slot />
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.admin-field {
  display: grid;
  gap: 0.55rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--admin-text-secondary, #4b5563);
}

.field-hint,
.field-error {
  font-size: 0.78rem;
  line-height: 1.5;
}

.field-hint {
  color: var(--admin-text-tertiary, #9ca3af);
}

.field-error {
  color: #be185d;
}
</style>
