/**
 * KDS Ticket Card Component (Refactored)
 * 
 * Changes from original:
 * - Timer is passed as `now` prop (single tick at parent level)
 * - Business logic extracted to ticket.logic.ts
 * - Split into sub-components: TicketHeader, TicketItemRow, TicketFooter
 * - Derived values memoized
 * - No card-level onClick, explicit buttons only (better a11y)
 */

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG } from '../types/kds.types'
import {
  calcElapsedSec,
  calcMaxPrepTime,
  calcTiming,
  isAllDone,
  filterItemsByStatus,
  TERMINAL_STATUSES,
  NEXT_STATUS,
} from '../logic/ticket.logic'
import { TicketHeader } from './ticket-header'
import { TicketItemRow } from './ticket-item-row'
import { TicketFooter } from './ticket-footer'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import type { KdsOrder, OrderItemStatus } from '../types/kds.types'

interface TicketCardProps {
  order: KdsOrder
  now: number  // Timestamp from parent's useNow hook
  onClick: () => void
  isListView?: boolean
  highlightStatus?: OrderItemStatus
  onUpdateItemStatus?: (orderId: string, itemId: string, newStatus: OrderItemStatus) => void
}

export function TicketCard({
  order,
  now,
  onClick,
  isListView,
  highlightStatus,
  onUpdateItemStatus,
}: TicketCardProps) {
  const [showNote, setShowNote] = useState(false)
  const [showConfirmComplete, setShowConfirmComplete] = useState(false)

  // Memoized calculations
  const elapsed = useMemo(
    () => calcElapsedSec(order.createdAt, now),
    [order.createdAt, now]
  )

  const maxPrepTime = useMemo(
    () => calcMaxPrepTime(order.items),
    [order.items]
  )

  const { isWarning, isOverdue } = useMemo(
    () => calcTiming(elapsed, maxPrepTime),
    [elapsed, maxPrepTime]
  )

  const allDone = useMemo(
    () => isAllDone(order.items),
    [order.items]
  )

  // Count items that are not yet done (for confirm dialog)
  const pendingItemsCount = useMemo(
    () => order.items.filter((item) => !TERMINAL_STATUSES.has(item.status)).length,
    [order.items]
  )

  const displayItems = useMemo(
    () => filterItemsByStatus(order.items, highlightStatus),
    [order.items, highlightStatus]
  )

  // Border color based on priority and overdue status
  const borderClass = useMemo(() => {
    if (isOverdue) return 'border-red-400 dark:border-red-600'
    if (isWarning) return 'border-amber-300 dark:border-amber-600'
    return PRIORITY_CONFIG[order.priority].borderColor
  }, [isOverdue, isWarning, order.priority])

  return (
    <div
      className={cn(
        'group rounded-2xl border-2 bg-white transition-all hover:shadow-lg dark:bg-slate-900',
        borderClass,
        isListView && 'flex items-center gap-4'
      )}
    >
      {/* Header */}
      <TicketHeader
        order={order}
        elapsed={elapsed}
        isWarning={isWarning}
        isOverdue={isOverdue}
        isListView={isListView}
      />

      {/* Body - Items */}
      <div className={cn('space-y-3 p-4', isListView && 'flex-1')}>
        {displayItems.map((item) => (
          <TicketItemRow
            key={item.id}
            item={item}
            orderId={order.id}
            onUpdateStatus={onUpdateItemStatus}
          />
        ))}

        {/* Order-level Customer Note */}
        {order.specialInstructions && (
          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowNote(!showNote)}
            >
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Ghi chú khách
              </span>
              {showNote ? (
                <ChevronUp className="h-3 w-3 text-slate-400" />
              ) : (
                <ChevronDown className="h-3 w-3 text-slate-400" />
              )}
            </button>
            {showNote && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                {order.specialInstructions}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer - Quick Actions (card view only) */}
      {!isListView && (
        <TicketFooter
          isAllDone={allDone}
          onCompleteAll={() => setShowConfirmComplete(true)}
          onShowDetail={onClick}
        />
      )}

      {/* Confirm Complete All Dialog */}
      <ConfirmActionDialog
        open={showConfirmComplete}
        onOpenChange={setShowConfirmComplete}
        title="Hoàn thành tất cả?"
        description={`Tất cả ${pendingItemsCount} món trong đơn ${order.orderNumber} sẽ được đánh dấu là sẵn sàng phục vụ.`}
        variant="success"
        confirmText="Xác nhận"
        onConfirm={async () => {
          if (!onUpdateItemStatus) return
          
          // Update each non-terminal item through valid status transitions
          // Backend requires: pending → accepted → preparing → ready
          for (const item of order.items) {
            if (TERMINAL_STATUSES.has(item.status)) continue
            
            // Get path to ready: pending→accepted→preparing→ready
            const path: OrderItemStatus[] = []
            let current = item.status
            
            while (current !== 'ready') {
              const next = NEXT_STATUS[current]
              if (!next) break
              path.push(next)
              current = next
            }
            
            // Execute each transition
            for (const nextStatus of path) {
              onUpdateItemStatus(order.id, item.id, nextStatus)
              // Small delay to ensure order of execution
              await new Promise(resolve => setTimeout(resolve, 50))
            }
          }
          
          setShowConfirmComplete(false)
        }}
      />
    </div>
  )
}
