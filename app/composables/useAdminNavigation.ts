import type { AdminPermissionCode } from "#shared/admin/domain"
import { AdminNavigationSchema } from "#shared/admin/domain"

export interface AdminNavLinkItem {
  title: string
  to: string
}

export interface AdminNavGroup {
  label: string
  items: AdminNavLinkItem[]
}

export function useAdminNavigation(hasPermission: (code: AdminPermissionCode) => boolean) {
  return computed<AdminNavGroup[]>(() => {
    const grouped = new Map<string, AdminNavLinkItem[]>()

    for (const item of AdminNavigationSchema) {
      if (!hasPermission(item.permission)) {
        continue
      }

      const items = grouped.get(item.groupLabel) || []
      items.push({
        title: item.title,
        to: item.to,
      })
      grouped.set(item.groupLabel, items)
    }

    return Array.from(grouped, ([label, items]) => ({
      label,
      items,
    }))
  })
}
