import type { ApiPageData, ApiResponse } from "~~/shared/types/api"

import {
  ADMIN_SUCCESS_RESPONSE_CODE,
  ADMIN_SUCCESS_RESPONSE_MESSAGE,
} from "./admin/constants"

export function successResponse<T>(data: T, msg = ADMIN_SUCCESS_RESPONSE_MESSAGE): ApiResponse<T> {
  return {
    code: ADMIN_SUCCESS_RESPONSE_CODE,
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
  msg = ADMIN_SUCCESS_RESPONSE_MESSAGE,
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
