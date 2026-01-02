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
import { vi } from 'date-fns/locale'
import { TablePagination } from '@/src/components/ui/table-pagination'
import { useOrdersQuery, useUpdateOrderStatusMutation } from '../queries'
import type { Order, OrderItem, OrderStatus } from '../types/orders'

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: 'Chờ xử lý',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  accepted: {
    label: 'Đã nhận',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  },
  in_progress: {
    label: 'Đang chuẩn bị',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  ready: {
    label: 'Sẵn sàng',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  served: {
    label: 'Đã phục vụ',
    className:
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  },
  completed: {
    label: 'Hoàn thành',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
  rejected: {
    label: 'Từ chối',
    className:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  },
  cancelled: {
    label: 'Đã hủy',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
  abandoned: {
    label: 'Bỏ dở',
    className:
      'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
  },
}

const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  unpaid: {
    label: 'Chưa TT',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
  paid: {
    label: 'Đã TT',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  refunded: {
    label: 'Hoàn tiền',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
}

const NEXT_STATUS_MAP: Record<string, string> = {
  pending: 'accepted',
  accepted: 'in_progress',
  in_progress: 'ready',
  ready: 'served',
  served: 'completed',
}

export function OrdersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  // NOTE: WebSocket connection is managed by OrdersFilterToolbar with auto-refresh toggle
  // The socket invalidates queries automatically, so this table will update in real-time

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

  // Loading state - skeleton rows to avoid layout shift
  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead className="px-4">Mã đơn</AdminTableHead>
                <AdminTableHead className="px-4">Bàn</AdminTableHead>
                <AdminTableHead className="px-4">Món</AdminTableHead>
                <AdminTableHead className="px-4">Trạng thái</AdminTableHead>
                <AdminTableHead className="px-4">Thanh toán</AdminTableHead>
                <AdminTableHead className="px-4" align="right">
                  Tổng tiền
                </AdminTableHead>
                <AdminTableHead className="px-4" align="center">
                  Thời gian
                </AdminTableHead>
                <AdminTableHead className="px-4" align="right">
                  Thao tác
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
              <AdminTableHead className="px-4">Mã đơn</AdminTableHead>
              <AdminTableHead className="px-4">Bàn</AdminTableHead>
              <AdminTableHead className="px-4">Món</AdminTableHead>
              <AdminTableHead className="px-4">Trạng thái</AdminTableHead>
              <AdminTableHead className="px-4">Thanh toán</AdminTableHead>
              <AdminTableHead className="px-4" align="right">
                Tổng tiền
              </AdminTableHead>
              <AdminTableHead className="px-4" align="center">
                Thời gian
              </AdminTableHead>
              <AdminTableHead className="px-4" align="right">
                Thao tác
              </AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-0">
                  <EmptyState
                    icon={ClipboardList}
                    title="Chưa có đơn nào"
                    description="Thử Reset filter hoặc chọn khoảng thời gian khác"
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
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Bàn {order.table?.tableNumber || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {order.table?.zone?.name || ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="group relative">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {order.items.length} món
                        </p>
                        {/* Tooltip */}
                        <div className="invisible absolute bottom-full left-0 z-10 mb-2 w-64 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
                          <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">
                            Chi tiết món:
                          </p>
                          <ul className="space-y-1">
                            {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                            {order.items.length > 3 && (
                              <li className="text-xs text-slate-500 dark:text-slate-500">
                                +{order.items.length - 3} món khác
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
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {order.totalAmount?.toLocaleString('vi-VN')}₫
                      </p>
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
                            Tiếp
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
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              In bill
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Thay đổi trạng thái...</DropdownMenuItem>
                            <DropdownMenuItem>Xuất PDF</DropdownMenuItem>
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
          itemLabel="đơn"
          onPageChange={() => {}}
        />
      )}
    </div>
  )
}
