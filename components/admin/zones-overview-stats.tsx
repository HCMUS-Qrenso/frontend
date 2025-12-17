'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { MapPin, CheckCircle2, EyeOff, Loader2 } from 'lucide-react'
import { useZonesStatsQuery } from '@/hooks/use-zones-query'

interface StatCardProps {
  title: string
  value: string
  subtext: string
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  className?: string
}

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  iconBgColor,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  )
}

export function ZonesOverviewStats() {
  const { data, isLoading } = useZonesStatsQuery()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ))}
      </div>
    )
  }

  const statsData = data?.data

  const stats = [
    {
      icon: MapPin,
      title: 'Tổng khu vực',
      value: statsData?.total_zones.toString() || '0',
      subtext: 'Đã tạo',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      title: 'Đang hoạt động',
      value: statsData?.active_zones.toString() || '0',
      subtext: 'Active',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: EyeOff,
      title: 'Tạm ẩn',
      value: statsData?.inactive_zones.toString() || '0',
      subtext: 'Inactive',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
        />
      ))}
    </div>
  )
}
