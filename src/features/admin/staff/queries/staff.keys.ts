import type { StaffQueryParams } from '@/src/features/admin/staff/types'

/**
 * Query key factory for staff
 * Follows the query key factory pattern for consistent cache management
 */
export const staffQueryKeys = {
  all: ['staff'] as const,
  lists: () => [...staffQueryKeys.all, 'list'] as const,
  list: (params?: StaffQueryParams) => [...staffQueryKeys.lists(), params] as const,
  detail: (id: string) => [...staffQueryKeys.all, 'detail', id] as const,
  stats: () => [...staffQueryKeys.all, 'stats'] as const,
}
