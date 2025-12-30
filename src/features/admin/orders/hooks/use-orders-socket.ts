/**
 * Admin Orders WebSocket Hook
 * Connect to WebSocket for real-time order updates in admin dashboard
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { ordersQueryKeys } from '../queries/orders.keys'
import { useAuthStore } from '@/src/store/auth-store'
import { toast } from 'sonner'

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

export function useOrdersSocket(
  options: UseOrdersSocketOptions = {}
): UseOrdersSocketReturn {
  const { enabled = true, showNotifications = true } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)

  const connect = useCallback(() => {
    // Don't connect if disabled or no token
    if (!enabled || !accessToken) {
      return
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      return
    }

    const socket = io(WS_URL + WS_NAMESPACE, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[AdminSocket] Connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // New order created
    socket.on('order:created', (event: OrderEvent) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.stats() })

      if (showNotifications) {
        toast.success(`Đơn hàng mới: ${event.data.orderNumber}`, {
          description: `Bàn ${event.data.table?.tableNumber || 'N/A'}`,
          duration: 5000,
        })
      }
    })

    // Order updated
    socket.on('order:updated', (event: OrderEvent) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.id),
      })
    })

    // Items added to order
    socket.on('order:items:added', (event: OrderEvent) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.id),
      })

      if (showNotifications) {
        toast.info(`Thêm món vào đơn: ${event.data.orderNumber}`, {
          duration: 3000,
        })
      }
    })

    // Item ready notification
    socket.on('item:ready', (event: ItemStatusEvent) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(event.data.orderId),
      })

      if (showNotifications) {
        toast.success(`Món sẵn sàng: ${event.data.itemName}`, {
          duration: 4000,
        })
      }
    })

    socketRef.current = socket
  }, [enabled, accessToken, queryClient, showNotifications])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 100)
  }, [disconnect, connect])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return { isConnected, disconnect, reconnect }
}
