'use client'

import type { ReactNode } from 'react'
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
import { Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmActionVariant = 'default' | 'success' | 'warning' | 'danger'

const VARIANT_CONFIG: Record<
  ConfirmActionVariant,
  {
    iconBg: string
    iconColor: string
    buttonBg: string
    buttonHover: string
    icon: typeof CheckCircle2
  }
> = {
  default: {
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    icon: Info,
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    buttonBg: 'bg-emerald-600',
    buttonHover: 'hover:bg-emerald-700',
    icon: CheckCircle2,
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    buttonBg: 'bg-amber-600',
    buttonHover: 'hover:bg-amber-700',
    icon: AlertTriangle,
  },
  danger: {
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
    icon: AlertTriangle,
  },
}

export interface ConfirmActionDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Description text */
  description: string
  /** Callback when action is confirmed */
  onConfirm: () => void
  /** Whether action is in progress */
  isLoading?: boolean
  /** Text for confirm button */
  confirmText?: string
  /** Text for cancel button */
  cancelText?: string
  /** Visual variant */
  variant?: ConfirmActionVariant
  /** Custom icon override */
  icon?: ReactNode
}

/**
 * Reusable confirm action dialog component
 * Use for any action that requires user confirmation (not just delete)
 *
 * @example
 * ```tsx
 * <ConfirmActionDialog
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   title="Hoàn thành tất cả?"
 *   description="Tất cả các món sẽ được đánh dấu là sẵn sàng."
 *   onConfirm={handleCompleteAll}
 *   variant="success"
 *   confirmText="Xác nhận"
 * />
 * ```
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  icon,
}: ConfirmActionDialogProps) {
  const config = VARIANT_CONFIG[variant]
  const IconComponent = config.icon

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader className="p-6 pb-0">
          <div
            className={cn(
              'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
              config.iconBg,
            )}
          >
            {icon || <IconComponent className={cn('h-6 w-6', config.iconColor)} />}
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
          <AlertDialogCancel disabled={isLoading} className="m-0 rounded-lg">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn('m-0 gap-2 rounded-lg', config.buttonBg, config.buttonHover)}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang xử lý...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
