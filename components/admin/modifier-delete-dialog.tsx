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
import { Loader2 } from 'lucide-react'
import { useDeleteModifierMutation, useModifiersQuery } from '@/hooks/use-modifiers-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifierDeleteDialogProps {
  selectedGroupId: string | null
}

export function ModifierDeleteDialog({ selectedGroupId }: ModifierDeleteDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const open = searchParams.get('delete') === 'modifier'
  const modifierId = searchParams.get('id')
  const { handleErrorWithStatus } = useErrorHandler()

  // Fetch modifiers to get the name
  const { data: modifiersData, isLoading: isLoadingModifiers } = useModifiersQuery(
    selectedGroupId,
    { include_unavailable: true },
    open && !!selectedGroupId && !!modifierId,
  )

  // Mutation
  const deleteMutation = useDeleteModifierMutation()

  const modifier = modifiersData?.data.modifiers.find((m) => m.id === modifierId)
  const modifierName = modifier?.name || ''
  const isDeleting = deleteMutation.isPending

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!modifierId || !selectedGroupId) return

    deleteMutation.mutate(
      { id: modifierId, groupId: selectedGroupId },
      {
        onSuccess: () => {
          toast.success('Đã xoá option')
          handleClose()
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể xoá option')
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isLoadingModifiers ? 'Đang tải...' : 'Xác nhận xoá option'}
          </AlertDialogTitle>
          {isLoadingModifiers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <AlertDialogDescription>
                Bạn có chắc muốn xoá option{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  &quot;{modifierName}&quot;
                </span>
                ? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
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
            </>
          )}
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
