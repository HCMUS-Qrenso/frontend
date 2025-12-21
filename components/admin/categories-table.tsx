'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatRelativeDate } from '@/lib/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge, CATEGORY_ACTIVE_CONFIG } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GripVertical, Pencil, Trash2, Eye, EyeOff, Loader2, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useCategoriesQuery,
  useReorderCategoriesMutation,
  useToggleCategoryStatusMutation,
} from '@/hooks/use-categories-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { CategorySortBy, CategorySortOrder } from '@/types/categories'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  item_count: number
  updated_at: string
}

interface CategoriesTableProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
}

function SortableCategoryRow({
  category,
  reorderMode,
  onEdit,
  onDelete,
  onToggleActive,
  onViewItems,
}: {
  category: Category
  reorderMode: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onViewItems: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: !reorderMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b border-slate-100 transition-colors dark:border-slate-800',
        !reorderMode && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
        !category.is_active && !isDragging && 'opacity-60',
        isDragging && 'z-50',
      )}
      onClick={() => !reorderMode && onViewItems(category.id)}
    >
      {reorderMode && (
        <TableCell className="px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </Button>
        </TableCell>
      )}
      <TableCell className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{category.description}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
        {category.display_order}
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <StatusBadge
          status={category.is_active ? 'active' : 'hidden'}
          config={CATEGORY_ACTIVE_CONFIG}
        />
      </TableCell>
      <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
        {category.item_count}
      </TableCell>
      <TableCell className="px-6 py-4 text-slate-600 dark:text-slate-400">
        {formatRelativeDate(category.updated_at)}
      </TableCell>
      <TableCell className="px-6 py-4 text-right">
        <div className="flex items-center justify-end">
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category.id)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleActive(category.id)
                }}
              >
                {category.is_active ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Ẩn danh mục
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Hiện danh mục
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(category.id)
                }}
                className="text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa danh mục
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function CategoriesTable({ reorderMode, setReorderMode }: CategoriesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithStatus } = useErrorHandler()

  // Get query params from URL
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || undefined
  const status = (searchParams.get('status') as 'active' | 'inactive' | 'all') || 'all'
  const sort_by = (searchParams.get('sort_by') as CategorySortBy) || 'display_order'
  const sort_order = (searchParams.get('sort_order') as CategorySortOrder) || 'asc'

  // Fetch categories from API
  const { data, isLoading, error } = useCategoriesQuery({
    page,
    limit,
    search,
    status,
    sort_by,
    sort_order,
    include_item_count: true,
  })

  const categories = data?.data.categories || []
  const pagination = data?.data.pagination

  // Local state for reordering - stores temporary order during drag-drop
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  // Sync local state when API data changes or when entering reorder mode
  useEffect(() => {
    if (categories.length > 0) {
      setLocalCategories(categories)
    }
  }, [categories])

  // Reset local state when exiting reorder mode
  useEffect(() => {
    if (!reorderMode && categories.length > 0) {
      setLocalCategories(categories)
    }
  }, [reorderMode, categories])

  // Mutations
  const reorderMutation = useReorderCategoriesMutation()
  const toggleStatusMutation = useToggleCategoryStatusMutation()

  const handleEdit = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'category')
    params.set('mode', 'edit')
    params.set('id', categoryId)
    router.push(`?${params.toString()}`)
  }

  const handleDelete = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('delete', 'category')
    params.set('id', categoryId)
    router.push(`?${params.toString()}`)
  }

  const handleViewItems = (categoryId: string) => {
    router.push(`/admin/menu/items?category_id=${categoryId}`)
  }

  const handleToggleActive = async (categoryId: string) => {
    try {
      // Find category from either localCategories (reorder mode) or categories
      const category =
        localCategories.find((c) => c.id === categoryId) ||
        categories.find((c) => c.id === categoryId)
      if (!category) return

      await toggleStatusMutation.mutateAsync({
        id: categoryId,
        payload: { is_active: !category.is_active },
      })

      toast.success(`Đã ${category.is_active ? 'ẩn' : 'hiện'} danh mục thành công`)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể thay đổi trạng thái danh mục')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLocalCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = async () => {
    try {
      // Transform localCategories array to API payload format
      const payload = {
        categories: localCategories.map((cat, idx) => ({
          id: cat.id,
          display_order: idx + 1,
        })),
      }

      await reorderMutation.mutateAsync(payload)
      toast.success('Đã cập nhật thứ tự danh mục thành công')
      setReorderMode(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể lưu thứ tự danh mục')
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
          <p className="text-red-600 dark:text-red-400">Không thể tải danh mục</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  const tableContent = (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
          {reorderMode && <TableHead className="w-[50px] px-6 py-3"></TableHead>}
          <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Danh mục
          </TableHead>
          <TableHead className="w-[150px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Thứ tự
          </TableHead>
          <TableHead className="w-[150px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Trạng thái
          </TableHead>
          <TableHead className="w-[150px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            # Món ăn
          </TableHead>
          <TableHead className="w-[120px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Cập nhật
          </TableHead>
          <TableHead className="w-[150px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Thao tác
          </TableHead>
        </TableRow>
      </TableHeader>
      {reorderMode ? (
        <SortableContext
          items={localCategories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableBody>
            {localCategories.map((category) => (
              <SortableCategoryRow
                key={category.id}
                category={category}
                reorderMode={reorderMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onViewItems={handleViewItems}
              />
            ))}
          </TableBody>
        </SortableContext>
      ) : (
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className={cn(
                'cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                !category.is_active && 'opacity-60',
              )}
              onClick={() => handleViewItems(category.id)}
            >
              <TableCell className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {category.description}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                {category.display_order}
              </TableCell>
              <TableCell className="px-6 py-4 text-center">
                <StatusBadge
                  status={category.is_active ? 'active' : 'hidden'}
                  config={CATEGORY_ACTIVE_CONFIG}
                />
              </TableCell>
              <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                {category.item_count}
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {formatRelativeDate(category.updated_at)}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <div className="flex items-center justify-end">
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
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(category.id)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(category.id)
                        }}
                      >
                        {category.is_active ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Ẩn danh mục
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Hiện danh mục
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(category.id)
                        }}
                        className="text-red-600 focus:text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa danh mục
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      )}
    </Table>
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      {reorderMode ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {tableContent}
        </DndContext>
      ) : (
        tableContent
      )}

      {reorderMode && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Button
            variant="outline"
            onClick={() => setReorderMode(false)}
            disabled={reorderMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveOrder}
            disabled={reorderMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {reorderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thứ tự'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
