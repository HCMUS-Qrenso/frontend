"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Copy, CreditCard, Check } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Mock data
const MOCK_PAYMENT = {
  status: "completed",
  payment_method: "momo",
  amount: 285000,
  currency: "VND",
  transaction_id: "TXN-20240118-ABC123",
  paid_at: new Date(Date.now() - 5 * 60 * 1000),
  refunded_at: null,
  refund_amount: null,
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Chưa thanh toán", color: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  completed: {
    label: "Đã thanh toán",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  refunded: { label: "Đã hoàn tiền", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ",
  momo: "MoMo",
  zalopay: "ZaloPay",
  vnpay: "VNPay",
  stripe: "Stripe",
}

interface PaymentCardProps {
  orderId: string
}

export function PaymentCard({ orderId }: PaymentCardProps) {
  const [copied, setCopied] = useState(false)
  const payment = MOCK_PAYMENT

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.transaction_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thanh toán</h2>
        <Badge className={cn("text-xs font-medium", PAYMENT_STATUS_CONFIG[payment.status]?.color)}>
          {PAYMENT_STATUS_CONFIG[payment.status]?.label}
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
              {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* Amount */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {payment.amount.toLocaleString("vi-VN")} {payment.currency}
          </p>
        </div>

        {/* Transaction ID */}
        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">Mã giao dịch</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 font-mono text-sm text-slate-900 dark:text-white">{payment.transaction_id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Paid At */}
        {payment.paid_at && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Thời gian thanh toán</p>
            <p className="text-sm text-slate-900 dark:text-white">
              {format(payment.paid_at, "HH:mm, dd/MM/yyyy", { locale: vi })}
            </p>
          </div>
        )}

        {/* Refund Info */}
        {payment.refunded_at && payment.refund_amount && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">Đã hoàn tiền</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Số tiền: {payment.refund_amount.toLocaleString("vi-VN")} {payment.currency}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {format(payment.refunded_at, "HH:mm, dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
