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
} from '@/components/ui/alert-dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  useDeleteModifierGroupMutation,
  useModifierGroupQuery,
} from '@/hooks/use-modifiers-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

export function ModifierGroupDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const open = searchParams.get('delete') === 'group'
  const groupId = searchParams.get('id')
  const { handleErrorWithStatus } = useErrorHandler()

  // Fetch group data
  const { data: groupData, isLoading: isLoadingGroup } = useModifierGroupQuery(
    groupId,
    false,
    open && !!groupId,
  )

  // Mutation
  const deleteMutation = useDeleteModifierGroupMutation()

  const group = groupData?.data.modifier_group
  const groupName = group?.name || ''
  const usedByCount = group?.used_by_count || 0
  const isDeleting = deleteMutation.isPending

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!groupId) return

    // Use force=true to delete even if used by menu items
    const force = usedByCount > 0

    deleteMutation.mutate(
      { id: groupId, force },
      {
        onSuccess: () => {
          toast.success('Đã xoá nhóm tuỳ chọn')
          handleClose()
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể xoá nhóm')
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        {isLoadingGroup ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
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
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-amber-900 dark:text-amber-200">
                          Hành động này sẽ xoá toàn bộ options trong nhóm
                        </p>
                        {usedByCount > 0 && (
                          <p className="text-amber-700 dark:text-amber-300">
                            Nhóm này đang được dùng bởi {usedByCount} món. Nhóm sẽ tự động bị gỡ
                            khỏi các món.
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
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
