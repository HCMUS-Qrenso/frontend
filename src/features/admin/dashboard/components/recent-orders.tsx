'use client'

import { cn } from '@/src/lib/utils'
import { Eye } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useRecentOrdersQuery } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function RecentOrders({ className }: { className?: string }) {
  const { data: orders, isLoading } = useRecentOrdersQuery(7)
  const t = useTranslations('dashboard')

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: t('pending'),
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    },
    accepted: {
      label: t('accepted'),
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    },
    in_progress: {
      label: t('inProgress'),
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
    },
    preparing: {
      label: t('preparing'),
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
    },
    ready: {
      label: t('ready'),
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    },
    served: {
      label: t('served'),
      className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    },
    completed: {
      label: t('completed'),
      className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    },
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

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
          <h3 className="font-semibold text-slate-900 dark:text-white">{t('recentOrdersTitle')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('trackLatestOrders')}</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            {t('viewAll')}
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t('orderId')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t('table')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t('time')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t('total')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))
            ) : orders?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {t('noOrdersToday')}
                </td>
              </tr>
            ) : (
              orders?.map((order) => {
                const status = statusConfig[order.status] || {
                  label: order.status,
                  className: 'bg-slate-100 text-slate-600',
                }
                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-white">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {t('table')} {order.table_number}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {formatTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
