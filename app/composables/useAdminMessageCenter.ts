type AdminMessageType = "success" | "error" | "info"

interface AdminMessageItem {
  id: string
  type: AdminMessageType
  message: string
  duration: number
}

function createAdminMessageId() {
  return `admin-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useAdminMessageCenter() {
  const messages = useState<AdminMessageItem[]>("admin-message-center", () => [])

  function remove(id: string) {
    messages.value = messages.value.filter((item) => item.id !== id)
  }

  function clear() {
    messages.value = []
  }

  function show(message: string, options?: {
    type?: AdminMessageType
    duration?: number
  }) {
    const item: AdminMessageItem = {
      id: createAdminMessageId(),
      type: options?.type ?? "info",
      message,
      duration: options?.duration ?? 2000,
    }

    messages.value = [...messages.value, item]

    if (import.meta.client && item.duration > 0) {
      setTimeout(() => remove(item.id), item.duration)
    }

    return item.id
  }

  function success(message: string, options?: { duration?: number }) {
    return show(message, {
      type: "success",
      duration: options?.duration,
    })
  }

  function error(message: string, options?: { duration?: number }) {
    return show(message, {
      type: "error",
      duration: options?.duration,
    })
  }

  function info(message: string, options?: { duration?: number }) {
    return show(message, {
      type: "info",
      duration: options?.duration,
    })
  }

  return {
    messages,
    show,
    success,
    error,
    info,
    remove,
    clear,
  }
}
