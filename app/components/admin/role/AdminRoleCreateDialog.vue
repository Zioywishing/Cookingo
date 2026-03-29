<script setup lang="ts">
import type { AdminPermissionItem } from "#shared/types/admin"

const props = defineProps<{
  open: boolean
  permissions: AdminPermissionItem[]
  pending?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: {
    name: string
    code: string
    description: string
    permissionCodes: string[]
  }]
}>()

const form = reactive({
  name: "",
  code: "",
  description: "",
  permissionCodes: [] as string[],
})

function togglePermission(code: string) {
  form.permissionCodes = form.permissionCodes.includes(code)
    ? form.permissionCodes.filter((item) => item !== code)
    : [...form.permissionCodes, code]
}

watch(
  () => props.open,
  (value) => {
    if (!value) {
      form.name = ""
      form.code = ""
      form.description = ""
      form.permissionCodes = []
    }
  },
)
</script>

<template>
  <div v-if="open" class="dialog-layer">
    <button class="dialog-backdrop" type="button" aria-label="Close dialog" @click="emit('close')" />
    <div class="dialog-panel">
      <h3>新建角色</h3>
      <div class="grid">
        <input v-model="form.name" placeholder="角色名" />
        <input v-model="form.code" placeholder="角色编码" />
        <input v-model="form.description" placeholder="描述" />
      </div>
      <div class="permissions">
        <label v-for="permission in permissions" :key="permission.code" class="permission">
          <input
            :checked="form.permissionCodes.includes(permission.code)"
            type="checkbox"
            @change="togglePermission(permission.code)"
          />
          <span>{{ permission.name }}</span>
        </label>
      </div>
      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
      <div class="actions">
        <button type="button" @click="emit('close')">
          取消
        </button>
        <button
          type="button"
          :disabled="pending"
          @click="emit('submit', { ...form })"
        >
          {{ pending ? "提交中..." : "创建角色" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-layer,
.dialog-backdrop {
  position: fixed;
  inset: 0;
}

.dialog-layer {
  z-index: 45;
}

.dialog-backdrop {
  border: 0;
  background: rgba(2, 6, 23, 0.6);
}

.dialog-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(92vw, 560px);
  max-height: 84vh;
  overflow-y: auto;
  padding: 24px;
  border-radius: 24px;
  background: #0f172a;
  transform: translate(-50%, -50%);
}

.grid,
.permissions {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.permission {
  display: flex;
  align-items: center;
  gap: 10px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.error {
  color: #fca5a5;
}
</style>
