'use client'

import { cn } from '@/src/lib/utils'

export interface StatusConfig {
  label: string
  className: string
}

export interface StatusBadgeProps {
  status: string
  config: Record<string, StatusConfig>
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Reusable status badge component that renders consistent badge styling
 * across different status types (order status, table status, user status, etc.)
 */
export function StatusBadge({ status, config, size = 'sm', className }: StatusBadgeProps) {
  const statusConfig = config[status]

  if (!statusConfig) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400',
          className,
        )}
      >
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        statusConfig.className,
        className,
      )}
    >
      {statusConfig.label}
    </span>
  )
}

// Pre-defined status configs for common use cases
// Use factory functions to create localized configs

// Factory function types
export interface TableStatusLabels {
  available: string
  occupied: string
  reserved: string
  maintenance: string
}

export interface UserStatusLabels {
  active: string
  inactive: string
  suspended: string
}

export interface UserRoleLabels {
  waiter: string
  kitchen_staff: string
}

export interface ZoneActiveLabels {
  active: string
  inactive: string
}

export interface OrderStatusLabels {
  new: string
  accepted: string
  preparing: string
  ready: string
  served: string
  completed: string
  cancelled: string
}

export interface MenuItemStatusLabels {
  available: string
  sold_out: string
  unavailable: string
}

export interface PaymentStatusLabels {
  unpaid: string
  paid: string
  partial: string
}

export interface CategoryActiveLabels {
  active: string
  hidden: string
}

// Factory functions for creating translated status configs
export function createTableStatusConfig(labels: TableStatusLabels): Record<string, StatusConfig> {
  return {
    available: {
      label: labels.available,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    occupied: {
      label: labels.occupied,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    reserved: {
      label: labels.reserved,
      className:
        'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
    },
    maintenance: {
      label: labels.maintenance,
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }
}

export function createUserStatusConfig(labels: UserStatusLabels): Record<string, StatusConfig> {
  return {
    active: {
      label: labels.active,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    inactive: {
      label: labels.inactive,
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
    suspended: {
      label: labels.suspended,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
  }
}

export function createUserRoleConfig(labels: UserRoleLabels): Record<string, StatusConfig> {
  return {
    waiter: {
      label: labels.waiter,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    kitchen_staff: {
      label: labels.kitchen_staff,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
  }
}

export function createZoneActiveConfig(labels: ZoneActiveLabels): Record<string, StatusConfig> {
  return {
    active: {
      label: labels.active,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    inactive: {
      label: labels.inactive,
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }
}

export function createOrderStatusConfig(labels: OrderStatusLabels): Record<string, StatusConfig> {
  return {
    new: {
      label: labels.new,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    accepted: {
      label: labels.accepted,
      className:
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    },
    preparing: {
      label: labels.preparing,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    ready: {
      label: labels.ready,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    served: {
      label: labels.served,
      className:
        'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
    },
    completed: {
      label: labels.completed,
      className:
        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
    cancelled: {
      label: labels.cancelled,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
  }
}

export function createMenuItemStatusConfig(
  labels: MenuItemStatusLabels,
): Record<string, StatusConfig> {
  return {
    available: {
      label: labels.available,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    sold_out: {
      label: labels.sold_out,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    unavailable: {
      label: labels.unavailable,
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }
}

export function createPaymentStatusConfig(
  labels: PaymentStatusLabels,
): Record<string, StatusConfig> {
  return {
    unpaid: {
      label: labels.unpaid,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
    paid: {
      label: labels.paid,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    partial: {
      label: labels.partial,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
  }
}

export function createCategoryActiveConfig(
  labels: CategoryActiveLabels,
): Record<string, StatusConfig> {
  return {
    active: {
      label: labels.active,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    hidden: {
      label: labels.hidden,
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }
}

// DEPRECATED: These static configs use hardcoded Vietnamese. Use factory functions instead.
// Keeping for backwards compatibility, but should migrate to factory functions.
export const ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  new: {
    label: 'Mới',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  accepted: {
    label: 'Đã nhận',
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  },
  preparing: {
    label: 'Chuẩn bị',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  ready: {
    label: 'Sẵn sàng',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  served: {
    label: 'Đã phục vụ',
    className:
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  },
  completed: {
    label: 'Hoàn tất',
    className:
      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
  cancelled: {
    label: 'Đã hủy',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
}

export const TABLE_STATUS_CONFIG: Record<string, StatusConfig> = {
  available: {
    label: 'Trống',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  occupied: {
    label: 'Đang sử dụng',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  reserved: {
    label: 'Đã đặt trước',
    className:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  },
  maintenance: {
    label: 'Bảo trì',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
}

export const USER_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Hoạt động',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  inactive: {
    label: 'Không hoạt động',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
  suspended: {
    label: 'Đình chỉ',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
}

export const USER_ROLE_CONFIG: Record<string, StatusConfig> = {
  waiter: {
    label: 'Phục vụ',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  kitchen_staff: {
    label: 'Bếp',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
}

export const MENU_ITEM_STATUS_CONFIG: Record<string, StatusConfig> = {
  available: {
    label: 'Đang bán',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  sold_out: {
    label: 'Hết hàng',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  unavailable: {
    label: 'Tạm ẩn',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
}

export const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  unpaid: {
    label: 'Chưa TT',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
  paid: {
    label: 'Đã TT',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  partial: {
    label: 'TT một phần',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
}

export const CATEGORY_ACTIVE_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Hoạt động',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  hidden: {
    label: 'Đang ẩn',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
}

export const ZONE_ACTIVE_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Hoạt động',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  inactive: {
    label: 'Tạm ẩn',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
}
