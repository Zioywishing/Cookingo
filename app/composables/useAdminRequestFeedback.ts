import type { ApiResponse } from "#shared/types/api"

interface AdminRequestFeedbackOptions {
  successMessage?: string
  errorMessage?: string
  silentSuccess?: boolean
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return typeof value === "object"
    && value !== null
    && "code" in value
    && typeof value.code === "number"
    && "msg" in value
}

function extractAdminErrorMessage(error: unknown, fallback = "请求失败，请稍后重试") {
  if (typeof error === "object" && error !== null) {
    if ("data" in error && typeof error.data === "object" && error.data !== null && "msg" in error.data && typeof error.data.msg === "string" && error.data.msg) {
      return error.data.msg
    }

    if ("statusMessage" in error && typeof error.statusMessage === "string" && error.statusMessage) {
      return error.statusMessage
    }

    if ("message" in error && typeof error.message === "string" && error.message) {
      return error.message
    }
  }

  return fallback
}

export function useAdminRequestFeedback() {
  const messageCenter = useAdminMessageCenter()

  function showSuccess(message: string) {
    messageCenter.success(message)
  }

  function showError(message: string) {
    messageCenter.error(message)
  }

  function showCaughtError(error: unknown, fallback = "请求失败，请稍后重试") {
    showError(extractAdminErrorMessage(error, fallback))
  }

  function handleResponse<T>(response: ApiResponse<T>, options?: AdminRequestFeedbackOptions) {
    if (response.code !== 0) {
      showError(response.msg || options?.errorMessage || "请求失败，请稍后重试")
      return false
    }

    if (!options?.silentSuccess && options?.successMessage) {
      showSuccess(options.successMessage)
    }

    return true
  }

  async function run<T>(task: () => Promise<T>, options?: AdminRequestFeedbackOptions) {
    try {
      const result = await task()

      if (isApiResponse(result)) {
        if (!handleResponse(result, options)) {
          return null
        }

        return result
      }

      if (!options?.silentSuccess && options?.successMessage) {
        showSuccess(options.successMessage)
      }

      return result
    }
    catch (error) {
      showCaughtError(error, options?.errorMessage)
      return null
    }
  }

  async function load<T>(task: () => Promise<T>, options: {
    errorMessage?: string
    fallback: T
  }) {
    try {
      return await task()
    }
    catch (error) {
      showCaughtError(error, options.errorMessage)
      return options.fallback
    }
  }

  return {
    showSuccess,
    showError,
    showCaughtError,
    handleResponse,
    run,
    load,
  }
}
