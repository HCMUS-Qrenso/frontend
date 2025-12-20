'use client'

import { cn } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  table: string
  time: string
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed'
}

const orders: Order[] = [
  { id: '#INV-2025-00128', table: 'Bàn 5', time: '12:45', total: 425000, status: 'preparing' },
  { id: '#INV-2025-00127', table: 'Bàn 12', time: '12:32', total: 680000, status: 'pending' },
  { id: '#INV-2025-00126', table: 'Bàn 3', time: '12:28', total: 312000, status: 'ready' },
  { id: '#INV-2025-00125', table: 'Bàn 8', time: '12:15', total: 520000, status: 'served' },
  { id: '#INV-2025-00124', table: 'Bàn 1', time: '12:02', total: 245000, status: 'completed' },
  { id: '#INV-2025-00123', table: 'Bàn 7', time: '11:48', total: 890000, status: 'completed' },
  { id: '#INV-2025-00122', table: 'Bàn 2', time: '11:35', total: 178000, status: 'completed' },
]

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
  },
  ready: {
    label: 'Ready',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  served: {
    label: 'Served',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  },
}

interface RecentOrdersProps {
  className?: string
}

export function RecentOrders({ className }: RecentOrdersProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Đơn hàng gần đây</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi đơn hàng mới nhất</p>
        </div>
        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
          Xem tất cả
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-white">
                  {order.id}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {order.table}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {order.time}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      statusConfig[order.status].className,
                    )}
                  >
                    {statusConfig[order.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
