import type { CategoryQueryParams } from '@/src/features/admin/menu/types'

/**
 * Query key factory for categories
 * Follows the query key factory pattern for consistent cache management
 */
export const categoriesQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesQueryKeys.all, 'list'] as const,
  list: (params?: CategoryQueryParams) => [...categoriesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...categoriesQueryKeys.all, 'detail', id] as const,
  stats: () => [...categoriesQueryKeys.all, 'stats'] as const,
}
