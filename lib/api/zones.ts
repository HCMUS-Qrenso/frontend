import { apiClient } from '@/lib/axios'
import type {
  Zone,
  ZoneListResponse,
  ZoneResponse,
  CreateZonePayload,
  UpdateZonePayload,
  ZoneQueryParams,
  ZoneStatsResponse,
  ZonesSimpleResponse,
} from '@/types/zones'
import type { MessageResponse } from '@/types/auth'

export const zonesApi = {
  // Get paginated list of zones
  getZones: async (params?: ZoneQueryParams): Promise<ZoneListResponse> => {
    const { data } = await apiClient.get<ZoneListResponse>('/zones', { params })
    return data
  },

  // Get simple list of zones for dropdowns (from /tables/zones)
  getZonesSimple: async (): Promise<ZonesSimpleResponse> => {
    const { data } = await apiClient.get<ZonesSimpleResponse>('/tables/zones')
    return data
  },

  // Get a single zone by ID
  getZoneById: async (id: string): Promise<ZoneResponse> => {
    const { data } = await apiClient.get<ZoneResponse>(`/zones/${id}`)
    return data
  },

  // Create a new zone
  createZone: async (payload: CreateZonePayload): Promise<ZoneResponse> => {
    const { data } = await apiClient.post<ZoneResponse>('/zones', payload)
    return data
  },

  // Update a zone
  updateZone: async (id: string, payload: UpdateZonePayload): Promise<ZoneResponse> => {
    const { data } = await apiClient.put<ZoneResponse>(`/zones/${id}`, payload)
    return data
  },

  // Delete a zone
  deleteZone: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/zones/${id}`)
    return data
  },

  // Get zone statistics
  getZoneStats: async (): Promise<ZoneStatsResponse> => {
    const { data } = await apiClient.get<ZoneStatsResponse>('/zones/stats')
    return data
  },
}

