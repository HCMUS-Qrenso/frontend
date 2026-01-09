'use client'

import type { OrderItemStatus } from '../types/kds.types'
import { ITEM_STATUS_CONFIG } from '../types/kds.types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrderItemStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = ITEM_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
