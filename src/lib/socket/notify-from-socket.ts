/**
 * Socket Event Notification Helper
 * Centralized toast notification for socket events
 */

import { toast } from 'sonner'
import {
  SOCKET_EVENT_NOTIFICATIONS,
  getItemStatusNotificationKey,
  type NotificationSeverity,
} from './notification-config'

// ============================================
// Types
// ============================================

export interface NotifyOptions {
  /** Override the default title */
  title?: string
  /** Override the default description */
  description?: string
  /** Override the default duration */
  duration?: number
  /** Force a specific severity */
  severity?: NotificationSeverity
}

// ============================================
// Helper Functions
// ============================================

/**
 * Show toast notification for a socket event
 * 
 * @param eventType - The socket event type (e.g., 'order:created', 'item:status')
 * @param data - Event data to populate the notification
 * @param options - Optional overrides
 * 
 * @example
 * // Basic usage
 * notifyFromSocket('order:created', event.data)
 * 
 * // For item status changes
 * notifyFromSocket('item:status', { ...event.data }, { useItemStatus: true })
 */
export function notifyFromSocket(
  eventType: string,
  data: any,
  options: NotifyOptions = {}
): void {
  // For item:status events, get specific config based on status
  let configKey = eventType
  if (eventType === 'item:status' && data?.status) {
    configKey = getItemStatusNotificationKey(data.status)
  }

  const config = SOCKET_EVENT_NOTIFICATIONS[configKey]
  
  // If no config found, skip notification (not all events need toast)
  if (!config) {
    return
  }

  const title = options.title || config.title(data)
  const description = options.description || config.description?.(data)
  const duration = options.duration || config.duration || 3000
  const severity = options.severity || config.severity

  // Call appropriate toast method based on severity
  const toastOptions = {
    description,
    duration,
  }

  switch (severity) {
    case 'success':
      toast.success(title, toastOptions)
      break
    case 'warning':
      toast.warning(title, toastOptions)
      break
    case 'error':
      toast.error(title, toastOptions)
      break
    case 'info':
    default:
      toast.info(title, toastOptions)
      break
  }
}

/**
 * Shorthand for connection events
 */
export function notifySocketConnected(): void {
  notifyFromSocket('socket:connected', {})
}

export function notifySocketDisconnected(): void {
  notifyFromSocket('socket:disconnected', {})
}

export function notifySocketError(message?: string): void {
  notifyFromSocket('socket:error', { message })
}
