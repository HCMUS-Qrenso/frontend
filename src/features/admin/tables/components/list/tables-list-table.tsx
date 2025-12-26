'use client'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { StatusBadge, TABLE_STATUS_CONFIG } from '@/src/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { LoadingState } from '@/src/components/ui/loading-state'
import { ContainerErrorState } from '@/src/components/ui/loading-state'
import { EmptyState } from '@/src/components/ui/empty-state'
import { SkeletonTableRows } from '@/src/components/loading'
import { Edit2, MapPin, Trash2, RotateCcw, MoreVertical, TableProperties } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTablesQuery, useUpdateTableMutation } from '@/src/features/admin/tables/queries'
import { toast } from 'sonner'
import { TablePagination } from '@/src/components/ui/table-pagination'
import type {
  Table as TableType,
  TableStatus,
  TablePosition,
  TableSortBy,
  TableSortOrder,
} from '@/src/features/admin/tables/types'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'

interface TablesListTableProps {
  isTrashView?: boolean
  onEditClick: (table: TableType) => void
  onDeleteClick: (table: TableType) => void
}

export function TablesListTable({
  isTrashView = false,
  onEditClick,
  onDeleteClick,
}: TablesListTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get query params
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const zone_id = searchParams.get('zone_id') || undefined
  const status = (searchParams.get('status') as TableStatus | null) || undefined
  const sort_by =
    (searchParams.get('sort_by') as TableSortBy | null) || ('tableNumber' as TableSortBy)
  const sort_order =
    (searchParams.get('sort_order') as TableSortOrder | null) || ('asc' as TableSortOrder)

  // Set is_active filter based on trash view
  // If trash view: show inactive tables (is_active = false)
  // If active view: show active tables (is_active = true)
  const isActive = isTrashView ? false : true

  const { data, isLoading, error } = useTablesQuery({
    page,
    limit,
    search,
    zone_id,
    status,
    is_active: isActive,
    sort_by,
    sort_order,
  })

  const tables = data?.data.tables || []
  const pagination = data?.data.pagination
  const updateMutation = useUpdateTableMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const handleViewOnLayout = (table: TableType) => {
    // Ưu tiên zone_id từ nested zone object hoặc zone_id field
    const zoneId = table.zone?.id || table.zone_id
    // Chỉ fallback về zone_name/floor nếu không có zone_id
    const zoneParam = zoneId || table.zone_name || table.floor || 'Tất cả'
    router.push(`/admin/tables/layout?zone=${encodeURIComponent(zoneParam)}&tableId=${table.id}`)
  }

  const handleRestore = async (table: TableType) => {
    try {
      // Parse position from JSON string if exists
      let position: TablePosition | undefined = undefined
      if (table.position) {
        try {
          position = JSON.parse(table.position) as TablePosition
        } catch {
          // Invalid JSON, ignore position
        }
      }

      await updateMutation.mutateAsync({
        id: table.id,
        payload: {
          table_number: table.table_number,
          capacity: table.capacity,
          zone_id: table.zone_id || undefined,
          shape: table.shape || undefined,
          status: table.status,
          is_active: true,
          position,
        },
      })
      toast.success('Bàn đã được khôi phục thành công')
    } catch (error: any) {
      handleErrorWithStatus(error, undefined, 'Không thể khôi phục bàn. Vui lòng thử lại.')
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  // Loading state - skeleton rows to avoid layout shift
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <Table className="w-full min-w-250 table-fixed">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[14%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
                <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Bàn
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Khu vực / Tầng
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Sức chứa
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Trạng thái
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Đơn hàng hiện tại
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SkeletonTableRows
                rowCount={5}
                columns={[
                  { type: 'text-with-subtext' },
                  { type: 'text' },
                  { type: 'number' },
                  { type: 'badge' },
                  { type: 'text' },
                  { type: 'actions', align: 'right', actionCount: 1 },
                ]}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ContainerErrorState
        title="Có lỗi xảy ra"
        description="Không thể tải danh sách bàn. Vui lòng thử lại."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table className="w-full min-w-250 table-fixed">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Khu vực / Tầng
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Sức chứa
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Đơn hàng hiện tại
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-0">
                  <EmptyState
                    icon={TableProperties}
                    title="Không có bàn nào"
                    description="Hãy tạo bàn đầu tiên hoặc thử tìm kiếm khác"
                  />
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table, index) => (
                <TableRow
                  key={table.id}
                  className={cn(
                    'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    index === tables.length - 1 && 'border-b-0',
                  )}
                >
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Số {table.table_number}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {table.capacity} chỗ ngồi
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {table.zone?.name || '—'}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{table.capacity}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={table.status} config={TABLE_STATUS_CONFIG} />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {table.current_order ? (
                      <p className="max-w-45 truncate text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {table.current_order}
                      </p>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      {isTrashView ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleRestore(table)}
                          disabled={updateMutation.isPending}
                          title="Khôi phục bàn"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEditClick(table)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewOnLayout(table)}>
                              <MapPin className="mr-2 h-4 w-4" />
                              Xem trên sơ đồ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteClick(table)}
                              className="text-red-600 focus:text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa bàn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          total={pagination.total}
          limit={pagination.limit}
          itemLabel="bàn"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
