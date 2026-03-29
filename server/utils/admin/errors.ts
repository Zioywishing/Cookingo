export class AdminDomainError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = "AdminDomainError"
  }
}

export function isAdminDomainError(error: unknown): error is AdminDomainError {
  return error instanceof AdminDomainError
}
