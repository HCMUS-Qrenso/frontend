'use client'

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
} from '@/src/components/ui/alert-dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useDeleteModifierGroupMutation } from '@/src/features/admin/menu/queries/modifiers.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import { ModifierGroup } from '@/src/features/admin/menu/types/modifiers'

interface ModifierGroupDeleteDialogProps {
  open: boolean
  modifierGroup: ModifierGroup | null
  onOpenChange: (open: boolean) => void
}

export function ModifierGroupDeleteDialog({
  open,
  modifierGroup,
  onOpenChange,
}: ModifierGroupDeleteDialogProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutation
  const deleteMutation = useDeleteModifierGroupMutation()

  const groupName = modifierGroup?.name || ''
  const usedByCount = modifierGroup?.used_by_count || 0
  const isDeleting = deleteMutation.isPending

  const handleDelete = async () => {
    if (!modifierGroup) return

    // Use force=true to delete even if used by menu items
    const force = usedByCount > 0

    deleteMutation.mutate(
      { id: modifierGroup.id, force },
      {
        onSuccess: () => {
          toast.success('Đã xoá nhóm tuỳ chọn')
          onOpenChange(false)
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể xoá nhóm')
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá nhóm tuỳ chọn</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Bạn có chắc muốn xoá nhóm{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  &quot;{groupName}&quot;
                </span>
                ?
              </p>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-200">
                      Hành động này sẽ xoá toàn bộ options trong nhóm
                    </p>
                    {usedByCount > 0 && (
                      <p className="text-amber-700 dark:text-amber-300">
                        Nhóm này đang được dùng bởi {usedByCount} món. Nhóm sẽ tự động bị gỡ khỏi
                        các món.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              'Xoá nhóm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
