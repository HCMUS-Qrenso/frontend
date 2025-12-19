'use client'

import { LucideIcon } from "lucide-react"
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtext: string
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  className?: string
  valueSz?: string
  iconSz?: number
  iconRounded?: string
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  iconBgColor,
  className,
  valueSz = 'text-2xl',
  iconSz = 6,
  iconRounded = 'xl',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80',
        className,
      )}
    >
      <div className="flex items-start gap-2 justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {title}
          </p>
          <p className={cn('mt-2 font-semibold tracking-tight text-slate-900 dark:text-white', valueSz)}>
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className={cn(`flex h-${iconSz*2} w-${iconSz*2} aspect-square items-center justify-center rounded-${iconRounded}`, iconBgColor)}>
          <Icon className={cn(`h-${iconSz} w-${iconSz}`, iconColor)} />
        </div>
      </div>
    </div>
  )
}