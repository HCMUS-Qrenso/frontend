'use client'

import { cn } from '@/src/lib/utils'
import { Skeleton } from '@/src/components/ui/skeleton'
import { TableRow, TableCell } from '@/src/components/ui/table'

/**
 * Column type determines the skeleton shape
 */
export type SkeletonColumnType =
  | 'text' // Simple text line
  | 'text-with-subtext' // Title + description
  | 'badge' // Status badge (pill shape)
  | 'number' // Small centered number
  | 'actions' // Action buttons (1-3 small squares)
  | 'avatar' // Circle avatar
  | 'avatar-with-text' // Avatar + text lines (for staff/user info)
  | 'image' // Square/rounded image
  | 'image-with-text' // Image + text lines (for menu items)

export interface SkeletonColumn {
  /**
   * Type of skeleton to show
   */
  type: SkeletonColumnType
  /**
   * CSS width for the column (e.g., 'w-32', '120px')
   */
  width?: string
  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Number of action buttons for 'actions' type
   * @default 1
   */
  actionCount?: number
}

interface SkeletonTableRowsProps {
  /**
   * Column configuration
   */
  columns: SkeletonColumn[]
  /**
   * Number of skeleton rows to render
   * @default 5
   */
  rowCount?: number
  /**
   * Additional className for table rows
   */
  className?: string
}

function renderSkeletonCell(column: SkeletonColumn) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[column.align || 'left']

  const content = (() => {
    switch (column.type) {
      case 'text':
        return <Skeleton className="h-4 w-full max-w-32" />

      case 'text-with-subtext':
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        )

      case 'badge':
        return <Skeleton className="mx-auto h-6 w-16 rounded-full" />

      case 'number':
        return <Skeleton className="mx-auto h-4 w-8" />

      case 'actions':
        const count = column.actionCount || 1
        return (
          <div
            className={cn(
              'flex gap-1',
              column.align === 'right'
                ? 'justify-end'
                : column.align === 'center'
                  ? 'justify-center'
                  : '',
            )}
          >
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        )

      case 'avatar':
        return <Skeleton className="h-10 w-10 rounded-full" />

      case 'avatar-with-text':
        return (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        )

      case 'image':
        return <Skeleton className="h-10 w-10 rounded-lg md:h-14 md:w-14" />

      case 'image-with-text':
        return (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg md:h-14 md:w-14" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        )

      default:
        return <Skeleton className="h-4 w-full" />
    }
  })()

  return <TableCell className={cn('px-6 py-4', alignClass)}>{content}</TableCell>
}

/**
 * Skeleton loading state for table rows
 * Use with Table component for consistent table loading
 *
 * @example
 * ```tsx
 * // Simple usage
 * <SkeletonTableRows
 *   columns={[
 *     { type: 'text-with-subtext' },
 *     { type: 'number', align: 'center' },
 *     { type: 'badge', align: 'center' },
 *     { type: 'actions', align: 'right', actionCount: 1 },
 *   ]}
 *   rowCount={5}
 * />
 * ```
 */
export function SkeletonTableRows({ columns, rowCount = 5, className }: SkeletonTableRowsProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          className={cn('border-b border-slate-100 dark:border-slate-800', className)}
        >
          {columns.map((column, colIndex) => (
            <React.Fragment key={colIndex}>{renderSkeletonCell(column)}</React.Fragment>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// Need to import React for Fragment
import React from 'react'
