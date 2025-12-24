import type { QueryModifierGroupsParams, QueryModifiersParams } from '@/src/features/admin/menu/types/modifiers'

/**
 * Query key factory for modifiers
 * Follows the query key factory pattern for consistent cache management
 */
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
