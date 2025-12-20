export interface TenantSummary {
  id: string
  name: string
  slug: string
  address: string | null
  image: string | null
  status: string
  subscription_tier: string
  settings: Record<string, unknown> | null
  statistics?: {
    total_users: number
    total_tables: number
    total_zones: number
    total_orders: number
  }
  created_at: string
  updated_at: string
}

export interface TenantListResponse {
  success: boolean
  data: {
    tenants: TenantSummary[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
}

export interface TenantDetail extends TenantSummary {
  owner?: {
    id: string
    full_name: string
    email: string
  }
  statistics: {
    total_users: number
    total_tables: number
    total_zones: number
    total_orders: number
    total_categories?: number
    total_menu_items?: number
  }
}

export interface TenantDetailResponse {
  success: boolean
  data: TenantDetail
}

export interface TenantListQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  subscription_tier?: string
}
