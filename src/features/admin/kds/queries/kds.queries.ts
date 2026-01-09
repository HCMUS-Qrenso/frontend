/**
 * KDS Query Hooks
 *
 * React Query hooks for Kitchen Display System
 * - useKdsOrdersQuery - Fetch active orders with auto-polling
 * - useUpdateItemStatusMutation - Update item status with optimistic update
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { kdsApi } from '../api/kds.api'
import { kdsQueryKeys } from './kds.keys'
import type { KdsFilters, KdsOrdersResponse, OrderItemStatus } from '../types/kds.types'
import { ordersQueryKeys } from '../../orders/queries'

// Re-export query keys
export { kdsQueryKeys }

/**
 * Fetch KDS orders with auto-polling
 * Polls every 30 seconds as fallback (WebSocket handles real-time updates)
 */
export function useKdsOrdersQuery(filters?: KdsFilters, enabled = true) {
  return useQuery<KdsOrdersResponse>({
    queryKey: kdsQueryKeys.orders(filters),
    queryFn: () => kdsApi.getKdsOrders(filters),
    enabled,
    refetchInterval: 30000, // 30s fallback polling (socket handles real-time)
    staleTime: 10000,
    placeholderData: keepPreviousData,
  })
}

/**
 * Update item status mutation with optimistic update
 */
export function useUpdateItemStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      newStatus,
    }: {
      orderId: string
      itemId: string
      newStatus: OrderItemStatus
    }) => kdsApi.updateItemStatus(orderId, itemId, newStatus),

    onMutate: async ({ itemId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kdsQueryKeys.all })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<KdsOrdersResponse>(kdsQueryKeys.orders())

      // Optimistically update the cache
      if (previousData) {
        queryClient.setQueryData<KdsOrdersResponse>(kdsQueryKeys.orders(), {
          ...previousData,
          data: {
            orders: previousData.data.orders.map((order) => ({
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, status: newStatus } : item,
              ),
            })),
          },
        })
      }

      return { previousData }
    },

    onError: (_err, _payload, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(kdsQueryKeys.orders(), context.previousData)
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: kdsQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
    },
  })
}

/**
 * Mark all items in order as ready
 */
export function useMarkOrderReadyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => kdsApi.markOrderReady(orderId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kdsQueryKeys.all })
    },
  })
}
