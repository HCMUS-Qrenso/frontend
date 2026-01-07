// KDS Types - Aligned with database schema (backend/prisma/schema.prisma)

// Order status from DB
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'ready'
  | 'served'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'abandoned'

// OrderItem status from DB
export type OrderItemStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'returned'

// Priority levels from DB
export type OrderPriority = 'normal' | 'high' | 'urgent' | 'vip'

// KDS OrderItem - matches OrderItem model with joined fields
export interface KdsOrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItemName: string // Joined from MenuItem.name
  quantity: number
  status: OrderItemStatus
  specialInstructions: string | null
  estimatedPrepTime: number | null // From MenuItem.preparationTime
  preparationStartedAt: string | null // ISO string from API
  preparationCompletedAt: string | null // ISO string from API
  servedAt: string | null // ISO string from API
  cancellationReason: string | null
  allergenInfo: string | null // From MenuItem.allergenInfo
  modifiers: KdsOrderItemModifier[] // Joined modifiers
  createdAt: string // ISO string from API
}

// KDS OrderItem Modifier
export interface KdsOrderItemModifier {
  id: string
  modifierName: string
  priceAdjustment: number
}

// KDS Order - matches Order model with joined fields
export interface KdsOrder {
  id: string
  orderNumber: string
  tableId: string
  tableNumber: string // Joined from Table.tableNumber
  zoneName: string | null // Joined from Zone.name
  waiterId: string | null
  waiterName: string | null // Joined from User.fullName
  status: OrderStatus
  priority: OrderPriority
  specialInstructions: string | null
  createdAt: string // ISO string from API
  updatedAt: string // ISO string from API
  items: KdsOrderItem[]
}

// API Response types
export interface KdsOrdersResponse {
  data: {
    orders: KdsOrder[]
  }
  meta: {
    total: number
    activeCount: number
    overdueCount: number
  }
}

// Filter parameters for KDS
export interface KdsFilters {
  status?: OrderItemStatus[]
  priority?: OrderPriority[]
  search?: string
}

// Update item status payload
export interface UpdateItemStatusPayload {
  itemId: string
  newStatus: OrderItemStatus
}

// Priority weight for sorting (lower = higher priority)
export const PRIORITY_WEIGHT: Record<OrderPriority, number> = {
  vip: 1,
  urgent: 2,
  high: 3,
  normal: 4,
}

// Item status display config
export const ITEM_STATUS_CONFIG: Record<
  OrderItemStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  accepted: {
    label: 'Đã nhận',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/10',
  },
  preparing: {
    label: 'Đang làm',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-500/10',
  },
  ready: {
    label: 'Sẵn sàng',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/10',
  },
  served: {
    label: 'Đã phục vụ',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-500/10',
  },
  cancelled: {
    label: 'Đã huỷ',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-500/10',
  },
  returned: {
    label: 'Trả lại',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-500/10',
  },
}

// Priority display config
export const PRIORITY_CONFIG: Record<
  OrderPriority,
  { label: string; color: string; borderColor: string }
> = {
  normal: {
    label: 'Normal',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
  high: {
    label: 'High',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  vip: {
    label: 'VIP',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
}
