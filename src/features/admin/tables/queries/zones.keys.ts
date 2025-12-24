import type { ZoneQueryParams } from '@/src/features/admin/tables/types/zones'

/**
 * Query key factory for zones
 * Follows the query key factory pattern for consistent cache management
 */
export const zonesQueryKeys = {
  all: ['zones'] as const,
  lists: () => [...zonesQueryKeys.all, 'list'] as const,
  list: (params?: ZoneQueryParams) => [...zonesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...zonesQueryKeys.all, 'detail', id] as const,
  stats: () => [...zonesQueryKeys.all, 'stats'] as const,
  simple: () => [...zonesQueryKeys.all, 'simple'] as const,
}
