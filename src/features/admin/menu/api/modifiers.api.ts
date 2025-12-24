import { apiClient } from '@/src/lib/axios'
import type {
  ModifierGroup,
  ModifierGroupListResponse,
  ModifierGroupResponse,
  ModifiersListResponse,
  CreateModifierGroupPayload,
  UpdateModifierGroupPayload,
  CreateModifierPayload,
  UpdateModifierPayload,
  QueryModifierGroupsParams,
  QueryModifiersParams,
  ReorderModifierGroupsPayload,
  ReorderModifiersPayload,
  MessageResponse,
} from '@/src/features/admin/menu/types/modifiers'

export const modifiersApi = {
  // ============================================
  // MODIFIER GROUPS
  // ============================================

  /**
   * Get paginated list of modifier groups
   */
  getModifierGroups: async (
    params?: QueryModifierGroupsParams,
  ): Promise<ModifierGroupListResponse> => {
    const { data } = await apiClient.get<ModifierGroupListResponse>('/modifier-groups', {
      params,
    })
    return data
  },

  /**
   * Get a specific modifier group by ID with its modifiers
   */
  getModifierGroup: async (id: string, includeModifiers = true): Promise<ModifierGroupResponse> => {
    const { data } = await apiClient.get<ModifierGroupResponse>(`/modifier-groups/${id}`, {
      params: { include_modifiers: includeModifiers },
    })
    return data
  },

  /**
   * Create a new modifier group
   */
  createModifierGroup: async (
    payload: CreateModifierGroupPayload,
  ): Promise<ModifierGroupResponse> => {
    const { data } = await apiClient.post<ModifierGroupResponse>('/modifier-groups', payload)
    return data
  },

  /**
   * Update a modifier group
   */
  updateModifierGroup: async (
    id: string,
    payload: UpdateModifierGroupPayload,
  ): Promise<ModifierGroupResponse> => {
    const { data } = await apiClient.patch<ModifierGroupResponse>(`/modifier-groups/${id}`, payload)
    return data
  },

  /**
   * Delete a modifier group
   */
  deleteModifierGroup: async (id: string, force = false): Promise<MessageResponse> => {
    const params = force ? { force } : undefined
    const { data } = await apiClient.delete<MessageResponse>(`/modifier-groups/${id}`, {
      params,
    })
    return data
  },

  /**
   * Reorder modifier groups display order
   */
  reorderModifierGroups: async (
    payload: ReorderModifierGroupsPayload,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.put<MessageResponse>('/modifier-groups/reorder', payload)
    return data
  },

  // ============================================
  // MODIFIERS
  // ============================================

  /**
   * Get modifiers within a specific group
   */
  getModifiers: async (
    groupId: string,
    params?: QueryModifiersParams,
  ): Promise<ModifiersListResponse> => {
    const { data } = await apiClient.get<ModifiersListResponse>(
      `/modifier-groups/${groupId}/modifiers`,
      { params },
    )
    return data
  },

  /**
   * Create a new modifier in a group
   */
  createModifier: async (
    groupId: string,
    payload: CreateModifierPayload,
  ): Promise<{ success: boolean; data: { modifier: ModifierGroup } }> => {
    const { data } = await apiClient.post<{ success: boolean; data: { modifier: ModifierGroup } }>(
      `/modifier-groups/${groupId}/modifiers`,
      payload,
    )
    return data
  },

  /**
   * Update a modifier
   */
  updateModifier: async (
    id: string,
    payload: UpdateModifierPayload,
  ): Promise<{ success: boolean; data: { modifier: ModifierGroup } }> => {
    const { data } = await apiClient.patch<{ success: boolean; data: { modifier: ModifierGroup } }>(
      `/modifiers/${id}`,
      payload,
    )
    return data
  },

  /**
   * Delete a modifier
   */
  deleteModifier: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/modifiers/${id}`)
    return data
  },

  /**
   * Reorder modifiers within a group
   */
  reorderModifiers: async (
    groupId: string,
    payload: ReorderModifiersPayload,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.put<MessageResponse>(
      `/modifier-groups/${groupId}/modifiers/reorder`,
      payload,
    )
    return data
  },
}
