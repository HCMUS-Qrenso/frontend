'use client'

import { cn } from '@/src/lib/utils'
import { FolderOpen, Eye, EyeOff } from 'lucide-react'
import { useCategoriesStatsQuery } from '@/src/features/admin/menu/queries'
import { StatCard } from '../../../../../components/ui/stat-card'
import { SkeletonStatCard } from '@/src/components/loading'

export function CategoriesOverviewStats() {
  const { data, isLoading } = useCategoriesStatsQuery()

  if (isLoading) {
    return <SkeletonStatCard count={4} columns={4} />
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
