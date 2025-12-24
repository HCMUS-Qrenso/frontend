import type { PaginationMeta, MessageResponse, SortOrder } from '@/src/types/common'

// Re-export for convenience
export type { PaginationMeta, MessageResponse, SortOrder }

// Modifier Types
export type ModifierGroupType = 'single_choice' | 'multiple_choice'
export type ModifierGroupSortBy = 'name' | 'display_order' | 'created_at' | 'updated_at'

// Main ModifierGroup interface matching backend response
export interface ModifierGroup {
  id: string
  tenant_id: string
  name: string
  type: ModifierGroupType
  is_required: boolean
  min_selections: number
  max_selections: number | null
  display_order: number
  used_by_count?: number
  modifiers?: Modifier[]
  created_at: string
  updated_at: string
}

// Modifier interface matching backend response
export interface Modifier {
  id: string
  modifier_group_id: string
  name: string
  price_adjustment: number
  is_available: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Note: Using PaginationMeta from common, extended version for modifiers
export interface ModifiersPaginationMeta extends PaginationMeta {
  has_next?: boolean
  has_prev?: boolean
}

// Modifier Group List Response
export interface ModifierGroupListResponse {
  success: boolean
  data: {
    modifier_groups: ModifierGroup[]
    pagination: PaginationMeta
  }
}

// Single Modifier Group Response
export interface ModifierGroupResponse {
  success: boolean
  data: {
    modifier_group: ModifierGroup
  }
}

// Modifiers List Response
export interface ModifiersListResponse {
  success: boolean
  data: {
    modifiers: Modifier[]
  }
}

// Create Modifier Group Payload
export interface CreateModifierGroupPayload {
  name: string
  type: ModifierGroupType
  is_required: boolean
  min_selections?: number
  max_selections?: number | null
  display_order?: number
}

// Update Modifier Group Payload
export interface UpdateModifierGroupPayload {
  name?: string
  type?: ModifierGroupType
  is_required?: boolean
  min_selections?: number
  max_selections?: number | null
  display_order?: number
}

// Create Modifier Payload
export interface CreateModifierPayload {
  name: string
  price_adjustment: number
  is_available: boolean
  display_order?: number
}

// Update Modifier Payload
export interface UpdateModifierPayload {
  name?: string
  price_adjustment?: number
  is_available?: boolean
  display_order?: number
}

// Reorder Modifier Groups Payload
export interface ReorderModifierGroupsPayload {
  modifier_groups: Array<{
    id: string
    display_order: number
  }>
}

// Reorder Modifiers Payload
export interface ReorderModifiersPayload {
  modifiers: Array<{
    id: string
    display_order: number
  }>
}

// Query Modifier Groups Parameters
export interface QueryModifierGroupsParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: ModifierGroupSortBy
  sort_order?: SortOrder
  include_usage_count?: boolean
}

// Query Modifiers Parameters
export interface QueryModifiersParams {
  include_unavailable?: boolean
  sort_by?: 'name' | 'display_order' | 'price_adjustment' | 'created_at'
  sort_order?: SortOrder
}


