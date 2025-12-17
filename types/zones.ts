// Zone Types
export interface Zone {
  id: string
  tenant_id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  table_count?: number
}

export interface SimpleZone {
  id: string
  name: string
}

// API Query Parameters
export interface ZoneQueryParams {
  page?: number
  limit?: number
  search?: string
  is_active?: 'true' | 'false' | 'all'
  sort_by?: 'name' | 'displayOrder' | 'createdAt' | 'updatedAt'
  sort_order?: 'asc' | 'desc'
}

// API Payloads
export interface CreateZonePayload {
  name: string
  description?: string | null
  display_order: number
  is_active: boolean
}

export interface UpdateZonePayload {
  name?: string
  description?: string | null
  display_order?: number
  is_active?: boolean
}

// API Responses
export interface ZoneListResponse {
  success: boolean
  data: {
    zones: Zone[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

export interface ZoneResponse {
  success: boolean
  data: {
    zone: Zone
  }
}

export interface ZoneStatsResponse {
  success: boolean
  data: {
    total_zones: number
    active_zones: number
    inactive_zones: number
  }
}