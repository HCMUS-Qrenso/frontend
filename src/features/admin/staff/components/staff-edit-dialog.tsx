'use client'

import { useState, useEffect } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { toast } from 'sonner'
import type { Staff } from '@/src/features/admin/staff/types'
import { useUpdateStaffMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useTranslations } from 'next-intl'

type StaffStatus = Staff['status']

interface StaffEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
}

export function StaffEditDialog({ open, onOpenChange, staff }: StaffEditDialogProps) {
  const [fullName, setFullName] = useState(staff.fullName)
  const [phone, setPhone] = useState(staff.phone || '')
  const [status, setStatus] = useState<StaffStatus>(staff.status)
  const t = useTranslations('staff')

  const updateMutation = useUpdateStaffMutation()
  const { handleError } = useErrorHandler()

  // Reset form when staff changes or dialog opens
  useEffect(() => {
    if (open) {
      setFullName(staff.fullName)
      setPhone(staff.phone || '')
      setStatus(staff.status)
    }
  }, [open, staff])

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error(t('enterFullName'))
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: staff.id,
        payload: {
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          status,
        },
      })
      toast.success(t('updateSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleError(error, t('updateError'))
    }
  }

  const getRoleLabelText = (role: string) => {
    if (role === 'waiter') return t('waiter')
    if (role === 'admin') return t('admin')
    return t('kitchenStaff')
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editTitle')}
      description={t('editDesc')}
      onSubmit={handleSubmit}
      isSubmitting={updateMutation.isPending}
      submitText={t('saveChanges')}
      loadingText={t('savingChanges')}
      size="md"
    >
      {/* Họ và tên */}
      <FormDialogField label={t('fullNameLabel')} required>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={updateMutation.isPending}
        />
      </FormDialogField>

      {/* Email (read-only) */}
      <FormDialogField label={t('email')}>
        <Input id="email" value={staff.email} disabled className="bg-slate-50 dark:bg-slate-900" />
      </FormDialogField>

      {/* Số điện thoại */}
      <FormDialogField label={t('phone')}>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          disabled={updateMutation.isPending}
        />
      </FormDialogField>

      {/* Vai trò (read-only) */}
      <FormDialogField label={t('role')}>
        <Input
          id="role"
          value={getRoleLabelText(staff.role)}
          disabled
          className="bg-slate-50 dark:bg-slate-900"
        />
      </FormDialogField>

      {/* Trạng thái */}
      <FormDialogField label={t('status')}>
        <Select
          value={status}
          onValueChange={(value: StaffStatus) => setStatus(value)}
          disabled={updateMutation.isPending}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('activeStatus')}</SelectItem>
            <SelectItem value="inactive">{t('inactiveStatus')}</SelectItem>
            <SelectItem value="suspended">{t('suspendedStatus')}</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>
    </FormDialog>
  )
}
