/**
 * Ticket Header Component
 * Displays: table number, order number, priority badge, timer, waiter info
 */

import { Badge } from '@/components/ui/badge'
import { User, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG } from '../types/kds.types'
import { TimerPill } from './timer-pill'
import type { KdsOrder } from '../types/kds.types'
import { useTranslations } from 'next-intl'

interface TicketHeaderProps {
  order: KdsOrder
  elapsed: number
  isWarning: boolean
  isOverdue: boolean
  isListView?: boolean
}

export function TicketHeader({
  order,
  elapsed,
  isWarning,
  isOverdue,
  isListView,
}: TicketHeaderProps) {
  const t = useTranslations('kds')

  return (
    <div
      className={cn(
        'border-b border-slate-100 p-4 dark:border-slate-800',
        isListView && 'flex-none border-0',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('table')} {order.tableNumber}
            </h3>
            {isOverdue && <AlertTriangle className="h-5 w-5 animate-pulse text-red-500" />}
          </div>
          <p className="mt-0.5 font-mono text-sm font-semibold text-slate-600 dark:text-slate-400">
            {order.orderNumber}
          </p>
          {order.waiterName && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.waiterName}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={cn('text-xs font-medium', PRIORITY_CONFIG[order.priority].color)}>
            {t(`priorityLabel.${order.priority}`)}
          </Badge>
          <TimerPill elapsed={elapsed} isOverdue={isOverdue} isWarning={isWarning} />
        </div>
      </div>
    </div>
  )
}

