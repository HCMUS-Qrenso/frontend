'use client'

import { cn } from '@/src/lib/utils'
import { FolderOpen, Eye, EyeOff } from 'lucide-react'
import { useCategoriesStatsQuery } from '@/src/features/admin/menu/queries'
import { StatCard } from '../../../../../components/ui/stat-card'
import { SkeletonStatCard } from '@/src/components/loading'
import { useTranslations } from 'next-intl'

export function CategoriesOverviewStats() {
  const { data, isLoading } = useCategoriesStatsQuery()
  const t = useTranslations('menu.stats')

  if (isLoading) {
    return <SkeletonStatCard count={4} columns={4} />
  }

  const statsData = data?.data

  const stats = [
    {
      icon: FolderOpen,
      title: t('totalCategories'),
      value: statsData?.total_categories.toString() || '0',
      subtext: t('created'),
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: Eye,
      title: t('visible'),
      value: statsData?.active_categories.toString() || '0',
      subtext: t('activeLabel'),
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: EyeOff,
      title: t('hiddenLabel'),
      value: statsData?.hidden_categories.toString() || '0',
      subtext: t('hiddenLabel'),
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBgColor: 'bg-rose-50 dark:bg-rose-500/10',
    },
  ]

  // Add total menu items card if available
  if (statsData?.total_menu_items !== undefined) {
    stats.push({
      icon: FolderOpen,
      title: t('totalItems'),
      value: statsData.total_menu_items.toString(),
      subtext: t('inCategories'),
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
