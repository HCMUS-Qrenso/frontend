import { apiClient } from '@/lib/axios'
import type {
  Table,
  TableListResponse,
  TableStatsResponse,
  QrStatsResponse,
  TableResponse,
  CreateTablePayload,
  UpdateTablePayload,
  TableQueryParams,
  QRGenerationResponse,
  QRTokenVerificationRequest,
  QRTokenVerificationResponse,
  ZoneLayoutResponse,
  ZonesResponse,
  FloorLayoutResponse,
  FloorsResponse,
  BatchPositionUpdatePayload,
  BatchPositionUpdateResponse,
  QRCodeDetailResponse,
  QRCodeListQueryParams,
  QRCodeListResponse,
  BatchGenerateQRPayload,
  BatchGenerateQRResponse,
  QrStats,
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
  getQRCode: async (tableId: string): Promise<QRCodeDetailResponse> => {
    const { data } = await apiClient.get<QRCodeDetailResponse>(`/tables/${tableId}/qr`)
    return data
  },

  getQRCodes: async (params?: QRCodeListQueryParams): Promise<QRCodeListResponse> => {
    const { data } = await apiClient.get<QRCodeListResponse>('/tables/qr', { params })
    return data
  },

  generateQR: async (tableId: string, forceRegenerate = false): Promise<QRGenerationResponse> => {
    const { data } = await apiClient.post<QRGenerationResponse>(`/tables/${tableId}/qr/generate`, {
      force_regenerate: forceRegenerate,
    })
    return data
  },

  batchGenerateQR: async (payload: BatchGenerateQRPayload): Promise<BatchGenerateQRResponse> => {
    const { data } = await apiClient.post<BatchGenerateQRResponse>(
      '/tables/qr/batch-generate',
      payload,
    )
    return data
  },

  downloadQR: async (tableId: string, format: 'png' | 'pdf' | 'zip' = 'png'): Promise<Blob> => {
    const response = await apiClient.get(`/tables/${tableId}/qr/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  downloadAllQR: async (format: 'png' | 'pdf' | 'zip' = 'zip'): Promise<Blob> => {
    const response = await apiClient.get('/tables/qr/download-all', {
      params: { format },
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

  // Zone Layout
  getZoneLayout: async (zoneId: string): Promise<ZoneLayoutResponse> => {
    const { data } = await apiClient.get<ZoneLayoutResponse>('/tables/layout', {
      params: { zone_id: zoneId },
    })
    return data
  },

  // Deprecated floor layout API kept only for type compatibility
  /** @deprecated Use getZoneLayout instead */
  getFloorLayout: async (_floor: string): Promise<FloorLayoutResponse> => {
    throw new Error('getFloorLayout is deprecated. Use getZoneLayout instead.')
  },

  getZones: async (): Promise<ZonesResponse> => {
    const { data } = await apiClient.get<ZonesResponse>('/tables/zones')
    return data
  },

  // Keep getFloors for backward compatibility
  /** @deprecated Use getZones instead */
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

  getQrStats: async (): Promise<QrStatsResponse> => {
    const { data } = await apiClient.get<QrStatsResponse>('/tables/qr/stats')
    return data
  },
}
