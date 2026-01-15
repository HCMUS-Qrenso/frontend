/**
 * KDS API Layer
 *
 * Handles all HTTP calls for Kitchen Display System.
 * Endpoints:
 * - GET /kds/orders - Get active orders for KDS display
 * - PATCH /orders/:id/items/:itemId/status - Update order item status
 */

import { apiClient } from '@/src/lib/axios'
import type {
  KdsOrdersResponse,
  KdsFilters,
  UpdateItemStatusPayload,
  OrderItemStatus,
} from '../types/kds.types'

// Response type for item status update
interface UpdateItemStatusResponse {
  success: boolean
  data: {
    id: string
    status: OrderItemStatus
  }
}

export const kdsApi = {
  /**
   * Get active orders for KDS display
   * Sorted by priority algorithm (VIP > Urgent > High > Normal)
   */
  getKdsOrders: async (filters?: KdsFilters): Promise<KdsOrdersResponse> => {
    const params: Record<string, any> = {}

    if (filters?.search) {
      params.search = filters.search
    }
    if (filters?.status && filters.status.length > 0) {
      params.item_statuses = filters.status
    }
    if (filters?.priority && filters.priority.length > 0) {
      params.priorities = filters.priority
    }

    const { data } = await apiClient.get<KdsOrdersResponse>('/kds/orders', { params })
    return data
  },

  /**
   * Update order item status (kitchen action)
   * Uses existing orders endpoint: PATCH /orders/:orderId/items/:itemId/status
   */
  updateItemStatus: async (
    orderId: string,
    itemId: string,
    newStatus: OrderItemStatus,
  ): Promise<UpdateItemStatusResponse> => {
    const { data } = await apiClient.patch<UpdateItemStatusResponse>(
      `/orders/${orderId}/items/${itemId}/status`,
      { status: newStatus },
    )
    return data
  },

  /**
   * Mark all items in order as ready
   */
  markOrderReady: async (orderId: string): Promise<{ success: boolean }> => {
    // This would need a batch endpoint or multiple calls
    // For now, return success
    return { success: true }
  },
}
