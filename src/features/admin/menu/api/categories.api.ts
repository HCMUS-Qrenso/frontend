import { apiClient } from '@/src/lib/axios'
import type {
  Category,
  CategoryListResponse,
  CategoryStatsResponse,
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryQueryParams,
  ReorderCategoriesPayload,
  ToggleCategoryStatusPayload,
} from '@/src/features/admin/menu/types'
import type { MessageResponse } from '@/src/features/auth/types'

export const categoriesApi = {
  // Category Management
  getCategories: async (params?: CategoryQueryParams): Promise<CategoryListResponse> => {
    const { data } = await apiClient.get<CategoryListResponse>('/categories', { params })
    return data
  },

  getCategoriesStats: async (): Promise<CategoryStatsResponse> => {
    const { data } = await apiClient.get<CategoryStatsResponse>('/categories/stats')
    return data
  },

  getCategory: async (id: string): Promise<CategoryResponse> => {
    const { data } = await apiClient.get<CategoryResponse>(`/categories/${id}`)
    return data
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    const { data } = await apiClient.post<CategoryResponse>('/categories', payload)
    return data
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<CategoryResponse> => {
    const { data } = await apiClient.patch<CategoryResponse>(`/categories/${id}`, payload)
    return data
  },

  deleteCategory: async (id: string, force?: boolean): Promise<MessageResponse> => {
    const params = force ? { force } : undefined
    const { data } = await apiClient.delete<MessageResponse>(`/categories/${id}`, { params })
    return data
  },

  reorderCategories: async (payload: ReorderCategoriesPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.put<MessageResponse>('/categories/reorder', payload)
    return data
  },

  toggleCategoryStatus: async (
    id: string,
    payload: ToggleCategoryStatusPayload,
  ): Promise<CategoryResponse> => {
    const { data } = await apiClient.patch<CategoryResponse>(`/categories/${id}/status`, payload)
    return data
  },
}
