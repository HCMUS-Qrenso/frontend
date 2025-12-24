'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'

/**
 * FormDialog - Shared dialog component for upsert forms
 *
 * Design tokens:
 * - Container: rounded-2xl, shadow-2xl, max-h-[90vh]
 * - Sections: rounded-xl
 * - Primary button: emerald-600, rounded-full
 * - Form spacing: space-y-6
 */

// Size variants for different form complexities
const sizeVariants = {
  sm: 'max-w-md', // 448px - simple forms
  md: 'max-w-lg', // 512px - standard forms
  lg: 'max-w-xl', // 576px - complex forms
  xl: 'max-w-2xl', // 672px - very complex forms
  '2xl': 'max-w-3xl', // 768px - extra large forms
}

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description/subtitle */
  description?: string
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Submit button text */
  submitText?: string
  /** Cancel button text */
  cancelText?: string
  /** Loading text shown when submitting */
  loadingText?: string
  /** Size variant */
  size?: keyof typeof sizeVariants
  /** Whether form needs scroll (many fields) */
  scrollable?: boolean
  /** Form content */
  children: React.ReactNode
  /** Additional className for DialogContent */
  className?: string
  /** Submit button variant - 'primary' for create/update, 'danger' for delete */
  submitVariant?: 'primary' | 'danger'
  /** Disable submit button */
  submitDisabled?: boolean
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isSubmitting = false,
  submitText = 'Lưu',
  cancelText = 'Huỷ',
  loadingText = 'Đang lưu...',
  size = 'lg',
  scrollable = false,
  children,
  className,
  submitVariant = 'primary',
  submitDisabled = false,
}: FormDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(e)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/80',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Dialog Content */}
        <DialogPrimitive.Content
          className={cn(
            // Positioning
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            // Layout
            'flex w-full flex-col',
            sizeVariants[size],
            scrollable && 'max-h-[90vh]',
            // Styling
            'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
            'dark:border-slate-700 dark:bg-slate-900',
            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
            className
          )}
        >
          {/* Header - Fixed */}
          <div className="border-b border-slate-200 p-6 dark:border-slate-800">
            <DialogPrimitive.Title className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </DialogPrimitive.Description>
            )}

            {/* Close button */}
            <DialogPrimitive.Close
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
                'transition-opacity hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:pointer-events-none',
                'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </DialogPrimitive.Close>
          </div>

          {/* Form - Scrollable content */}
          <form
            onSubmit={handleSubmit}
            className={cn('flex flex-1 flex-col', scrollable && 'overflow-hidden')}
          >
            {/* Content Area */}
            <div className={cn('flex-1 space-y-6 p-6', scrollable && 'overflow-y-auto')}>
              {children}
            </div>

            {/* Footer - Fixed */}
            <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-full"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                className={cn(
                  'rounded-full',
                  submitVariant === 'primary' && 'bg-emerald-600 hover:bg-emerald-700',
                  submitVariant === 'danger' && 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingText}
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * FormDialogSection - Styled section for toggle/switch rows
 */
export interface FormDialogSectionProps {
  children: React.ReactNode
  className?: string
}

export function FormDialogSection({ children, className }: FormDialogSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-slate-200 p-4',
        'dark:border-slate-800',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * FormDialogField - Standard form field wrapper
 */
export interface FormDialogFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormDialogField({
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: FormDialogFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-slate-900 dark:text-white">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  )
}

export default FormDialog
