import type { OrderQueryParams } from '@/src/features/admin/orders/types/orders'

/**
 * Query key factory for orders
 * Follows the query key factory pattern for consistent cache management
 */
export const ordersQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersQueryKeys.all, 'list'] as const,
  list: (params?: OrderQueryParams) => [...ordersQueryKeys.lists(), params] as const,
  detail: (id: string) => [...ordersQueryKeys.all, 'detail', id] as const,
  stats: () => [...ordersQueryKeys.all, 'stats'] as const,
}
