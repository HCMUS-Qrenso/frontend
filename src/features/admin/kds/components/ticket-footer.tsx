/**
 * Ticket Footer Component
 * Displays: "Complete all" button + "Details" button
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface TicketFooterProps {
  isAllDone: boolean
  onCompleteAll?: () => void
  onShowDetail: () => void
}

export function TicketFooter({ isAllDone, onCompleteAll, onShowDetail }: TicketFooterProps) {
  const t = useTranslations('kds')

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
          {isAllDone ? t('allReady') : t('completeAll')}
        </Button>
        <Button size="sm" variant="outline" className="shrink-0" onClick={onShowDetail}>
          {t('details')}
        </Button>
      </div>
    </div>
  )
}
