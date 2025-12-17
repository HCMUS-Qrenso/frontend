import { useQuery } from '@tanstack/react-query'
import { tenantsApi } from '@/lib/api/tenants'
import type {
  TenantDetailResponse,
  TenantListQueryParams,
  TenantListResponse,
} from '@/types/tenants'

export const tenantsQueryKeys = {
  all: ['tenants'] as const,
  list: (params?: TenantListQueryParams) => [...tenantsQueryKeys.all, 'list', params] as const,
  current: () => [...tenantsQueryKeys.all, 'current'] as const,
}

export const useOwnerTenantsQuery = (params?: TenantListQueryParams, enabled = true) => {
  return useQuery<TenantListResponse>({
    queryKey: tenantsQueryKeys.list(params),
    queryFn: () => tenantsApi.getOwnerTenants(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCurrentTenantQuery = (enabled = true) => {
  return useQuery<TenantDetailResponse>({
    queryKey: tenantsQueryKeys.current(),
    queryFn: () => tenantsApi.getCurrentTenant(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
