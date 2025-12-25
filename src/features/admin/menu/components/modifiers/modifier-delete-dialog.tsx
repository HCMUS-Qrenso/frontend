'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteModifierMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Modifier } from '@/src/features/admin/menu/types/modifiers'

interface ModifierDeleteDialogProps {
  open: boolean
  modifier: Modifier | null
  onOpenChange: (open: boolean) => void
}

export function ModifierDeleteDialog({ open, modifier, onOpenChange }: ModifierDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutation
  const deleteMutation = useDeleteModifierMutation()

  const modifierName = modifier?.name || ''
  const isDeleting = deleteMutation.isPending

  const handleDelete = async () => {
    if (!modifier) return

    deleteMutation.mutate(
      { id: modifier.id, groupId: modifier.modifier_group_id },
      {
        onSuccess: () => {
          toast.success('Đã xoá option')
          onOpenChange(false)
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể xoá option')
        },
      },
    )
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xác nhận xoá option"
      description="Hành động này không thể hoàn tác."
      itemName={modifierName}
      onConfirm={handleDelete}
      isLoading={isDeleting}
      confirmText="Xoá option"
    />
  )
}
