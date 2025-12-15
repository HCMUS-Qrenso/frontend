import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zonesApi } from '@/lib/api/zones'
import type {
  Zone,
  ZoneListResponse,
  ZoneResponse,
  ZoneQueryParams,
  CreateZonePayload,
  UpdateZonePayload,
  ZoneStatsResponse,
  ZonesSimpleResponse,
} from '@/types/zones'
import type { MessageResponse } from '@/types/auth'

// Query Keys
export const zonesQueryKeys = {
  all: ['zones'] as const,
  lists: () => [...zonesQueryKeys.all, 'list'] as const,
  list: (params?: ZoneQueryParams) => [...zonesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...zonesQueryKeys.all, 'detail', id] as const,
  stats: () => [...zonesQueryKeys.all, 'stats'] as const,
  simple: () => [...zonesQueryKeys.all, 'simple'] as const,
}

// Query Hooks
export const useZonesQuery = (params?: ZoneQueryParams, enabled = true) => {
  return useQuery<ZoneListResponse>({
    queryKey: zonesQueryKeys.list(params),
    queryFn: () => zonesApi.getZones(params),
    enabled,
    staleTime: 30 * 1000,
  })
}

export const useZonesSimpleQuery = (enabled = true) => {
  return useQuery<ZonesSimpleResponse>({
    queryKey: zonesQueryKeys.simple(),
    queryFn: () => zonesApi.getZonesSimple(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - zones don't change often
  })
}

export const useZoneQuery = (id: string | null, enabled = true) => {
  return useQuery<ZoneResponse>({
    queryKey: zonesQueryKeys.detail(id!),
    queryFn: () => zonesApi.getZoneById(id!),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  })
}

export const useZoneStatsQuery = (enabled = true) => {
  return useQuery<ZoneStatsResponse>({
    queryKey: zonesQueryKeys.stats(),
    queryFn: () => zonesApi.getZoneStats(),
    enabled,
    staleTime: 30 * 1000,
  })
}

// Mutation Hooks
export const useCreateZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ZoneResponse, unknown, CreateZonePayload>({
    mutationFn: (payload) => zonesApi.createZone(payload),
    onSuccess: () => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.simple() })
    },
  })
}

export const useUpdateZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ZoneResponse, unknown, { id: string; payload: UpdateZonePayload }>({
    mutationFn: ({ id, payload }) => zonesApi.updateZone(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific zone in cache
      queryClient.setQueryData(zonesQueryKeys.detail(variables.id), data)
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.simple() })
    },
  })
}

export const useDeleteZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, string>({
    mutationFn: (id) => zonesApi.deleteZone(id),
    onSuccess: () => {
      // Invalidate all zone queries
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.all })
    },
  })
}

