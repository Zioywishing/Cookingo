import type {
  AdminAuditLogItem,
  AdminLoginLogItem,
} from "#shared/types/admin"
import type { ApiPageData, ApiResponse } from "#shared/types/api"

function getAdminRequestHeaders() {
  return import.meta.server ? useRequestHeaders(["cookie"]) : undefined
}

function unwrapAdminResponse<T>(response: ApiResponse<T>) {
  if (response.code !== 0) {
    throw new Error(response.msg || "请求失败，请稍后重试")
  }

  return response.data
}

export function useAdminLogs() {
  async function listLoginLogs(page = 1, pageSize = 20) {
    const response = await $fetch<ApiResponse<ApiPageData<AdminLoginLogItem>>>(
      "/api/admin/get/loginLogs",
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

  async function listAuditLogs(page = 1, pageSize = 20) {
    const response = await $fetch<ApiResponse<ApiPageData<AdminAuditLogItem>>>(
      "/api/admin/get/auditLogs",
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

  return {
    listLoginLogs,
    listAuditLogs,
  }
}
