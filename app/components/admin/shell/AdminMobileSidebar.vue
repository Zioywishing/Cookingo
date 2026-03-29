<script setup lang="ts">
interface AdminNavItemGroup {
  label: string
  items: {
    title: string
    to: string
  }[]
}

const props = defineProps<{
  groups: AdminNavItemGroup[]
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

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
    document.removeEventListener("keydown", handleKeydown)
    document.body.style.overflow = ""
  })

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown)
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mobile-sidebar-layer">
      <button class="mobile-sidebar-backdrop" type="button" aria-label="Close menu" @click="emit('close')" />
      <aside class="mobile-sidebar-panel">
        <div class="panel-head">
          <AdminBaseAdminButton size="sm" variant="ghost" @click="emit('close')">
            关闭
          </AdminBaseAdminButton>
        </div>

        <section v-for="group in groups" :key="group.label" class="nav-group">
          <p class="nav-label">
            {{ group.label }}
          </p>
          <AdminShellAdminSidebarNav :items="group.items" />
        </section>
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
  padding: 1.25rem 0;
  background: var(--admin-bg-surface, #fff);
  border-right: 1px solid var(--admin-border-subtle, #f3f4f6);
  box-shadow: 0 24px 80px rgba(17, 24, 39, 0.18);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0 0 0.15rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

h2 {
  margin: 0;
  font-family: var(--admin-font-serif, "Georgia", serif);
  font-size: 1.1rem;
  font-weight: 600;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box, var(--admin-accent-gradient, linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)) border-box;
  font-family: var(--admin-font-serif, "Georgia", serif);
  color: var(--admin-accent, #9c27b0);
}

.nav-group + .nav-group {
  margin-top: 0.9rem;
}

.nav-label {
  margin: 0 0 0.65rem;
  padding: 0 1rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-tertiary, #9ca3af);
}

@media (min-width: 921px) {
  .mobile-sidebar-layer {
    display: none;
  }
}
</style>
