'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useDeleteCategoryMutation } from '@/hooks/use-categories-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'
import { Category } from '@/types/categories'

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

  // Mutation
  const deleteMutation = useDeleteCategoryMutation()

  const handleDelete = async () => {
    if (!category) return

    try {
      await deleteMutation.mutateAsync({ id: category.id, force: forceDelete })
      toast.success('Đã xóa danh mục thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xóa danh mục')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasItems && (
          <Alert variant={forceDelete ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {forceDelete
                ? `Danh mục đang chứa ${itemCount} món ăn. Xóa buộc sẽ xóa cả các món ăn này.`
                : `Danh mục đang chứa ${itemCount} món ăn. Bạn cần chuyển các món sang danh mục khác trước khi xóa.`}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          {hasItems && !forceDelete && (
            <Button
              variant="destructive"
              onClick={() => setForceDelete(true)}
              disabled={deleteMutation.isPending}
            >
              Xóa buộc
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || (hasItems && !forceDelete)}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa danh mục'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
