import type { TableQueryParams, QRCodeListQueryParams } from '@/src/features/admin/tables/types/tables'

/**
 * Query key factory for tables
 * Follows the query key factory pattern for consistent cache management
 */
export const tablesQueryKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesQueryKeys.all, 'list'] as const,
  list: (params?: TableQueryParams) => [...tablesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...tablesQueryKeys.all, 'detail', id] as const,
  stats: () => [...tablesQueryKeys.all, 'stats'] as const,
  layout: (zone: string) => [...tablesQueryKeys.all, 'layout', zone] as const,
  zones: () => [...tablesQueryKeys.all, 'zones'] as const,
  /** @deprecated Use zones() instead */
  floors: () => [...tablesQueryKeys.all, 'floors'] as const,
  qr: {
    all: () => [...tablesQueryKeys.all, 'qr'] as const,
    list: (params?: QRCodeListQueryParams) =>
      [...tablesQueryKeys.qr.all(), 'list', params] as const,
    detail: (id: string) => [...tablesQueryKeys.qr.all(), 'detail', id] as const,
    stats: () => [...tablesQueryKeys.qr.all(), 'stats'] as const,
  },
}
