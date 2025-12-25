/**
 * Orders API Layer
 *
 * TODO: Implement when backend order endpoints are ready
 *
 * Expected endpoints:
 * - GET /orders - List orders with filtering
 * - GET /orders/:id - Get order by ID
 * - PATCH /orders/:id/status - Update order status
 * - GET /orders/stats - Get order statistics
 */

import { apiClient } from '@/src/lib/axios'
import type {
  Order,
  OrderQueryParams,
  OrderListResponse,
  OrderResponse,
  UpdateOrderStatusPayload,
} from '@/src/features/admin/orders/types'

export const ordersApi = {
  /**
   * Get paginated list of orders
   * TODO: Implement when backend is ready
   */
  getOrders: async (params?: OrderQueryParams): Promise<OrderListResponse> => {
    const { data } = await apiClient.get<OrderListResponse>('/orders', { params })
    return data
  },

  /**
   * Get single order by ID
   * TODO: Implement when backend is ready
   */
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const { data } = await apiClient.get<OrderResponse>(`/orders/${id}`)
    return data
  },

  /**
   * Update order status
   * TODO: Implement when backend is ready
   */
  updateOrderStatus: async (
    id: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<OrderResponse> => {
    const { data } = await apiClient.patch<OrderResponse>(`/orders/${id}/status`, payload)
    return data
  },
}
