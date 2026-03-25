import type { ApiResponse } from "~~/shared/types/api"

export function successResponse<T>(data: T, msg = "success"): ApiResponse<T> {
  return {
    code: 0,
    data,
    msg,
  }
}
