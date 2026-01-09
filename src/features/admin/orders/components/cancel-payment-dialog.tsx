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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('orders')

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
      toast.success(t('toast.paymentCancelled'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.errorCancelPayment'))
    }

    onOpenChange(false)
    setCancelReason('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <AlertDialogHeader className="border-b border-slate-200 pb-2 dark:border-slate-800">
          <AlertDialogTitle>{t('dialog.cancelPaymentTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('dialog.cancelPaymentDesc')}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">{t('dialog.cancelReason')}</Label>
            <Textarea
              id="cancel-reason"
              placeholder={t('dialog.cancelReasonPlaceholder')}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <AlertDialogFooter className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <AlertDialogCancel disabled={cancelPaymentMutation.isPending}>
            {t('dialog.no')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelPayment}
            disabled={cancelPaymentMutation.isPending || !cancelReason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {cancelPaymentMutation.isPending
              ? t('paymentCard.processing')
              : t('paymentCard.cancelPayment')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
