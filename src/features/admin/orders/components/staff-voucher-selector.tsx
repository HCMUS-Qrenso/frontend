'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Tag,
  Loader2,
  X,
  Check,
  Search,
  Percent,
  DollarSign,
  Users,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import { useStaffVouchersQuery } from '@/src/features/admin/vouchers/queries'
import { ordersApi } from '../api'
import { ordersQueryKeys } from '../queries'
import type { Voucher } from '@/src/features/admin/vouchers/types'
import { toast } from 'sonner'

interface StaffVoucherSelectorProps {
  orderId: string
  orderSubtotal: number
  appliedVouchers?: Array<{
    redemptionId: string
    code: string
    name: string
    discountAmount: number
  }>
  onVoucherApplied?: (discountAmount: number) => void
  onVoucherRemoved?: () => void
  disabled?: boolean
}

/**
 * Staff voucher selector component for waiter/admin to apply vouchers on orders
 * Supports multiple vouchers per order
 */
export function StaffVoucherSelector({
  orderId,
  orderSubtotal,
  appliedVouchers = [],
  onVoucherApplied,
  onVoucherRemoved,
  disabled = false,
}: StaffVoucherSelectorProps) {
  const t = useTranslations('vouchers')
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [applyingCode, setApplyingCode] = useState(false)

  const { data, isLoading, refetch } = useStaffVouchersQuery()
  const queryClient = useQueryClient()
  const vouchers = data?.data || []

  // Filter vouchers by search
  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()),
  )

  // Check if voucher is eligible based on minimum subtotal
  const isEligible = (voucher: Voucher) => {
    if (voucher.minSubtotal && orderSubtotal < voucher.minSubtotal) {
      return false
    }
    return true
  }

  // Calculate estimated discount
  const estimateDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'percent') {
      const discount = orderSubtotal * ((voucher.percentOff || 0) / 100)
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        return voucher.maxDiscountAmount
      }
      return discount
    }
    return voucher.amountOff || 0
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  // Apply voucher by ID
  const handleApplyVoucher = async (voucherId: string) => {
    setApplyingId(voucherId)
    try {
      const result = await ordersApi.applyVoucher(orderId, voucherId)
      toast.success(t('applySuccess'))
      setIsOpen(false)
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      onVoucherApplied?.(result.data.discountAmount)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('applyError'))
    } finally {
      setApplyingId(null)
    }
  }

  // Apply voucher by code - find voucher first then apply
  const handleApplyCode = async () => {
    if (!codeInput.trim()) return

    setApplyingCode(true)
    try {
      // Find voucher by code in the list
      const voucher = vouchers.find((v) => v.code.toLowerCase() === codeInput.toLowerCase())
      if (!voucher) {
        toast.error(t('invalidCode'))
        setApplyingCode(false)
        return
      }

      const result = await ordersApi.applyVoucher(orderId, voucher.id)
      toast.success(t('applySuccess'))
      setIsOpen(false)
      setCodeInput('')
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      onVoucherApplied?.(result.data.discountAmount)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('applyError'))
    } finally {
      setApplyingCode(false)
    }
  }

  // Remove applied voucher by redemptionId
  const handleRemoveVoucher = async (redemptionId: string) => {
    setRemoving(true)
    try {
      await ordersApi.revokeVoucher(orderId, redemptionId, 'Removed by staff')
      toast.success(t('revokeSuccess'))
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() })
      onVoucherRemoved?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('revokeError'))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Show all applied vouchers */}
      {appliedVouchers.length > 0 && (
        <div className="space-y-2">
          {appliedVouchers.map((voucher) => (
            <div
              key={voucher.redemptionId}
              className="flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/20"
            >
              <div className="flex flex-1 items-center gap-2">
                <Ticket className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {voucher.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {voucher.code} • -{formatCurrency(voucher.discountAmount)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveVoucher(voucher.redemptionId)}
                disabled={disabled || removing}
                className="text-green-700 hover:bg-red-50 hover:text-red-600"
              >
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add voucher button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
            <Tag className="h-4 w-4" />
            {appliedVouchers.length > 0
              ? t('actions.addAnotherVoucher')
              : t('actions.applyVoucher')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b p-3">
            <h4 className="text-sm font-medium">{t('staffSelector.title')}</h4>
            <p className="text-muted-foreground mt-1 text-xs">{t('staffSelector.subtitle')}</p>
          </div>

          {/* Search */}
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('staffSelector.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8"
              />
            </div>
          </div>

          {/* Voucher list */}
          <div className="h-[200px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                {t('staffSelector.noVouchers')}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredVouchers.map((voucher) => {
                  const eligible = isEligible(voucher)
                  const discount = estimateDiscount(voucher)

                  return (
                    <button
                      key={voucher.id}
                      onClick={() => eligible && handleApplyVoucher(voucher.id)}
                      disabled={!eligible || applyingId !== null}
                      className={`w-full rounded-md p-2 text-left transition-colors ${
                        eligible
                          ? 'hover:bg-muted cursor-pointer'
                          : 'bg-muted/50 cursor-not-allowed opacity-50'
                      } `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            {voucher.discountType === 'percent' ? (
                              <Percent className="text-muted-foreground h-3 w-3" />
                            ) : (
                              <DollarSign className="text-muted-foreground h-3 w-3" />
                            )}
                            <span className="text-sm font-medium">
                              {voucher.discountType === 'percent'
                                ? `${voucher.percentOff}%`
                                : formatCurrency(voucher.amountOff || 0)}
                            </span>
                            <Badge variant="outline" className="px-1 py-0 text-[10px]">
                              {voucher.code}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {voucher.name}
                          </p>
                          {voucher.minSubtotal && (
                            <div className="mt-1 flex items-center gap-1">
                              <ShoppingBag className="text-muted-foreground h-3 w-3" />
                              <span className="text-muted-foreground text-[10px]">
                                Đơn từ {formatCurrency(voucher.minSubtotal)}
                              </span>
                            </div>
                          )}
                        </div>
                        {eligible && (
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-medium text-green-600">
                              -{formatCurrency(discount)}
                            </p>
                            {applyingId === voucher.id && (
                              <Loader2 className="mx-auto mt-1 h-3 w-3 animate-spin" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Manual code input */}
          <div className="p-2">
            <p className="text-muted-foreground mb-2 text-xs">{t('staffSelector.orEnterCode')}</p>
            <div className="flex gap-2">
              <Input
                placeholder="CODE"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                className="h-8 uppercase"
              />
              <Button
                size="sm"
                onClick={handleApplyCode}
                disabled={!codeInput.trim() || applyingCode}
              >
                {applyingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
