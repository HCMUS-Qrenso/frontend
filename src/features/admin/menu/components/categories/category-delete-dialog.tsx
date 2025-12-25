'use client'

import { useState } from 'react'
import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useDeleteCategoryMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Category } from '@/src/features/admin/menu/types'

interface CategoryDeleteDialogProps {
  open: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
}

export function CategoryDeleteDialog({ open, category, onOpenChange }: CategoryDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()
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
      toast.success('Đã xóa danh mục thành công')
      handleOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xóa danh mục')
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
          ? `Danh mục đang chứa ${itemCount} món ăn. Xóa buộc sẽ xóa cả các món ăn này.`
          : `Danh mục đang chứa ${itemCount} món ăn. Bạn cần chuyển các món sang danh mục khác trước khi xóa.`}
      </AlertDescription>
    </Alert>
  ) : undefined

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`Xóa danh mục "${category?.name}"?`}
      description="Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống."
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
      confirmText="Xóa danh mục"
      warningContent={warningContent}
      confirmDisabled={hasItems && !forceDelete}
      forceDeleteText="Xóa buộc"
      onForceDelete={hasItems ? handleForceDelete : undefined}
    />
  )
}
