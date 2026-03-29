import type { AdminInitStatusData } from "#shared/types/admin"
import type { ApiResponse } from "#shared/types/api"

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

export function useAdminInitStatus() {
  const cookie = useCookie<boolean | null>("admin-init-ready", {
    default: () => null,
  })
  const initialized = useState<boolean | null>("admin-init-ready", () => cookie.value)
  const loaded = useState("admin-init-loaded", () => initialized.value === true)
  const pending = useState("admin-init-pending", () => false)

  async function ensureLoaded(force = false) {
    if (!force && initialized.value === true) {
      loaded.value = true
      return true
    }

    if (!force && loaded.value && initialized.value !== null) {
      return initialized.value
    }

    if (pending.value) {
      return initialized.value === true
    }

    pending.value = true

    try {
      const response = await $fetch<ApiResponse<AdminInitStatusData>>(
        "/api/admin/get/initStatus",
        {
          headers: getAdminRequestHeaders(),
        },
      )

      if (response.code === 0 && response.data.initialized) {
        cookie.value = true
        initialized.value = true
      }
      else {
        cookie.value = null
        initialized.value = false
      }

      loaded.value = true
      return initialized.value === true
    }
    catch {
      loaded.value = true
      initialized.value = false
      return false
    }
    finally {
      pending.value = false
    }
  }

  function markInitialized() {
    cookie.value = true
    initialized.value = true
    loaded.value = true
  }

  return {
    initialized,
    loaded,
    pending,
    ensureLoaded,
    markInitialized,
  }
}
