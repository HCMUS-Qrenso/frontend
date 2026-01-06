'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { toast } from 'sonner'
import type { Staff } from '@/src/features/admin/staff/types'
import { useDeleteStaffMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useTranslations } from 'next-intl'

interface StaffDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
}

export function StaffDeleteDialog({ open, onOpenChange, staff }: StaffDeleteDialogProps) {
  const deleteMutation = useDeleteStaffMutation()
  const { handleError } = useErrorHandler()
  const t = useTranslations('staff')

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(staff.id)
      toast.success(t('deleteSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleError(error, t('deleteError'))
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteTitle')}
      description={t('deleteDesc')}
      itemName={staff.fullName}
      onConfirm={handleConfirmDelete}
      isLoading={deleteMutation.isPending}
      confirmText={t('deleteConfirm')}
    />
  )
}
