'use client'

import { useState } from 'react'
import { cn } from '@/src/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePerformanceQuery } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'

type TimeRange = 'day' | 'week' | 'month'
type DataType = 'revenue' | 'orders'

function formatCurrency(value: number) {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

export function PerformanceChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const [dataType, setDataType] = useState<DataType>('revenue')

  const { data: performanceData, isLoading } = usePerformanceQuery(timeRange, 11)

  const chartData = performanceData?.data || []
  const summary = performanceData?.summary

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Hiệu suất theo thời gian
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi doanh thu và số order
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Toggle */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>

          {/* Data Type Toggle */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            {(['revenue', 'orders'] as DataType[]).map((type) => (
              <button
                key={type}
                onClick={() => setDataType(type)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  dataType === type
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {type === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) =>
                  dataType === 'revenue' ? formatCurrency(value) : value.toString()
                }
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [
                  dataType === 'revenue'
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(value)
                    : `${value} đơn hàng`,
                  dataType === 'revenue' ? 'Doanh thu' : 'Đơn hàng',
                ]}
              />
              <Area
                type="monotone"
                dataKey={dataType}
                stroke={dataType === 'revenue' ? '#10b981' : '#6366f1'}
                strokeWidth={2}
                fill={dataType === 'revenue' ? 'url(#colorRevenue)' : 'url(#colorOrders)'}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3 dark:border-slate-800">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng doanh thu</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-32" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(summary?.total_revenue || 0)}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tăng trưởng</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : (
            <p className={cn(
              'mt-1 flex items-center gap-1 text-xl font-semibold',
              (summary?.growth_percentage || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {(summary?.growth_percentage || 0) >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {(summary?.growth_percentage ?? 0) >= 0 ? '+' : ''}{summary?.growth_percentage ?? 0}%
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Đơn hàng TB/ngày</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {summary?.avg_orders_per_period || 0}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
