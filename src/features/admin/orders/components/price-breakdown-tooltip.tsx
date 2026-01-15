'use client'

import { useMemo } from 'react'
import { useFormat } from '@/src/hooks/use-format'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'

interface PriceData {
  subtotal: number
  taxAmount: number
  serviceCharge?: number
  discountAmount?: number
  totalAmount: number
}

interface PriceBreakdownTooltipProps {
  children: React.ReactNode
  price: PriceData
}

/**
 * Tooltip component that shows price breakdown when hovering over total amount.
 * Displays subtotal, service charge, tax (with label from settings), discount, and total.
 * Uses CSS-based hover tooltip (same pattern as items tooltip in orders-table).
 */
export function PriceBreakdownTooltip({ children, price }: PriceBreakdownTooltipProps) {
  const { formatPrice } = useFormat()
  const { settings } = useTenantSettings()

  const breakdown = useMemo(() => {
    const items: { label: string; amount: number; isNegative?: boolean }[] = []

    // Subtotal
    items.push({
      label: 'Tạm tính',
      amount: price.subtotal,
    })

    // Service charge (if applicable)
    if (price.serviceCharge && price.serviceCharge > 0) {
      items.push({
        label: `Phí dịch vụ (${settings.service_charge.rate}%)`,
        amount: price.serviceCharge,
      })
    }

    // Tax - use label from tenant settings
    if (price.taxAmount > 0) {
      const taxLabel = settings.tax.inclusive
        ? `${settings.tax.label} (${settings.tax.rate}%, đã bao gồm)`
        : `${settings.tax.label} (${settings.tax.rate}%)`
      items.push({
        label: taxLabel,
        amount: price.taxAmount,
      })
    }

    // Discount (if applicable)
    if (price.discountAmount && price.discountAmount > 0) {
      items.push({
        label: 'Giảm giá',
        amount: -price.discountAmount,
        isNegative: true,
      })
    }

    return items
  }, [price, settings])

  // Don't show tooltip if there's nothing interesting to show
  const shouldShowTooltip =
    breakdown.length > 1 || price.taxAmount > 0 || (price.serviceCharge && price.serviceCharge > 0)

  if (!shouldShowTooltip) {
    return <>{children}</>
  }

  return (
    <div className="group relative inline-block">
      {children}
      {/* Tooltip - position left to avoid overflow */}
      <div className="invisible absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-1.5">
          <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">Chi tiết giá</p>
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
              <span
                className={
                  item.isNegative
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300'
                }
              >
                {item.isNegative ? '-' : ''}
                {formatPrice(Math.abs(item.amount))}
              </span>
            </div>
          ))}
          <div className="mt-1.5 border-t border-slate-200 pt-1.5 dark:border-slate-700">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-white">Tổng cộng</span>
              <span className="text-slate-900 dark:text-white">
                {formatPrice(price.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
