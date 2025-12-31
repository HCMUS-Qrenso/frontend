/**
 * Orders API Layer
 *
 * Handles all HTTP calls for orders feature.
 * Expected endpoints:
 * - GET /orders - List orders with filtering
 * - GET /orders/:id - Get order by ID
 * - PATCH /orders/:id/status - Update order status
 * - GET /orders/stats - Get order statistics
 */

import { apiClient } from '@/src/lib/axios'
import type {
  OrderQueryParams,
  OrderListResponse,
  OrderDetailResponse,
  OrderStatsResponse,
  UpdateOrderStatusPayload,
} from '@/src/features/admin/orders/types'

export const ordersApi = {
  /**
   * Get paginated list of orders
   */
  getOrders: async (params?: OrderQueryParams): Promise<OrderListResponse> => {
    const { data } = await apiClient.get<OrderListResponse>('/orders', { params })
    return data
  },

  /**
   * Get single order by ID (returns full detail with statusHistory and payments)
   */
  getOrderById: async (id: string): Promise<OrderDetailResponse> => {
    const { data } = await apiClient.get<OrderDetailResponse>(`/orders/${id}`)
    return data
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStatsResponse> => {
    const { data } = await apiClient.get<OrderStatsResponse>('/orders/stats')
    return data
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    id: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<OrderDetailResponse> => {
    const { data } = await apiClient.patch<OrderDetailResponse>(`/orders/${id}/status`, payload)
    return data
  },
}
