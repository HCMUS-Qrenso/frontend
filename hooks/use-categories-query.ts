import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
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
} from '@/types/categories'
import type { MessageResponse } from '@/types/auth'

// Query Keys
export const categoriesQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesQueryKeys.all, 'list'] as const,
  list: (params?: CategoryQueryParams) => [...categoriesQueryKeys.lists(), params] as const,
  detail: (id: string) => [...categoriesQueryKeys.all, 'detail', id] as const,
  stats: () => [...categoriesQueryKeys.all, 'stats'] as const,
}

// Query Hooks
export const useCategoriesQuery = (params?: CategoryQueryParams, enabled = true) => {
  return useQuery<CategoryListResponse>({
    queryKey: categoriesQueryKeys.list(params),
    queryFn: () => categoriesApi.getCategories(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useCategoriesStatsQuery = (enabled = true) => {
  return useQuery<CategoryStatsResponse>({
    queryKey: categoriesQueryKeys.stats(),
    queryFn: () => categoriesApi.getCategoriesStats(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useCategoryQuery = (id: string | null, enabled = true) => {
  return useQuery<CategoryResponse>({
    queryKey: categoriesQueryKeys.detail(id!),
    queryFn: () => categoriesApi.getCategory(id!),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  })
}

// Mutation Hooks
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CategoryResponse, unknown, CreateCategoryPayload>({
    mutationFn: (payload) => categoriesApi.createCategory(payload),
    onSuccess: () => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.stats() })
    },
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CategoryResponse, unknown, { id: string; payload: UpdateCategoryPayload }>({
    mutationFn: ({ id, payload }) => categoriesApi.updateCategory(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific category in cache
      queryClient.setQueryData(categoriesQueryKeys.detail(variables.id), data)
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.stats() })
    },
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, { id: string; force?: boolean }>({
    mutationFn: ({ id, force }) => categoriesApi.deleteCategory(id, force),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all })
    },
  })
}

export const useReorderCategoriesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, unknown, ReorderCategoriesPayload>({
    mutationFn: (payload) => categoriesApi.reorderCategories(payload),
    onSuccess: () => {
      // Invalidate list queries to refresh the order
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
    },
  })
}

export const useToggleCategoryStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CategoryResponse,
    unknown,
    { id: string; payload: ToggleCategoryStatusPayload }
  >({
    mutationFn: ({ id, payload }) => categoriesApi.toggleCategoryStatus(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific category in cache
      queryClient.setQueryData(categoriesQueryKeys.detail(variables.id), data)
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.stats() })
    },
  })
}
