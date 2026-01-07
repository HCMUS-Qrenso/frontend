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
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  useCompletePaymentMutation,
  useCancelPaymentMutation,
  useCheckPaymentStatusMutation,
} from '../queries'
import { toast } from 'sonner'
import type { PaymentRecord } from '../types/orders'
import { printBill } from '../utils/print-bill'

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Chưa thanh toán',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  failed: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  qr: 'VietQR',
  payos: 'VietQR', // Backward compatibility
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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const completePaymentMutation = useCompletePaymentMutation()
  const cancelPaymentMutation = useCancelPaymentMutation()
  const checkPaymentStatusMutation = useCheckPaymentStatusMutation()

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
      toast.success('Đã hoàn tất thanh toán')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hoàn tất thanh toán')
    }
  }

  const handleCancelPayment = async () => {
    if (!payment?.id) return

    try {
      await cancelPaymentMutation.mutateAsync({
        paymentId: payment.id,
        reason: cancelReason || undefined,
      })
      toast.success('Đã hủy thanh toán')
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy thanh toán')
    }
  }

  const handleOpenCancelDialog = () => {
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const handlePrintBill = () => {
    if (!order) {
      toast.error('Không có thông tin đơn hàng')
      return
    }

    printBill({
      order,
      billType: 'final',
      paymentMethod: payment?.paymentMethod as 'cash' | 'qr',
      tenantName,
      tenantAddress,
    })
    toast.success('Đang in hóa đơn')
  }

  const handleCheckPaymentStatus = async () => {
    if (!payment?.orderCode) {
      toast.error('Không có mã đơn hàng')
      return
    }

    try {
      const result = await checkPaymentStatusMutation.mutateAsync(payment.orderCode)
      if (result.status === 'paid') {
        toast.success('Thanh toán đã được xác nhận!')
      } else if (result.status === 'processing') {
        toast.info('Đang chờ thanh toán...')
      } else {
        toast.warning(`Trạng thái: ${result.status}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thanh toán</h2>
        <Badge className={cn('text-xs font-medium', PAYMENT_STATUS_CONFIG[paymentStatus]?.color)}>
          {PAYMENT_STATUS_CONFIG[paymentStatus]?.label || paymentStatus}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Payment Method */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Phương thức</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {hasPayment && payment.paymentMethod
                ? PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod
                : 'Chưa xác định'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* Amount */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {totalAmount.toLocaleString('vi-VN')} VND
          </p>
        </div>

        {/* Transaction ID */}
        {hasPayment && payment.transactionId && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Mã giao dịch</p>
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Thời gian thanh toán</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {format(new Date(payment.paidAt), 'HH:mm, dd/MM/yyyy', { locale: vi })}
            </p>
          </div>
        )}

        {/* Refund Info */}
        {hasPayment && payment.refundedAt && payment.refundAmount && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">Đã hoàn tiền</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Số tiền: {payment.refundAmount.toLocaleString('vi-VN')} VND
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {format(new Date(payment.refundedAt), 'HH:mm, dd/MM/yyyy', { locale: vi })}
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
                Thanh toán đã bị hủy
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500">
                Giao dịch đã bị hủy. Vui lòng tạo giao dịch mới.
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
                Thanh toán thất bại
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác
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
                {completePaymentMutation.isPending ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
              </Button>
              <Button
                onClick={handleOpenCancelDialog}
                disabled={completePaymentMutation.isPending || cancelPaymentMutation.isPending}
                variant="outline"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Hủy
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
              <div className="flex gap-2">
                <Button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkPaymentStatusMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw
                    className={cn(
                      'mr-2 h-4 w-4',
                      checkPaymentStatusMutation.isPending && 'animate-spin',
                    )}
                  />
                  {checkPaymentStatusMutation.isPending
                    ? 'Đang kiểm tra...'
                    : 'Kiểm tra trạng thái'}
                </Button>
                <Button
                  onClick={handleOpenCancelDialog}
                  disabled={cancelPaymentMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy thanh toán
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
              In hóa đơn
            </Button>
          </>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy thanh toán này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancel-reason">Lý do hủy (tùy chọn)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Nhập lý do hủy thanh toán..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelPaymentMutation.isPending}>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={cancelPaymentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelPaymentMutation.isPending ? 'Đang hủy...' : 'Hủy thanh toán'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
