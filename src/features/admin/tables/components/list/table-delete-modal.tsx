import { Table } from '@/src/features/admin/tables/types/tables'
import { ConfirmDeleteDialog } from '../../../../../components/ui/confirm-delete-dialog'
import { useDeleteTableMutation } from '@/src/features/admin/tables/queries/tables.queries'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'

interface TableDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table | null
}

export function TableDeleteModal({ open, onOpenChange, table }: TableDeleteModalProps) {
  const deleteMutation = useDeleteTableMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  // Format table info for display
  const getTableDisplayInfo = (table: Table | null): string => {
    if (!table) return ''
    const zoneName = table.zone_name || table.floor || 'Chưa xác định'
    return `${zoneName} - Bàn #${table.table_number} - ${table.capacity} ghế`
  }

  const handleConfirmDelete = async () => {
    if (!table) return

    try {
      await deleteMutation.mutateAsync(table.id)
      toast.success('Bàn đã được xóa thành công')
      onOpenChange(false)
    } catch (error: any) {
      // Handle specific error cases with custom message for 409
      const status = error?.response?.status
      if (status === 409) {
        // Extract message directly from backend response
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'Không thể xóa bàn đang có đơn hàng'
        toast.error(message)
      } else {
        // Use default error handler for other errors
        handleErrorWithStatus(error, undefined, 'Không thể xóa bàn. Vui lòng thử lại.')
      }
      // Keep dialog open on error so user can try again or cancel
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa bàn này?"
      description="Hành động này không thể hoàn tác."
      itemName={getTableDisplayInfo(table)}
      onConfirm={handleConfirmDelete}
      isLoading={deleteMutation.isPending}
      confirmText="Xóa bàn"
    />
  )
}
