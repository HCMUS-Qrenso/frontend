'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { AlertCircle } from 'lucide-react'
import { useDeleteModifierGroupMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { ModifierGroup } from '@/src/features/admin/menu/types/modifiers'

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

  // Build warning content
  const warningContent = (
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
  )

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xác nhận xoá nhóm tuỳ chọn"
      description={`Bạn có chắc muốn xoá nhóm "${groupName}"?`}
      onConfirm={handleDelete}
      isLoading={isDeleting}
      confirmText="Xoá nhóm"
      warningContent={warningContent}
    />
  )
}
