import { apiClient } from '@/lib/axios'
import type {
  Zone,
  ZoneListResponse,
  ZoneStatsResponse,
  ZoneResponse,
  CreateZonePayload,
  UpdateZonePayload,
  ZoneQueryParams,
} from '@/types/zones'
import type { MessageResponse } from '@/types/auth'

export const zonesApi = {
  // Zone Management
  getZones: async (params?: ZoneQueryParams): Promise<ZoneListResponse> => {
    const { data } = await apiClient.get<ZoneListResponse>('/zones', { params })
    return data
  },

  getZonesStats: async (): Promise<ZoneStatsResponse> => {
    const { data } = await apiClient.get<ZoneStatsResponse>('/zones/stats')
    return data
  },

  getZone: async (id: string): Promise<ZoneResponse> => {
    const { data } = await apiClient.get<ZoneResponse>(`/zones/${id}`)
    return data
  },

  createZone: async (payload: CreateZonePayload): Promise<ZoneResponse> => {
    const { data } = await apiClient.post<ZoneResponse>('/zones', payload)
    return data
  },

  updateZone: async (id: string, payload: UpdateZonePayload): Promise<ZoneResponse> => {
    const { data } = await apiClient.patch<ZoneResponse>(`/zones/${id}`, payload)
    return data
  },

  deleteZone: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/zones/${id}`)
    return data
  },

  // Simple zones list (for dropdowns, etc.)
  getZonesSimple: async (): Promise<{ zones: { id: string; name: string }[] }> => {
    const { data } = await apiClient.get<ZoneListResponse>('/zones', {
      params: { limit: 100, is_active: 'all' },
    })

    // Transform to simple format
    return {
      zones: data.data.zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
      })),
    }
  },
}