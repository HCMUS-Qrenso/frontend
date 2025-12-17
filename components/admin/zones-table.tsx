'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useZonesQuery, useDeleteZoneMutation, useUpdateZoneMutation } from '@/hooks/use-zones-query'
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
  const search = searchParams.get('search') || undefined
  const isActiveParam = searchParams.get('is_active')
  const sortBy = (searchParams.get('sort_by') as 'name' | 'displayOrder' | 'createdAt' | 'updatedAt') || 'displayOrder'
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'

  // Convert is_active param to boolean filter
  let is_active: boolean | undefined
  if (isActiveParam === 'true') is_active = true
  else if (isActiveParam === 'false') is_active = false

  const { data, isLoading } = useZonesQuery({
    search,
    is_active,
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  const zones = data?.data.zones || []
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
        payload: { is_active: !currentStatus }
      })

      toast.success(`Khu vực đã được ${!currentStatus ? 'kích hoạt' : 'tạm ẩn'}`)
    } catch (error) {
      handleErrorWithStatus(error, 'Không thể cập nhật trạng thái khu vực')
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
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
                  <div className="h-4 bg-slate-200 rounded animate-pulse dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="h-3 bg-slate-200 rounded animate-pulse dark:bg-slate-700" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="h-4 w-8 bg-slate-200 rounded animate-pulse dark:bg-slate-700 mx-auto" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="h-5 w-16 bg-slate-200 rounded animate-pulse dark:bg-slate-700 mx-auto" />
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse dark:bg-slate-700" />
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse dark:bg-slate-700" />
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse dark:bg-slate-700" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
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
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {zone.description || 'Không có mô tả'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    {zone.display_order}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge
                      variant={zone.is_active ? 'default' : 'secondary'}
                      className={cn(
                        'font-medium',
                        zone.is_active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                      )}
                    >
                      {zone.is_active ? 'Hoạt động' : 'Tạm ẩn'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(zone.id)
                        }}
                        title="Chỉnh sửa"
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(zone.id, zone.is_active)
                        }}
                        title={zone.is_active ? 'Ẩn khu vực' : 'Hiện khu vực'}
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                      >
                        {zone.is_active ? (
                          <span className="text-slate-400">👁️</span>
                        ) : (
                          <span className="text-slate-600">🙈</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(zone)
                        }}
                        title="Xóa"
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
              Xóa khu vực?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa khu vực "{zoneToDelete?.name}" không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
            <AlertDialogCancel
              className="m-0 rounded-full"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="m-0 gap-2 rounded-full bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Xóa khu vực
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
