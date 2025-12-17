import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { menuItemsApi } from '@/lib/api/menu-items'
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

// Query Keys
export const menuItemsQueryKeys = {
  all: ['menu-items'] as const,
  lists: () => [...menuItemsQueryKeys.all, 'list'] as const,
  list: (params?: MenuItemQueryParams) => [...menuItemsQueryKeys.lists(), params] as const,
  detail: (id: string) => [...menuItemsQueryKeys.all, 'detail', id] as const,
  stats: () => [...menuItemsQueryKeys.all, 'stats'] as const,
}

// Query Hooks
export const useMenuItemsQuery = (params?: MenuItemQueryParams, enabled = true) => {
  return useQuery<MenuItemListResponse>({
    queryKey: menuItemsQueryKeys.list(params),
    queryFn: () => menuItemsApi.getMenuItems(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useMenuItemsStatsQuery = (enabled = true) => {
  return useQuery<MenuItemStatsResponse>({
    queryKey: menuItemsQueryKeys.stats(),
    queryFn: () => menuItemsApi.getMenuItemsStats(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useMenuItemQuery = (id: string | null, enabled = true) => {
  return useQuery<MenuItemResponse>({
    queryKey: menuItemsQueryKeys.detail(id!),
    queryFn: () => menuItemsApi.getMenuItem(id!),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  })
}

// Mutation Hooks
export const useCreateMenuItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MenuItemResponse, unknown, CreateMenuItemPayload>({
    mutationFn: (payload) => menuItemsApi.createMenuItem(payload),
    onSuccess: () => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.stats() })
    },
  })
}

export const useUpdateMenuItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MenuItemResponse, unknown, { id: string; payload: UpdateMenuItemPayload }>({
    mutationFn: ({ id, payload }) => menuItemsApi.updateMenuItem(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific menu item in cache
      queryClient.setQueryData(menuItemsQueryKeys.detail(variables.id), data)
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.stats() })
    },
  })
}

export const useDeleteMenuItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, string>({
    mutationFn: (id) => menuItemsApi.deleteMenuItem(id),
    onSuccess: () => {
      // Invalidate all menu item queries
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.all })
    },
  })
}
