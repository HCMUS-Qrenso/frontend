'use client'

import { useEffect, useState } from 'react'
import {
  FormDialog,
  FormDialogField,
  FormDialogSectionGroup,
  FormDialogDivider,
} from '@/src/components/ui/form-dialog'
import { Label } from '@/src/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import { Textarea } from '@/src/components/ui/textarea'
import { Separator } from '@/src/components/ui/separator'
import { Banknote, QrCode, Printer, Ticket } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useCreatePaymentMutation, useOrderQuery } from '../queries'
import { printBill } from '../utils/print-bill'
import { toast } from 'sonner'
import type { Order, OrderDetail } from '../types/orders'
import { QrPaymentModal } from './qr-payment-modal'
import { StaffVoucherSelector } from './staff-voucher-selector'
import { useTranslations } from 'next-intl'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'
import { useLocale } from 'next-intl'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | OrderDetail | null
  tenantName?: string | null
  tenantAddress?: string | null
}

type PaymentMethod = 'cash' | 'qr'
type DialogAction = 'print' | 'payment'

export function PaymentDialog({
  open,
  onOpenChange,
  order: orderProp,
  tenantName,
  tenantAddress,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [action, setAction] = useState<DialogAction>('print')
  const [description, setDescription] = useState('')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined)

  // Fetch fresh order data to get applied vouchers
  const { data: orderData } = useOrderQuery(orderProp?.id || null, open && !!orderProp?.id)

  // Use fresh data if available, fallback to prop
  const order = orderData?.data || orderProp

  const createPaymentMutation = useCreatePaymentMutation()
  const t = useTranslations('orders')
  const locale = useLocale()
  const { settings } = useTenantSettings()

  useEffect(() => {
    if (open) {
      // Set defaults when dialog opens
      setPaymentMethod('cash')
      setAction('print')
      setDescription('')
    }
  }, [open])

  const handleProcessPayment = async () => {
    if (!order) return

    // Validate order status
    if (order.status !== 'completed') {
      toast.error(t('warning.orderNotCompleted'))
      return
    }

    // Check for existing active payment
    const activePayment = order.payments?.find(
      (p) => !['cancelled', 'failed', 'paid'].includes(p.status),
    )
    if (activePayment) {
      toast.error(t('warning.paymentInProgress'))
      return
    }

    // For print action: create payment first, then print phiếu tạm tính
    if (action === 'print') {
      try {
        // Create payment record
        const result = await createPaymentMutation.mutateAsync({
          orderId: order.id,
          paymentMethod,
          description: description || `${order.orderNumber}`,
        })

        // Print phiếu tạm tính with payment info (including QR for qr)
        printBill({
          order,
          billType: 'temporary',
          paymentMethod,
          description: description || `${order.orderNumber}`,
          qrCodeData: result?.qrCodeData,
          tenantName,
          tenantAddress,
          locale,
          receiptHeader: settings.receipt.header,
          receiptFooter: settings.receipt.footer,
          currencySymbol: settings.general.currency_symbol,
        })

        if (paymentMethod === 'cash') {
          toast.success(t('toast.printedCashBill'))
        } else {
          toast.success(t('toast.printedQrBill'))
        }

        onOpenChange(false)

        // Only reset to default state
        setPaymentMethod('cash')
        setAction('print')
        setDescription('')
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.errorCreatePayment'))
      }
      return
    }

    // For payment action: just create payment without printing
    try {
      const result = await createPaymentMutation.mutateAsync({
        orderId: order.id,
        paymentMethod,
        description: description || `${order.orderNumber}`,
      })

      if (paymentMethod === 'cash') {
        toast.success(t('toast.createdCashPayment'))
        onOpenChange(false)
      } else {
        // For QR payment at counter, show QR modal
        if (result?.qrCode) {
          setQrCode(result.qrCode)
          setTransactionId(result.transactionId)
          setQrModalOpen(true)
          toast.success(t('toast.createdQrPayment'))
        }
      }

      // Reset form (don't close dialog for QR counter payment - wait for QR modal)
      if (paymentMethod === 'cash') {
        setPaymentMethod('cash')
        setAction('print')
        setDescription('')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.errorCreatePayment'))
    }
  }

  if (!order) return null

  // Check if there's an active payment
  const hasActivePayment = !!order.payments?.find(
    (p) => !['cancelled', 'failed', 'paid'].includes(p.status),
  )

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('dialog.paymentTitle', { orderNumber: order.orderNumber })}
        description={`${t('header.table')} ${order.table?.tableNumber} - ${t('paymentCard.total')}: ${order.totalAmount.toLocaleString('vi-VN')}₫`}
        onSubmit={handleProcessPayment}
        isSubmitting={createPaymentMutation.isPending}
        submitText={action === 'print' ? t('dialog.createAndPrint') : t('dialog.createPayment')}
        loadingText={t('paymentCard.processing')}
        size="xl"
        scrollable
        submitDisabled={hasActivePayment}
      >
        {/* Warning for non-completed orders */}
        {order.status !== 'completed' && (
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-500/10">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
              ⚠️ {t('warning.orderNotCompletedTitle')}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              {t('warning.orderNotCompletedDesc')}
            </p>
          </div>
        )}

        {/* Warning for existing active payment */}
        {(() => {
          const activePayment = order.payments?.find(
            (p) => !['cancelled', 'failed', 'paid'].includes(p.status),
          )
          if (activePayment) {
            return (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                  💳 {t('warning.paymentProcessing')}
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  {t('paymentCard.method')}:{' '}
                  {t(`paymentMethod.${activePayment.paymentMethod}` as any) ||
                    activePayment.paymentMethod}{' '}
                  - {t('dialog.currentStatus')}:{' '}
                  {t(`paymentStatus.${activePayment.status}` as any) || activePayment.status}
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {t('warning.cannotCreateNewPayment')}
                </p>
              </div>
            )
          }
          return null
        })()}

        {/* Action Selection */}
        <FormDialogSectionGroup title={t('dialog.action')}>
          <RadioGroup value={action} onValueChange={(value) => setAction(value as DialogAction)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="print" id="print" />
              <Label htmlFor="print" className="flex cursor-pointer items-center gap-2 font-normal">
                <Printer className="h-4 w-4" />
                <div>
                  <div className="font-medium">{t('dialog.printBill')}</div>
                  <div className="text-muted-foreground text-xs">{t('dialog.printBillDesc')}</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="payment"
                id="payment"
                disabled={order.status !== 'completed'}
              />
              <Label
                htmlFor="payment"
                className={cn(
                  'flex cursor-pointer items-center gap-2 font-normal',
                  order.status !== 'completed' && 'cursor-not-allowed opacity-50',
                )}
              >
                <Banknote className="h-4 w-4" />
                <div>
                  <div className="font-medium">{t('dialog.createPayment')}</div>
                  <div className="text-muted-foreground text-xs">
                    {t('dialog.createPaymentDesc')}
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </FormDialogSectionGroup>

        {/* Payment Method (always show when order is completed) */}
        {order.status === 'completed' && (
          <>
            <FormDialogDivider />

            <FormDialogSectionGroup title={t('dialog.paymentMethod')}>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <div
                  className={cn(
                    'flex cursor-pointer items-center space-x-3 rounded-lg border-2 p-4 transition-colors',
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex flex-1 cursor-pointer items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                      <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t('paymentMethod.cash')}</div>
                      <div className="text-muted-foreground text-xs">{t('dialog.cashDesc')}</div>
                    </div>
                  </Label>
                </div>

                <div
                  className={cn(
                    'flex cursor-pointer items-center space-x-3 rounded-lg border-2 p-4 transition-colors',
                    paymentMethod === 'qr'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex flex-1 cursor-pointer items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10">
                      <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t('paymentMethod.qr')}</div>
                      <div className="text-muted-foreground text-xs">{t('dialog.qrDesc')}</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </FormDialogSectionGroup>

            <FormDialogDivider />

            <FormDialogField label={t('dialog.notes')}>
              <Textarea
                id="description"
                placeholder={t('dialog.notesPlaceholder')}
                maxLength={25}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
              />
            </FormDialogField>
          </>
        )}

        <FormDialogDivider />

        {/* Order Summary with Price Breakdown */}
        <FormDialogSectionGroup title={t('dialog.orderSummary')}>
          <div className="bg-muted/50 rounded-lg border p-4">
            {/* Items list */}
            <div className="space-y-2 text-sm">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {(item as any).name || (item as any).menuItem?.name}
                  </span>
                  <span>{item.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-muted-foreground text-xs">
                  +{order.items.length - 3} {t('dialog.moreItems')}
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('paymentCard.subtotal')}</span>
                <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
              </div>

              {/* Discount - show each applied voucher */}
              {(order as any).appliedVouchers && (order as any).appliedVouchers.length > 0
                ? // Show individual voucher discounts
                  (order as any).appliedVouchers.map((voucher: any) => (
                    <div
                      key={voucher.redemptionId}
                      className="flex justify-between text-emerald-600 dark:text-emerald-400"
                    >
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        {t('paymentCard.discount')}
                        <span className="text-xs">({voucher.voucherCode})</span>
                      </span>
                      <span>-{voucher.discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))
                : order.discountAmount > 0 && (
                    // Fallback: single discount line
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        {t('paymentCard.discount')}
                        {(order as any).voucherCode && (
                          <span className="text-xs">({(order as any).voucherCode})</span>
                        )}
                      </span>
                      <span>-{order.discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}

              {/* Tax/VAT */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('paymentCard.tax')}</span>
                <span>{order.taxAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Total */}
            <div className="flex justify-between text-base font-bold">
              <span>{t('dialog.total')}:</span>
              <span>{order.totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </FormDialogSectionGroup>

        {/* Staff Voucher Selector - only before payment is created */}
        {order.status === 'completed' &&
          !order.payments?.some((p) => !['cancelled', 'failed'].includes(p.status)) && (
            <FormDialogSectionGroup title={t('dialog.applyVoucher')}>
              <StaffVoucherSelector
                orderId={order.id}
                orderSubtotal={order.subtotal}
                appliedVouchers={((order as any).appliedVouchers || []).map((v: any) => ({
                  redemptionId: v.redemptionId,
                  code: v.voucherCode,
                  name: v.voucherName,
                  discountAmount: v.discountAmount,
                }))}
                onVoucherApplied={(discount) => {
                  // Order will be refreshed via query invalidation
                }}
                onVoucherRemoved={() => {
                  // Order will be refreshed via query invalidation
                }}
              />
            </FormDialogSectionGroup>
          )}
      </FormDialog>

      {/* QR Code Display Modal for Counter Payments */}
      <QrPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        qrCode={qrCode}
        amount={order?.totalAmount || 0}
        orderNumber={order?.orderNumber || ''}
        transactionId={transactionId}
        orderId={order?.id || ''}
        onClose={() => {
          setQrModalOpen(false)
          setQrCode(null)
          setTransactionId(undefined)
          onOpenChange(false)
          setPaymentMethod('cash')
          setAction('print')
          setDescription('')
        }}
      />
    </>
  )
}
