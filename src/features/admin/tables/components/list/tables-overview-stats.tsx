'use client'

import { LayoutGrid, CheckCircle2, Users2, Clock } from 'lucide-react'
import { useTableStatsQuery } from '@/src/features/admin/tables/queries'
import { StatCard } from '../../../../../components/ui/stat-card'
import { SkeletonStatCard } from '@/src/components/loading'
import { useTranslations } from 'next-intl'

export function TablesOverviewStats() {
  const { data, isLoading } = useTableStatsQuery()
  const t = useTranslations('tables')

  if (isLoading) {
    return <SkeletonStatCard count={4} columns={4} />
  }

  const statsData = data?.data

  const stats = [
    {
      icon: LayoutGrid,
      title: t('totalTables'),
      value: statsData?.total_tables.toString() || '0',
      subtext: t('configured'),
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      title: t('availableTables'),
      value: statsData?.available_tables.toString() || '0',
      subtext: t('availableLabel'),
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: Users2,
      title: t('occupiedTables'),
      value: statsData?.occupied_tables.toString() || '0',
      subtext: t('serving'),
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: Clock,
      title: t('waitingPayment'),
      value: statsData?.waiting_for_payment.toString() || '0',
      subtext: t('waitingPaymentSubtext'),
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
