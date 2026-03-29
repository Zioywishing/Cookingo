import type {
  AdminAuthorization,
  AdminPageMeta,
  AdminPermissionCode,
  AdminSessionPayload,
  AdminSessionUser,
} from "#shared/types/admin"
import type { ApiResponse } from "#shared/types/api"
import {
  AdminPermissionRouteEntries,
  resolveAdminPageMeta,
} from "#shared/admin/domain"

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

function normalizeAdminSessionUser(payload: AdminSessionPayload["user"]): AdminSessionUser {
  return {
    id: payload.id,
    username: payload.username,
    displayName: payload.displayName,
    status: payload.status,
  }
}

function normalizeAdminAuthorization(payload: AdminSessionPayload["authorization"]): AdminAuthorization {
  return {
    roleCodes: payload.roleCodes,
    permissions: payload.permissions,
  }
}

export function useAdminSession() {
  const user = useState<AdminSessionUser | null>("admin-session-user", () => null)
  const roleCodes = useState<string[]>("admin-session-role-codes", () => [])
  const permissions = useState<AdminPermissionCode[]>("admin-session-permissions", () => [])
  const loaded = useState("admin-session-loaded", () => false)
  const pending = useState("admin-session-pending", () => false)

  function applySessionPayload(payload: AdminSessionPayload) {
    user.value = normalizeAdminSessionUser(payload.user)
    const authorization = normalizeAdminAuthorization(payload.authorization)
    roleCodes.value = authorization.roleCodes
    permissions.value = authorization.permissions
    loaded.value = true
  }

  function clear() {
    user.value = null
    roleCodes.value = []
    permissions.value = []
    loaded.value = false
  }

  async function ensureLoaded(force = false) {
    if (!force && loaded.value) {
      return user.value
    }

    if (pending.value) {
      return user.value
    }

    pending.value = true

    try {
      const response = await $fetch<ApiResponse<AdminSessionPayload>>(
        "/api/admin/get/currentUser",
        {
          headers: getAdminRequestHeaders(),
        },
      )

      if (response.code !== 0) {
        clear()
        loaded.value = true
        return null
      }

      applySessionPayload(response.data)
      return user.value
    }
    catch {
      clear()
      loaded.value = true
      return null
    }
    finally {
      pending.value = false
    }
  }

  async function login(username: string, password: string) {
    const response = await $fetch<ApiResponse<AdminSessionPayload>>(
      "/api/admin/post/login",
      {
        method: "POST",
        body: {
          username,
          password,
        },
        headers: getAdminRequestHeaders(),
      },
    )

    if (response.code === 0) {
      applySessionPayload(response.data)
    }

    return response
  }

  async function logout() {
    await $fetch<ApiResponse<boolean>>("/api/admin/post/logout", {
      method: "POST",
      headers: getAdminRequestHeaders(),
    })
    clear()
  }

  function hasPermission(code: AdminPermissionCode) {
    return permissions.value.includes(code)
  }

  function resolveHomePath() {
    return AdminPermissionRouteEntries.find((item) => hasPermission(item.code))?.path || "/admin/login"
  }

  function resolvePageMeta(path: string): AdminPageMeta {
    return resolveAdminPageMeta(path)
  }

  return {
    user,
    roleCodes,
    permissions,
    loaded,
    pending,
    ensureLoaded,
    login,
    logout,
    clear,
    hasPermission,
    resolveHomePath,
    resolvePageMeta,
  }
}
