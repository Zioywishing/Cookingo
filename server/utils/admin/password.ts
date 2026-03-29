import {
  ADMIN_PASSWORD_WEAK,
} from "./error-codes"
import { ADMIN_PASSWORD_MIN_LENGTH } from "./constants"
import { ADMIN_PASSWORD_WEAK_MESSAGE } from "./error-messages"
import { AdminDomainError } from "./errors"

const PASSWORD_RULE = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{${ADMIN_PASSWORD_MIN_LENGTH},}$`,
)

export function assertAdminPassword(password: string) {
  if (!PASSWORD_RULE.test(password)) {
    throw new AdminDomainError(
      ADMIN_PASSWORD_WEAK,
      ADMIN_PASSWORD_WEAK_MESSAGE,
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
