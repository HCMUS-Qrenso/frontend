'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pencil, Trash2, Award, Clock, MoreVertical, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate, formatPrice } from '@/lib/utils/format'
import { StatusBadge, MENU_ITEM_STATUS_CONFIG } from '@/components/ui/status-badge'
import { ContainerLoadingState, ContainerErrorState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import Image from 'next/image'
import { useMenuItemsQuery } from '@/hooks/use-menu-items-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { MenuItemSortBy, MenuItemSortOrder } from '@/types/menu-items'
import { toast } from 'sonner'

// Import the MenuItem type from the types file
import type { MenuItem } from '@/types/menu-items'

export function MenuItemsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithStatus } = useErrorHandler()

  // Get query params from URL
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const category_id = searchParams.get('category_id')

  // Get sort params directly from URL (matching API format)
  const sort_by: MenuItemSortBy = (searchParams.get('sort_by') as MenuItemSortBy) || 'createdAt'
  const sort_order: MenuItemSortOrder =
    (searchParams.get('sort_order') as MenuItemSortOrder) || 'desc'

  // Fetch menu items from API (status is not sent to API)
  const { data, isLoading, error } = useMenuItemsQuery({
    page,
    limit,
    search,
    category_id: category_id === 'all' ? undefined : category_id || undefined,
    sort_by,
    sort_order,
  })

  const menuItems = data?.data.menu_items || []
  const pagination = data?.data.pagination

  // Calculate pagination variables
  const currentPage = pagination?.page || page
  const totalPages = pagination?.total_pages || 1
  const total = pagination?.total || 0
  const startItem = pagination ? (currentPage - 1) * limit + 1 : 0
  const endItem = pagination ? Math.min(currentPage * limit, total) : 0

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const handleEdit = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'item')
    params.set('mode', 'edit')
    params.set('id', itemId)
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const handleDelete = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('delete', 'item')
    params.set('id', itemId)
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  // Loading state
  if (isLoading) {
    return <ContainerLoadingState />
  }

  // Error state
  if (error) {
    return (
      <ContainerErrorState
        title="Không thể tải danh sách món ăn"
        description="Vui lòng thử lại sau"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="min-w-[200px] px-2 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase md:px-4 dark:text-slate-400">
                Món ăn
              </TableHead>
              <TableHead className="w-24 px-2 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase md:w-32 md:px-4 dark:text-slate-400">
                Danh mục
              </TableHead>
              <TableHead className="w-20 px-2 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase md:w-28 md:px-4 dark:text-slate-400">
                Giá
              </TableHead>
              <TableHead className="w-24 px-2 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase md:w-28 md:px-4 dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="w-16 px-2 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase md:w-20 md:px-4 dark:text-slate-400">
                Phổ biến
              </TableHead>
              <TableHead className="w-20 px-2 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase md:w-24 md:px-4 dark:text-slate-400">
                Cập nhật
              </TableHead>
              <TableHead className="w-20 px-2 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase md:px-4 dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-2 py-0 md:px-4">
                  <EmptyState
                    icon={UtensilsCrossed}
                    title="Chưa có món ăn nào"
                    description="Bắt đầu bằng cách thêm món đầu tiên"
                  />
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    'cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    index === menuItems.length - 1 && 'border-b-0',
                  )}
                  onClick={() => handleEdit(item.id)}
                >
                  <TableCell className="px-2 py-3 md:px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-14 md:w-14 dark:border-slate-700 dark:bg-slate-800">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={
                              typeof item.images[0] === 'string'
                                ? item.images[0]
                                : (item.images[0] as any)?.image_url || '/placeholder.svg'
                            }
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-2 text-xs font-medium break-words text-slate-900 md:text-sm dark:text-white">
                            {item.name}
                          </span>
                          {item.is_chef_recommendation && (
                            <span title="Chef's recommendation">
                              <Award className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{item.preparation_time} phút</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3 md:px-4">
                    <span className="text-xs break-words text-slate-600 md:text-sm dark:text-slate-400">
                      {item.category?.name || 'Chưa phân loại'}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-right md:px-4">
                    <span className="text-xs font-medium text-slate-900 md:text-sm dark:text-white">
                      {formatPrice(Number(item.base_price))}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-center md:px-4">
                    <StatusBadge status={item.status} config={MENU_ITEM_STATUS_CONFIG} />
                  </TableCell>
                  <TableCell className="px-2 py-3 text-center md:px-4">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-medium text-slate-900 md:text-sm dark:text-white">
                        {item.popularity_score}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3 md:px-4">
                    <span className="text-xs text-slate-600 md:text-sm dark:text-slate-400">
                      {formatRelativeDate(item.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-right md:px-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full md:h-8 md:w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(item.id)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(item.id)
                            }}
                            className="text-red-600 focus:text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa món ăn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {startItem}-{endItem} trên {total} món
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 w-8 rounded-full',
                  pageNum === currentPage
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
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
