/**
 * Socket utilities barrel export
 */

export {
  SOCKET_EVENT_NOTIFICATIONS,
  ITEM_STATUS_LABELS,
  getItemStatusNotificationKey,
  type NotificationSeverity,
  type SocketNotificationConfig,
} from './notification-config'

export {
  notifyFromSocket,
  notifySocketConnected,
  notifySocketDisconnected,
  notifySocketError,
  type NotifyOptions,
} from './notify-from-socket'
