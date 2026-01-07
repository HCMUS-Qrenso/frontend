/**
 * Admin Orders WebSocket Hook
 * Connect to WebSocket for real-time order updates in admin dashboard
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient, QueryClient } from '@tanstack/react-query'
import { ordersQueryKeys } from '../queries/orders.keys'
import { useAuthStore } from '@/src/store/auth-store'
import { notifyFromSocket, notifySocketError } from '@/src/lib/socket'

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
    itemName: string
    status: string
    updatedBy?: string
    updatedAt: string
  }
  timestamp: string
}

export interface UseOrdersSocketOptions {
  enabled?: boolean
  showNotifications?: boolean
}

export interface UseOrdersSocketReturn {
  isConnected: boolean
  disconnect: () => void
  reconnect: () => void
}

// ============================================
// Hook
// ============================================

export function useOrdersSocket(options: UseOrdersSocketOptions = {}): UseOrdersSocketReturn {
  const { enabled = true, showNotifications = true } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)

  // Use refs and keep callbacks stable to avoid dependency changes causing reconnect loops
  const queryClientRef = useRef<QueryClient>(queryClient)
  const showNotificationsRef = useRef(showNotifications)

  // Update refs when values change (without causing re-renders)
  useEffect(() => {
    queryClientRef.current = queryClient
    showNotificationsRef.current = showNotifications
  }, [queryClient, showNotifications])

  const connect = useCallback(() => {
    // Don't connect if disabled or no token
    if (!enabled || !accessToken) {
      return
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      return
    }

    console.log('[AdminSocket] Connecting to', WS_URL + WS_NAMESPACE)

    const socket = io(WS_URL + WS_NAMESPACE, {
      // Backend checks client.handshake.query.accessToken, not auth
      query: { accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[AdminSocket] Connected, socket.id=', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('[AdminSocket] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[AdminSocket] Connection error:', error.message)
      if (showNotificationsRef.current) {
        notifySocketError(error.message)
      }
    })

    // New order created
    socket.on('order:created', (event: OrderEvent) => {
      console.log('[AdminSocket] Order created:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.stats() })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:created', event.data)
      }
    })

    // Order updated
    socket.on('order:updated', (event: OrderEvent) => {
      console.log('[AdminSocket] Order updated:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClientRef.current.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.id),
      })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:updated', event.data)
      }
    })

    // Items added to order
    socket.on('order:items:added', (event: OrderEvent) => {
      console.log('[AdminSocket] Items added:', event.data.orderNumber)
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClientRef.current.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.id),
      })

      if (showNotificationsRef.current) {
        notifyFromSocket('order:items:added', event.data)
      }
    })

    // Item status changed (from KDS or other sources)
    socket.on('item:status', (event: ItemStatusEvent) => {
      console.log('[AdminSocket] Item status changed:', event.data.itemId, '->', event.data.status)
      // Invalidate both lists and detail to reflect status changes
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClientRef.current.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.orderId),
      })

      // Show toast for item status changes
      if (showNotificationsRef.current) {
        notifyFromSocket('item:status', event.data)
      }
    })

    // Payment status updated (e.g., QR payment confirmed)
    socket.on('payment:updated', (event: any) => {
      console.log('[AdminSocket] Payment updated:', event.data.orderId, '->', event.data.status)
      console.log('[AdminSocket] Invalidating queries with key:', ordersQueryKeys.all)

      // Invalidate queries to refresh payment status
      queryClientRef.current.invalidateQueries({ queryKey: ordersQueryKeys.all })

      // Show toast notification
      if (showNotificationsRef.current && event.data.status === 'paid') {
        notifyFromSocket('payment:updated', event.data)
      }
    })

    socketRef.current = socket
  }, [enabled, accessToken])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[AdminSocket] Disconnecting')
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
  // Only re-run when enabled or accessToken changes
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [enabled, accessToken])

  return { isConnected, disconnect, reconnect }
}
