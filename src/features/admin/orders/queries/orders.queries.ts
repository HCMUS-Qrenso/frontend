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
 * - useCreatePaymentMutation - Create payment for order
 */

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  ordersApi,
  type CreatePaymentPayload,
  type PaymentResponse,
} from '@/src/features/admin/orders/api'
import type {
  Order,
  OrderQueryParams,
  OrderListResponse,
  OrderDetailResponse,
  OrderStatsResponse,
  OrderDetail,
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
  return useQuery<OrderDetailResponse>({
    queryKey: ordersQueryKeys.detail(id!),
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: enabled && !!id,
    staleTime: 10 * 1000,
  })
}

/**
 * Get order statistics
 */
export const useOrderStatsQuery = (enabled = true) => {
  return useQuery<OrderStatsResponse>({
    queryKey: ordersQueryKeys.stats(),
    queryFn: () => ordersApi.getOrderStats(),
    enabled,
    staleTime: 30 * 1000,
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

  return useMutation<OrderDetailResponse, Error, { id: string; payload: UpdateOrderStatusPayload }>(
    {
      mutationFn: ({ id, payload }) => ordersApi.updateOrderStatus(id, payload),
      onSuccess: (_, { id }) => {
        // Invalidate order list and detail queries
        queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: ordersQueryKeys.stats() })
      },
    },
  )
}

/**
 * Update order item status (mark as served)
 * Backend auto-updates order status when all items are served
 */
export const useUpdateOrderItemStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { id: string; status: string } },
    Error,
    { orderId: string; itemId: string; status: string }
  >({
    mutationFn: ({ orderId, itemId, status }) =>
      ordersApi.updateItemStatus(orderId, itemId, status),
    onSuccess: (_, { orderId }) => {
      // Invalidate order detail to refresh items and potentially order status
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
    },
  })
}

/**
 * Create payment for order
 */
export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<PaymentResponse, Error, CreatePaymentPayload>({
    mutationFn: (payload) => ordersApi.createPayment(payload),
    onSuccess: (data, variables) => {
      // Invalidate order queries to refresh payment status
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.stats() })

      // Note: Cash payments are NOT auto-completed
      // Waiter must manually complete after receiving money
    },
  })
}

/**
 * Complete cash payment
 */
export const useCompletePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<PaymentResponse, Error, string>({
    mutationFn: (paymentId) => ordersApi.completePayment(paymentId),
    onSuccess: () => {
      // Invalidate order queries to refresh payment status
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
    },
  })
}

/**
 * Cancel payment
 */
export const useCancelPaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<PaymentResponse, Error, { paymentId: string; reason?: string }>({
    mutationFn: ({ paymentId, reason }) => ordersApi.cancelPayment(paymentId, reason),
    onSuccess: () => {
      // Invalidate order queries to refresh payment status
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
    },
  })
}

/**
 * Check payment status
 */
export const useCheckPaymentStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<PaymentResponse, Error, string>({
    mutationFn: (orderCode) => ordersApi.checkPaymentStatus(orderCode),
    onSuccess: () => {
      // Invalidate order queries to refresh payment status
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
    },
  })
}
