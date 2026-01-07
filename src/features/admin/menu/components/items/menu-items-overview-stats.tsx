'use client'

import { UtensilsCrossed, CheckCircle2, XCircle, EyeOff, Award } from 'lucide-react'
import { useMenuItemsStatsQuery } from '@/src/features/admin/menu/queries'
import { StatCard } from '../../../../../components/ui/stat-card'
import { SkeletonStatCard } from '@/src/components/loading'
import { useTranslations } from 'next-intl'

export function MenuItemsOverviewStats() {
  const { data, isLoading } = useMenuItemsStatsQuery()
  const t = useTranslations('menu')

  if (isLoading) {
    return <SkeletonStatCard count={5} columns={5} />
  }

  const statsData = data?.data

  const totalMenuItems = statsData?.total_menu_items ?? 0
  const availableItems = statsData?.available_items ?? 0
  const unavailableItems =
    statsData?.unavailable_items ?? Math.max(totalMenuItems - availableItems, 0)

  const stats = [
    {
      icon: UtensilsCrossed,
      title: t('totalItems'),
      value: String(totalMenuItems),
      subtext: t('created'),
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      title: t('available'),
      value: String(availableItems),
      subtext: t('availableSubtext'),
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: XCircle,
      title: t('unavailable'),
      value: String(unavailableItems),
      subtext: t('unavailableSubtext'),
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBgColor: 'bg-rose-50 dark:bg-rose-500/10',
    },
    {
      icon: EyeOff,
      title: t('soldOut'),
      value: '0', // Will be calculated if backend provides this info
      subtext: t('soldOutSubtext'),
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: Award,
      title: t('chefPicks'),
      value: String(statsData?.chef_recommendations ?? 0),
      subtext: t('picks'),
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      iconBgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
          iconSz={5}
          iconRounded="lg"
        />
      ))}
    </div>
  )
}
