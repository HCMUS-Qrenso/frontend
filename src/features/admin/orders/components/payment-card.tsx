'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { cn } from '@/src/lib/utils'
import { Copy, CreditCard, Check, CheckCircle, Printer, X, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { PaymentRecord } from '../types/orders'
import { useFormat } from '@/src/hooks/use-format'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  useCompletePaymentMutation,
  useCancelPaymentMutation,
  useCheckPaymentStatusMutation,
} from '../queries'
import { toast } from 'sonner'
import { printBill } from '../utils/print-bill'
import { useTranslations } from 'next-intl'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  refunded: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
}

interface PaymentCardProps {
  payments: PaymentRecord[]
  totalAmount: number
  order?: any // For printing bill
  tenantName?: string
  tenantAddress?: string | null
}

export function PaymentCard({
  payments,
  totalAmount,
  order,
  tenantName,
  tenantAddress,
}: PaymentCardProps) {
  const [copied, setCopied] = useState(false)
  const { formatPrice, formatDateTime } = useFormat()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const completePaymentMutation = useCompletePaymentMutation()
  const cancelPaymentMutation = useCancelPaymentMutation()
  const checkPaymentStatusMutation = useCheckPaymentStatusMutation()
  const t = useTranslations('orders')

  // Helper functions for translation
  const getPaymentStatusLabel = (status: string) => t(`paymentStatus.${status}` as any) || status
  const getPaymentMethodLabel = (method: string) => t(`paymentMethod.${method}` as any) || method

  // Get the most recent paid payment first, otherwise get the most recent non-cancelled/non-failed payment
  const paidPayment = payments.find((p) => p.status === 'paid')
  const activePayment = payments.find((p) => !['cancelled', 'failed'].includes(p.status))
  const payment = paidPayment || activePayment || payments[0]
  const hasPayment = payments.length > 0 && payment
  const paymentStatus = hasPayment ? payment.status : 'pending'

  // Check if there are cancelled or failed payments to show warnings
  const hasCancelledPayments = payments.some((p) => p.status === 'cancelled')
  const hasFailedPayments = payments.some((p) => p.status === 'failed')

  const handleCopy = () => {
    if (payment?.transactionId) {
      navigator.clipboard.writeText(payment.transactionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCompletePayment = async () => {
    if (!payment?.id) return

    try {
      await completePaymentMutation.mutateAsync(payment.id)
      toast.success(t('toast.paymentCompleted'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.errorCompletePayment'))
    }
  }

  const handleCancelPayment = async () => {
    if (!payment?.id) return

    try {
      await cancelPaymentMutation.mutateAsync({
        paymentId: payment.id,
        reason: cancelReason || undefined,
      })
      toast.success(t('toast.paymentCancelled'))
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.errorCancelPayment'))
    }
  }

  const handleOpenCancelDialog = () => {
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const handlePrintBill = () => {
    if (!order) {
      toast.error(t('toast.errorNoOrderInfo'))
      return
    }

    printBill({
      order,
      billType: 'final',
      paymentMethod: payment?.paymentMethod as 'cash' | 'qr',
      tenantName,
      tenantAddress,
    })
    toast.success(t('toast.printingBill'))
  }

  const handleCheckPaymentStatus = async () => {
    if (!payment?.transactionId) {
      toast.error(t('toast.errorNoTransactionId'))
      return
    }

    try {
      const result = await checkPaymentStatusMutation.mutateAsync(payment.transactionId)
      if (result.status === 'paid') {
        toast.success(t('toast.paymentConfirmed'))
      } else if (result.status === 'pending') {
        toast.info(t('toast.paymentPending'))
      } else {
        toast.warning(`${t('dialog.currentStatus')}: ${getPaymentStatusLabel(result.status || '')}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.errorCheckStatus'))
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('paymentCard.title')}
        </h2>
        <Badge className={cn('text-xs font-medium', PAYMENT_STATUS_COLORS[paymentStatus])}>
          {getPaymentStatusLabel(paymentStatus)}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Payment Method */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('paymentCard.method')}</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {hasPayment && payment.paymentMethod
                ? getPaymentMethodLabel(payment.paymentMethod)
                : t('paymentMethod.undefined')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('paymentCard.subtotal')}</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {formatPrice(order?.subtotal || 0)}
            </p>
          </div>

          {/* Discount - only show if exists */}
          {order?.discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('paymentCard.discount')}
                {order?.voucherCode && (
                  <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">
                    ({order.voucherCode})
                  </span>
                )}
              </p>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                -{formatPrice(order.discountAmount)}
              </p>
            </div>
          )}

          {/* Tax/VAT */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('paymentCard.tax')}</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {formatPrice(order?.taxAmount || 0)}
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-2" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('paymentCard.total')}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatPrice(totalAmount)}
            </p>
          </div>
        </div>

        {hasPayment && payment.transactionId && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('paymentCard.transactionId')}
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 font-mono text-sm text-slate-900 dark:text-white">
                {payment.transactionId}
              </p>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Paid At */}
        {hasPayment && payment.paidAt && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('paymentCard.paidAt')}</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {formatDateTime(payment.paidAt)}
            </p>
          </div>
        )}

        {/* Refund Info */}
        {hasPayment && payment.refundedAt && payment.refundAmount && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                {t('paymentCard.refunded')}
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {t('paymentCard.amount')}: {formatPrice(payment.refundAmount)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {formatDateTime(payment.refundedAt)}
              </p>
            </div>
          </>
        )}

        {/* Cancelled Payment Warning */}
        {hasCancelledPayments && payment.status === 'cancelled' && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-500/10">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-400">
                {t('paymentCard.cancelled')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500">
                {t('paymentCard.cancelledDesc')}
              </p>
            </div>
          </>
        )}

        {/* Failed Payment Warning */}
        {hasFailedPayments && payment.status === 'failed' && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
              <p className="text-sm font-medium text-red-900 dark:text-red-400">
                {t('paymentCard.failed')}
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {t('paymentCard.failedDesc')}
              </p>
            </div>
          </>
        )}

        {/* Complete Payment Button - for pending cash payments */}
        {hasPayment && payment.status === 'pending' && payment.paymentMethod === 'cash' && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="flex gap-2">
              <Button
                onClick={handleCompletePayment}
                disabled={completePaymentMutation.isPending || cancelPaymentMutation.isPending}
                className="flex-1"
                size="lg"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {completePaymentMutation.isPending
                  ? t('paymentCard.processing')
                  : t('paymentCard.complete')}
              </Button>
              <Button
                onClick={handleOpenCancelDialog}
                disabled={completePaymentMutation.isPending || cancelPaymentMutation.isPending}
                variant="outline"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                {t('paymentCard.cancel')}
              </Button>
            </div>
          </>
        )}

        {/* Cancel Button - for pending/processing QR payments */}
        {hasPayment &&
          (payment.status === 'pending' || payment.status === 'processing') &&
          (payment.paymentMethod === 'qr' || payment.paymentMethod === 'payos') && (
            <>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <div className="flex flex-row gap-2 lg:flex-col">
                <Button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkPaymentStatusMutation.isPending}
                  variant="outline"
                  className="flex-1 lg:flex-none"
                  size="lg"
                >
                  <RefreshCw
                    className={cn(
                      'mr-2 h-4 w-4',
                      checkPaymentStatusMutation.isPending && 'animate-spin',
                    )}
                  />
                  {checkPaymentStatusMutation.isPending
                    ? t('paymentCard.checking')
                    : t('paymentCard.checkStatus')}
                </Button>
                <Button
                  onClick={handleOpenCancelDialog}
                  disabled={cancelPaymentMutation.isPending}
                  variant="destructive"
                  className="flex-1 lg:flex-none"
                  size="lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('paymentCard.cancelPayment')}
                </Button>
              </div>
            </>
          )}

        {/* Print Bill Button - for completed payments */}
        {hasPayment && payment.status === 'paid' && order && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <Button onClick={handlePrintBill} variant="outline" className="w-full" size="lg">
              <Printer className="mr-2 h-4 w-4" />
              {t('paymentCard.printBill')}
            </Button>
          </>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.cancelPaymentTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dialog.cancelPaymentDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancel-reason">{t('dialog.cancelReason')}</Label>
            <Textarea
              id="cancel-reason"
              placeholder={t('dialog.cancelReasonPlaceholder')}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelPaymentMutation.isPending}>
              {t('dialog.no')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={cancelPaymentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelPaymentMutation.isPending
                ? t('paymentCard.processing')
                : t('paymentCard.cancelPayment')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
