'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { StatusBadge, ZONE_ACTIVE_CONFIG } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useZonesQuery,
  useDeleteZoneMutation,
  useUpdateZoneMutation,
} from '@/hooks/use-zones-query'
import { toast } from 'sonner'
import type { Zone } from '@/types/zones'
import { useErrorHandler } from '@/hooks/use-error-handler'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ZonesTable() {
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
  const deleteMutation = useDeleteZoneMutation()
  const updateMutation = useUpdateZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleEdit = (zoneId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'zone')
    params.set('mode', 'edit')
    params.set('id', zoneId)
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

  const handleDeleteClick = (zone: Zone) => {
    setZoneToDelete(zone)
    setDeleteDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.replace(`/admin/tables/zones?${params.toString()}`)
  }

  const handleConfirmDelete = async () => {
    if (!zoneToDelete) return

    try {
      await deleteMutation.mutateAsync(zoneToDelete.id)
      toast.success('Khu vực đã được xóa thành công')
      setDeleteDialogOpen(false)
      setZoneToDelete(null)
    } catch (error: any) {
      // Handle specific error cases with custom message for 409
      const status = error?.response?.status
      if (status === 409) {
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'Không thể xóa khu vực đang có bàn'
        toast.error(message)
      } else {
        handleErrorWithStatus(error, undefined, 'Không thể xóa khu vực. Vui lòng thử lại.')
      }
    }
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
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table className="w-full min-w-250 table-fixed">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Tên khu vực
              </TableHead>
              <TableHead className="w-[200px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Mô tả
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thứ tự
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="w-[150px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-6 py-4">
                  <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="mx-auto h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="mx-auto h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table className="w-full min-w-250 table-fixed">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[32%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Tên khu vực
              </TableHead>
              <TableHead className="w-[200px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Mô tả
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thứ tự
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="w-[150px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Chưa có khu vực nào. Hãy tạo khu vực đầu tiên.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow
                  key={zone.id}
                  className={cn(
                    'cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    !zone.is_active && 'opacity-60',
                  )}
                  onClick={() => handleEdit(zone.id)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {zone.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="max-w-xs text-sm break-words whitespace-normal text-slate-600 sm:max-w-md dark:text-slate-400">
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
                        <DropdownMenuItem onClick={() => handleEdit(zone.id)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(zone.id, zone.is_active)}>
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
                          onClick={() => handleDeleteClick(zone)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa khu vực
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa khu vực?"
        description="Hành động này không thể hoàn tác."
        itemName={zoneToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        confirmText="Xóa khu vực"
      />

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} trên {pagination.total}{' '}
            khu vực
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
