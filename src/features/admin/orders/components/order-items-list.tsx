'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { Clock, Check, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { OrderDetailItem } from '../types/orders'
import { useUpdateOrderItemStatusMutation } from '../queries'
import { useFormat } from '@/src/hooks/use-format'
import { useTranslations } from 'next-intl'

const ITEM_STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  pending: {
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    icon: Clock,
  },
  accepted: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    icon: Check,
  },
  preparing: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    icon: Clock,
  },
  ready: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    icon: Check,
  },
  served: {
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    icon: Check,
  },
  cancelled: {
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    icon: XCircle,
  },
  returned: {
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    icon: AlertCircle,
  },
}

interface OrderItemsListProps {
  items: OrderDetailItem[]
  orderId: string
}

export function OrderItemsList({ items, orderId }: OrderItemsListProps) {
  const updateItemStatusMutation = useUpdateOrderItemStatusMutation()
  const { formatPrice, formatTime } = useFormat()
  const t = useTranslations('orders')

  const getItemStatusLabel = (status: string) => t(`itemStatus.${status}` as any) || status

  const handleMarkServed = (itemId: string) => {
    updateItemStatusMutation.mutate({
      orderId,
      itemId,
      status: 'served',
    })
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('items.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('items.empty')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        {t('items.title')}
      </h2>

      <div className="space-y-4">
        {items.map((item) => {
          const statusConfig = ITEM_STATUS_CONFIG[item.status]
          const StatusIcon = statusConfig?.icon || Clock

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Item Info */}
                <div className="flex-1 space-y-2">
                  {/* Name + Qty */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {item.quantity}x
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {item.menuItem.name}
                    </h3>
                  </div>

                  {/* Modifiers */}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="ml-11 space-y-1">
                      {item.modifiers.map((mod, idx) => (
                        <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          + {mod.name}
                          {mod.priceAdjustment > 0 && (
                            <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                              +{formatPrice(mod.priceAdjustment)}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <div className="ml-11 flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-500/10">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {item.specialInstructions}
                      </p>
                    </div>
                  )}

                  <div className="ml-11 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {item.preparationStartedAt && (
                      <span>
                        {t('items.started')}: {formatTime(item.preparationStartedAt)}
                      </span>
                    )}
                    {item.preparationCompletedAt && (
                      <span>
                        {t('items.done')}: {formatTime(item.preparationCompletedAt)}
                      </span>
                    )}
                    {item.servedAt && (
                      <span>
                        {t('items.servedAt')}: {formatTime(item.servedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Price + Status + Actions */}
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                    {item.modifiersTotal > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        +{formatPrice(item.modifiersTotal)}
                      </p>
                    )}
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge className={cn('gap-1 text-xs font-medium', statusConfig?.color)}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {getItemStatusLabel(item.status)}
                  </Badge>

                  {/* Actions - Only waiter can mark as served */}
                  <div className="flex gap-2">
                    {item.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleMarkServed(item.id)}
                        disabled={updateItemStatusMutation.isPending}
                      >
                        {updateItemStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('items.markServed')
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
