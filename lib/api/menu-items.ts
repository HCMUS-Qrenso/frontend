import { apiClient } from '@/lib/axios'
import type {
  MenuItem,
  MenuItemListResponse,
  MenuItemStatsResponse,
  MenuItemResponse,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  MenuItemQueryParams,
} from '@/types/menu-items'
import type { MessageResponse } from '@/types/auth'

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
}
