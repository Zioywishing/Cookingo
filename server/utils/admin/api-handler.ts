import type { H3Event } from "h3"
import { getHeader } from "h3"
import { ZodError } from "zod"

import { failureResponse } from "../api-response"
import { ADMIN_INTERNAL_ERROR, ADMIN_REQUEST_INVALID } from "./error-codes"
import { isAdminDomainError } from "./errors"

export function createAdminErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return failureResponse(ADMIN_REQUEST_INVALID, "request params invalid")
  }

  if (isAdminDomainError(error)) {
    return failureResponse(error.code, error.message)
  }

  console.error(error)
  return failureResponse(ADMIN_INTERNAL_ERROR, "admin internal error")
}

export function defineAdminApiHandler<T>(
  handler: (event: H3Event) => Promise<T> | T,
) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    }
    catch (error) {
      return createAdminErrorResponse(error)
    }
  })
}

export function getRequestMeta(event: H3Event) {
  return {
    ip: event.node.req.socket.remoteAddress || null,
    userAgent: getHeader(event, "user-agent") || null,
  }
}
