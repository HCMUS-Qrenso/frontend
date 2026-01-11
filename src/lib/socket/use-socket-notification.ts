/**
 * useSocketNotification Hook
 * React hook that provides localized socket notification functions
 */

'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
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
// Hook
// ============================================

/**
 * Hook that returns localized socket notification functions
 * 
 * @example
 * const { notifyFromSocket } = useSocketNotification()
 * 
 * // In socket handler:
 * socket.on('order:created', (event) => {
 *   notifyFromSocket('order:created', event.data)
 * })
 */
export function useSocketNotification() {
  const t = useTranslations('socket')

  const notifyFromSocket = useCallback((eventType: string, data: any, options: NotifyOptions = {}): void => {
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

    // Get title from translations
    let title = options.title
    if (!title) {
      const params = config.titleParams?.(data) || {}
      // Use item.defaultName as fallback for itemName
      if (params.itemName === undefined && config.titleKey.startsWith('item.')) {
        params.itemName = t('item.defaultName')
      }
      title = t(config.titleKey, params)
    }

    // Get description from translations (if available)
    let description = options.description
    if (!description && config.descriptionKey) {
      const params = config.descriptionParams?.(data) || {}
      // Only show description if all params are defined
      const hasAllParams = Object.values(params).every(v => v !== undefined && v !== null)
      if (hasAllParams || Object.keys(params).length === 0) {
        description = t(config.descriptionKey, params)
      }
    }

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
  }, [t])

  const notifySocketConnected = useCallback((): void => {
    notifyFromSocket('socket:connected', {})
  }, [notifyFromSocket])

  const notifySocketDisconnected = useCallback((): void => {
    notifyFromSocket('socket:disconnected', {})
  }, [notifyFromSocket])

  const notifySocketError = useCallback((message?: string): void => {
    notifyFromSocket('socket:error', { message })
  }, [notifyFromSocket])

  return {
    notifyFromSocket,
    notifySocketConnected,
    notifySocketDisconnected,
    notifySocketError,
  }
}
