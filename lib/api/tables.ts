import { apiClient } from '@/lib/axios'
import type {
  Table,
  TableListResponse,
  TableStatsResponse,
  TableResponse,
  CreateTablePayload,
  UpdateTablePayload,
  TableQueryParams,
  QRGenerationResponse,
  QRTokenVerificationRequest,
  QRTokenVerificationResponse,
  FloorLayoutResponse,
  FloorsResponse,
  BatchPositionUpdatePayload,
  BatchPositionUpdateResponse,
} from '@/types/tables'
import type { MessageResponse } from '@/types/auth'

export const tablesApi = {
  // Table Management
  getTables: async (params?: TableQueryParams): Promise<TableListResponse> => {
    const { data } = await apiClient.get<TableListResponse>('/tables', { params })
    return data
  },

  getTableStats: async (): Promise<TableStatsResponse> => {
    const { data } = await apiClient.get<TableStatsResponse>('/tables/stats')
    return data
  },

  getTableById: async (id: string): Promise<TableResponse> => {
    const { data } = await apiClient.get<TableResponse>(`/tables/${id}`)
    return data
  },

  createTable: async (payload: CreateTablePayload): Promise<TableResponse> => {
    // Backend accepts position as object, not JSON string
    const { data } = await apiClient.post<TableResponse>('/tables', payload)
    return data
  },

  updateTable: async (id: string, payload: UpdateTablePayload): Promise<TableResponse> => {
    // Backend accepts position as object, not JSON string
    const { data } = await apiClient.put<TableResponse>(`/tables/${id}`, payload)
    return data
  },

  deleteTable: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/tables/${id}`)
    return data
  },

  // QR Code Management
  generateQR: async (tableId: string, forceRegenerate = false): Promise<QRGenerationResponse> => {
    const { data } = await apiClient.post<QRGenerationResponse>(`/tables/${tableId}/qr/generate`, {
      force_regenerate: forceRegenerate,
    })
    return data
  },

  downloadQR: async (tableId: string, format: 'png' | 'pdf'): Promise<Blob> => {
    const response = await apiClient.get(`/tables/${tableId}/qr/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  downloadAllQR: async (): Promise<Blob> => {
    const response = await apiClient.get('/tables/qr/download-all', {
      responseType: 'blob',
    })
    return response.data
  },

  verifyQRToken: async (
    payload: QRTokenVerificationRequest,
  ): Promise<QRTokenVerificationResponse> => {
    const { data } = await apiClient.post<QRTokenVerificationResponse>(
      '/tables/verify-token',
      payload,
    )
    return data
  },

  // Floor Layout
  getFloorLayout: async (floor: string): Promise<FloorLayoutResponse> => {
    const { data } = await apiClient.get<FloorLayoutResponse>('/tables/layout', {
      params: { floor },
    })
    return data
  },

  getFloors: async (): Promise<FloorsResponse> => {
    const { data } = await apiClient.get<FloorsResponse>('/tables/floors')
    return data
  },

  batchUpdatePositions: async (
    payload: BatchPositionUpdatePayload,
  ): Promise<BatchPositionUpdateResponse> => {
    // Backend accepts position as object, not JSON string
    const { data } = await apiClient.post<BatchPositionUpdateResponse>(
      '/tables/layout/batch-update',
      payload,
    )
    return data
  },
}
