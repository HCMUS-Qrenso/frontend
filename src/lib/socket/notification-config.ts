/**
 * Socket Event Notification Configuration
 * Maps socket events to toast notifications with consistent styling
 * 
 * NOTE: This file now uses translation keys from socket.json
 * The actual translation is handled by notify-from-socket-hook.ts
 */

import type { ExternalToast } from 'sonner'

// ============================================
// Types
// ============================================

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export interface SocketNotificationConfig {
  severity: NotificationSeverity
  /** Translation key for title (from socket namespace) */
  titleKey: string
  /** Translation key for description (from socket namespace) */
  descriptionKey?: string
  /** Data key mappings for interpolation, e.g., { orderNumber: 'orderNumber' } */
  titleParams?: (data: any) => Record<string, string | number | undefined>
  descriptionParams?: (data: any) => Record<string, string | number | undefined>
  duration?: number
}

// ============================================
// Event Notification Configs
// ============================================

export const SOCKET_EVENT_NOTIFICATIONS: Record<string, SocketNotificationConfig> = {
  // ========== Order Events ==========
  'order:created': {
    severity: 'success',
    titleKey: 'order.new',
    titleParams: (data) => ({ orderNumber: data.orderNumber || 'N/A' }),
    descriptionKey: 'order.table',
    descriptionParams: (data) => ({ tableNumber: data.table?.tableNumber }),
    duration: 5000,
  },

  'order:updated': {
    severity: 'info',
    titleKey: 'order.updated',
    titleParams: (data) => ({ orderNumber: data.orderNumber || 'N/A' }),
    descriptionKey: 'order.status',
    descriptionParams: (data) => ({ status: data.status }),
    duration: 3000,
  },

  'order:items:added': {
    severity: 'info',
    titleKey: 'order.itemsAdded',
    titleParams: (data) => ({ orderNumber: data.orderNumber || 'N/A' }),
    descriptionKey: 'order.newItems',
    descriptionParams: (data) => ({ count: data.itemCount }),
    duration: 3000,
  },

  // ========== Item Status Events ==========
  'item:status:accepted': {
    severity: 'info',
    titleKey: 'item.accepted',
    titleParams: (data) => ({ itemName: data.menuItemName }),
    duration: 3000,
  },

  'item:status:preparing': {
    severity: 'info',
    titleKey: 'item.preparing',
    titleParams: (data) => ({ itemName: data.menuItemName }),
    duration: 3000,
  },

  'item:status:ready': {
    severity: 'success',
    titleKey: 'item.ready',
    titleParams: (data) => ({ itemName: data.menuItemName }),
    descriptionKey: 'order.table',
    descriptionParams: (data) => ({ tableNumber: data.table?.tableNumber }),
    duration: 4000,
  },

  'item:status:served': {
    severity: 'success',
    titleKey: 'item.served',
    titleParams: (data) => ({ itemName: data.menuItemName }),
    duration: 3000,
  },

  'item:status:cancelled': {
    severity: 'warning',
    titleKey: 'item.cancelled',
    titleParams: (data) => ({ itemName: data.menuItemName }),
    duration: 4000,
  },

  // ========== Connection Events ==========
  'socket:connected': {
    severity: 'success',
    titleKey: 'socket.connected',
    duration: 2000,
  },

  'socket:disconnected': {
    severity: 'warning',
    titleKey: 'socket.disconnected',
    descriptionKey: 'socket.reconnecting',
    duration: 4000,
  },

  'socket:error': {
    severity: 'error',
    titleKey: 'socket.error',
    descriptionKey: 'socket.errorMessage',
    duration: 5000,
  },

  // ========== Payment Events ==========
  'payment:updated': {
    severity: 'success',
    titleKey: 'payment.updated',
    descriptionKey: 'payment.orderPaid',
    duration: 5000,
  },

  // ========== Bill Request Events ==========
  'bill:requested': {
    severity: 'warning',
    titleKey: 'bill.requested',
    titleParams: (data) => ({ tableNumber: data.tableNumber || 'N/A' }),
    duration: 8000,
  },
}

/**
 * Get notification config for an item status change
 * Maps 'item:status' + status to specific config
 */
export function getItemStatusNotificationKey(status: string): string {
  return `item:status:${status}`
}
