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
  transactionId?: string
  orderId: string
  onClose: () => void
}

export function QrPaymentModal({
  open,
  onOpenChange,
  qrCode,
  amount,
  orderNumber,
  transactionId,
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
    if (!transactionId) {
      toast.error('Không có mã giao dịch')
      return
    }

    try {
      const result = await checkPaymentStatusMutation.mutateAsync(transactionId)
      if (result.status === 'paid') {
        toast.success('Thanh toán đã được xác nhận!')
        onClose()
      } else if (result.status === 'pending') {
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
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-w-md dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 p-6 dark:border-slate-800">
          <DialogTitle>Mã QR Thanh Toán</DialogTitle>
          <DialogDescription>
            Hiển thị mã QR này cho khách hàng quét để thanh toán
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
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
        </div>
        <DialogFooter className="gap-2 border-t border-slate-200 px-6 py-6 sm:justify-center dark:border-slate-800">
          {transactionId && (
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
