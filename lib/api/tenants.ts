import { apiClient } from '@/lib/axios'
import type {
  TenantDetailResponse,
  TenantListQueryParams,
  TenantListResponse,
} from '@/types/tenants'

export const tenantsApi = {
  /**
   * Get all tenants owned by the current owner
   * - Backend: GET /tenants
   * - For owners only (reads owner from JWT)
   * - MUST NOT send x-tenant-id header
   */
  getOwnerTenants: async (params?: TenantListQueryParams): Promise<TenantListResponse> => {
    const { data } = await apiClient.get<TenantListResponse>('/tenants', {
      params,
      // Custom flag so axios interceptor skips x-tenant-id for this request
      withoutTenant: true,
    } as any)
    return data
  },

  /**
   * Get current tenant details for admin/staff
   * - Backend: GET /tenants/current
   * - For admins/staff (tenant taken from JWT)
   * - Owners can also call this with x-tenant-id if needed
   */
  getCurrentTenant: async (): Promise<TenantDetailResponse> => {
    const { data } = await apiClient.get<TenantDetailResponse>('/tenants/current')
    return data
  },
}


