/**
 * KDS WebSocket Hook
 * Connect to WebSocket for real-time KDS updates (new orders, item status changes)
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient, QueryClient } from '@tanstack/react-query'
import { kdsQueryKeys } from '../queries/kds.keys'
import { useAuthStore } from '@/src/store/auth-store'
import { notifyFromSocket, notifySocketError } from '@/src/lib/socket'
import type { KdsOrdersResponse, OrderItemStatus } from '../types/kds.types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'
const WS_NAMESPACE = '/orders'

// ============================================
// Types
// ============================================

interface OrderEventData {
  id: string
  orderNumber: string
  status: string
  table?: {
    id: string
    tableNumber: string
  }
  items?: unknown[]
  totalAmount?: number
  [key: string]: unknown
}

interface OrderEvent {
  type: string
  data: OrderEventData
  timestamp: string
}

interface ItemStatusEvent {
  type: string
  data: {
    orderId: string
    itemId: string
    status: OrderItemStatus
    menuItemName?: string
  }
  timestamp: string
}

export interface UseKdsSocketOptions {
  enabled?: boolean
  showNotifications?: boolean
}

export interface UseKdsSocketReturn {
  isConnected: boolean
  disconnect: () => void
  reconnect: () => void
}

// ============================================
// Hook
// ============================================

export function useKdsSocket(options: UseKdsSocketOptions = {}): UseKdsSocketReturn {
  const { enabled = true, showNotifications = true } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)

  // Use refs to avoid dependency changes causing reconnect loops
  const queryClientRef = useRef<QueryClient>(queryClient)
  const showNotificationsRef = useRef(showNotifications)

  useEffect(() => {
    queryClientRef.current = queryClient
    showNotificationsRef.current = showNotifications
  }, [queryClient, showNotifications])

  /**
   * Optimistically update item status in cache
   */
  const updateItemStatusInCache = useCallback((orderId: string, itemId: string, newStatus: OrderItemStatus) => {
    // Update all KDS query caches
    queryClientRef.current.setQueriesData<KdsOrdersResponse>(
      { queryKey: kdsQueryKeys.all },
      (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: {
            orders: oldData.data.orders.map((order) => {
              if (order.id !== orderId) return order
              return {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId ? { ...item, status: newStatus } : item
                ),
              }
            }),
          },
        }
      }
    )
  }, [])

  const connect = useCallback(() => {
    if (!enabled || !accessToken) {
      return
    }

    if (socketRef.current?.connected) {
      return
    }

    console.log('[KdsSocket] Connecting to', WS_URL + WS_NAMESPACE)

    const socket = io(WS_URL + WS_NAMESPACE, {
      query: { accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => {
      console.log('[KdsSocket] Connected, socket.id=', socket.id)
      setIsConnected(true)
      
      // Subscribe to kitchen events
      socket.emit('subscribeKitchen')
    })

    socket.on('disconnect', (reason) => {
      console.log('[KdsSocket] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[KdsSocket] Connection error:', error.message)
      if (showNotificationsRef.current) {
        notifySocketError(error.message)
      }
    })

    // New order created - refresh KDS board
    socket.on('order:created', (event: OrderEvent) => {
      console.log('[KdsSocket] New order:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: kdsQueryKeys.all })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:created', event.data)
      }
    })

    // Items added to order - refresh KDS board
    socket.on('order:items:added', (event: OrderEvent) => {
      console.log('[KdsSocket] Items added to:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: kdsQueryKeys.all })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:items:added', event.data)
      }
    })

    // Item status changed - optimistic update
    socket.on('item:status', (event: ItemStatusEvent) => {
      console.log('[KdsSocket] Item status:', event.data.itemId, '->', event.data.status)
      updateItemStatusInCache(event.data.orderId, event.data.itemId, event.data.status)

      // Show toast for item status changes (except pending - no need to notify)
      if (showNotificationsRef.current && event.data.status !== 'pending') {
        notifyFromSocket('item:status', event.data)
      }
    })

    // Order updated - refresh to ensure consistency
    socket.on('order:updated', (event: OrderEvent) => {
      console.log('[KdsSocket] Order updated:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: kdsQueryKeys.all })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:updated', event.data)
      }
    })

    socketRef.current = socket
  }, [enabled, accessToken, updateItemStatusInCache])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[KdsSocket] Disconnecting')
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 100)
  }, [disconnect, connect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [enabled, accessToken])

  return { isConnected, disconnect, reconnect }
}
