'use client'

import type { KdsOrder, OrderItemStatus } from '../types/kds.types'
import { ITEM_STATUS_CONFIG } from '../types/kds.types'
import { TicketCard } from './ticket-card'

interface StatusColumnsProps {
  orders: KdsOrder[]
  now: number // Timestamp from parent's useNow hook
  viewMode: 'grid' | 'list'
  groupByStatus: boolean
  selectedStatus: OrderItemStatus | 'all'
  onSelectOrder: (orderId: string) => void
  onUpdateItemStatus?: (orderId: string, itemId: string, newStatus: OrderItemStatus) => void
}

// KDS workflow statuses (only active processing statuses)
const KDS_STATUSES: OrderItemStatus[] = ['pending', 'accepted', 'preparing', 'ready']

export function StatusColumns({
  orders,
  now,
  viewMode,
  groupByStatus,
  selectedStatus,
  onSelectOrder,
  onUpdateItemStatus,
}: StatusColumnsProps) {
  // Filter active orders (not completed/cancelled/abandoned)
  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled', 'abandoned'].includes(o.status),
  )

  if (activeOrders.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-6xl">🍳</div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Không có đơn nào</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Đang chờ đơn hàng mới...
          </p>
        </div>
      </div>
    )
  }

  // Group by item status
  if (groupByStatus) {
    const statuses = selectedStatus === 'all' ? KDS_STATUSES : [selectedStatus as OrderItemStatus]

    // Group orders by whether they have items in each status
    const ordersByStatus: Record<string, KdsOrder[]> = {}

    statuses.forEach((status) => {
      ordersByStatus[status] = activeOrders.filter((order) =>
        order.items.some((item) => item.status === status),
      )
    })

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => {
          const statusConfig = ITEM_STATUS_CONFIG[status]
          const statusOrders = ordersByStatus[status]

          return (
            <div key={status} className="space-y-4">
              {/* Status Header */}
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {statusConfig.label}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusOrders.length}
                  </span>
                </div>
              </div>

              {/* Tickets */}
              <div className="space-y-4">
                {statusOrders.map((order) => (
                  <TicketCard
                    key={`${order.id}-${status}`}
                    order={order}
                    now={now}
                    highlightStatus={status}
                    onClick={() => onSelectOrder(order.id)}
                    onUpdateItemStatus={onUpdateItemStatus}
                  />
                ))}
                {statusOrders.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                    Không có đơn
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Grid or List view (no grouping)
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeOrders.map((order) => (
          <TicketCard
            key={order.id}
            order={order}
            now={now}
            onClick={() => onSelectOrder(order.id)}
            onUpdateItemStatus={onUpdateItemStatus}
          />
        ))}
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-4">
      {activeOrders.map((order) => (
        <TicketCard
          key={order.id}
          order={order}
          now={now}
          isListView
          onClick={() => onSelectOrder(order.id)}
          onUpdateItemStatus={onUpdateItemStatus}
        />
      ))}
    </div>
  )
}
