import { apiClient } from '@/src/lib/axios'
import type {
  MenuItem,
  MenuItemListResponse,
  MenuItemStatsResponse,
  MenuItemResponse,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  MenuItemQueryParams,
  ExportMenuParams,
  ImportMenuMode,
  ImportMenuResult,
} from '@/src/features/admin/menu/types'
import type { MessageResponse } from '@/src/features/auth/types'

export const menuItemsApi = {
  // Menu Item Management
  getMenuItems: async (params?: MenuItemQueryParams): Promise<MenuItemListResponse> => {
    const { data } = await apiClient.get<MenuItemListResponse>('/menu', { params })
    return data
  },

  getMenuItemsStats: async (): Promise<MenuItemStatsResponse> => {
    const { data } = await apiClient.get<MenuItemStatsResponse>('/menu/stats')
    return data
  },

  getMenuItem: async (id: string): Promise<MenuItemResponse> => {
    const { data } = await apiClient.get<MenuItemResponse>(`/menu/${id}`)
    return data
  },

  createMenuItem: async (payload: CreateMenuItemPayload): Promise<MenuItemResponse> => {
    const { data } = await apiClient.post<MenuItemResponse>('/menu', payload)
    return data
  },

  updateMenuItem: async (id: string, payload: UpdateMenuItemPayload): Promise<MenuItemResponse> => {
    const { data } = await apiClient.put<MenuItemResponse>(`/menu/${id}`, payload)
    return data
  },

  deleteMenuItem: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/menu/${id}`)
    return data
  },

  // Export menu data as CSV/XLSX
  exportMenu: async (params: ExportMenuParams): Promise<Blob> => {
    const { data } = await apiClient.get('/menu/export', {
      params,
      responseType: 'blob',
    })
    return data
  },

  // Import menu data from CSV/XLSX file
  importMenu: async (file: File, mode: ImportMenuMode): Promise<ImportMenuResult> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    const { data } = await apiClient.post<ImportMenuResult>('/menu/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
