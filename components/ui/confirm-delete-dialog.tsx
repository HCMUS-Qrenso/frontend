'use client'

import { ReactNode } from 'react'
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
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Main description text */
  description: string
  /** Name of item being deleted (highlighted in description) */
  itemName?: string
  /** Callback when delete is confirmed */
  onConfirm: () => void
  /** Whether delete action is in progress */
  isLoading?: boolean
  /** Text for confirm button */
  confirmText?: string
  /** Text for cancel button */
  cancelText?: string
  /** Additional warning content (e.g., for items with children) */
  warningContent?: ReactNode
  /** Disable confirm button (e.g., when force delete required) */
  confirmDisabled?: boolean
}

/**
 * Reusable confirm delete dialog component with centered layout
 * Provides consistent styling and behavior for delete confirmations
 *
 * @example Simple usage
 * ```tsx
 * <ConfirmDeleteDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Xóa món ăn?"
 *   description="Hành động này không thể hoàn tác."
 *   itemName="Phở bò"
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 * />
 * ```
 *
 * @example With warning
 * ```tsx
 * <ConfirmDeleteDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Xóa danh mục?"
 *   description="Danh mục sẽ bị xóa vĩnh viễn."
 *   itemName="Đồ uống"
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 *   warningContent={
 *     <Alert variant="destructive">
 *       Danh mục đang chứa 5 món ăn.
 *     </Alert>
 *   }
 * />
 * ```
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  isLoading = false,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  warningContent,
  confirmDisabled = false,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    if (!isLoading && !confirmDisabled) {
      onConfirm()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            {itemName ? (
              <>
                {description.includes('{itemName}') ? (
                  description.replace('{itemName}', `"${itemName}"`)
                ) : (
                  <>
                    Bạn có chắc chắn muốn xóa &quot;{itemName}&quot; không? {description}
                  </>
                )}
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warningContent && <div className="mt-2">{warningContent}</div>}

        <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
          <AlertDialogCancel disabled={isLoading} className="m-0 rounded-lg">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || confirmDisabled}
            className="m-0 gap-2 rounded-lg bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4" />
            {isLoading ? 'Đang xóa...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
