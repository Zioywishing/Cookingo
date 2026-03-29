import type {
  AdminRoleListItem,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserStatus,
} from "#shared/types/admin"
import type { ApiPageData, ApiResponse } from "#shared/types/api"

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

function mapAdminRoleOption(row: AdminRoleListItem): AdminRoleListItem {
  return row
}

function unwrapAdminResponse<T>(response: ApiResponse<T>) {
  if (response.code !== 0) {
    throw new Error(response.msg || "请求失败，请稍后重试")
  }

  return response.data
}

export function useAdminUsers() {
  async function listUsers(page = 1, pageSize = 20) {
    const response = await $fetch<ApiResponse<ApiPageData<AdminUserListItem>>>(
      "/api/admin/get/users",
      {
        query: {
          page,
          pageSize,
        },
        headers: getAdminRequestHeaders(),
      },
    )

    return unwrapAdminResponse(response)
  }

  async function getUserDetail(id: string) {
    const response = await $fetch<ApiResponse<AdminUserDetail>>(
      "/api/admin/get/userDetail",
      {
        query: { id },
        headers: getAdminRequestHeaders(),
      },
    )

    return unwrapAdminResponse(response)
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

    return unwrapAdminResponse(response).items.map(mapAdminRoleOption)
  }

  async function createUser(payload: {
    username: string
    displayName: string
    password: string
  }) {
    return await $fetch<ApiResponse<AdminUserDetail>>("/api/admin/post/users", {
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
