'use client'

import { cn } from '@/lib/utils'

interface TimerPillProps {
  elapsed: number // seconds
  isOverdue: boolean
  isWarning?: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function TimerPill({ elapsed, isOverdue, isWarning }: TimerPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold',
        isOverdue
          ? 'animate-pulse bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
          : isWarning
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      )}
    >
      ⏱ {formatTime(elapsed)}
    </span>
  )
}
