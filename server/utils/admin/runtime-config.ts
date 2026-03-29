import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function parseEnvFile(content: string) {
  const entries: Record<string, string> = {}

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    entries[key] = stripWrappingQuotes(value)
  }

  return entries
}

function readEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {}
  }

  return parseEnvFile(readFileSync(filePath, "utf8"))
}

export function resolveRuntimeEnv(
  key: string,
  options?: {
    cwd?: string
    fallback?: string
    envFiles?: string[]
  },
) {
  const processValue = process.env[key]

  if (typeof processValue === "string" && processValue.length > 0) {
    return processValue
  }

  const cwd = options?.cwd || process.cwd()
  const envFiles = options?.envFiles || [".env.dev", ".env"]

  for (const envFile of envFiles) {
    const fileValue = readEnvFile(resolve(cwd, envFile))[key]

    if (typeof fileValue === "string" && fileValue.length > 0) {
      return fileValue
    }
  }

  return options?.fallback || ""
}
