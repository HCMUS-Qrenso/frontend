/**
 * Ticket Item Row Component
 * Displays single menu item with quantity, modifiers, notes, status, action button
 */

import { Button } from '@/components/ui/button'
import { Play, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from './status-badge'
import { getActionConfig, getNextStatus } from '../logic/ticket.logic'
import type { KdsOrderItem, OrderItemStatus } from '../types/kds.types'

interface TicketItemRowProps {
  item: KdsOrderItem
  orderId: string
  onUpdateStatus?: (orderId: string, itemId: string, newStatus: OrderItemStatus) => void
}

/**
 * Get icon component based on icon name
 */
function ActionIcon({ iconName }: { iconName: 'check' | 'play' | 'checkCircle' }) {
  switch (iconName) {
    case 'play':
      return <Play className="mr-1 h-3 w-3" />
    case 'check':
    case 'checkCircle':
    default:
      return <CheckCircle2 className="mr-1 h-3 w-3" />
  }
}

export function TicketItemRow({ item, orderId, onUpdateStatus }: TicketItemRowProps) {
  const actionConfig = getActionConfig(item.status)
  const nextStatus = getNextStatus(item.status)

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className="flex flex-col gap-2">
        {/* Item name */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            {item.quantity}x {item.menuItemName}
          </span>
        </div>
        
        {/* Status badge */}
        <StatusBadge status={item.status} />

        {/* Modifiers */}
        {item.modifiers && item.modifiers.length > 0 && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            + {item.modifiers.map((m) => m.modifierName).join(', ')}
          </p>
        )}

        {/* Customer note - prioritized display */}
        {item.specialInstructions && (
          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Ghi chú: {item.specialInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      {actionConfig && nextStatus && onUpdateStatus && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          onClick={() => onUpdateStatus(orderId, item.id, nextStatus)}
        >
          <ActionIcon iconName={actionConfig.iconName} />
          {actionConfig.label}
        </Button>
      )}
    </div>
  )
}
