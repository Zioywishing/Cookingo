<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  maxWidth?: string
}>(), {
  description: "",
  maxWidth: "34rem",
})

const emit = defineEmits<{
  close: []
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

if (import.meta.client) {
  watch(
    () => props.open,
    (value) => {
      document.body.style.overflow = value ? "hidden" : ""
    },
    { immediate: true },
  )

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown)
    document.body.style.overflow = ""
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="admin-dialog-layer">
      <button class="admin-dialog-backdrop" type="button" aria-label="Close dialog" @click="emit('close')" />
      <div class="admin-dialog-panel" :style="{ maxWidth }">
        <header class="admin-dialog-header">
          <div>
            <h3>{{ title }}</h3>
            <p v-if="description">
              {{ description }}
            </p>
          </div>
          <button class="close-button" type="button" aria-label="Close dialog" @click="emit('close')">
            关闭
          </button>
        </header>

        <div class="admin-dialog-body">
          <slot />
        </div>

        <footer v-if="$slots.actions" class="admin-dialog-actions">
          <slot name="actions" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.admin-dialog-layer,
.admin-dialog-backdrop {
  position: fixed;
  inset: 0;
}

.admin-dialog-layer {
  z-index: 60;
}

.admin-dialog-backdrop {
  border: 0;
  background: rgba(17, 24, 39, 0.28);
  backdrop-filter: blur(4px);
}

.admin-dialog-panel {
  position: fixed;
  inset: 50% auto auto 50%;
  width: min(calc(100vw - 2rem), 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.5rem;
  border: 1px solid var(--admin-border-subtle, #f3f4f6);
  border-radius: 0.9rem;
  background: var(--admin-bg-surface, #fff);
  box-shadow: 0 24px 80px rgba(17, 24, 39, 0.16);
  transform: translate(-50%, -50%);
}

.admin-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

h3 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.3rem;
  font-weight: 600;
}

p {
  margin: 0.45rem 0 0;
  color: var(--admin-text-secondary, #4b5563);
  line-height: 1.6;
}

.close-button {
  min-height: 2.25rem;
  padding: 0 0.85rem;
  border: 1px solid var(--admin-border-medium, #e5e7eb);
  border-radius: 999px;
  background: transparent;
  color: var(--admin-text-secondary, #4b5563);
  cursor: pointer;
}

.admin-dialog-body {
  display: grid;
  gap: 1rem;
}

.admin-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
