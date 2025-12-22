import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { menuItemsApi } from '@/lib/api/menu-items'
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
} from '@/types/menu-items'
import type { MessageResponse } from '@/types/auth'
import { categoriesQueryKeys } from './use-categories-query'
import { modifiersQueryKeys } from './use-modifiers-query'

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
      // Invalidate list and stats queries, and also modifiers
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.stats() })
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
      // Invalidate list and stats queries, and also modifiers
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.stats() })
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
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
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.groups.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
    },
  })
}

// Export Menu Mutation - Downloads file
export const useExportMenuMutation = () => {
  return useMutation<void, unknown, ExportMenuParams>({
    mutationFn: async (params) => {
      const blob = await menuItemsApi.exportMenu(params)
      // Trigger file download
      const url = URL.createObjectURL(blob)
      const filename = `menu-export-${new Date().toISOString().split('T')[0]}.${params.format || 'csv'}`
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

// Import Menu Mutation
export const useImportMenuMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ImportMenuResult, unknown, { file: File; mode: ImportMenuMode }>({
    mutationFn: ({ file, mode }) => menuItemsApi.importMenu(file, mode),
    onSuccess: () => {
      // Invalidate menu items, categories and modifiers (import may create categories)
      queryClient.invalidateQueries({ queryKey: menuItemsQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: modifiersQueryKeys.all })
    },
  })
}
