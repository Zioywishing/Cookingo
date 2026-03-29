import {
  ADMIN_PASSWORD_WEAK,
} from "./error-codes"
import { AdminDomainError } from "./errors"

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function assertAdminPassword(password: string) {
  if (!PASSWORD_RULE.test(password)) {
    throw new AdminDomainError(
      ADMIN_PASSWORD_WEAK,
      "password must include upper, lower, number, and special char",
    )
  }
}

export async function hashAdminPassword(password: string) {
  assertAdminPassword(password)

  return Bun.password.hash(password)
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  return Bun.password.verify(password, passwordHash)
}
