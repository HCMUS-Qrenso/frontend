'use client'

import { cn } from '@/src/lib/utils'
import { Skeleton } from '@/src/components/ui/skeleton'

interface SkeletonStatCardProps {
  /**
   * Number of skeleton cards to render
   * @default 3
   */
  count?: number
  /**
   * Grid columns configuration
   * @default 3
   */
  columns?: 2 | 3 | 4 | 5
  /**
   * Additional className for the container
   */
  className?: string
}

/**
 * Skeleton loading state for stat cards
 * Matches the layout of StatCard component to prevent layout shift
 */
export function SkeletonStatCard({ count = 3, columns = 3, className }: SkeletonStatCardProps) {
  const gridColsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  }[columns]

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', gridColsClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-3 w-20" />
              {/* Value skeleton */}
              <Skeleton className="h-7 w-16" />
              {/* Subtext skeleton */}
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Icon skeleton */}
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
