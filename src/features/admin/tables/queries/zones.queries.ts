import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zonesApi } from '@/src/features/admin/tables/api/zones.api'
import type {
  Zone,
  ZoneQueryParams,
  CreateZonePayload,
  UpdateZonePayload,
  ZoneListResponse,
  ZoneStatsResponse,
  ZoneResponse,
} from '@/src/features/admin/tables/types/zones'
import type { MessageResponse } from '@/src/features/auth/types/auth'
import { tablesQueryKeys } from './tables.queries'

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
  })
}

export const useZoneQuery = (id: string, enabled = true) => {
  return useQuery<ZoneResponse>({
    queryKey: zonesQueryKeys.detail(id),
    queryFn: () => zonesApi.getZone(id),
    enabled: enabled && !!id,
  })
}

export const useZonesStatsQuery = (enabled = true) => {
  return useQuery<ZoneStatsResponse>({
    queryKey: zonesQueryKeys.stats(),
    queryFn: () => zonesApi.getZonesStats(),
    enabled,
    staleTime: 30 * 1000,
  })
}

export const useZonesSimpleQuery = (enabled = true) => {
  return useQuery<{ zones: { id: string; name: string }[] }>({
    queryKey: zonesQueryKeys.simple(),
    queryFn: () => zonesApi.getZonesSimple(),
    enabled,
  })
}

// Mutation Hooks
export const useCreateZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ZoneResponse, Error, CreateZonePayload>({
    mutationFn: (payload) => zonesApi.createZone(payload),
    onSuccess: () => {
      // Invalidate and refetch zones list and stats
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.simple() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
    },
  })
}

export const useUpdateZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ZoneResponse, Error, { id: string; payload: UpdateZonePayload }>({
    mutationFn: ({ id, payload }) => zonesApi.updateZone(id, payload),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch zones list, stats, and specific zone detail
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.simple() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
    },
  })
}

export const useDeleteZoneMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (id) => zonesApi.deleteZone(id),
    onSuccess: () => {
      // Invalidate and refetch zones list and stats
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: zonesQueryKeys.simple() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
    },
  })
}
