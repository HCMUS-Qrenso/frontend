'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { useDeleteZoneMutation } from '@/hooks/use-zones-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

export function ZoneDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const deleteType = searchParams.get('delete')
  const zoneId = searchParams.get('id')
  const zoneName = searchParams.get('name') || 'khu vực này'

  const open = deleteType === 'zone' && !!zoneId

  const deleteMutation = useDeleteZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const isDeleting = deleteMutation.isPending

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    params.delete('name')
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

  const handleConfirmDelete = async () => {
    if (!zoneId) return

    try {
      await deleteMutation.mutateAsync(zoneId)
      toast.success('Khu vực đã được xóa thành công')
      handleClose()
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
      onOpenChange={handleClose}
      title="Xóa khu vực?"
      description="Hành động này không thể hoàn tác. Lưu ý: Chỉ có thể xóa khu vực không có bàn nào."
      itemName={zoneName !== 'khu vực này' ? zoneName : undefined}
      onConfirm={handleConfirmDelete}
      isLoading={isDeleting}
      confirmText="Xóa khu vực"
    />
  )
}

