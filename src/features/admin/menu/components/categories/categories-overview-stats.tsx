'use client'

import { cn } from '@/src/lib/utils'
import { FolderOpen, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCategoriesStatsQuery } from '@/src/features/admin/menu/queries/categories.queries'
import { StatCard } from '../../../../../components/ui/stat-card'

export function CategoriesOverviewStats() {
  const { data, isLoading } = useCategoriesStatsQuery()

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
      icon: FolderOpen,
      title: 'Tổng danh mục',
      value: statsData?.total_categories.toString() || '0',
      subtext: 'Đã tạo',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: Eye,
      title: 'Đang hiển thị',
      value: statsData?.active_categories.toString() || '0',
      subtext: 'Active',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: EyeOff,
      title: 'Đang ẩn',
      value: statsData?.hidden_categories.toString() || '0',
      subtext: 'Hidden',
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBgColor: 'bg-rose-50 dark:bg-rose-500/10',
    },
  ]

  // Add total menu items card if available
  if (statsData?.total_menu_items !== undefined) {
    stats.push({
      icon: FolderOpen,
      title: 'Tổng món ăn',
      value: statsData.total_menu_items.toString(),
      subtext: 'Thuộc các danh mục',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
    })
  }

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2',
        stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
      )}
    >
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
