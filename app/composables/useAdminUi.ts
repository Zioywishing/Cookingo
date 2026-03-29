const adminPermissionGroupLabelMap: Record<string, string> = {
  overview: "Overview",
  iam: "IAM",
  security: "Security",
}

export function resolveAdminBadgeTone(value: string): "neutral" | "success" | "warning" | "danger" {
  const normalized = value.trim().toLowerCase()

  if (["active", "success", "enabled"].includes(normalized)) {
    return "success"
  }

  if (["pending", "processing", "review"].includes(normalized)) {
    return "warning"
  }

  if (["disabled", "failure", "failed", "error", "blocked"].includes(normalized)) {
    return "danger"
  }

  return "neutral"
}

export function formatAdminPermissionGroupLabel(groupKey: string): string {
  if (adminPermissionGroupLabelMap[groupKey]) {
    return adminPermissionGroupLabelMap[groupKey]
  }

  return groupKey
    .split("-")
    .filter(Boolean)
    .map((segment) => `${segment[0]?.toUpperCase() || ""}${segment.slice(1)}`)
    .join(" ")
}
