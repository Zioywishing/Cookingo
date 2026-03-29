import type {
  AdminRoleListItem,
  AdminRoleSummary,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserStatus,
} from "#shared/types/admin"
import type { ApiPageData, ApiResponse } from "#shared/types/api"

type AdminUserRow = {
  id: string
  username: string
  displayName: string
  status: AdminUserStatus
  roles: AdminRoleSummary[]
  lastLoginAt: string | null
  passwordChangedAt: string | null
  createdAt: string
  updatedAt: string
}

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

function mapAdminUserListItem(row: AdminUserRow): AdminUserListItem {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    status: row.status,
    roles: row.roles,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapAdminUserDetail(row: AdminUserRow): AdminUserDetail {
  return {
    ...mapAdminUserListItem(row),
    passwordChangedAt: row.passwordChangedAt,
  }
}

function mapAdminRoleOption(row: AdminRoleListItem): AdminRoleListItem {
  return row
}

export function useAdminUsers() {
  async function listUsers(page = 1, pageSize = 20) {
    const response = await $fetch<ApiResponse<ApiPageData<AdminUserRow>>>(
      "/api/admin/get/users",
      {
        query: {
          page,
          pageSize,
        },
        headers: getAdminRequestHeaders(),
      },
    )

    return {
      ...response.data,
      items: response.data.items.map(mapAdminUserListItem),
    }
  }

  async function getUserDetail(id: string) {
    const response = await $fetch<ApiResponse<AdminUserRow>>(
      "/api/admin/get/userDetail",
      {
        query: { id },
        headers: getAdminRequestHeaders(),
      },
    )

    return mapAdminUserDetail(response.data)
  }

  async function listRoleOptions() {
    const response = await $fetch<ApiResponse<ApiPageData<AdminRoleListItem>>>(
      "/api/admin/get/roles",
      {
        query: {
          page: 1,
          pageSize: 100,
        },
        headers: getAdminRequestHeaders(),
      },
    )

    return response.data.items.map(mapAdminRoleOption)
  }

  async function createUser(payload: {
    username: string
    displayName: string
    password: string
  }) {
    return await $fetch<ApiResponse<AdminUserRow>>("/api/admin/post/users", {
      method: "POST",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function updateProfile(payload: {
    id: string
    displayName: string
  }) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/put/user", {
      method: "PUT",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function updateRoles(payload: {
    id: string
    roleIds: string[]
  }) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/put/userRoles", {
      method: "PUT",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function updateStatus(payload: {
    id: string
    status: AdminUserStatus
  }) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/put/userStatus", {
      method: "PUT",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function resetPassword(payload: {
    id: string
    newPassword: string
  }) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/put/userPassword", {
      method: "PUT",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  return {
    listUsers,
    getUserDetail,
    listRoleOptions,
    createUser,
    updateProfile,
    updateRoles,
    updateStatus,
    resetPassword,
  }
}
