'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
} from '@/src/components/ui/table'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Eye, MoreVertical, Printer, ChevronRight, AlertCircle, ClipboardList } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { StatusBadge, type StatusConfig } from '@/src/components/ui/status-badge'
import { EmptyState } from '@/src/components/ui/empty-state'
import { SkeletonTableRows } from '@/src/components/loading'
import { formatDistanceToNow } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { TablePagination } from '@/src/components/ui/table-pagination'
import { useOrdersQuery, useUpdateOrderStatusMutation } from '../queries'
import type { Order, OrderItem, OrderStatus } from '../types/orders'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { PriceBreakdownTooltip } from './price-breakdown-tooltip'
import { useFormat } from '@/src/hooks/use-format'

// Waiter-only transitions - KDS handles accepted->in_progress->ready
const NEXT_STATUS_MAP: Record<string, string> = {
  pending: 'accepted',    // Waiter accepts order
  ready: 'served',        // Waiter serves ready items
  served: 'completed',    // Waiter completes order
}

export function OrdersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('orders')
  const locale = useLocale()
  const { formatPrice } = useFormat()

  // Build status config with translations
  const STATUS_CONFIG: Record<string, StatusConfig> = {
    pending: {
      label: t('pending'),
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    accepted: {
      label: t('accepted'),
      className:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    },
    in_progress: {
      label: t('preparing'),
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    ready: {
      label: t('ready'),
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    served: {
      label: t('served'),
      className:
        'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
    },
    completed: {
      label: t('completed'),
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
    rejected: {
      label: t('rejected'),
      className:
        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    },
    cancelled: {
      label: t('cancelled'),
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
    abandoned: {
      label: t('abandoned'),
      className:
        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
    },
  }

  const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
    unpaid: {
      label: t('unpaid'),
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
    paid: {
      label: t('paid'),
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    refunded: {
      label: t('refunded'),
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }

  // Build query params from URL
  const timeRange = searchParams.get('timeRange') || 'all'

  // Calculate date_from and date_to based on timeRange
  const getDateRange = (range: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (range) {
      case 'today':
        return {
          date_from: today.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0],
        }
      case 'last24h':
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        return {
          date_from: last24h.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0],
        }
      case 'last7d':
        const last7d = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          date_from: last7d.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0],
        }
      default:
        return {}
    }
  }

  const dateRange = getDateRange(timeRange)

  const queryParams = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    status:
      searchParams.get('status') !== 'all'
        ? (searchParams.get('status') as OrderStatus)
        : undefined,
    search: searchParams.get('q') || undefined,
    zone_id: searchParams.get('zoneId') || undefined,
    table_id: searchParams.get('tableId') || undefined,
    ...dateRange,
  }

  // Fetch orders from API
  const { data, isLoading, error } = useOrdersQuery(queryParams)
  const orders = data?.data || []
  const meta = data?.meta

  // Update status mutation
  const updateStatusMutation = useUpdateOrderStatusMutation()

  const handleBumpStatus = (orderId: string) => {
    const order = orders.find((o: Order) => o.id === orderId)
    if (!order) return

    const nextStatus = NEXT_STATUS_MAP[order.status]
    if (!nextStatus) return

    updateStatusMutation.mutate({
      id: orderId,
      payload: { status: nextStatus as OrderStatus },
    })
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`)
  }

  const getAgingMinutes = (createdAt: Date) => {
    return Math.floor((Date.now() - createdAt.getTime()) / 60000)
  }

  const isAging = (createdAt: Date) => {
    return getAgingMinutes(createdAt) > 20
  }

  const dateLocale = locale === 'vi' ? vi : enUS

  // Loading state - skeleton rows to avoid layout shift
  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead className="px-4">{t('orderId')}</AdminTableHead>
                <AdminTableHead className="px-4">{t('tableHeader')}</AdminTableHead>
                <AdminTableHead className="px-4">{t('itemsCount')}</AdminTableHead>
                <AdminTableHead className="px-4">{t('status')}</AdminTableHead>
                <AdminTableHead className="px-4">{t('payment')}</AdminTableHead>
                <AdminTableHead className="px-4" align="right">
                  {t('totalAmount')}
                </AdminTableHead>
                <AdminTableHead className="px-4" align="center">
                  {t('time')}
                </AdminTableHead>
                <AdminTableHead className="px-4" align="right">
                  {t('actions')}
                </AdminTableHead>
              </AdminTableHeaderRow>
            </TableHeader>
            <TableBody>
              <SkeletonTableRows
                rowCount={5}
                columns={[
                  { type: 'text-with-subtext' },
                  { type: 'text-with-subtext' },
                  { type: 'number' },
                  { type: 'badge' },
                  { type: 'badge' },
                  { type: 'text', align: 'right' },
                  { type: 'number', align: 'center' },
                  { type: 'actions', align: 'right', actionCount: 2 },
                ]}
              />
            </TableBody>
          </Table>
        </AdminTableContainer>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <AdminTableContainer>
        <Table>
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead className="px-4">{t('orderId')}</AdminTableHead>
              <AdminTableHead className="px-4">{t('tableHeader')}</AdminTableHead>
              <AdminTableHead className="px-4">{t('itemsCount')}</AdminTableHead>
              <AdminTableHead className="px-4">{t('status')}</AdminTableHead>
              <AdminTableHead className="px-4">{t('payment')}</AdminTableHead>
              <AdminTableHead className="px-4" align="right">
                {t('totalAmount')}
              </AdminTableHead>
              <AdminTableHead className="px-4" align="center">
                {t('time')}
              </AdminTableHead>
              <AdminTableHead className="px-4" align="right">
                {t('actions')}
              </AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-0">
                  <EmptyState
                    icon={ClipboardList}
                    title={t('noOrders')}
                    description={t('noOrdersHint')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: Order, index: number) => {
                const aging = getAgingMinutes(new Date(order.createdAt))
                const isOverdue = isAging(new Date(order.createdAt))

                return (
                  <AdminTableRow
                    key={order.id}
                    isLast={index === orders.length - 1}
                    className="cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {t('tableHeader')} {order.table?.tableNumber || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {order.table?.zone?.name || ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="group relative">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {order.items.length} {t('itemsCount').toLowerCase()}
                        </p>
                        {/* Tooltip - position below to avoid overflow clipping */}
                        <div className="invisible absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
                          <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">
                            {t('itemDetails')}
                          </p>
                          <ul className="space-y-1">
                            {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                            {order.items.length > 3 && (
                              <li className="text-xs text-slate-500 dark:text-slate-500">
                                {t('moreItems', { count: order.items.length - 3 })}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={order.status} config={STATUS_CONFIG} />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={order.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <PriceBreakdownTooltip
                        price={{
                          subtotal: order.subtotal,
                          taxAmount: order.taxAmount,
                          discountAmount: order.discountAmount,
                          totalAmount: order.totalAmount,
                        }}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white cursor-help">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </PriceBreakdownTooltip>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {isOverdue && <AlertCircle className="h-3 w-3 text-red-500" />}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-700 dark:text-slate-300',
                          )}
                        >
                          {aging}m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="px-4 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Bump/Next Status */}
                        {NEXT_STATUS_MAP[order.status] && (
                          <Button
                            variant="outline"
                            className="h-7 gap-1 rounded-full bg-transparent px-2 text-xs md:h-8 md:px-3"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBumpStatus(order.id)
                            }}
                          >
                            {t('next')}
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}

                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full md:h-8 md:w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewOrder(order.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* More Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full md:h-8 md:w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              {t('printBill')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>{t('changeStatus')}</DropdownMenuItem>
                            <DropdownMenuItem>{t('exportPdf')}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </AdminTableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </AdminTableContainer>

      {/* Pagination */}
      {meta && (
        <TablePagination
          currentPage={meta.page || 1}
          totalPages={meta.totalPages || 1}
          total={meta.total || 0}
          limit={meta.limit || 10}
          itemLabel={t('itemLabel')}
          onPageChange={() => {}}
        />
      )}
    </div>
  )
}
