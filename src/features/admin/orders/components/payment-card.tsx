'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { Copy, CreditCard, Check } from 'lucide-react'
import { useState } from 'react'
import type { PaymentRecord } from '../types/orders'
import { useFormat } from '@/src/hooks/use-format'

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Chưa thanh toán',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  completed: {
    label: 'Đã thanh toán',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  failed: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
  stripe: 'Stripe',
}

interface PaymentCardProps {
  payments: PaymentRecord[]
  totalAmount: number
}

export function PaymentCard({ payments, totalAmount }: PaymentCardProps) {
  const [copied, setCopied] = useState(false)
  const { formatPrice, formatDateTime } = useFormat()

  // Get the most recent completed payment, or first payment
  const payment = payments.find((p) => p.status === 'completed') || payments[0]
  const hasPayment = payments.length > 0 && payment
  const paymentStatus = hasPayment ? payment.status : 'pending'

  const handleCopy = () => {
    if (payment?.transactionId) {
      navigator.clipboard.writeText(payment.transactionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
              {hasPayment && payment.method
                ? PAYMENT_METHOD_LABELS[payment.method] || payment.method
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
            {formatPrice(totalAmount)}
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
              {formatDateTime(payment.paidAt)}
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
                Số tiền: {formatPrice(payment.refundAmount)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {formatDateTime(payment.refundedAt)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
