/**
 * Socket utilities barrel export
 */

export {
  SOCKET_EVENT_NOTIFICATIONS,
  getItemStatusNotificationKey,
  type NotificationSeverity,
  type SocketNotificationConfig,
} from './notification-config'

// New localized hook (recommended)
export { useSocketNotification } from './use-socket-notification'
