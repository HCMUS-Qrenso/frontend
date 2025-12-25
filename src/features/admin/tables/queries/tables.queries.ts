import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '@/src/features/admin/tables/api/tables.api'
import type {
  Table,
  TableQueryParams,
  CreateTablePayload,
  UpdateTablePayload,
  BatchPositionUpdatePayload,
  TableListResponse,
  TableStatsResponse,
  QrStatsResponse,
  TableResponse,
  QRGenerationResponse,
  ZoneLayoutResponse,
  BatchPositionUpdateResponse,
  QRCodeDetailResponse,
  QRCodeListQueryParams,
  QRCodeListResponse,
  BatchGenerateQRPayload,
  BatchGenerateQRResponse,
  QrStats,
} from '@/src/features/admin/tables/types/tables'
import type { MessageResponse } from '@/src/features/auth/types/auth'

// Import and re-export query keys from dedicated keys file
export { tablesQueryKeys } from './tables.keys'
import { tablesQueryKeys } from './tables.keys'


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


// Mutation Hooks
export const useCreateTableMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<TableResponse, unknown, CreateTablePayload>({
    mutationFn: (payload) => tablesApi.createTable(payload),
    onSuccess: (response) => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.zones() })
      queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.layout(response.data.zone_id || ''),
      })
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
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.layout(data.data.zone_id || '') })
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

export const useQrStatsQuery = (enabled = true) => {
  return useQuery<QrStatsResponse>({
    queryKey: tablesQueryKeys.qr.stats(),
    queryFn: () => tablesApi.getQrStats(),
    enabled,
    staleTime: 30 * 1000,
  })
}
