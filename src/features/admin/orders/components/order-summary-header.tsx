'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import {
  ArrowLeft,
  Copy,
  Printer,
  MoreVertical,
  AlertTriangle,
  Check,
  Wallet,
  QrCode,
  Bell,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { OverrideStatusModal } from './override-status-modal'
import { PaymentDialog } from './payment-dialog'
import type { OrderDetail } from '../types/orders'
import { useFormat } from '@/src/hooks/use-format'
import { useTranslations } from 'next-intl'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  served: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  abandoned: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  normal: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  vip: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
}

interface OrderSummaryHeaderProps {
  order: OrderDetail
}

export function OrderSummaryHeader({ order }: OrderSummaryHeaderProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const { formatRelativeDate } = useFormat()
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const t = useTranslations('orders')

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get localized labels
  const getStatusLabel = (status: string) => t(`status.${status}` as any) || status
  const getPriorityLabel = (priority: string) => t(`priority.${priority}` as any) || priority

  // Check if there are any payments in process
  const hasPaymentInProcess = order.payments?.some(
    (payment) => payment.status === 'pending' || payment.status === 'processing',
  )

  const canInitiatePayment =
    order.status === 'completed' && order.paymentStatus === 'unpaid' && !hasPaymentInProcess

  return (
    <>
      <div className="space-y-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/admin/orders')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('header.orders')}
        </Button>

        {/* Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Order Info */}
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {t('header.orders')} #{order.orderNumber}
                </h1>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {order.paymentRequestedAt && order.paymentStatus !== 'paid' && (
                  <TooltipProvider>
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 dark:bg-amber-900/30">
                      <Bell className="h-4 w-4 animate-pulse text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Yêu cầu thanh toán
                      </span>
                      {order.paymentMethod === 'qr' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <QrCode className="h-4 w-4 cursor-help text-blue-600 dark:text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>QR Payment</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : order.paymentMethod === 'cash' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DollarSign className="h-4 w-4 cursor-help text-emerald-600 dark:text-emerald-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cash Payment</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-lg font-medium">
                  {t('table')} {order.table?.tableNumber}
                </span>
                {order.table?.zone?.name && (
                  <>
                    <span className="text-sm">•</span>
                    <span className="text-sm">{order.table.zone.name}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('text-xs font-medium', STATUS_COLORS[order.status])}>
                  {getStatusLabel(order.status)}
                </Badge>

                <Badge className={cn('text-xs font-medium', PRIORITY_COLORS[order.priority])}>
                  {getPriorityLabel(order.priority)}
                </Badge>

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatRelativeDate(order.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {canInitiatePayment && (
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(true)}
                  className="gap-2 bg-transparent"
                >
                  <Wallet className="h-4 w-4" />
                  {t('header.payment')}
                </Button>
              )}

              <Button
                variant="default"
                disabled={
                  order.paymentStatus === 'paid' ||
                  order.status === 'abandoned' ||
                  hasPaymentInProcess
                }
                onClick={() => setOverrideModalOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <AlertTriangle className="h-4 w-4" />
                {t('header.changeStatus')}
              </Button>

              {order.paymentStatus !== 'paid' && order.status !== 'abandoned' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={hasPaymentInProcess}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={hasPaymentInProcess}>
                      {t('header.assignStaff')}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={hasPaymentInProcess}>
                      {t('header.changePriority')}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={hasPaymentInProcess} className="text-red-600">
                      {t('header.cancel')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Override Status Modal */}
      <OverrideStatusModal
        orderId={order.id}
        currentStatus={order.status}
        open={overrideModalOpen}
        onOpenChange={setOverrideModalOpen}
      />

      {/* Payment Dialog */}
      <PaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} order={order} />
    </>
  )
}
