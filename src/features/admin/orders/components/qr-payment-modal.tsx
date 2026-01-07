'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { useCheckPaymentStatusMutation, useOrderQuery } from '../queries'

interface QrPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrCode: string | null
  amount: number
  orderNumber: string
  orderCode?: number
  orderId: string
  onClose: () => void
}

export function QrPaymentModal({
  open,
  onOpenChange,
  qrCode,
  amount,
  orderNumber,
  orderCode,
  orderId,
  onClose,
}: QrPaymentModalProps) {
  const checkPaymentStatusMutation = useCheckPaymentStatusMutation()
  const { data: orderData } = useOrderQuery(orderId)

  // Auto-close when payment is confirmed via socket
  useEffect(() => {
    if (!open || !orderData?.data) return

    const order = orderData.data
    console.log('[QR Modal] Order data updated:', {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      payments: order.payments?.map((p) => ({ id: p.id, status: p.status })),
    })

    // Check if there's a paid payment
    const hasPaidPayment = order.payments?.some((p) => p.status === 'paid')

    if (hasPaidPayment && order.paymentStatus === 'paid') {
      console.log('[QR Modal] Payment confirmed, closing modal')
      toast.success('Thanh toán đã được xác nhận!')
      onClose()
    }
  }, [open, orderData, onClose])

  const handleCheckStatus = async () => {
    if (!orderCode) {
      toast.error('Không có mã đơn hàng')
      return
    }

    try {
      const result = await checkPaymentStatusMutation.mutateAsync(orderCode)
      if (result.status === 'paid') {
        toast.success('Thanh toán đã được xác nhận!')
        onClose()
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mã QR Thanh Toán</DialogTitle>
          <DialogDescription>
            Hiển thị mã QR này cho khách hàng quét để thanh toán
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="rounded-lg border-4 border-slate-200 p-4 dark:border-slate-700">
            {qrCode ? (
              <img
                src={qrCode}
                alt="QR Code"
                className="h-64 w-64"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  toast.error('Không thể tải mã QR')
                }}
              />
            ) : (
              <div className="text-muted-foreground flex h-64 w-64 items-center justify-center">
                Không có mã QR
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{amount.toLocaleString('vi-VN')}₫</p>
            <p className="text-muted-foreground text-sm">Đơn hàng {orderNumber}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-center">
          {orderCode && (
            <Button
              onClick={handleCheckStatus}
              disabled={checkPaymentStatusMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {checkPaymentStatusMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kiểm tra trạng thái
                </>
              )}
            </Button>
          )}
          <Button onClick={onClose} className="flex-1">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
