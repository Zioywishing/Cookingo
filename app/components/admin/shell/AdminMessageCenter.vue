<script setup lang="ts">
const { messages, remove } = useAdminMessageCenter()

const toneLabelMap = {
  success: "Success",
  error: "Error",
  info: "Info",
} as const
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="admin-message" tag="div" class="admin-message-center">
      <article
        v-for="item in messages"
        :key="item.id"
        class="admin-message-card"
        :class="`is-${item.type}`"
        role="status"
        aria-live="polite"
      >
        <span class="message-badge">
          {{ toneLabelMap[item.type] }}
        </span>
        <p>{{ item.message }}</p>
        <button type="button" class="close-button" aria-label="关闭消息" @click="remove(item.id)">
          关闭
        </button>
      </article>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.admin-message-center {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  z-index: 80;
  display: grid;
  gap: 0.75rem;
  width: min(calc(100vw - 2rem), 28rem);
  transform: translateX(-50%);
  pointer-events: none;
}

.admin-message-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--admin-border-medium, #e5e7eb);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 44px rgba(17, 24, 39, 0.16);
  backdrop-filter: blur(14px);
  pointer-events: auto;
}

.message-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.8rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

p {
  margin: 0;
  line-height: 1.55;
  color: var(--admin-text-primary, #111827);
}

.close-button {
  min-height: 2rem;
  padding: 0 0.7rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--admin-text-secondary, #4b5563);
  cursor: pointer;
}

.is-success {
  border-color: rgba(22, 163, 74, 0.16);
}

.is-success .message-badge {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.is-error {
  border-color: rgba(225, 29, 72, 0.16);
}

.is-error .message-badge {
  background: rgba(225, 29, 72, 0.1);
  color: #be123c;
}

.is-info {
  border-color: rgba(156, 39, 176, 0.16);
}

.is-info .message-badge {
  background: rgba(156, 39, 176, 0.1);
  color: var(--admin-accent, #9c27b0);
}

.admin-message-enter-active,
.admin-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.admin-message-enter-from,
.admin-message-leave-to {
  opacity: 0;
  transform: translateY(-0.45rem);
}

@media (max-width: 640px) {
  .admin-message-center {
    top: 1rem;
    width: min(calc(100vw - 1rem), 28rem);
  }

  .admin-message-card {
    grid-template-columns: 1fr auto;
  }

  .message-badge {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
