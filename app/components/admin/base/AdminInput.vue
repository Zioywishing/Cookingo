<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  modelValue?: string
  invalid?: boolean
  disabled?: boolean
  type?: string
}>(), {
  modelValue: "",
  invalid: false,
  disabled: false,
  type: "text",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
})
</script>

<template>
  <input
    v-bind="$attrs"
    v-model="model"
    class="admin-input"
    :class="{ 'is-invalid': invalid }"
    :disabled="disabled"
    :type="type"
  >
</template>

<style scoped>
.admin-input {
  min-height: 2.9rem;
  padding: 0 0.9rem;
  border: 1px solid var(--admin-border-medium, #e5e7eb);
  border-radius: 0.5rem;
  background: var(--admin-bg-surface, #fff);
  color: var(--admin-text-primary, #111827);
  font-size: 0.92rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.admin-input::placeholder {
  color: var(--admin-text-tertiary, #9ca3af);
}

.admin-input:hover:not(:disabled) {
  border-color: rgba(156, 39, 176, 0.18);
}

.admin-input:focus-visible {
  outline: none;
  border-color: rgba(156, 39, 176, 0.42);
  box-shadow: 0 0 0 4px rgba(156, 39, 176, 0.08);
}

.admin-input:disabled {
  background: var(--admin-bg-muted, #f9fafb);
  color: var(--admin-text-tertiary, #9ca3af);
}

.admin-input.is-invalid {
  border-color: rgba(233, 30, 99, 0.38);
  box-shadow: 0 0 0 4px rgba(233, 30, 99, 0.06);
}
</style>
