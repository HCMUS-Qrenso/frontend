/**
 * Ticket Footer Component
 * Displays: "Hoàn thành tất cả" button + "Chi tiết" button
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TicketFooterProps {
  isAllDone: boolean
  onCompleteAll?: () => void
  onShowDetail: () => void
}

export function TicketFooter({ isAllDone, onCompleteAll, onShowDetail }: TicketFooterProps) {
  return (
    <div className="border-t border-slate-100 p-3 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className={cn(
            'flex-1',
            isAllDone
              ? 'cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-500'
              : 'bg-emerald-600 hover:bg-emerald-700',
          )}
          disabled={isAllDone}
          onClick={onCompleteAll}
        >
          {isAllDone ? 'Đã sẵn sàng' : 'Hoàn thành tất cả'}
        </Button>
        <Button size="sm" variant="outline" className="shrink-0" onClick={onShowDetail}>
          Chi tiết
        </Button>
      </div>
    </div>
  )
}
