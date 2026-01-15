'use client'

import { useState } from 'react'
import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useDeleteCategoryMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Category } from '@/src/features/admin/menu/types'
import { useTranslations } from 'next-intl'

interface CategoryDeleteDialogProps {
  open: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
}

export function CategoryDeleteDialog({ open, category, onOpenChange }: CategoryDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()
  const t = useTranslations('menu.deleteDialog')
  const [forceDelete, setForceDelete] = useState(false)

  // Check if category has items
  const hasItems = category ? category.item_count > 0 : false
  const itemCount = category?.item_count || 0

  // Reset force delete state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForceDelete(false)
    }
    onOpenChange(isOpen)
  }

  // Mutation
  const deleteMutation = useDeleteCategoryMutation()

  const handleDelete = async () => {
    if (!category) return

    try {
      await deleteMutation.mutateAsync({ id: category.id, force: forceDelete })
      toast.success(t('success'))
      handleOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, t('error'))
    }
  }

  const handleForceDelete = () => {
    setForceDelete(true)
  }

  // Build warning content if category has items
  const warningContent = hasItems ? (
    <Alert variant={forceDelete ? 'default' : 'destructive'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {forceDelete
          ? t('warningForceDelete', { count: itemCount })
          : t('warningHasItems', { count: itemCount })}
      </AlertDescription>
    </Alert>
  ) : undefined

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('title', { name: category?.name || '' })}
      description={t('description')}
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
      confirmText={t('confirmText')}
      cancelText={t('cancelText')}
      loadingText={t('loadingText')}
      warningContent={warningContent}
      confirmDisabled={hasItems && !forceDelete}
      forceDeleteText={t('forceDeleteText')}
      onForceDelete={hasItems ? handleForceDelete : undefined}
    />
  )
}
