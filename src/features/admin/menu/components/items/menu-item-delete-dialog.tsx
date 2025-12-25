'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteMenuItemMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { MenuItem } from '@/src/features/admin/menu/types'

interface MenuItemDeleteDialogProps {
  open: boolean
  item: MenuItem | null
  onOpenChange: (open: boolean) => void
}

export function MenuItemDeleteDialog({ open, item, onOpenChange }: MenuItemDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutation
  const deleteMutation = useDeleteMenuItemMutation()

  const handleDelete = async () => {
    if (!item) return

    try {
      await deleteMutation.mutateAsync(item.id)
      onOpenChange(false)
      toast.success('Đã xóa món ăn thành công')
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xóa món ăn')
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa món"
      description="Hành động này không thể hoàn tác. Món ăn sẽ bị xóa vĩnh viễn khỏi menu."
      itemName={item?.name}
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
      confirmText="Xóa món ăn"
    />
  )
}
