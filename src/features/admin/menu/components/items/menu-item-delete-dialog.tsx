'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteMenuItemMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { MenuItem } from '@/src/features/admin/menu/types'
import { useTranslations } from 'next-intl'

interface MenuItemDeleteDialogProps {
  open: boolean
  item: MenuItem | null
  onOpenChange: (open: boolean) => void
}

export function MenuItemDeleteDialog({ open, item, onOpenChange }: MenuItemDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()
  const t = useTranslations('menu.items.deleteDialog')

  // Mutation
  const deleteMutation = useDeleteMenuItemMutation()

  const handleDelete = async () => {
    if (!item) return

    try {
      await deleteMutation.mutateAsync(item.id)
      onOpenChange(false)
      toast.success(t('success'))
    } catch (error) {
      handleErrorWithStatus(error, undefined, t('error'))
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('title', { name: item?.name || '' })}
      description={t('description')}
      itemName={item?.name}
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
      confirmText={t('confirmText')}
    />
  )
}
