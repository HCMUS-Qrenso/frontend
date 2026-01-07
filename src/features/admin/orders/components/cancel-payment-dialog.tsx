'use client'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { Order } from '../types'
import { useCancelPaymentMutation } from '../queries'

interface CancelPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderToCancel: Order | null
}

export function CancelPaymentDialog({
  open,
  onOpenChange,
  orderToCancel,
}: CancelPaymentDialogProps) {
  const [cancelReason, setCancelReason] = useState('')
  const cancelPaymentMutation = useCancelPaymentMutation()

  const handleCancelPayment = async () => {
    if (!orderToCancel) return

    const activePayment = orderToCancel.payments?.find(
      (p: { status: string }) => !['cancelled', 'failed', 'paid'].includes(p.status),
    )
    if (!activePayment) return

    try {
      await cancelPaymentMutation.mutateAsync({
        paymentId: activePayment.id,
        reason: cancelReason || undefined,
      })
      toast.success('Đã hủy thanh toán')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy thanh toán')
    }

    onOpenChange(false)
    setCancelReason('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            disabled={cancelPaymentMutation.isPending || !cancelReason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {cancelPaymentMutation.isPending ? 'Đang hủy...' : 'Hủy thanh toán'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
