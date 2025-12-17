'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const dailyData = [
  { date: '01/12', revenue: 12500000, orders: 45 },
  { date: '02/12', revenue: 15800000, orders: 58 },
  { date: '03/12', revenue: 14200000, orders: 52 },
  { date: '04/12', revenue: 18900000, orders: 72 },
  { date: '05/12', revenue: 16500000, orders: 61 },
  { date: '06/12', revenue: 21200000, orders: 85 },
  { date: '07/12', revenue: 19800000, orders: 78 },
  { date: '08/12', revenue: 17400000, orders: 65 },
  { date: '09/12', revenue: 22100000, orders: 88 },
  { date: '10/12', revenue: 20500000, orders: 82 },
  { date: '11/12', revenue: 18500000, orders: 70 },
]

const weeklyData = [
  { date: 'Tuần 45', revenue: 98500000, orders: 385 },
  { date: 'Tuần 46', revenue: 112800000, orders: 428 },
  { date: 'Tuần 47', revenue: 125200000, orders: 492 },
  { date: 'Tuần 48', revenue: 118900000, orders: 456 },
  { date: 'Tuần 49', revenue: 132500000, orders: 521 },
]

const monthlyData = [
  { date: 'Tháng 7', revenue: 420000000, orders: 1580 },
  { date: 'Tháng 8', revenue: 485000000, orders: 1820 },
  { date: 'Tháng 9', revenue: 512000000, orders: 1950 },
  { date: 'Tháng 10', revenue: 498000000, orders: 1890 },
  { date: 'Tháng 11', revenue: 545000000, orders: 2100 },
  { date: 'Tháng 12', revenue: 380000000, orders: 1450 },
]

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

  const data = timeRange === 'day' ? dailyData : timeRange === 'week' ? weeklyData : monthlyData

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
  const avgOrdersPerDay = Math.round(totalOrders / data.length)

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
                {type === 'revenue' ? 'Doanh thu' : 'Orders'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  : `${value} orders`,
                dataType === 'revenue' ? 'Doanh thu' : 'Orders',
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
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3 dark:border-slate-800">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng doanh thu</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(totalRevenue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tăng trưởng</p>
          <p className="mt-1 flex items-center gap-1 text-xl font-semibold text-emerald-600">
            <TrendingUp className="h-5 w-5" />
            +15.3%
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Orders TB/ngày</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            {avgOrdersPerDay}
          </p>
        </div>
      </div>
    </div>
  )
}
