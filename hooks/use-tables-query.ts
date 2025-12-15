import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '@/lib/api/tables'
import type {
  Table,
  TableQueryParams,
  CreateTablePayload,
  UpdateTablePayload,
  BatchPositionUpdatePayload,
  TableListResponse,
  TableStatsResponse,
  TableResponse,
  QRGenerationResponse,
  ZoneLayoutResponse,
  ZonesResponse,
  FloorLayoutResponse,
  FloorsResponse,
  BatchPositionUpdateResponse,
  QRCodeDetailResponse,
  QRCodeListQueryParams,
  QRCodeListResponse,
  BatchGenerateQRPayload,
  BatchGenerateQRResponse,
} from '@/types/tables'
import type { MessageResponse } from '@/types/auth'

// Query Keys
export const tablesQueryKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesQueryKeys.all, 'list'] as const,
  list: (params?: TableQueryParams) => [...tablesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...tablesQueryKeys.all, 'detail', id] as const,
  stats: () => [...tablesQueryKeys.all, 'stats'] as const,
  layout: (zone: string) => [...tablesQueryKeys.all, 'layout', zone] as const,
  zones: () => [...tablesQueryKeys.all, 'zones'] as const,
  floors: () => [...tablesQueryKeys.all, 'floors'] as const, // Deprecated
  qr: {
    all: () => [...tablesQueryKeys.all, 'qr'] as const,
    list: (params?: QRCodeListQueryParams) =>
      [...tablesQueryKeys.qr.all(), 'list', params] as const,
    detail: (id: string) => [...tablesQueryKeys.qr.all(), 'detail', id] as const,
  },
}

// Query Hooks
export const useTablesQuery = (params?: TableQueryParams, enabled = true) => {
  return useQuery<TableListResponse>({
    queryKey: tablesQueryKeys.list(params),
    queryFn: () => tablesApi.getTables(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useTableQuery = (id: string | null, enabled = true) => {
  return useQuery<TableResponse>({
    queryKey: tablesQueryKeys.detail(id!),
    queryFn: () => tablesApi.getTableById(id!),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  })
}

export const useTableStatsQuery = (enabled = true) => {
  return useQuery<TableStatsResponse>({
    queryKey: tablesQueryKeys.stats(),
    queryFn: () => tablesApi.getTableStats(),
    enabled,
    staleTime: 30 * 1000,
  })
}

export const useZoneLayoutQuery = (zone: string | null, enabled = true) => {
  return useQuery<ZoneLayoutResponse>({
    queryKey: tablesQueryKeys.layout(zone!),
    queryFn: () => tablesApi.getZoneLayout(zone!),
    enabled: enabled && !!zone,
    staleTime: 30 * 1000,
  })
}

export const useZonesQuery = (enabled = true) => {
  return useQuery<ZonesResponse>({
    queryKey: tablesQueryKeys.zones(),
    queryFn: () => tablesApi.getZones(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - zones don't change often
  })
}

// Keep deprecated hooks for backward compatibility
/** @deprecated Use useZoneLayoutQuery instead */
export const useFloorLayoutQuery = (floor: string | null, enabled = true) => {
  return useQuery<FloorLayoutResponse>({
    queryKey: tablesQueryKeys.layout(floor!),
    queryFn: () => tablesApi.getFloorLayout(floor!),
    enabled: enabled && !!floor,
    staleTime: 30 * 1000,
  })
}

/** @deprecated Use useZonesQuery instead */
export const useFloorsQuery = (enabled = true) => {
  return useQuery<FloorsResponse>({
    queryKey: tablesQueryKeys.floors(),
    queryFn: () => tablesApi.getFloors(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - floors don't change often
  })
}

// Mutation Hooks
export const useCreateTableMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<TableResponse, unknown, CreateTablePayload>({
    mutationFn: (payload) => tablesApi.createTable(payload),
    onSuccess: () => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.zones() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.floors() }) // Deprecated
    },
  })
}

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<TableResponse, unknown, { id: string; payload: UpdateTablePayload }>({
    mutationFn: ({ id, payload }) => tablesApi.updateTable(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific table in cache
      queryClient.setQueryData(tablesQueryKeys.detail(variables.id), data)
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.stats() })
      // Invalidate layout queries if position changed
      if (variables.payload.position) {
        queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
      }
    },
  })
}

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, string>({
    mutationFn: (id) => tablesApi.deleteTable(id),
    onSuccess: () => {
      // Invalidate all table queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
    },
  })
}

// QR Code Query Hooks
export const useQRCodeQuery = (tableId: string | null, enabled = true) => {
  return useQuery<QRCodeDetailResponse>({
    queryKey: tablesQueryKeys.qr.detail(tableId!),
    queryFn: () => tablesApi.getQRCode(tableId!),
    enabled: enabled && !!tableId,
    staleTime: 30 * 1000,
  })
}

export const useQRCodesQuery = (params?: QRCodeListQueryParams, enabled = true) => {
  return useQuery<QRCodeListResponse>({
    queryKey: tablesQueryKeys.qr.list(params),
    queryFn: () => tablesApi.getQRCodes(params),
    enabled,
    staleTime: 30 * 1000,
  })
}

// QR Code Mutation Hooks
export const useGenerateQRMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<QRGenerationResponse, unknown, { tableId: string; forceRegenerate?: boolean }>(
    {
      mutationFn: ({ tableId, forceRegenerate }) => tablesApi.generateQR(tableId, forceRegenerate),
      onSuccess: (data, variables) => {
        // Update the specific table in cache
        queryClient.invalidateQueries({ queryKey: tablesQueryKeys.detail(variables.tableId) })
        // Invalidate QR queries
        queryClient.invalidateQueries({ queryKey: tablesQueryKeys.qr.detail(variables.tableId) })
        queryClient.invalidateQueries({ queryKey: tablesQueryKeys.qr.list() })
        // Invalidate list queries to update QR status
        queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() })
      },
    },
  )
}

export const useBatchGenerateQRMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<BatchGenerateQRResponse, unknown, BatchGenerateQRPayload>({
    mutationFn: (payload) => tablesApi.batchGenerateQR(payload),
    onSuccess: () => {
      // Invalidate all QR queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.qr.all() })
      // Invalidate table list queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() })
    },
  })
}

export const useBatchUpdatePositionsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<BatchPositionUpdateResponse, unknown, BatchPositionUpdatePayload>({
    mutationFn: (payload) => tablesApi.batchUpdatePositions(payload),
    onSuccess: () => {
      // Invalidate layout queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.all })
    },
  })
}
