'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'

export function ModifierDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const open = searchParams.get('delete') === 'modifier'
  const modifierId = searchParams.get('id')
  const [isDeleting, setIsDeleting] = useState(false)

  // TODO: Fetch actual modifier data
  const modifierName = 'Lớn (Large)'

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Delete API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      handleClose()
    } catch (error) {
      console.error('Error deleting modifier:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá option</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xoá option{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              &quot;{modifierName}&quot;
            </span>
            ? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xoá...
              </>
            ) : (
              'Xoá option'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
