'use client'

import type React from 'react'
import { cn } from '@/src/lib/utils'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Clock } from 'lucide-react'
import { useTodayStatsQuery } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'

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
  isLoading 
}: { 
  data?: { pending: number; preparing: number; ready: number; served: number; completed: number };
  isLoading?: boolean 
}) {
  const statuses = data ? [
    { name: 'Pending', count: data.pending, color: 'bg-amber-400' },
    { name: 'Preparing', count: data.preparing, color: 'bg-sky-400' },
    { name: 'Ready', count: data.ready, color: 'bg-emerald-400' },
    { name: 'Served', count: data.served, color: 'bg-slate-400' },
    { name: 'Completed', count: data.completed, color: 'bg-green-600' },
  ] : []
  const total = statuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái order</p>
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

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₫`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₫`
  return `${value} ₫`
}

export function TodayStats() {
  const { data, isLoading } = useTodayStatsQuery()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Orders hôm nay"
        value={data?.orders_today.toString() || '0'}
        subtext="so với hôm qua"
        trend={data ? { 
          value: `${data.orders_change_percent >= 0 ? '+' : ''}${data.orders_change_percent}%`, 
          isPositive: data.orders_change_percent >= 0 
        } : undefined}
        icon={<ShoppingBag className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Revenue hôm nay"
        value={data ? formatCurrency(data.revenue_today) : '0'}
        subtext={data ? `Giá trị TB: ${formatCurrency(data.avg_order_value)}` : ''}
        trend={data ? { 
          value: `${data.revenue_change_percent >= 0 ? '+' : ''}${data.revenue_change_percent}%`, 
          isPositive: data.revenue_change_percent >= 0 
        } : undefined}
        icon={<DollarSign className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Bàn đang phục vụ"
        value={data?.tables_occupied.toString() || '0'}
        subtext={data ? `${data.tables_available} bàn trống` : ''}
        icon={<Users className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Thời gian phục vụ TB"
        value={data ? `${data.avg_service_time_minutes} phút` : '0 phút'}
        subtext="Từ order đến served"
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
      />
    </div>
  )
}
