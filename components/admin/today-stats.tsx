'use client'

import type React from 'react'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Clock } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtext: string
  trend?: { value: string; isPositive: boolean }
  icon: React.ReactNode
  className?: string
}

function StatCard({ title, value, subtext, trend, icon, className }: StatCardProps) {
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
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {trend && (
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
            <span className="text-xs text-slate-500 dark:text-slate-400">{subtext}</span>
          </div>
        </div>
        <div className="flex h-12 w-12 aspect-square items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

// Order Status Card with progress bar
function OrderStatusCard() {
  const statuses = [
    { name: 'Pending', count: 3, color: 'bg-amber-400' },
    { name: 'Preparing', count: 8, color: 'bg-sky-400' },
    { name: 'Ready', count: 5, color: 'bg-emerald-400' },
    { name: 'Served', count: 12, color: 'bg-slate-400' },
    { name: 'Completed', count: 42, color: 'bg-green-600' },
  ]
  const total = statuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái order</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {total}
      </p>

      {/* Stacked progress bar */}
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {statuses.map((status) => (
          <div
            key={status.name}
            className={cn('h-full transition-all', status.color)}
            style={{ width: `${(status.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', status.color)} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {status.name}: {status.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TodayStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Orders hôm nay"
        value="70"
        subtext="so với hôm qua"
        trend={{ value: '+12%', isPositive: true }}
        icon={<ShoppingBag className="h-6 w-6" />}
      />
      <StatCard
        title="Revenue hôm nay"
        value="18.5M ₫"
        subtext="Giá trị TB: 264K ₫"
        trend={{ value: '+8.2%', isPositive: true }}
        icon={<DollarSign className="h-6 w-6" />}
      />
      <StatCard
        title="Bàn đang phục vụ"
        value="12"
        subtext="8 bàn trống"
        icon={<Users className="h-6 w-6" />}
      />
      <StatCard
        title="Thời gian phục vụ TB"
        value="18 phút"
        subtext="Từ order đến served"
        trend={{ value: '-2 phút', isPositive: true }}
        icon={<Clock className="h-6 w-6" />}
      />
      <OrderStatusCard />
    </div>
  )
}
