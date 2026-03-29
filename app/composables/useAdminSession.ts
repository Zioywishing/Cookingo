import type {
  AdminPageMeta,
  AdminPermissionCode,
  AdminSessionUser,
} from "#shared/types/admin"
import type { ApiResponse } from "#shared/types/api"
import { AdminPageMetaByPath, AdminPermissionCode as AdminPermissionCodeMap } from "#shared/types/admin"

type AdminSessionApiPayload = {
  user: {
    id: string
    username: string
    displayName: string
    status: AdminSessionUser["status"]
  }
  authorization: {
    roleCodes: string[]
    permissions: AdminPermissionCode[]
  }
}

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

function normalizeAdminSessionUser(payload: AdminSessionApiPayload["user"]): AdminSessionUser {
  return {
    id: payload.id,
    username: payload.username,
    displayName: payload.displayName,
    status: payload.status,
  }
}

export function useAdminSession() {
  const user = useState<AdminSessionUser | null>("admin-session-user", () => null)
  const roleCodes = useState<string[]>("admin-session-role-codes", () => [])
  const permissions = useState<AdminPermissionCode[]>("admin-session-permissions", () => [])
  const loaded = useState("admin-session-loaded", () => false)
  const pending = useState("admin-session-pending", () => false)

  function applySessionPayload(payload: AdminSessionApiPayload) {
    user.value = normalizeAdminSessionUser(payload.user)
    roleCodes.value = payload.authorization.roleCodes
    permissions.value = payload.authorization.permissions
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
      const response = await $fetch<ApiResponse<AdminSessionApiPayload>>(
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
    const response = await $fetch<ApiResponse<AdminSessionApiPayload>>(
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
    const routeOrder = [
      { code: AdminPermissionCodeMap.Dashboard, path: "/admin" },
      { code: AdminPermissionCodeMap.Users, path: "/admin/users" },
      { code: AdminPermissionCodeMap.Roles, path: "/admin/roles" },
      { code: AdminPermissionCodeMap.LoginLogs, path: "/admin/login-logs" },
      { code: AdminPermissionCodeMap.AuditLogs, path: "/admin/audit-logs" },
    ]

    return routeOrder.find((item) => hasPermission(item.code))?.path || "/admin/login"
  }

  function resolvePageMeta(path: string): AdminPageMeta {
    if (path.startsWith("/admin/users/")) {
      return {
        title: "用户详情",
        description: "查看并维护后台用户信息、角色和安全设置。",
      }
    }

    if (path.startsWith("/admin/roles/")) {
      return {
        title: "角色详情",
        description: "编辑角色信息并配置后台页面权限。",
      }
    }

    return AdminPageMetaByPath[path] || AdminPageMetaByPath["/admin"]
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
