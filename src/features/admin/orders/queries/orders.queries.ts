/**
 * Orders Query Hooks
 *
 * TODO: Implement when backend order endpoints are ready
 *
 * Expected hooks:
 * - useOrdersQuery - Fetch paginated orders list
 * - useOrderQuery - Fetch single order by ID
 * - useOrderStatsQuery - Fetch order statistics
 * - useUpdateOrderStatusMutation - Update order status
 */

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { ordersApi } from '@/src/features/admin/orders/api'
import type {
  Order,
  OrderQueryParams,
  OrderListResponse,
  OrderResponse,
  UpdateOrderStatusPayload,
} from '@/src/features/admin/orders/types'

// Import and re-export query keys from dedicated keys file
export { ordersQueryKeys } from './orders.keys'
import { ordersQueryKeys } from './orders.keys'

// ============================================
// Query Hooks
// ============================================

/**
 * Get paginated list of orders
 */
export const useOrdersQuery = (params?: OrderQueryParams, enabled = true) => {
  return useQuery<OrderListResponse>({
    queryKey: ordersQueryKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
    enabled,
    staleTime: 10 * 1000,
    placeholderData: keepPreviousData,
  })
}

/**
 * Get single order by ID
 */
export const useOrderQuery = (id: string | null, enabled = true) => {
  return useQuery<OrderResponse>({
    queryKey: ordersQueryKeys.detail(id!),
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: enabled && !!id,
    staleTime: 10 * 1000,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Update order status
 */
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<OrderResponse, Error, { id: string; payload: UpdateOrderStatusPayload }>({
    mutationFn: ({ id, payload }) => ordersApi.updateOrderStatus(id, payload),
    onSuccess: (_, { id }) => {
      // Invalidate order list and detail queries
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.stats() })
    },
  })
}
