'use client'

import { ClipboardList, Clock, ChefHat, CheckCircle2, CreditCard } from 'lucide-react'
import { StatCard } from '../../../../components/ui/stat-card'
import { useOrderStatsQuery } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useTranslations } from 'next-intl'

export function OrdersOverviewStats() {
  const { data, isLoading } = useOrderStatsQuery()
  const stats = data?.data
  const t = useTranslations('orders')

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      icon: ClipboardList,
      title: t('totalOrders'),
      value: String(stats?.totalOrders || 0),
      subtext: t('activeOrders'),
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: Clock,
      title: t('waitingConfirm'),
      value: String(stats?.pendingOrders || 0),
      subtext: t('newPending'),
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: ChefHat,
      title: t('inProgress'),
      value: String(stats?.inProgressOrders || 0),
      subtext: 'In progress',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      icon: CheckCircle2,
      title: t('completedToday'),
      value: String(stats?.completedToday || 0),
      subtext: 'Completed today',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: CreditCard,
      title: t('todayRevenue'),
      value: stats?.todayRevenue
        ? stats.todayRevenue >= 1000000
          ? `${(stats.todayRevenue / 1000000).toFixed(1)}M`
          : `${(stats.todayRevenue / 1000).toFixed(0)}K`
        : '0',
      subtext: 'VND',
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBgColor: 'bg-rose-50 dark:bg-rose-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => (
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
