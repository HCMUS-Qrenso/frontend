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

// Payment record (forward declaration for Order type)
export interface PaymentRecord {
  id: string
  status: string
  paymentMethod?: string
  amount: number
  currency?: string
  transactionId?: string
  qrCode?: string
  qrCodeData?: string
  paidAt?: string
  refundedAt?: string
  refundAmount?: number
  createdAt: string
}

// Order Item interface (matching actual backend response)
export interface OrderItem {
  id: string
  name: string // Direct name field from API
  quantity: number
  status: string
  subtotal: number
  // Optional fields that may be present
  unitPrice?: number
  modifiersTotal?: number
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

// Waiter info in order
export interface OrderWaiter {
  id: string
  fullName: string
}

// Customer info in order
export interface OrderCustomer {
  id: string
  fullName: string
  email?: string
}

// Main Order interface (matching actual backend response)
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  priority: OrderPriority
  paymentStatus: PaymentStatus
  table: OrderTable
  waiter?: OrderWaiter
  customer?: OrderCustomer
  items: OrderItem[]
  itemCount: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  specialInstructions?: string
  payments?: PaymentRecord[] // Added to support payment actions in list view
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

// API Response Types - matching actual backend structure
export interface OrderListResponse {
  success: boolean
  data: Order[] // Direct array, not nested
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
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
    totalOrders: number
    pendingOrders: number
    inProgressOrders: number
    completedToday: number
    todayRevenue: number
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

// ============================================
// Order Detail Types (for GET /orders/:id)
// ============================================

// Order Item with full details for detail page
export interface OrderDetailItem {
  id: string
  menuItem: {
    id: string
    name: string
    description?: string
    image?: string
  }
  quantity: number
  unitPrice: number
  modifiersTotal: number
  subtotal: number
  status: string
  specialInstructions?: string
  modifiers: Array<{
    id: string
    name: string
    priceAdjustment: number
  }>
  preparationStartedAt?: string
  preparationCompletedAt?: string
  servedAt?: string
  createdAt: string
}

// Status history entry
export interface StatusHistoryEntry {
  id: string
  fromStatus?: string
  toStatus: string
  notes?: string
  user?: {
    id: string
    fullName: string
  }
  createdAt: string
}

// Full Order Detail (for detail page)
export interface OrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  priority: OrderPriority
  paymentStatus: PaymentStatus
  table: OrderTable
  tableSession?: {
    id: string
    startedAt: string
    status: string
  }
  waiter?: OrderWaiter
  customer?: {
    id: string
    fullName: string
    email?: string
    phone?: string
  }
  items: OrderDetailItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  specialInstructions?: string
  rejectionReason?: string
  acceptedAt?: string
  completedAt?: string
  statusHistory: StatusHistoryEntry[]
  payments: PaymentRecord[]
  createdAt: string
  updatedAt: string
}

// API Response for order detail
export interface OrderDetailResponse {
  success: boolean
  message?: string
  data: OrderDetail
}
