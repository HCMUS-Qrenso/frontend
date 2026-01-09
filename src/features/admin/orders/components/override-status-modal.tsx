'use client'

import { useState } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { Checkbox } from '@/src/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

const STATUS_VALUES = [
  'pending',
  'accepted',
  'in_progress',
  'preparing',
  'ready',
  'served',
  'completed',
  'rejected',
  'cancelled',
]

interface OverrideStatusModalProps {
  orderId: string
  currentStatus: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OverrideStatusModal({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: OverrideStatusModalProps) {
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [notifyStaff, setNotifyStaff] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('orders')

  const getStatusLabel = (status: string) => t(`status.${status}` as any) || status

  const handleSubmit = async () => {
    if (!newStatus || !reason.trim()) {
      toast.error(t('toast.selectStatusAndReason'))
      return
    }

    setLoading(true)
    console.log('[v0] Override status:', { orderId, currentStatus, newStatus, reason, notifyStaff })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    onOpenChange(false)

    // Reset form
    setNewStatus('')
    setReason('')
    setNotifyStaff(false)

    toast.success(t('toast.statusUpdated'))
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dialog.changeStatusTitle')}
      description={t('dialog.changeStatusDesc', { orderId })}
      onSubmit={handleSubmit}
      isSubmitting={loading}
      submitText={t('dialog.confirm')}
      loadingText={t('paymentCard.processing')}
      size="md"
    >
      {/* Current Status */}
      <div className="space-y-2">
        <Label>{t('dialog.currentStatus')}</Label>
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-900 capitalize dark:text-white">
            {getStatusLabel(currentStatus)}
          </p>
        </div>
      </div>

      {/* New Status */}
      <FormDialogField label={t('dialog.newStatus')} required>
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger id="new-status">
            <SelectValue placeholder={t('dialog.selectNewStatus')} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_VALUES.filter((s) => s !== currentStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Reason */}
      <FormDialogField label={t('dialog.reason')} required>
        <Textarea
          id="reason"
          placeholder={t('dialog.reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </FormDialogField>

      {/* Notify Staff */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="notify"
          checked={notifyStaff}
          onCheckedChange={(checked) => setNotifyStaff(checked === true)}
        />
        <label
          htmlFor="notify"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('dialog.notifyStaff')}
        </label>
      </div>
    </FormDialog>
  )
}
