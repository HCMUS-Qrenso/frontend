'use client'

import type { Table } from '@/src/features/admin/tables/types'
import { ConfirmDeleteDialog } from '../../../../../components/ui/confirm-delete-dialog'
import { useDeleteTableMutation } from '@/src/features/admin/tables/queries'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useTranslations } from 'next-intl'

interface TableDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table | null
}

export function TableDeleteModal({ open, onOpenChange, table }: TableDeleteModalProps) {
  const deleteMutation = useDeleteTableMutation()
  const { handleErrorWithStatus } = useErrorHandler()
  const t = useTranslations('tables')

  // Format table info for display
  const getTableDisplayInfo = (table: Table | null): string => {
    if (!table) return ''
    const zoneName = table.zone_name || table.floor || t('undefined')
    return `${zoneName} - ${t('tableCol')} #${table.table_number} - ${table.capacity} ${t('seats')}`
  }

  const handleConfirmDelete = async () => {
    if (!table) return

    try {
      await deleteMutation.mutateAsync(table.id)
      toast.success(t('tableDeletedSuccess'))
      onOpenChange(false)
    } catch (error: any) {
      // Handle specific error cases with custom message for 409
      const status = error?.response?.status
      if (status === 409) {
        // Extract message directly from backend response
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || t('cannotDeleteTableWithOrder')
        toast.error(message)
      } else {
        // Use default error handler for other errors
        handleErrorWithStatus(error, undefined, t('cannotDeleteTable'))
      }
      // Keep dialog open on error so user can try again or cancel
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteTableTitle')}
      description={t('deleteTableDesc')}
      itemName={getTableDisplayInfo(table)}
      onConfirm={handleConfirmDelete}
      isLoading={deleteMutation.isPending}
      confirmText={t('confirmDeleteTable')}
    />
  )
}
