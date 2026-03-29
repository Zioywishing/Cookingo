<script setup lang="ts">
interface AdminNavItem {
  title: string
  to: string
}

const props = defineProps<{
  items: AdminNavItem[]
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    if (props.open) {
      emit("close")
    }
  },
)

if (import.meta.client) {
  watch(
    () => props.open,
    (value) => {
      document.body.style.overflow = value ? "hidden" : ""
    },
  )

  onBeforeUnmount(() => {
    document.body.style.overflow = ""
  })
}

onKeyStroke("Escape", () => {
  if (props.open) {
    emit("close")
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mobile-sidebar-layer">
      <button class="mobile-sidebar-backdrop" type="button" aria-label="Close menu" @click="emit('close')" />
      <aside class="mobile-sidebar-panel">
        <div class="panel-head">
          <p class="eyebrow">Cookingo Admin</p>
          <button class="close-button" type="button" @click="emit('close')">
            关闭
          </button>
        </div>

        <AdminSidebarNav :items="items" />
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.mobile-sidebar-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.mobile-sidebar-backdrop {
  position: fixed;
  inset: 0;
  border: 0;
  background: rgba(2, 6, 23, 0.58);
}

.mobile-sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(82vw, 320px);
  padding: 26px 18px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.92));
  border-right: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 24px 80px rgba(2, 6, 23, 0.42);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7dd3fc;
}

.close-button {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.48);
  color: #f8fafc;
}

@media (min-width: 921px) {
  .mobile-sidebar-layer {
    display: none;
  }
}
</style>
