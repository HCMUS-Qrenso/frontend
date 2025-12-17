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
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Category {
  id: string
  name: string
  description: string
  display_order: number
  is_active: boolean
  item_count: number
}

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Khai vị',
    description: 'Các món khai vị truyền thống',
    display_order: 1,
    is_active: true,
    item_count: 8,
  },
  {
    id: '2',
    name: 'Món chính',
    description: 'Các món chính phong phú',
    display_order: 2,
    is_active: true,
    item_count: 24,
  },
  {
    id: '3',
    name: 'Tráng miệng',
    description: 'Các món tráng miệng ngọt ngào',
    display_order: 3,
    is_active: true,
    item_count: 12,
  },
  {
    id: '4',
    name: 'Đồ uống',
    description: 'Nước giải khát và cocktail',
    display_order: 4,
    is_active: true,
    item_count: 18,
  },
  {
    id: '5',
    name: 'Món đặc biệt',
    description: 'Các món đặc biệt của nhà hàng',
    display_order: 5,
    is_active: false,
    item_count: 6,
  },
]

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
        <Badge
          variant={category.is_active ? 'default' : 'secondary'}
          className={cn(
            'font-medium',
            category.is_active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
          )}
        >
          {category.is_active ? 'Active' : 'Hidden'}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
        {category.item_count}
      </TableCell>
      <TableCell className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(category.id)
            }}
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive(category.id)
            }}
            title={category.is_active ? 'Ẩn danh mục' : 'Hiện danh mục'}
          >
            {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(category.id)
            }}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function CategoriesTable({ reorderMode, setReorderMode }: CategoriesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState(mockCategories)

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
    router.push(`/admin/menu/items?categoryId=${categoryId}`)
  }

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, is_active: !cat.is_active } : cat)),
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)
      const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, idx) => ({
        ...cat,
        display_order: idx + 1,
      }))
      setCategories(reordered)
    }
  }

  const handleSaveOrder = () => {
    // TODO: Save order to backend
    // API call to save new display_order for all categories
    setReorderMode(false)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
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
            <TableHead className="w-[150px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        {reorderMode ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {categories.map((category) => (
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
          </DndContext>
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
                  <Badge
                    variant={category.is_active ? 'default' : 'secondary'}
                    className={cn(
                      'font-medium',
                      category.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    )}
                  >
                    {category.is_active ? 'Active' : 'Hidden'}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                  {category.item_count}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(category.id)
                      }}
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleActive(category.id)
                      }}
                      title={category.is_active ? 'Ẩn danh mục' : 'Hiện danh mục'}
                    >
                      {category.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(category.id)
                      }}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {reorderMode && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Button variant="outline" onClick={() => setReorderMode(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveOrder} className="bg-emerald-600 hover:bg-emerald-700">
            Lưu thứ tự
          </Button>
        </div>
      )}
    </div>
  )
}
