'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { toast } from 'sonner'
import type { Staff } from '@/src/features/admin/staff/types/staff'
import { useDeleteStaffMutation } from '@/src/features/admin/staff/queries/staff.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'

interface StaffDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
}

export function StaffDeleteDialog({ open, onOpenChange, staff }: StaffDeleteDialogProps) {
  const deleteMutation = useDeleteStaffMutation()
  const { handleError } = useErrorHandler()

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(staff.id)
      toast.success('Đã xóa nhân viên thành công')
      onOpenChange(false)
    } catch (error) {
      handleError(error, 'Không thể xóa nhân viên')
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa nhân viên?"
      description="Hành động này không thể hoàn tác."
      itemName={staff.fullName}
      onConfirm={handleConfirmDelete}
      isLoading={deleteMutation.isPending}
      confirmText="Xóa"
    />
  )
}
