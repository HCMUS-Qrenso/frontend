'use client'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { StatusBadge, ZONE_ACTIVE_CONFIG } from '@/src/components/ui/status-badge'
import { EmptyState } from '@/src/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Edit2, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useZonesQuery, useUpdateZoneMutation } from '@/src/features/admin/tables/queries'
import { toast } from 'sonner'
import type { Zone } from '@/src/features/admin/tables/types'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { TablePagination } from '@/src/components/ui/table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
} from '@/src/components/ui/table'
import { SkeletonTableRows } from '@/src/components/loading'

interface ZonesTableProps {
  onEdit: (zone: Zone) => void
  onDelete: (zone: Zone) => void
}

export function ZonesTable({ onEdit, onDelete }: ZonesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get filter params from URL
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const isActive = searchParams.get('is_active') as 'true' | 'false' | undefined
  const sortBy =
    (searchParams.get('sort_by') as 'name' | 'displayOrder' | 'createdAt' | 'updatedAt') ||
    'displayOrder'
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'

  const { data, isLoading, error } = useZonesQuery({
    page,
    limit,
    search,
    is_active: isActive,
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  const zones = data?.data || []
  const pagination = data?.pagination
  const updateMutation = useUpdateZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.replace(`/admin/tables/zones?${params.toString()}`)
  }

  const handleToggleActive = async (zoneId: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id: zoneId,
        payload: { is_active: !currentStatus },
      })

      toast.success(`Khu vực đã được ${!currentStatus ? 'kích hoạt' : 'tạm ẩn'}`)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể cập nhật trạng thái khu vực')
    }
  }

  if (isLoading) {
    return (
      <AdminTableContainer>
        <Table className="w-full min-w-250 table-fixed">
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead>Tên khu vực</AdminTableHead>
              <AdminTableHead className="w-50">Mô tả</AdminTableHead>
              <AdminTableHead className="w-30" align="center">Thứ tự</AdminTableHead>
              <AdminTableHead className="w-30" align="center">Trạng thái</AdminTableHead>
              <AdminTableHead className="w-37.5" align="right">Thao tác</AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            <SkeletonTableRows
              rowCount={3}
              columns={[
                { type: 'text' },
                { type: 'text' },
                { type: 'number', align: 'center' },
                { type: 'badge', align: 'center' },
                { type: 'actions', align: 'right', actionCount: 1 },
              ]}
            />
          </TableBody>
        </Table>
      </AdminTableContainer>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-500/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Có lỗi xảy ra khi tải danh sách khu vực. Vui lòng thử lại.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AdminTableContainer>
        <Table className="w-full min-w-250 table-fixed">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[32%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead>Tên khu vực</AdminTableHead>
              <AdminTableHead className="w-50">Mô tả</AdminTableHead>
              <AdminTableHead className="w-30" align="center">Thứ tự</AdminTableHead>
              <AdminTableHead className="w-30" align="center">Trạng thái</AdminTableHead>
              <AdminTableHead className="w-37.5" align="right">Thao tác</AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-0">
                  <EmptyState title="Chưa có khu vực nào" description="Hãy tạo khu vực đầu tiên" />
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone, index) => (
                <AdminTableRow
                  key={zone.id}
                  isLast={index === zones.length - 1}
                  className={cn(!zone.is_active && 'opacity-60')}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {zone.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="max-w-xs text-sm wrap-break-word whitespace-normal text-slate-600 sm:max-w-md dark:text-slate-400">
                      {zone.description || 'Không có mô tả'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    {zone.display_order}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge
                      status={zone.is_active ? 'active' : 'inactive'}
                      config={ZONE_ACTIVE_CONFIG}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(zone)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(zone.id, zone.is_active)}
                        >
                          {zone.is_active ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Ẩn khu vực
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Hiện khu vực
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(zone)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa khu vực
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </AdminTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          total={pagination.total}
          limit={pagination.limit}
          itemLabel="khu vực"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
