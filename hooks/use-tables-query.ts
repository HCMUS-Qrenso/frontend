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
  FloorLayoutResponse,
  FloorsResponse,
  BatchPositionUpdateResponse,
  MessageResponse,
} from '@/types/tables'

// Query Keys
export const tablesQueryKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesQueryKeys.all, 'list'] as const,
  list: (params?: TableQueryParams) => [...tablesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...tablesQueryKeys.all, 'detail', id] as const,
  stats: () => [...tablesQueryKeys.all, 'stats'] as const,
  layout: (floor: string) => [...tablesQueryKeys.all, 'layout', floor] as const,
  floors: () => [...tablesQueryKeys.all, 'floors'] as const,
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

export const useFloorLayoutQuery = (floor: string | null, enabled = true) => {
  return useQuery<FloorLayoutResponse>({
    queryKey: tablesQueryKeys.layout(floor!),
    queryFn: () => tablesApi.getFloorLayout(floor!),
    enabled: enabled && !!floor,
    staleTime: 30 * 1000,
  })
}

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
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.floors() })
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

export const useGenerateQRMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    QRGenerationResponse,
    unknown,
    { tableId: string; forceRegenerate?: boolean }
  >({
    mutationFn: ({ tableId, forceRegenerate }) =>
      tablesApi.generateQR(tableId, forceRegenerate),
    onSuccess: (data, variables) => {
      // Update the specific table in cache
      queryClient.invalidateQueries({ queryKey: tablesQueryKeys.detail(variables.tableId) })
      // Invalidate list queries to update QR status
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

