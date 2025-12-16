import type { PaginationMeta } from './tables'

// Zone entity matching backend response
export interface Zone {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  table_count?: number
  created_at: string
  updated_at: string
}

// Zone List Response (paginated)
export interface ZoneListResponse {
  data: Zone[]
  pagination: PaginationMeta
}

// Single Zone Response
export interface ZoneResponse {
  data: Zone
}

// Create Zone Payload
export interface CreateZonePayload {
  name: string
  description?: string
  display_order?: number
  is_active?: boolean
}

// Update Zone Payload
export interface UpdateZonePayload {
  name?: string
  description?: string
  display_order?: number
  is_active?: boolean
}

// Zone Query Parameters
export interface ZoneQueryParams {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

// Zone Stats Response (structure may vary based on backend)
export interface ZoneStatsResponse {
  data: {
    total_zones: number
    active_zones: number
    inactive_zones: number
    total_tables: number
    [key: string]: unknown
  }
}

// Simple Zone for dropdowns (from /tables/zones)
export interface SimpleZone {
  id: string
  name: string
}

export interface ZonesSimpleResponse {
  data: SimpleZone[]
}

