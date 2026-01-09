'use client'

import type { KdsOrder, OrderItemStatus } from '../types/kds.types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './status-badge'
import { PRIORITY_CONFIG } from '../types/kds.types'
import { Clock, User, Printer, Play, CheckCircle2, MapPin } from 'lucide-react'
import { useFormat } from '@/src/hooks/use-format'
import { useTranslations } from 'next-intl'

interface TicketDetailsDrawerProps {
  open: boolean
  onClose: () => void
  order?: KdsOrder
  onUpdateItemStatus?: (orderId: string, itemId: string, newStatus: OrderItemStatus) => void
}

// Get next status for an item
function getNextStatus(currentStatus: OrderItemStatus): OrderItemStatus | null {
  switch (currentStatus) {
    case 'pending':
      return 'accepted'
    case 'accepted':
      return 'preparing'
    case 'preparing':
      return 'ready'
    default:
      return null
  }
}

// Get action button config key for a status
function getActionConfigKey(
  status: OrderItemStatus,
): { labelKey: string; icon: React.ReactNode } | null {
  switch (status) {
    case 'pending':
      return { labelKey: 'acceptOrder', icon: <CheckCircle2 className="mr-2 h-4 w-4" /> }
    case 'accepted':
      return { labelKey: 'action.start', icon: <Play className="mr-2 h-4 w-4" /> }
    case 'preparing':
      return { labelKey: 'action.done', icon: <CheckCircle2 className="mr-2 h-4 w-4" /> }
    default:
      return null
  }
}

export function TicketDetailsDrawer({
  open,
  onClose,
  order,
  onUpdateItemStatus,
}: TicketDetailsDrawerProps) {
  const { formatRelativeDate } = useFormat()
  const t = useTranslations('kds')

  if (!order) return null

  // Check if all items are already ready or beyond (served, cancelled, returned)
  const completedStatuses = ['ready', 'served', 'cancelled', 'returned']
  const isAllReady = order.items.every((item) => completedStatuses.includes(item.status))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="flex w-full flex-col px-6 sm:max-w-xl">
        {/* Header */}
        <SheetHeader className="space-y-1 pb-4">
          <SheetTitle className="text-2xl">{t('orderDetails')}</SheetTitle>
          <SheetDescription>
            {t('orderDetailsDesc', { orderNumber: order.orderNumber })}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  {/* Table Number */}
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {t('table')} {order.tableNumber}
                    </h3>
                    <p className="mt-1 font-mono text-sm font-medium text-slate-500 dark:text-slate-400">
                      {order.orderNumber}
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {order.waiterName && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{order.waiterName}</span>
                      </div>
                    )}
                    {order.zoneName && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{order.zoneName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatRelativeDate(new Date(order.createdAt).toISOString())}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                <Badge
                  className={`shrink-0 px-3 py-1 text-sm ${PRIORITY_CONFIG[order.priority].color}`}
                >
                  {t(`priorityLabel.${order.priority}`)}
                </Badge>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Items Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('itemsCount', { count: order.items.length })}
              </h4>

              <div className="space-y-4">
                {order.items.map((item) => {
                  const actionConfig = getActionConfigKey(item.status)
                  const nextStatus = getNextStatus(item.status)

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {/* Item name and status */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">
                              {item.quantity}x {item.menuItemName}
                            </span>
                            <StatusBadge status={item.status} />
                          </div>

                          {/* Modifiers */}
                          {item.modifiers.length > 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              <span className="font-medium">+</span>{' '}
                              {item.modifiers.map((m) => m.modifierName).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="mt-4 space-y-2">
                        {/* Prep time */}
                        {item.estimatedPrepTime && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="h-4 w-4" />
                            <span>{t('estimatedTime', { time: item.estimatedPrepTime })}</span>
                          </div>
                        )}

                        {/* Customer Note - prioritized */}
                        {item.specialInstructions && (
                          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                              📝 {t('notes')}: {item.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Item Action Button */}
                      {actionConfig && nextStatus && onUpdateItemStatus && (
                        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => onUpdateItemStatus(order.id, item.id, nextStatus)}
                          >
                            {actionConfig.icon}
                            {t(actionConfig.labelKey)}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Customer Note */}
            {order.specialInstructions && (
              <>
                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                    {t('customerNoteTitle')}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-amber-700 dark:text-amber-400">
                    {order.specialInstructions}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Footer Actions */}
        <div className="border-t border-slate-200 py-4 pb-6 dark:border-slate-700">
          <div className="flex gap-3">
            <Button
              className={
                isAllReady
                  ? 'flex-1 cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-500'
                  : 'flex-1 bg-emerald-600 hover:bg-emerald-700'
              }
              disabled={isAllReady}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isAllReady ? t('allReady') : t('completeAll')}
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
