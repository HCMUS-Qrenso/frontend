// Menu Item Status Types
export type MenuItemStatus = 'available' | 'unavailable' | 'sold_out'
export type MenuItemSortBy =
  | 'name'
  | 'base_price'
  | 'popularity_score'
  | 'created_at'
  | 'updated_at'
export type MenuItemSortOrder = 'asc' | 'desc'

// Nutritional Info interface
export interface NutritionalInfo {
  fat: number
  carbs: number
  protein: number
  calories: number
}

// Menu Item Category (nested object in API response)
export interface MenuItemCategory {
  id: string
  name: string
}

// Modifier within a modifier group
export interface Modifier {
  id: string
  name: string
  price_adjustment: string // Can be number or string like "+25000" or "-8000"
  is_available: boolean
  display_order: number
}

// Modifier Group for menu item customization
export interface ModifierGroup {
  id: string
  name: string
  type: 'single_choice' | 'multiple_choice'
  is_required: boolean
  min_selections: number
  max_selections: number
  display_order: number
  modifiers: Modifier[]
}

// Image object for menu item
export interface MenuItemImage {
  url: string
  is_primary?: boolean
}

// Main Menu Item interface matching backend response
export interface MenuItem {
  id: string
  name: string
  description: string | null
  base_price: string // Backend returns as string like "70000"
  preparation_time: number
  status: MenuItemStatus
  is_chef_recommendation: boolean
  allergen_info: string | null
  nutritional_info: NutritionalInfo
  popularity_score: number
  category: MenuItemCategory
  images: string[] // Array of image URLs
  modifier_groups?: ModifierGroup[] // Only in detailed response
  pairings?: any[] // For future use
  review_count: number
  order_count: number
  created_at: string
  updated_at: string
}

// Menu Item Statistics
export interface MenuItemStats {
  total_menu_items: number
  available_items: number
  unavailable_items: number
  chef_recommendations: number
}

// Pagination response
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

// Menu Item List Response
export interface MenuItemListResponse {
  success: boolean
  data: {
    menu_items: MenuItem[]
    pagination: PaginationMeta
  }
}

// Menu Item Stats Response
export interface MenuItemStatsResponse {
  success: boolean
  data: MenuItemStats
}

// Single Menu Item Response
export interface MenuItemResponse {
  success: boolean
  data: MenuItem
}

// Create Menu Item Payload
export interface CreateMenuItemPayload {
  name: string
  description?: string
  base_price: string
  preparation_time: number
  status?: MenuItemStatus
  is_chef_recommendation?: boolean
  allergen_info?: string
  category_id: string
  nutritional_info?: NutritionalInfo
  images?: string[]
}

// Update Menu Item Payload
export interface UpdateMenuItemPayload {
  name?: string
  description?: string
  base_price?: string
  preparation_time?: number
  status?: MenuItemStatus
  is_chef_recommendation?: boolean
  allergen_info?: string
  category_id?: string
  nutritional_info?: NutritionalInfo
  images?: string[]
  modifier_groups?: ModifierGroup[]
}

// Menu Item Query Parameters for GET /menu
export interface MenuItemQueryParams {
  page?: number
  limit?: number
  search?: string
  category_id?: string
  status?: MenuItemStatus
  is_chef_recommendation?: boolean
  sort_by?: MenuItemSortBy
  sort_order?: MenuItemSortOrder
}

// Message Response (for delete, create, update operations)
export interface MessageResponse {
  success: boolean
  message: string
  data?: {
    message: string
  }
}
