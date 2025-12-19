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
import { Pencil, Trash2, Award, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  const getStatusBadge = (status: MenuItem['status']) => {
    const variants = {
      available: {
        label: 'Đang bán',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      },
      sold_out: {
        label: 'Hết hàng',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      },
      unavailable: {
        label: 'Tạm ẩn',
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      },
    }

    const variant = variants[status]
    return (
      <Badge variant="secondary" className={cn('font-medium', variant.className)}>
        {variant.label}
      </Badge>
    )
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h trước`
    } else if (diffInHours < 48) {
      return '1 ngày trước'
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white/80 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white/80 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Không thể tải danh sách món ăn</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
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
                <TableCell colSpan={7} className="px-2 py-12 text-center md:px-4">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-slate-400">
                      <UtensilsCrossed className="mx-auto h-12 w-12" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Chưa có món ăn nào
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        Bắt đầu bằng cách thêm món đầu tiên
                      </p>
                    </div>
                  </div>
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
                    {getStatusBadge(item.status)}
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
                      {formatDate(item.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-right md:px-4">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full md:h-8 md:w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(item.id)
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-red-600 hover:text-red-700 md:h-8 md:w-8 dark:text-red-400 dark:hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        title="Xóa"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
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

function UtensilsCrossed({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m2.1 21.8 6.4-6.3" />
      <path d="m19 5-7 7" />
    </svg>
  )
}
