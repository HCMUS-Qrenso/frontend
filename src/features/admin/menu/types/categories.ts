import type { PaginationMeta, MessageResponse } from '@/src/types/common'

// Re-export shared types for convenience
export type { PaginationMeta, MessageResponse }

// Category Status Types
export type CategorySortBy = 'name' | 'display_order' | 'created_at' | 'updated_at'
export type CategorySortOrder = 'asc' | 'desc'

// Main Category interface matching backend response
export interface Category {
  id: string
  tenant_id?: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  item_count: number
  created_at: string
  updated_at: string
}

// Category Statistics
export interface CategoryStats {
  total_categories: number
  active_categories: number
  hidden_categories: number
  total_menu_items: number
}

// Category List Response
export interface CategoryListResponse {
  success: boolean
  data: {
    categories: Category[]
    pagination: PaginationMeta
  }
}

// Category Stats Response
export interface CategoryStatsResponse {
  success: boolean
  data: CategoryStats
}

// Single Category Response
export interface CategoryResponse {
  success: boolean
  message?: string
  data: {
    category: Category
  }
}

// Create Category Payload
export interface CreateCategoryPayload {
  name: string
  description?: string
  is_active?: boolean
}

// Update Category Payload
export interface UpdateCategoryPayload {
  name?: string
  description?: string
  is_active?: boolean
}

// Category Query Parameters for GET /categories
export interface CategoryQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'all'
  sort_by?: CategorySortBy
  sort_order?: CategorySortOrder
  include_item_count?: boolean
}

// Reorder Categories Payload for PUT /categories/reorder
export interface ReorderCategoriesPayload {
  categories: Array<{
    id: string
    display_order: number
  }>
}

// Toggle Category Status Payload for PATCH /categories/{id}/status
export interface ToggleCategoryStatusPayload {
  is_active: boolean
}
