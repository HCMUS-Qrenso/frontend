'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useCategoryQuery, useDeleteCategoryMutation } from '@/hooks/use-categories-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

export function CategoryDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithStatus } = useErrorHandler()
  const [forceDelete, setForceDelete] = useState(false)

  const open = searchParams.get('delete') === 'category'
  const categoryId = searchParams.get('id')

  // Fetch category data to check if it has items
  const { data: categoryData } = useCategoryQuery(categoryId || null, open && !!categoryId)
  const category = categoryData?.data?.category

  // Check if category has items
  const hasItems = category ? category.item_count > 0 : false
  const itemCount = category?.item_count || 0

  // Mutation
  const deleteMutation = useDeleteCategoryMutation()

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!categoryId) return

    try {
      await deleteMutation.mutateAsync({ id: categoryId, force: forceDelete })
      toast.success('Đã xóa danh mục thành công')
      handleClose()
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xóa danh mục')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
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
          <Button variant="outline" onClick={handleClose} disabled={deleteMutation.isPending}>
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
