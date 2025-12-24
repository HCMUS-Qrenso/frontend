'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Plus, Search, MoreVertical, GripVertical, Users } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ModifierGroup } from '@/src/features/admin/menu/types/modifiers'
import { useReorderModifierGroupsMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifierGroupsPanelProps {
  groups: ModifierGroup[]
  selectedGroupId: string | null
  onSelectGroup: (id: string) => void
  onCreateGroup: () => void
  onEditGroup: () => void
  onDeleteGroup: () => void
}

export function ModifierGroupsPanel({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
}: ModifierGroupsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutation for reordering
  const reorderMutation = useReorderModifierGroupsMutation()

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.id === active.id)
      const newIndex = groups.findIndex((g) => g.id === over.id)
      const reordered = arrayMove(groups, oldIndex, newIndex).map((g, idx) => ({
        id: g.id,
        display_order: idx + 1,
      }))

      // Call API to save order
      reorderMutation.mutate(
        { modifier_groups: reordered },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật thứ tự nhóm')
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể cập nhật thứ tự')
          },
        },
      )
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nhóm tuỳ chọn</h2>
          <Button onClick={onCreateGroup} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Tạo nhóm
          </Button>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="max-h-150 overflow-y-auto p-4">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredGroups.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <SortableGroupItem
                  key={group.id}
                  group={group}
                  isSelected={group.id === selectedGroupId}
                  onSelect={() => onSelectGroup(group.id)}
                  onDelete={onDeleteGroup}
                  onEdit={onEditGroup}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredGroups.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Không tìm thấy nhóm nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableGroupItem({
  group,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: {
  group: ModifierGroup
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDuplicate = () => {
    // TODO: Implement duplicate
    console.log('Duplicate group', group.id)
  }

  const handleUsedByClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/admin/menu/items?modifierGroupId=${group.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group relative cursor-pointer rounded-lg border p-4 transition-all',
        isSelected
          ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-500/10'
          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600',
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1/2 left-2 -translate-y-1/2 cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="ml-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 dark:text-white">{group.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                variant={group.type === 'single_choice' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {group.type === 'single_choice' ? 'Single' : 'Multiple'}
              </Badge>
              {group.is_required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>Nhân bản</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Used By */}
        {group.used_by_count !== undefined && group.used_by_count > 0 && (
          <button
            onClick={handleUsedByClick}
            className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <Users className="h-3.5 w-3.5" />
            Đang dùng bởi {group.used_by_count} món
          </button>
        )}
      </div>
    </div>
  )
}
