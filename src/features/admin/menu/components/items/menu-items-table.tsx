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
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Pencil, Trash2, Award, Clock, MoreVertical, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useFormat } from '@/src/hooks/use-format'
import { StatusBadge, type StatusConfig } from '@/src/components/ui/status-badge'
import { ContainerLoadingState, ContainerErrorState } from '@/src/components/ui/loading-state'
import { EmptyState } from '@/src/components/ui/empty-state'
import { SkeletonTableRows } from '@/src/components/loading'
import Image from 'next/image'
import { useMenuItemsQuery } from '@/src/features/admin/menu/queries'
import { TablePagination } from '@/src/components/ui/table-pagination'
import type {
  MenuItemSortBy,
  MenuItemSortOrder,
  MenuItemStatus,
} from '@/src/features/admin/menu/types'
import { useTranslations } from 'next-intl'

interface MenuItemsTableProps {
  onEditClick: (item: any) => void
  onDeleteClick: (item: any) => void
}

export function MenuItemsTable({ onEditClick, onDeleteClick }: MenuItemsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('menu')
  const { formatPrice, formatRelativeDate } = useFormat()

  const MENU_ITEM_STATUS_CONFIG: Record<string, StatusConfig> = {
    available: {
      label: t('available'),
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    sold_out: {
      label: t('soldOut'),
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    unavailable: {
      label: t('unavailable'),
      className:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
  }

  // Get query params from URL
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const category_id = searchParams.get('category_id')

  // Get sort params directly from URL (matching API format)
  const sort_by: MenuItemSortBy = (searchParams.get('sort_by') as MenuItemSortBy) || 'createdAt'
  const sort_order: MenuItemSortOrder =
    (searchParams.get('sort_order') as MenuItemSortOrder) || 'desc'

  // Validate status parameter
  const statusParam = searchParams.get('status')
  const status: MenuItemStatus | undefined =
    statusParam && ['available', 'unavailable', 'sold_out'].includes(statusParam)
      ? (statusParam as MenuItemStatus)
      : undefined

  // Fetch menu items from API (status is not sent to API)
  const { data, isLoading, error } = useMenuItemsQuery({
    page,
    limit,
    search,
    status,
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

  // Loading state - skeleton rows to avoid layout shift
  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead className="min-w-50 px-2 md:px-4">{t('menuItem')}</AdminTableHead>
                <AdminTableHead className="w-24 px-2 md:w-32 md:px-4">
                  {t('category')}
                </AdminTableHead>
                <AdminTableHead className="w-20 px-2 md:w-28 md:px-4" align="right">
                  {t('price')}
                </AdminTableHead>
                <AdminTableHead className="w-24 px-2 md:w-28 md:px-4" align="center">
                  {t('status')}
                </AdminTableHead>
                <AdminTableHead className="w-16 px-2 md:w-20 md:px-4" align="center">
                  {t('popularityScore')}
                </AdminTableHead>
                <AdminTableHead className="w-20 px-2 md:w-24 md:px-4">
                  {t('updatedAt')}
                </AdminTableHead>
                <AdminTableHead className="w-20 px-2 md:px-4" align="right">
                  {t('actions')}
                </AdminTableHead>
              </AdminTableHeaderRow>
            </TableHeader>
            <TableBody>
              <SkeletonTableRows
                rowCount={5}
                columns={[
                  { type: 'image-with-text' },
                  { type: 'text' },
                  { type: 'text', align: 'right' },
                  { type: 'badge', align: 'center' },
                  { type: 'number', align: 'center' },
                  { type: 'text' },
                  { type: 'actions', align: 'right', actionCount: 1 },
                ]}
              />
            </TableBody>
          </Table>
        </AdminTableContainer>
      </div>
    )
  }

  // Error state
  if (error) {
    return <ContainerErrorState title={t('cannotLoadItems')} description={t('tryAgainLater')} />
  }

  return (
    <div className="space-y-4">
      <AdminTableContainer>
        <Table>
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead className="min-w-50 px-2 md:px-4">{t('menuItem')}</AdminTableHead>
              <AdminTableHead className="w-24 px-2 md:w-32 md:px-4">{t('category')}</AdminTableHead>
              <AdminTableHead className="w-20 px-2 md:w-28 md:px-4" align="right">
                {t('price')}
              </AdminTableHead>
              <AdminTableHead className="w-24 px-2 md:w-28 md:px-4" align="center">
                {t('status')}
              </AdminTableHead>
              <AdminTableHead className="w-16 px-2 md:w-20 md:px-4" align="center">
                {t('popularityScore')}
              </AdminTableHead>
              <AdminTableHead className="w-20 px-2 md:w-24 md:px-4">
                {t('updatedAt')}
              </AdminTableHead>
              <AdminTableHead className="w-20 px-2 md:px-4" align="right">
                {t('actions')}
              </AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-2 py-0 md:px-4">
                  <EmptyState
                    icon={UtensilsCrossed}
                    title={t('noItems')}
                    description={t('noItemsHint')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item, index) => (
                <AdminTableRow
                  key={item.id}
                  isLast={index === menuItems.length - 1}
                  className="cursor-pointer"
                  onClick={() => onEditClick(item)}
                >
                  <TableCell className="px-2 py-3 md:px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-14 md:w-14 dark:border-slate-700 dark:bg-slate-800">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={
                              item.images.find((img: any) => img.is_primary)?.image_url ||
                              item.images[0]?.image_url ||
                              '/placeholder.svg'
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
                          <span className="line-clamp-2 text-xs font-medium wrap-break-word text-slate-900 md:text-sm dark:text-white">
                            {item.name}
                          </span>
                          {item.is_chef_recommendation && (
                            <span title={t('chefRecommendation')}>
                              <Award className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {item.preparation_time} {t('prepTime')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3 md:px-4">
                    <span className="text-xs wrap-break-word text-slate-600 md:text-sm dark:text-slate-400">
                      {item.category?.name || t('uncategorized')}
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
                              onEditClick(item)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteClick(item)
                            }}
                            className="text-red-600 focus:text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('deleteItem')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          itemLabel={t('itemLabel')}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
