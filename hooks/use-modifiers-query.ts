import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { modifiersApi } from '@/lib/api/modifiers'
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
} from '@/types/modifiers'

// ============================================
// QUERY KEYS
// ============================================

export const modifiersQueryKeys = {
  all: ['modifiers'] as const,
  groups: {
    all: () => [...modifiersQueryKeys.all, 'groups'] as const,
    lists: () => [...modifiersQueryKeys.groups.all(), 'list'] as const,
    list: (params?: QueryModifierGroupsParams) =>
      [...modifiersQueryKeys.groups.lists(), params] as const,
    detail: (id: string) => [...modifiersQueryKeys.groups.all(), 'detail', id] as const,
  },
  modifiers: {
    all: () => [...modifiersQueryKeys.all, 'items'] as const,
    list: (groupId: string, params?: QueryModifiersParams) =>
      [...modifiersQueryKeys.modifiers.all(), 'list', groupId, params] as const,
  },
}

// ============================================
// QUERY HOOKS - MODIFIER GROUPS
// ============================================

/**
 * Fetch paginated list of modifier groups
 */
export const useModifierGroupsQuery = (params?: QueryModifierGroupsParams, enabled = true) => {
  return useQuery<ModifierGroupListResponse>({
    queryKey: modifiersQueryKeys.groups.list(params),
    queryFn: () => modifiersApi.getModifierGroups(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch a single modifier group by ID
 */
export const useModifierGroupQuery = (
  id: string | null,
  includeModifiers = true,
  enabled = true,
) => {
  return useQuery<ModifierGroupResponse>({
    queryKey: modifiersQueryKeys.groups.detail(id!),
    queryFn: () => modifiersApi.getModifierGroup(id!, includeModifiers),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  })
}

// ============================================
// QUERY HOOKS - MODIFIERS
// ============================================

/**
 * Fetch modifiers for a specific group
 */
export const useModifiersQuery = (
  groupId: string | null,
  params?: QueryModifiersParams,
  enabled = true,
) => {
  return useQuery<ModifiersListResponse>({
    queryKey: modifiersQueryKeys.modifiers.list(groupId!, params),
    queryFn: () => modifiersApi.getModifiers(groupId!, params),
    enabled: enabled && !!groupId,
    staleTime: 30 * 1000,
  })
}

// ============================================
// MUTATION HOOKS - MODIFIER GROUPS
// ============================================

/**
 * Create a new modifier group
 */
export const useCreateModifierGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ModifierGroupResponse, unknown, CreateModifierGroupPayload>({
    mutationFn: (payload) => modifiersApi.createModifierGroup(payload),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
    },
  })
}

/**
 * Update a modifier group
 */
export const useUpdateModifierGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ModifierGroupResponse,
    unknown,
    { id: string; payload: UpdateModifierGroupPayload }
  >({
    mutationFn: ({ id, payload }) => modifiersApi.updateModifierGroup(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific group in cache
      queryClient.setQueryData(modifiersQueryKeys.groups.detail(variables.id), data)
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
    },
  })
}

/**
 * Delete a modifier group
 */
export const useDeleteModifierGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, { id: string; force?: boolean }>({
    mutationFn: ({ id, force }) => modifiersApi.deleteModifierGroup(id, force),
    onSuccess: () => {
      // Invalidate all modifier group queries
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.all() })
    },
  })
}

/**
 * Reorder modifier groups
 */
export const useReorderModifierGroupsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, ReorderModifierGroupsPayload>({
    mutationFn: (payload) => modifiersApi.reorderModifierGroups(payload),
    onSuccess: () => {
      // Invalidate list queries to refresh the order
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
    },
  })
}

// ============================================
// MUTATION HOOKS - MODIFIERS
// ============================================

/**
 * Create a new modifier
 */
export const useCreateModifierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { modifier: ModifierGroup } },
    unknown,
    { groupId: string; payload: CreateModifierPayload }
  >({
    mutationFn: ({ groupId, payload }) => modifiersApi.createModifier(groupId, payload),
    onSuccess: (data, variables) => {
      // Invalidate ALL modifiers lists for this group (regardless of params)
      queryClient.invalidateQueries({
        queryKey: [...modifiersQueryKeys.modifiers.all(), 'list', variables.groupId],
      })
      // Also invalidate the group detail to update modifiers array
      queryClient.invalidateQueries({
        queryKey: modifiersQueryKeys.groups.detail(variables.groupId),
      })
    },
  })
}

/**
 * Update a modifier
 */
export const useUpdateModifierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { modifier: ModifierGroup } },
    unknown,
    { id: string; groupId: string; payload: UpdateModifierPayload }
  >({
    mutationFn: ({ id, payload }) => modifiersApi.updateModifier(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate ALL modifiers lists for this group (regardless of params)
      queryClient.invalidateQueries({
        queryKey: [...modifiersQueryKeys.modifiers.all(), 'list', variables.groupId],
      })
      // Also invalidate the group detail
      queryClient.invalidateQueries({
        queryKey: modifiersQueryKeys.groups.detail(variables.groupId),
      })
    },
  })
}

/**
 * Delete a modifier
 */
export const useDeleteModifierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, { id: string; groupId: string }>({
    mutationFn: ({ id }) => modifiersApi.deleteModifier(id),
    onSuccess: (data, variables) => {
      // Invalidate ALL modifiers lists for this group (regardless of params)
      queryClient.invalidateQueries({
        queryKey: [...modifiersQueryKeys.modifiers.all(), 'list', variables.groupId],
      })
      // Also invalidate the group detail
      queryClient.invalidateQueries({
        queryKey: modifiersQueryKeys.groups.detail(variables.groupId),
      })
    },
  })
}

/**
 * Reorder modifiers within a group
 */
export const useReorderModifiersMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    MessageResponse,
    unknown,
    { groupId: string; payload: ReorderModifiersPayload }
  >({
    mutationFn: ({ groupId, payload }) => modifiersApi.reorderModifiers(groupId, payload),
    onSuccess: (data, variables) => {
      // Invalidate ALL modifiers lists for this group to refresh the order (regardless of params)
      queryClient.invalidateQueries({
        queryKey: [...modifiersQueryKeys.modifiers.all(), 'list', variables.groupId],
      })
    },
  })
}

/**
 * Toggle modifier availability
 */
export const useToggleModifierAvailabilityMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { modifier: ModifierGroup } },
    unknown,
    { id: string; groupId: string; is_available: boolean }
  >({
    mutationFn: ({ id, is_available }) => modifiersApi.updateModifier(id, { is_available }),
    onSuccess: (data, variables) => {
      // Invalidate ALL modifiers lists for this group (regardless of params)
      queryClient.invalidateQueries({
        queryKey: [...modifiersQueryKeys.modifiers.all(), 'list', variables.groupId],
      })
    },
  })
}
