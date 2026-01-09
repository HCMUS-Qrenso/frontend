'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteModifierMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Modifier } from '@/src/features/admin/menu/types/modifiers'
import { useTranslations } from 'next-intl'

interface ModifierDeleteDialogProps {
  open: boolean
  modifier: Modifier | null
  onOpenChange: (open: boolean) => void
}

export function ModifierDeleteDialog({ open, modifier, onOpenChange }: ModifierDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()
  const t = useTranslations('menu.modifiers.optionDeleteDialog')

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
          toast.success(t('success'))
          onOpenChange(false)
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error(t('error'))
        },
      },
    )
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={t('description')}
      itemName={modifierName}
      onConfirm={handleDelete}
      isLoading={isDeleting}
      confirmText={t('confirmText')}
    />
  )
}

