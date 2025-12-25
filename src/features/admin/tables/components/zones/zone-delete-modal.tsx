'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteZoneMutation } from '@/src/features/admin/tables/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Zone } from '@/src/features/admin/tables/types'

interface ZoneDeleteModalProps {
  open: boolean
  zone: Zone | null
  onOpenChange: (open: boolean) => void
}

export function ZoneDeleteModal({ open, zone, onOpenChange }: ZoneDeleteModalProps) {
  const zoneName = zone?.name || 'khu vực này'

  const deleteMutation = useDeleteZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const isDeleting = deleteMutation.isPending

  const handleConfirmDelete = async () => {
    if (!zone) return

    try {
      await deleteMutation.mutateAsync(zone.id)
      toast.success('Khu vực đã được xóa thành công')
      onOpenChange(false)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'Không thể xóa khu vực đang có bàn'
        toast.error(message)
      } else {
        handleErrorWithStatus(error, undefined, 'Không thể xóa khu vực. Vui lòng thử lại.')
      }
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa khu vực?"
      description="Hành động này không thể hoàn tác. Lưu ý: Chỉ có thể xóa khu vực không có bàn nào."
      itemName={zoneName !== 'khu vực này' ? zoneName : undefined}
      onConfirm={handleConfirmDelete}
      isLoading={isDeleting}
      confirmText="Xóa khu vực"
    />
  )
}
