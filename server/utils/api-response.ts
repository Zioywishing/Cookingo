import type { ApiPageData, ApiResponse } from "~~/shared/types/api"

export function successResponse<T>(data: T, msg = "success"): ApiResponse<T> {
  return {
    code: 0,
    data,
    msg,
  }
}

export function failureResponse(code: number, msg: string): ApiResponse<null> {
  return {
    code,
    data: null,
    msg,
  }
}

export function pageResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  msg = "success",
): ApiResponse<ApiPageData<T>> {
  return successResponse(
    {
      items,
      total,
      page,
      pageSize,
    },
    msg,
  )
}
