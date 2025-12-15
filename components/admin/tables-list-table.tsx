'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Edit2,
  MoreVertical,
  MapPin,
  Trash2,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useTablesQuery,
  useDeleteTableMutation,
  useUpdateTableMutation,
} from '@/hooks/use-tables-query'
import { toast } from 'sonner'
import type { Table, TableStatus, TablePosition } from '@/types/tables'
import { useErrorHandler } from '@/hooks/use-error-handler'

function getStatusBadge(status: TableStatus) {
  const config = {
    available: {
      label: 'Trống',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    occupied: {
      label: 'Đang sử dụng',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    waiting_for_payment: {
      label: 'Chờ thanh toán',
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    maintenance: {
      label: 'Bảo trì',
      className:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    },
  }

  const statusConfig = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusConfig.className,
      )}
    >
      {statusConfig.label}
    </span>
  )
}

interface TablesListTableProps {
  isTrashView?: boolean
}

export function TablesListTable({ isTrashView = false }: TablesListTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)

  // Get query params
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const floor = searchParams.get('floor') || undefined
  const status = (searchParams.get('status') as TableStatus | null) || undefined

  // Set is_active filter based on trash view
  // If trash view: show inactive tables (is_active = false)
  // If active view: show active tables (is_active = true)
  const isActive = isTrashView ? false : true

  const { data, isLoading, error } = useTablesQuery({
    page,
    limit,
    search,
    floor,
    status,
    is_active: isActive,
  })

  const tables = data?.data.tables || []
  const pagination = data?.data.pagination
  const deleteMutation = useDeleteTableMutation()
  const updateMutation = useUpdateTableMutation()
  const { handleErrorWithStatus, getErrorMessage } = useErrorHandler()

  const handleEdit = (tableId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'table')
    params.set('mode', 'edit')
    params.set('id', tableId)
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  const handleDeleteClick = (table: Table) => {
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
      console.error('Delete table error:', error)
      console.error('Error status:', error?.response?.status)
      console.error('Error message:', error?.response?.data?.message)

      // Handle specific error cases with custom message for 409
      const status = error?.response?.status
      if (status === 409) {
        // Use message from backend or fallback to default
        const message = getErrorMessage(error, 'Không thể xóa bàn đang có đơn hàng')
        toast.error(message)
      } else {
        // Use default error handler for other errors
        handleErrorWithStatus(error, undefined, 'Không thể xóa bàn. Vui lòng thử lại.')
      }
      // Keep dialog open on error so user can try again or cancel
    }
  }

  // Format table info for display
  const getTableDisplayInfo = (table: Table | null): string => {
    if (!table) return ''
    const floor = table.floor || 'Chưa xác định'
    return `${floor} - Bàn #${table.table_number} - ${table.capacity} ghế`
  }

  const handleViewOnLayout = (table: Table) => {
    const floorParam = table.floor || 'Tất cả'
    router.push(`/admin/tables/layout?floor=${encodeURIComponent(floorParam)}&tableId=${table.id}`)
  }

  const handleRestore = async (table: Table) => {
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
          floor: table.floor || undefined,
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

  const handleDeletePermanently = async (table: Table) => {
    // TODO: Implement permanent delete API when available
    // For now, just show a message
    toast.info('Chức năng xóa vĩnh viễn sẽ được triển khai khi API sẵn sàng')
    console.log('Permanent delete requested for table:', table.id)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-500/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Có lỗi xảy ra khi tải danh sách bàn. Vui lòng thử lại.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Khu vực / Tầng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Sức chứa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Đơn hàng hiện tại
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Không có bàn nào được tìm thấy.
                  </p>
                </td>
              </tr>
            ) : (
              tables.map((table, index) => (
                <tr
                  key={table.id}
                  className={cn(
                    'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    index === tables.length - 1 && 'border-b-0',
                  )}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Bàn #{table.table_number}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {table.capacity} chỗ ngồi
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {table.floor || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{table.capacity}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(table.status)}</td>
                  <td className="px-6 py-4">
                    {table.current_order ? (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {table.current_order}
                      </p>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isTrashView ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRestore(table)}
                              disabled={updateMutation.isPending}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              {updateMutation.isPending ? 'Đang khôi phục...' : 'Khôi phục'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeletePermanently(table)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa vĩnh viễn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleEdit(table.id)}
                            title="Chỉnh sửa bàn"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(table.id)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewOnLayout(table)}>
                                <MapPin className="mr-2 h-4 w-4" />
                                Xem trên sơ đồ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(table)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
                Xóa bàn này?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
                Bạn có chắc chắn muốn xóa{' '}
                <span className="font-medium text-slate-900 dark:text-white">
                  {getTableDisplayInfo(tableToDelete)}
                </span>
                ? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
              <AlertDialogCancel
                disabled={deleteMutation.isPending}
                className="m-0 rounded-full"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setTableToDelete(null)
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="m-0 gap-2 rounded-full bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa bàn'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
