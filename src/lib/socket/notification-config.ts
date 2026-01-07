/**
 * Socket Event Notification Configuration
 * Maps socket events to toast notifications with consistent styling
 */

import type { ExternalToast } from 'sonner'

// ============================================
// Types
// ============================================

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export interface SocketNotificationConfig {
  severity: NotificationSeverity
  title: (data: any) => string
  description?: (data: any) => string | undefined
  duration?: number
  icon?: string
}

// ============================================
// Item Status Labels
// ============================================

export const ITEM_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  accepted: 'Đã nhận',
  preparing: 'Đang làm',
  ready: 'Sẵn sàng',
  served: 'Đã phục vụ',
  cancelled: 'Đã hủy',
  returned: 'Trả lại',
}

// ============================================
// Event Notification Configs
// ============================================

export const SOCKET_EVENT_NOTIFICATIONS: Record<string, SocketNotificationConfig> = {
  // ========== Order Events ==========
  'order:created': {
    severity: 'success',
    title: (data) => `Đơn mới: ${data.orderNumber || 'N/A'}`,
    description: (data) => (data.table?.tableNumber ? `Bàn ${data.table.tableNumber}` : undefined),
    duration: 5000,
  },

  'order:updated': {
    severity: 'info',
    title: (data) => `Cập nhật: ${data.orderNumber || 'N/A'}`,
    description: (data) => (data.status ? `Trạng thái: ${data.status}` : undefined),
    duration: 3000,
  },

  'order:items:added': {
    severity: 'info',
    title: (data) => `Thêm món: ${data.orderNumber || 'N/A'}`,
    description: (data) => (data.itemCount ? `${data.itemCount} món mới` : undefined),
    duration: 3000,
  },

  // ========== Item Status Events ==========
  'item:status:accepted': {
    severity: 'info',
    title: (data) => `Đã nhận: ${data.menuItemName || 'Món ăn'}`,
    duration: 3000,
  },

  'item:status:preparing': {
    severity: 'info',
    title: (data) => `Đang làm: ${data.menuItemName || 'Món ăn'}`,
    duration: 3000,
  },

  'item:status:ready': {
    severity: 'success',
    title: (data) => `Sẵn sàng: ${data.menuItemName || 'Món ăn'}`,
    description: (data) => (data.table?.tableNumber ? `Bàn ${data.table.tableNumber}` : undefined),
    duration: 4000,
  },

  'item:status:served': {
    severity: 'success',
    title: (data) => `Đã phục vụ: ${data.menuItemName || 'Món ăn'}`,
    duration: 3000,
  },

  'item:status:cancelled': {
    severity: 'warning',
    title: (data) => `Đã hủy: ${data.menuItemName || 'Món ăn'}`,
    duration: 4000,
  },

  // ========== Connection Events ==========
  'socket:connected': {
    severity: 'success',
    title: () => 'Đã kết nối realtime',
    duration: 2000,
  },

  'socket:disconnected': {
    severity: 'warning',
    title: () => 'Mất kết nối realtime',
    description: () => 'Đang thử kết nối lại...',
    duration: 4000,
  },

  'socket:error': {
    severity: 'error',
    title: () => 'Lỗi kết nối',
    description: (data) => data.message || 'Không thể kết nối đến server',
    duration: 5000,
  },

  // ========== Payment Events ==========
  'payment:updated': {
    severity: 'success',
    title: (data) => 'Thanh toán thành công',
    description: (data) => (data.orderId ? `Đơn hàng đã được thanh toán` : undefined),
    duration: 5000,
  },
}

/**
 * Get notification config for an item status change
 * Maps 'item:status' + status to specific config
 */
export function getItemStatusNotificationKey(status: string): string {
  return `item:status:${status}`
}
