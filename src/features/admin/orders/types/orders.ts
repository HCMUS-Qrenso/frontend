/**
 * Order Types for Admin Dashboard
 *
 * TODO: Implement when backend order endpoints are ready
 *
 * Expected types to implement:
 * - Order (main entity)
 * - OrderItem
 * - OrderStatus
 * - OrderQueryParams
 * - OrderListResponse
 * - OrderResponse
 * - CreateOrderPayload
 * - UpdateOrderPayload
 * - UpdateOrderStatusPayload
 */

import type { PaginationMeta } from '@/src/types/common'

// Re-export for convenience
export type { PaginationMeta }

// Order Status Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'

// Order Item interface
export interface OrderItem {
  id: string
  menu_item_id: string
  menu_item_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  modifiers?: Array<{
    id: string
    name: string
    price_adjustment: number
  }>
}

// Main Order interface (placeholder - update based on backend API)
export interface Order {
  id: string
  tenant_id: string
  table_id: string
  table_number: string
  order_number: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
}

// Query parameters for GET /orders
export interface OrderQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  table_id?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'updated_at' | 'total'
  sort_order?: 'asc' | 'desc'
}

// API Response Types (placeholder - update based on backend API)
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

// Mutation payloads (placeholder - update based on backend API)
export interface UpdateOrderStatusPayload {
  status: OrderStatus
}