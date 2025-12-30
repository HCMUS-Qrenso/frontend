/**
 * Order Types for Admin Dashboard
 * Updated to match backend API response format
 */

import type { PaginationMeta } from '@/src/types/common'

// Re-export for convenience
export type { PaginationMeta }

// Order Status Types (matching backend)
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'in_progress'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'abandoned'

// Payment Status Types
export type PaymentStatus = 'unpaid' | 'paid' | 'partial'

// Order Priority Types
export type OrderPriority = 'normal' | 'high' | 'rush'

// Order Item interface (matching backend response)
export interface OrderItem {
  id: string
  menuItem: {
    id: string
    name: string
    description?: string
    images?: Array<{ imageUrl: string }>
  }
  quantity: number
  unitPrice: number
  modifiersTotal: number
  subtotal: number
  status: string
  specialInstructions?: string
  modifiers?: Array<{
    id: string
    modifierName: string
    priceAdjustment: number
  }>
}

// Table info in order
export interface OrderTable {
  id: string
  tableNumber: string
  zone?: {
    id: string
    name: string
  }
}

// Main Order interface (matching backend response)
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  priority: OrderPriority
  paymentStatus: PaymentStatus
  table: OrderTable
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

// Query parameters for GET /orders
export interface OrderQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  table_id?: string
  date_from?: string
  date_to?: string
  sort_by?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber'
  sort_order?: 'asc' | 'desc'
}

// API Response Types
export interface OrderListResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: PaginationMeta
  }
}

export interface OrderResponse {
  success: boolean
  message?: string
  data: Order
}

export interface OrderStatsResponse {
  success: boolean
  data: {
    pending: number
    accepted: number
    preparing: number
    ready: number
    served: number
    completed: number
    cancelled: number
    totalToday: number
    revenueToday: number
  }
}

// Mutation payloads
export interface UpdateOrderStatusPayload {
  status: OrderStatus
  notes?: string
}

export interface UpdateOrderItemStatusPayload {
  status: string
}
