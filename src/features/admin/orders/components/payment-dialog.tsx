'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import { Textarea } from '@/src/components/ui/textarea'
import { Separator } from '@/src/components/ui/separator'
import { Banknote, QrCode, Printer, Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useCreatePaymentMutation } from '../queries'
import { printBill } from '../utils/print-bill'
import { toast } from 'sonner'
import type { Order } from '../types/orders'
import { QrPaymentModal } from './qr-payment-modal'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  tenantName?: string | null
  tenantAddress?: string | null
}

type PaymentMethod = 'cash' | 'qr'
type DialogAction = 'print' | 'payment'

export function PaymentDialog({
  open,
  onOpenChange,
  order,
  tenantName,
  tenantAddress,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [action, setAction] = useState<DialogAction>('print')
  const [description, setDescription] = useState('')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<number | undefined>(undefined)

  const createPaymentMutation = useCreatePaymentMutation()

  const handleProcessPayment = async () => {
    if (!order) return

    // Validate order status
    if (order.status !== 'completed') {
      toast.error('Chỉ có thể thanh toán cho đơn hàng đã hoàn thành')
      return
    }

    // Check for existing active payment
    const activePayment = order.payments?.find(
      (p) => !['cancelled', 'failed', 'paid'].includes(p.status),
    )
    if (activePayment) {
      toast.error(
        'Đơn hàng đang có thanh toán đang xử lý. Vui lòng hoàn tất hoặc hủy thanh toán hiện tại trước.',
      )
      return
    }

    // For print action: create payment first, then print phiếu tạm tính
    if (action === 'print') {
      try {
        // Create payment record
        const result = await createPaymentMutation.mutateAsync({
          orderId: order.id,
          paymentMethod,
          description: description || `Thanh toán đơn hàng ${order.orderNumber}`,
        })

        // Print phiếu tạm tính with payment info (including QR for qr)
        printBill({
          order,
          billType: 'temporary',
          paymentMethod,
          description: description || `Thanh toán đơn hàng ${order.orderNumber}`,
          qrCodeData: result?.qrCodeData,
          tenantName,
          tenantAddress,
        })

        if (paymentMethod === 'cash') {
          toast.success('Đã in phiếu tạm tính. Mang ra bàn và nhận tiền, sau đó nhấn "Hoàn tất".')
        } else {
          toast.success('Đã in phiếu tạm tính với mã QR. Mang ra bàn cho khách quét.')
        }

        onOpenChange(false)

        // Only reset to default state
        setPaymentMethod('cash')
        setAction('print')
        setDescription('')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể tạo thanh toán')
      }
      return
    }

    // For payment action: just create payment without printing
    try {
      const result = await createPaymentMutation.mutateAsync({
        orderId: order.id,
        paymentMethod,
        description: description || `Thanh toán đơn hàng ${order.orderNumber}`,
      })

      if (paymentMethod === 'cash') {
        toast.success('Đã tạo thanh toán. Nhận tiền và nhấn "Hoàn tất".')
        onOpenChange(false)
      } else {
        // For QR payment at counter, show QR modal
        if (result?.qrCode) {
          setQrCode(result.qrCode)
          setOrderCode(result.orderCode)
          setQrModalOpen(true)
          toast.success('Đã tạo mã QR thanh toán')
        }
      }

      // Reset form (don't close dialog for QR counter payment - wait for QR modal)
      if (paymentMethod === 'cash') {
        setPaymentMethod('cash')
        setAction('print')
        setDescription('')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo thanh toán')
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tính tiền - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Bàn {order.table?.tableNumber} - Tổng: {order.totalAmount.toLocaleString('vi-VN')}₫
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning for non-completed orders */}
          {order.status !== 'completed' && (
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-500/10">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                ⚠️ Đơn hàng chưa hoàn thành
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Chỉ có thể in phiếu tạm tính. Tạo thanh toán chỉ khả dụng khi đơn hàng đã hoàn
                thành.
              </p>
            </div>
          )}

          {/* Warning for existing active payment */}
          {(() => {
            const activePayment = order.payments?.find(
              (p) => !['cancelled', 'failed', 'paid'].includes(p.status),
            )
            if (activePayment) {
              const statusLabels: Record<string, string> = {
                pending: 'chờ thanh toán',
                processing: 'đang xử lý',
              }
              const methodLabels: Record<string, string> = {
                cash: 'Tiền mặt',
                payos: 'VietQR',
              }
              return (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                    💳 Thanh toán đang xử lý
                  </p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Phương thức:{' '}
                    {methodLabels[activePayment.paymentMethod || ''] || activePayment.paymentMethod}{' '}
                    - Trạng thái: {statusLabels[activePayment.status] || activePayment.status}
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Không thể tạo thanh toán mới. Vui lòng hoàn tất hoặc hủy thanh toán hiện tại.
                  </p>
                </div>
              )
            }
            return null
          })()}

          {/* Action Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Hành động</Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as DialogAction)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="print" id="print" />
                <Label
                  htmlFor="print"
                  className="flex cursor-pointer items-center gap-2 font-normal"
                >
                  <Printer className="h-4 w-4" />
                  <div>
                    <div className="font-medium">In phiếu tạm tính</div>
                    <div className="text-muted-foreground text-xs">
                      Tạo thanh toán và in phiếu mang ra bàn
                    </div>
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
                    <div className="font-medium">Tạo thanh toán</div>
                    <div className="text-muted-foreground text-xs">
                      Tạo thanh toán không in phiếu (thanh toán ngay)
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method (always show when order is completed) */}
          {order.status === 'completed' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold">Phương thức thanh toán</Label>
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
                        <div className="font-medium">Tiền mặt</div>
                        <div className="text-muted-foreground text-xs">
                          Nhận tiền, sau đó nhấn "Hoàn tất"
                        </div>
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
                        <div className="font-medium">VietQR</div>
                        <div className="text-muted-foreground text-xs">
                          Tạo mã QR, khách quét để thanh toán
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Ghi chú (tuỳ chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập ghi chú cho giao dịch..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="mb-3 text-sm font-semibold">Tóm tắt đơn hàng</div>
            <div className="space-y-2 text-sm">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{item.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-muted-foreground text-xs">
                  +{order.items.length - 3} món khác
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng:</span>
                <span>{order.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createPaymentMutation.isPending}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleProcessPayment}
            disabled={
              createPaymentMutation.isPending ||
              !!order.payments?.find((p) => !['cancelled', 'failed', 'paid'].includes(p.status))
            }
          >
            {createPaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                {action === 'print' ? 'Tạo thanh toán & In phiếu' : 'Tạo thanh toán'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* QR Code Display Modal for Counter Payments */}
      <QrPaymentModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        qrCode={qrCode}
        amount={order?.totalAmount || 0}
        orderNumber={order?.orderNumber || ''}
        orderCode={orderCode}
        orderId={order?.id || ''}
        onClose={() => {
          setQrModalOpen(false)
          setQrCode(null)
          setOrderCode(undefined)
          onOpenChange(false)
          setPaymentMethod('cash')
          setAction('print')
          setDescription('')
        }}
      />
    </Dialog>
  )
}
