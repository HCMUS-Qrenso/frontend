'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'
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
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
            Xóa khu vực?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            Bạn có chắc chắn muốn xóa khu vực "{zoneName}" không? Hành động này không thể hoàn tác.
            {zoneName !== 'khu vực này' && (
              <span className="mt-1 block font-medium text-red-600 dark:text-red-400">
                Lưu ý: Chỉ có thể xóa khu vực không có bàn nào.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
          <AlertDialogCancel
            disabled={isDeleting}
            className="m-0 rounded-full"
            onClick={handleClose}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="m-0 gap-2 rounded-full bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? 'Đang xóa...' : 'Xóa khu vực'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
