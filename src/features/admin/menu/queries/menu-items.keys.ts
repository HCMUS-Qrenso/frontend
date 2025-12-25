import type { MenuItemQueryParams } from '@/src/features/admin/menu/types'

/**
 * Query key factory for menu items
 * Follows the query key factory pattern for consistent cache management
 */
export const menuItemsQueryKeys = {
  all: ['menu-items'] as const,
  lists: () => [...menuItemsQueryKeys.all, 'list'] as const,
  list: (params?: MenuItemQueryParams) => [...menuItemsQueryKeys.lists(), params] as const,
  detail: (id: string) => [...menuItemsQueryKeys.all, 'detail', id] as const,
  stats: () => [...menuItemsQueryKeys.all, 'stats'] as const,
}
