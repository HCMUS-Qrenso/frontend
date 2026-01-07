'use client'

import type React from 'react'
import { cn } from '@/src/lib/utils'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Clock } from 'lucide-react'
import { useTodayStatsQuery } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'

interface StatCardProps {
  title: string
  value: string
  subtext: string
  trend?: { value: string; isPositive: boolean }
  icon: React.ReactNode
  className?: string
  isLoading?: boolean
}

function StatCard({ title, value, subtext, trend, icon, className, isLoading }: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-9 w-24" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {!isLoading && trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-500',
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">{subtext}</span>
            )}
          </div>
        </div>
        <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

// Order Status Card with progress bar
function OrderStatusCard({ 
  data, 
  isLoading,
  t
}: { 
  data?: { pending: number; preparing: number; ready: number; served: number; completed: number };
  isLoading?: boolean;
  t: (key: string) => string;
}) {
  const statuses = data ? [
    { name: t('pending'), count: data.pending, color: 'bg-amber-400' },
    { name: t('preparing'), count: data.preparing, color: 'bg-sky-400' },
    { name: t('ready'), count: data.ready, color: 'bg-emerald-400' },
    { name: t('served'), count: data.served, color: 'bg-slate-400' },
    { name: t('completed'), count: data.completed, color: 'bg-green-600' },
  ] : []
  const total = statuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('orderStatus')}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-9 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {total}
        </p>
      )}

      {/* Stacked progress bar */}
      {isLoading ? (
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
      ) : (
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          {statuses.map((status) => (
            <div
              key={status.name}
              className={cn('h-full transition-all', status.color)}
              style={{ width: total > 0 ? `${(status.count / total) * 100}%` : '0%' }}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </>
        ) : (
          statuses.map((status) => (
            <div key={status.name} className="flex items-center gap-1.5">
              <div className={cn('h-2 w-2 rounded-full', status.color)} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {status.name}: {status.count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatCurrency(value: number, symbol: string): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${symbol}`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ${symbol}`
  return `${value} ${symbol}`
}

export function TodayStats() {
  const { data, isLoading } = useTodayStatsQuery()
  const t = useTranslations('dashboard')
  const { settings } = useTenantSettings()
  const currencySymbol = settings.currencySymbol

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title={t('ordersToday')}
        value={data?.orders_today.toString() || '0'}
        subtext={t('comparedToYesterday')}
        trend={data ? { 
          value: `${data.orders_change_percent >= 0 ? '+' : ''}${data.orders_change_percent}%`, 
          isPositive: data.orders_change_percent >= 0 
        } : undefined}
        icon={<ShoppingBag className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title={t('revenueToday')}
        value={data ? formatCurrency(data.revenue_today, currencySymbol) : '0'}
        subtext={data ? `${t('avgValue')}: ${formatCurrency(data.avg_order_value, currencySymbol)}` : ''}
        trend={data ? { 
          value: `${data.revenue_change_percent >= 0 ? '+' : ''}${data.revenue_change_percent}%`, 
          isPositive: data.revenue_change_percent >= 0 
        } : undefined}
        icon={<DollarSign className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title={t('tablesServing')}
        value={data?.tables_occupied.toString() || '0'}
        subtext={data ? `${data.tables_available} ${t('tablesAvailable')}` : ''}
        icon={<Users className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title={t('avgServiceTime')}
        value={data ? `${data.avg_service_time_minutes} ${t('minutes')}` : `0 ${t('minutes')}`}
        subtext={t('fromOrderToServed')}
        icon={<Clock className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <OrderStatusCard 
        data={data ? {
          pending: data.order_status_breakdown.pending,
          preparing: data.order_status_breakdown.preparing || data.order_status_breakdown.in_progress,
          ready: data.order_status_breakdown.ready,
          served: data.order_status_breakdown.served,
          completed: data.order_status_breakdown.completed,
        } : undefined}
        isLoading={isLoading}
        t={t}
      />
    </div>
  )
}
