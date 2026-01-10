/**
 * Orders API Layer
 *
 * Handles all HTTP calls for orders feature.
 * Expected endpoints:
 * - GET /orders - List orders with filtering
 * - GET /orders/:id - Get order by ID
 * - PATCH /orders/:id/status - Update order status
 * - GET /orders/stats - Get order statistics
 * - POST /payments - Create payment for order
 * - POST /payments/:id/complete - Complete cash payment
 */

import { apiClient } from '@/src/lib/axios'
import type {
  OrderQueryParams,
  OrderListResponse,
  OrderDetailResponse,
  OrderStatsResponse,
  UpdateOrderStatusPayload,
} from '@/src/features/admin/orders/types'

export interface CreatePaymentPayload {
  orderId: string
  paymentMethod: 'cash' | 'qr'
  description?: string
  returnUrl?: string
}

export interface PaymentResponse {
  message?: string
  paymentId?: string
  paymentMethod?: string
  transactionId?: string
  checkoutUrl?: string
  paymentLinkId?: string
  amount?: number
  currency?: string
  status?: string
  qrCode?: string
  qrCodeData?: string
  createdAt?: string
}

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

  /**
   * Update order item status (waiter marks item as served)
   * Backend will auto-update order status when all items are served
   */
  updateItemStatus: async (
    orderId: string,
    itemId: string,
    status: string,
  ): Promise<{ success: boolean; data: { id: string; status: string } }> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/items/${itemId}/status`, { status })
    return data
  },

  /**
   * Create payment for order
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const { data } = await apiClient.post<PaymentResponse>('/payments', payload)
    return data
  },

  /**
   * Complete cash payment
   */
  completePayment: async (paymentId: string): Promise<PaymentResponse> => {
    const { data } = await apiClient.post<PaymentResponse>(`/payments/${paymentId}/complete`)
    return data
  },

  /**
   * Cancel payment
   */
  cancelPayment: async (paymentId: string, reason?: string): Promise<PaymentResponse> => {
    const { data } = await apiClient.delete<PaymentResponse>(`/payments/${paymentId}`, {
      params: reason ? { reason } : undefined,
    })
    return data
  },

  /**
   * Check payment status by transaction ID
   */
  checkPaymentStatus: async (transactionId: string): Promise<PaymentResponse> => {
    const { data } = await apiClient.get<PaymentResponse>(`/payments/check/${transactionId}`)
    return data
  },

  // ============================================
  // Voucher Operations
  // ============================================

  /**
   * Apply voucher to order (staff/waiter)
   */
  applyVoucher: async (
    orderId: string,
    voucherId: string,
    notes?: string,
  ): Promise<ApplyVoucherResponse> => {
    const { data } = await apiClient.post<ApplyVoucherResponse>(`/orders/${orderId}/vouchers/apply`, {
      voucherId,
      notes,
    })
    return data
  },

  /**
   * Revoke voucher from order (staff/waiter)
   */
  revokeVoucher: async (
    orderId: string,
    redemptionId: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/orders/${orderId}/vouchers/${redemptionId}`,
      { data: { reason } },
    )
    return data
  },
}

export interface ApplyVoucherResponse {
  success: boolean
  data: {
    redemptionId: string
    voucherCode: string
    voucherName: string
    discountAmount: number
  }
}
