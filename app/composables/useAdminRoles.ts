import type {
  AdminPermissionItem,
  AdminRoleDetail,
  AdminRoleListItem,
} from "#shared/types/admin"
import type { ApiPageData, ApiResponse } from "#shared/types/api"

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

export function useAdminRoles() {
  async function listRoles(page = 1, pageSize = 20) {
    const response = await $fetch<ApiResponse<ApiPageData<AdminRoleListItem>>>(
      "/api/admin/get/roles",
      {
        query: {
          page,
          pageSize,
        },
        headers: getAdminRequestHeaders(),
      },
    )

    return response.data
  }

  async function getRoleDetail(id: string) {
    const response = await $fetch<ApiResponse<AdminRoleDetail>>(
      "/api/admin/get/roleDetail",
      {
        query: { id },
        headers: getAdminRequestHeaders(),
      },
    )

    return response.data
  }

  async function listPermissions() {
    const response = await $fetch<ApiResponse<AdminPermissionItem[]>>(
      "/api/admin/get/permissions",
      {
        headers: getAdminRequestHeaders(),
      },
    )

    return response.data
  }

  async function createRole(payload: {
    name: string
    code: string
    description: string
    permissionCodes: string[]
  }) {
    return await $fetch<ApiResponse<AdminRoleListItem>>("/api/admin/post/roles", {
      method: "POST",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function updateRole(payload: {
    id: string
    name: string
    description: string
    permissionCodes: string[]
  }) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/put/role", {
      method: "PUT",
      body: payload,
      headers: getAdminRequestHeaders(),
    })
  }

  async function deleteRole(id: string) {
    return await $fetch<ApiResponse<boolean>>("/api/admin/delete/role", {
      method: "DELETE",
      body: { id },
      headers: getAdminRequestHeaders(),
    })
  }

  return {
    listRoles,
    getRoleDetail,
    listPermissions,
    createRole,
    updateRole,
    deleteRole,
  }
}
