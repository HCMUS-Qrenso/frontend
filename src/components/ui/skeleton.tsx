'use client'

import { cn } from '@/src/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with shimmer animation
 * Used as building block for skeleton UIs
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
    />
  )
}

/**
 * Text skeleton with default text-like dimensions
 */
export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />
}

/**
 * Circle skeleton for avatars/icons
 */
export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />
}

/**
 * Button skeleton
 */
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />
}
