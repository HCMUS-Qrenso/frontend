'use client'

import type { OrderItemStatus } from '../types/kds.types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface StatusBadgeProps {
  status: OrderItemStatus
  className?: string
}

// Status display config with colors only (labels come from translations)
const STATUS_STYLE_CONFIG: Record<OrderItemStatus, { bgColor: string; color: string }> = {
  pending: { bgColor: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-700 dark:text-slate-300' },
  accepted: { bgColor: 'bg-blue-100 dark:bg-blue-500/10', color: 'text-blue-700 dark:text-blue-400' },
  preparing: { bgColor: 'bg-amber-100 dark:bg-amber-500/10', color: 'text-amber-700 dark:text-amber-400' },
  ready: { bgColor: 'bg-emerald-100 dark:bg-emerald-500/10', color: 'text-emerald-700 dark:text-emerald-400' },
  served: { bgColor: 'bg-purple-100 dark:bg-purple-500/10', color: 'text-purple-700 dark:text-purple-400' },
  cancelled: { bgColor: 'bg-red-100 dark:bg-red-500/10', color: 'text-red-700 dark:text-red-400' },
  returned: { bgColor: 'bg-red-100 dark:bg-red-500/10', color: 'text-red-700 dark:text-red-400' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('kds')
  const config = STATUS_STYLE_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}

