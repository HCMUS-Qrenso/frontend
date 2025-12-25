'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export interface LoadingStateProps {
  /** Loading text to display */
  text?: string
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * Simple loading spinner component
 *
 * @example Basic usage
 * ```tsx
 * <LoadingState />
 * ```
 *
 * @example With custom text
 * ```tsx
 * <LoadingState text="Đang tải dữ liệu..." size="lg" />
 * ```
 */
export function LoadingState({ text, size = 'md', className }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className={cn('animate-spin text-emerald-600', sizeClasses[size])} />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  )
}

/**
 * Container loading state with card styling
 * Use this when loading content inside a card/container
 */
export interface ContainerLoadingStateProps extends LoadingStateProps {
  /** Whether to show card styling */
  withCard?: boolean
}

export function ContainerLoadingState({ withCard = true, ...props }: ContainerLoadingStateProps) {
  if (withCard) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <LoadingState {...props} />
      </div>
    )
  }
  return <LoadingState {...props} />
}

/**
 * Skeleton rows for table loading state
 */
export interface TableLoadingRowsProps {
  /** Number of columns */
  columns: number
  /** Number of rows to show */
  rows?: number
  /** Additional CSS classes for the row */
  className?: string
}

export function TableLoadingRows({ columns, rows = 5, className }: TableLoadingRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={cn('border-b border-slate-100 dark:border-slate-800', className)}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * Error state component
 */
export interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error description */
  description?: string
  /** Retry action */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  description = 'Vui lòng thử lại sau',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <div className="text-center">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}

/**
 * Container error state with card styling
 */
export function ContainerErrorState(props: ErrorStateProps & { withCard?: boolean }) {
  const { withCard = true, ...errorProps } = props

  if (withCard) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <ErrorState {...errorProps} />
      </div>
    )
  }
  return <ErrorState {...errorProps} />
}
