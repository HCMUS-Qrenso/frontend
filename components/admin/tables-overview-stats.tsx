'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { LayoutGrid, CheckCircle2, Users2, Clock, Loader2 } from 'lucide-react'
import { useTableStatsQuery } from '@/hooks/use-tables-query'

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

export function TablesOverviewStats() {
  const { data, isLoading } = useTableStatsQuery()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
      icon: LayoutGrid,
      title: 'Tổng số bàn',
      value: statsData?.total_tables.toString() || '0',
      subtext: 'Đã cấu hình',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      title: 'Bàn trống',
      value: statsData?.available_tables.toString() || '0',
      subtext: 'Có sẵn',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: Users2,
      title: 'Đang phục vụ',
      value: statsData?.occupied_tables.toString() || '0',
      subtext: 'Đang sử dụng',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: Clock,
      title: 'Chờ thanh toán',
      value: statsData?.waiting_for_payment.toString() || '0',
      subtext: 'Đang chờ thanh toán',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
