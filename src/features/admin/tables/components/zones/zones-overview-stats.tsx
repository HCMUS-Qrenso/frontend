'use client'

import { MapPin, CheckCircle2, EyeOff, Loader2 } from 'lucide-react'
import { useZonesStatsQuery } from '@/src/features/admin/tables/queries'
import { StatCard } from '../../../../../components/ui/stat-card'

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

  const stats = [
    {
      icon: MapPin,
      title: 'Tổng khu vực',
      value: String(data?.total ?? 0),
      subtext: 'Đã tạo',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      title: 'Đang hoạt động',
      value: String(data?.active ?? 0),
      subtext: 'Active',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: EyeOff,
      title: 'Tạm ẩn',
      value: String(data?.inactive ?? 0),
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
