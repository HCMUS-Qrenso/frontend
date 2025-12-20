'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusBadge, TABLE_STATUS_CONFIG } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { LoadingState } from '@/components/ui/loading-state'
import { ContainerErrorState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Edit2, MapPin, Trash2, RotateCcw, MoreVertical, TableProperties } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useTablesQuery,
  useDeleteTableMutation,
  useUpdateTableMutation,
} from '@/hooks/use-tables-query'
import { toast } from 'sonner'
import type {
  Table as TableType,
  TableStatus,
  TablePosition,
  TableSortBy,
  TableSortOrder,
} from '@/types/tables'
import { useErrorHandler } from '@/hooks/use-error-handler'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'


interface TablesListTableProps {
  isTrashView?: boolean
}

export function TablesListTable({ isTrashView = false }: TablesListTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<TableType | null>(null)

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
  const deleteMutation = useDeleteTableMutation()
  const updateMutation = useUpdateTableMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const handleEdit = (tableId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'table')
    params.set('mode', 'edit')
    params.set('id', tableId)
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  const handleDeleteClick = (table: TableType) => {
    setTableToDelete(table)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return

    try {
      await deleteMutation.mutateAsync(tableToDelete.id)
      toast.success('Bàn đã được xóa thành công')
      setDeleteDialogOpen(false)
      setTableToDelete(null)
    } catch (error: any) {
      // Handle specific error cases with custom message for 409
      const status = error?.response?.status
      if (status === 409) {
        // Extract message directly from backend response
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'Không thể xóa bàn đang có đơn hàng'
        toast.error(message)
      } else {
        // Use default error handler for other errors
        handleErrorWithStatus(error, undefined, 'Không thể xóa bàn. Vui lòng thử lại.')
      }
      // Keep dialog open on error so user can try again or cancel
    }
  }

  // Format table info for display
  const getTableDisplayInfo = (table: TableType | null): string => {
    if (!table) return ''
    const zoneName = table.zone_name || table.floor || 'Chưa xác định'
    return `${zoneName} - Bàn #${table.table_number} - ${table.capacity} ghế`
  }

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

  if (isLoading) {
    return <LoadingState />
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
                      <p className="max-w-[180px] truncate text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
                            <DropdownMenuItem onClick={() => handleEdit(table.id)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewOnLayout(table)}>
                              <MapPin className="mr-2 h-4 w-4" />
                              Xem trên sơ đồ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(table)}
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
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} trên {pagination.total}{' '}
            bàn
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Trước
            </Button>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 w-8 rounded-full',
                  pageNum === pagination.page
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    : 'bg-transparent',
                )}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={pagination.page === pagination.total_pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - Only show for active view */}
      {!isTrashView && (
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) setTableToDelete(null)
          }}
          title="Xóa bàn này?"
          description="Hành động này không thể hoàn tác."
          itemName={getTableDisplayInfo(tableToDelete)}
          onConfirm={handleConfirmDelete}
          isLoading={deleteMutation.isPending}
          confirmText="Xóa bàn"
        />
      )}
    </div>
  )
}
