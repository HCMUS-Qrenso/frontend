import type { QueryClient } from '@tanstack/react-query'

/**
 * Invalidates all tenant-dependent queries
 * This should be called when the tenant context changes (e.g., owner switches tenant)
 *
 * @param queryClient - The React Query client instance
 */
export function invalidateTenantQueries(queryClient: QueryClient): void {
  // Explicitly invalidate main tenant-dependent query keys
  // Note: ['tenants', 'current'] is NOT invalidated here because it will automatically
  // refetch when selectedTenantId changes (dependency-based refetch)

  // Invalidate tables list, stats, and zones queries
  // Note: We do NOT invalidate ['tables'] broadly because it would invalidate
  // all layout queries (['tables', 'layout', zone1], ['tables', 'layout', zone2], etc.)
  // Layout queries will automatically refetch when the zone changes or component re-mounts
  queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
  queryClient.invalidateQueries({ queryKey: ['tables', 'stats'] })
  queryClient.invalidateQueries({ queryKey: ['tables', 'zones'] })

  // Invalidate zones queries (from use-zones-query.ts)
  queryClient.invalidateQueries({ queryKey: ['zones'] })

  // Invalidate any other tenant-dependent queries using predicate
  // This catches any queries that might be tenant-scoped but not explicitly listed above
  // Exclude layout queries to avoid invalidating all zone layouts unnecessarily
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0]
      const secondKey = query.queryKey[1]

      // Exclude 'tenants' because:
      // - 'tenants/list' doesn't depend on tenant context (owner's tenant list)
      // - 'tenants/current' will auto-refetch when selectedTenantId changes
      // Exclude 'auth' and 'users' as they are not tenant-scoped
      // Exclude 'tables' queries that are layout queries (['tables', 'layout', zone])
      // Layout queries will refetch automatically when zone changes
      if (key === 'auth' || key === 'users' || key === 'tenants') {
        return false
      }

      // Exclude layout queries - they will refetch when zone changes
      if (key === 'tables' && secondKey === 'layout') {
        return false
      }

      return true
    },
  })
}
