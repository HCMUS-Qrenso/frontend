'use client'

import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon
  /** Main title text */
  title: string
  /** Description or hint text */
  description?: string
  /** Call to action button */
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable empty state component for tables and lists
 * Provides consistent styling for "no data" states
 * 
 * @example Simple usage
 * ```tsx
 * <EmptyState
 *   title="Chưa có khu vực nào"
 *   description="Hãy tạo khu vực đầu tiên"
 * />
 * ```
 * 
 * @example With icon
 * ```tsx
 * <EmptyState
 *   icon={UtensilsCrossed}
 *   title="Chưa có món ăn nào"
 *   description="Bắt đầu bằng cách thêm món đầu tiên"
 * />
 * ```
 * 
 * @example With action button
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="Chưa có nhân viên nào"
 *   description="Nhấn để mời nhân viên mới"
 *   action={{
 *     label: "Mời nhân viên",
 *     onClick: () => setDialogOpen(true),
 *     icon: Plus
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 py-12",
      className
    )}>
      {Icon && (
        <div className="text-slate-400 dark:text-slate-500">
          <Icon className="mx-auto h-12 w-12" />
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={action.onClick}
        >
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * TableEmptyState - Wrapper for use inside Table components
 * Includes TableRow and TableCell with proper colSpan
 */
export interface TableEmptyStateProps extends EmptyStateProps {
  /** Number of columns to span */
  colSpan: number
}

export function TableEmptyState({ colSpan, ...props }: TableEmptyStateProps) {
  // Note: This returns JSX that should be placed inside TableBody
  // Import TableRow & TableCell at usage site
  return (
    <EmptyState {...props} className={cn("px-6", props.className)} />
  )
}
