'use client'

import { useState, useMemo } from 'react'
import { KdsTopBar } from './kds-top-bar'
import { KdsFilters } from './kds-filters'
import { StatusColumns } from './status-columns'
import { TicketDetailsDrawer } from './ticket-details-drawer'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKdsOrdersQuery, useUpdateItemStatusMutation } from '../queries/kds.queries'
import { useKdsSocket } from '../hooks/use-kds-socket'
import { useNow } from '../hooks/use-now'
import type { KdsOrder, OrderItemStatus } from '../types/kds.types'
import { PRIORITY_WEIGHT } from '../types/kds.types'
import { useTranslations } from 'next-intl'

export function KdsBoardClient() {
  const t = useTranslations('kds')
  
  // State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [groupByStatus, setGroupByStatus] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderItemStatus | 'all'>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Single tick timer for all ticket cards (1 second interval)
  const now = useNow(1000)

  // Queries
  const { data, isLoading, error, dataUpdatedAt } = useKdsOrdersQuery({
    search: searchQuery || undefined,
  })

  // WebSocket for real-time updates
  const { isConnected: socketConnected } = useKdsSocket({
    enabled: true,
    showNotifications: soundEnabled, // Use sound setting for notifications
  })

  // Mutations
  const updateItemStatusMutation = useUpdateItemStatusMutation()

  // Derived data
  const orders = useMemo(() => {
    if (!data?.data.orders) return []

    // Sort by priority algorithm from PROJECT_DESCRIPTION.md
    return [...data.data.orders].sort((a, b) => {
      // 1. Priority Level (VIP/Urgent first)
      const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // 2. Elapsed Time (older orders first - prevent starvation)
      // API returns ISO string, convert to Date
      const aElapsed = Date.now() - new Date(a.createdAt).getTime()
      const bElapsed = Date.now() - new Date(b.createdAt).getTime()
      const threshold = 20 * 60 * 1000 // 20 minutes

      if (aElapsed > threshold || bElapsed > threshold) {
        return bElapsed - aElapsed // Older first
      }

      // 3. Preparation Time (quick items first for throughput)
      const aMaxPrep = Math.max(...a.items.map((i) => i.estimatedPrepTime || 15))
      const bMaxPrep = Math.max(...b.items.map((i) => i.estimatedPrepTime || 15))
      return aMaxPrep - bMaxPrep
    })
  }, [data?.data.orders])

  const stats = data?.meta || { total: 0, activeCount: 0, overdueCount: 0 }
  const lastUpdated = new Date(dataUpdatedAt)

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle item status update
  const handleUpdateItemStatus = (orderId: string, itemId: string, newStatus: OrderItemStatus) => {
    updateItemStatusMutation.mutate({ orderId, itemId, newStatus })
  }

  // Find selected order
  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/20">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">{t('loadingError')}</h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : t('errorOccurred')}
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700"
        >
          {t('retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <KdsTopBar
        activeTickets={stats.activeCount}
        overdueTickets={stats.overdueCount}
        lastUpdated={lastUpdated}
        viewMode={viewMode}
        setViewMode={setViewMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isLoading={isLoading}
        socketConnected={socketConnected}
      />

      <KdsFilters
        groupByStatus={groupByStatus}
        setGroupByStatus={setGroupByStatus}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <StatusColumns
        orders={orders}
        now={now}
        viewMode={viewMode}
        groupByStatus={groupByStatus}
        selectedStatus={selectedStatus}
        onSelectOrder={setSelectedOrderId}
        onUpdateItemStatus={handleUpdateItemStatus}
      />

      <TicketDetailsDrawer
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
        onUpdateItemStatus={handleUpdateItemStatus}
      />
    </div>
  )
}
