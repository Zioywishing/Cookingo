import { ADMIN_ACTIVE_USER_STATUS, ADMIN_INITIAL_TOKEN_VERSION } from "./constants"

export function createInitialAdminUserFields(now: string) {
  return {
    status: ADMIN_ACTIVE_USER_STATUS,
    tokenVersion: ADMIN_INITIAL_TOKEN_VERSION,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function getNextAdminTokenVersion(tokenVersion: number) {
  return tokenVersion + 1
}
