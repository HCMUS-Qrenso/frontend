'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import { Badge } from '@/src/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ModifierGroup, Modifier } from '@/src/features/admin/menu/types/modifiers'
import {
  useModifiersQuery,
  useReorderModifiersMutation,
  useToggleModifierAvailabilityMutation,
} from '@/src/features/admin/menu/queries/modifiers.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifiersPanelProps {
  selectedGroup: ModifierGroup | null
  selectedGroupId: string | null
  onCreateModifier: () => void
  onEditModifier: (modifier: Modifier) => void
  onDeleteModifier: (modifier: Modifier) => void
}

export function ModifiersPanel({
  selectedGroup,
  selectedGroupId,
  onCreateModifier,
  onEditModifier,
  onDeleteModifier,
}: ModifiersPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const { handleErrorWithStatus } = useErrorHandler()

  // Fetch modifiers for the selected group
  const {
    data: modifiersData,
    isLoading: isLoadingModifiers,
    error: modifiersError,
  } = useModifiersQuery(selectedGroupId, {
    include_unavailable: true,
    sort_by: 'display_order',
    sort_order: 'asc',
  })

  // Mutations
  const reorderMutation = useReorderModifiersMutation()
  const toggleAvailabilityMutation = useToggleModifierAvailabilityMutation()

  // Handle errors
  if (modifiersError) {
    handleErrorWithStatus(modifiersError)
  }

  const modifiers = modifiersData?.data.modifiers || []

  const filteredModifiers = modifiers.filter((mod) => {
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAvailable = !showOnlyAvailable || mod.is_available
    return matchesSearch && matchesAvailable
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id && selectedGroupId) {
      const oldIndex = filteredModifiers.findIndex((m) => m.id === active.id)
      const newIndex = filteredModifiers.findIndex((m) => m.id === over.id)
      const reordered = arrayMove(filteredModifiers, oldIndex, newIndex).map((m, idx) => ({
        id: m.id,
        display_order: idx + 1,
      }))

      // Call API to save order
      reorderMutation.mutate(
        { groupId: selectedGroupId, payload: { modifiers: reordered } },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật thứ tự option')
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể cập nhật thứ tự')
          },
        },
      )
    }
  }

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Chuẩn'
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(amount))
    return amount > 0 ? `+${formatted}đ` : `-${formatted}đ`
  }

  if (!selectedGroup) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-100 items-center justify-center">
          <div className="text-center">
            <Eye className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Chọn nhóm để xem các option
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedGroup.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {selectedGroup.is_required && <span>• Bắt buộc chọn</span>}
              {selectedGroup.min_selections !== null && selectedGroup.min_selections > 0 && (
                <span>• Tối thiểu: {selectedGroup.min_selections}</span>
              )}
              {selectedGroup.max_selections !== null ? (
                <span>• Tối đa: {selectedGroup.max_selections}</span>
              ) : (
                <span>• Không giới hạn số lượng</span>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm">Chỉ hiện Available</span>
                  <Switch checked={showOnlyAvailable} onCheckedChange={setShowOnlyAvailable} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => onCreateModifier()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm option
            </Button>
          </div>
        </div>
      </div>

      {/* Modifiers List */}
      <div className="max-h-150 overflow-y-auto p-4">
        {isLoadingModifiers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={filteredModifiers.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredModifiers.map((modifier) => (
                    <SortableModifierItem
                      key={modifier.id}
                      modifier={modifier}
                      formatPrice={formatPrice}
                      selectedGroupId={selectedGroupId}
                      toggleAvailabilityMutation={toggleAvailabilityMutation}
                      handleErrorWithStatus={handleErrorWithStatus}
                      onEdit={() => onEditModifier(modifier)}
                      onDelete={() => onDeleteModifier(modifier)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {filteredModifiers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {modifiers.length === 0
                    ? 'Chưa có option nào. Thêm mới để bắt đầu.'
                    : 'Không tìm thấy option nào'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SortableModifierItem({
  modifier,
  formatPrice,
  selectedGroupId,
  toggleAvailabilityMutation,
  handleErrorWithStatus,
  onEdit,
  onDelete,
}: {
  modifier: Modifier
  formatPrice: (amount: number) => string
  selectedGroupId: string | null
  toggleAvailabilityMutation: any
  handleErrorWithStatus: any
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: modifier.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleToggleAvailability = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedGroupId) return

    toggleAvailabilityMutation.mutate(
      {
        id: modifier.id,
        groupId: selectedGroupId,
        is_available: !modifier.is_available,
      },
      {
        onSuccess: () => {
          toast.success(modifier.is_available ? 'Đã ẩn option' : 'Đã hiện option')
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể cập nhật trạng thái')
        },
      },
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900 dark:text-white">{modifier.name}</h3>
            {!modifier.is_available && (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="mr-1 h-3 w-3" />
                Ẩn
              </Badge>
            )}
          </div>
          <p
            className={cn(
              'mt-1 text-sm font-medium',
              modifier.price_adjustment === 0
                ? 'text-slate-500 dark:text-slate-400'
                : modifier.price_adjustment > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
            )}
          >
            {formatPrice(modifier.price_adjustment)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={cn(
              'rounded-full p-2 transition-colors',
              modifier.is_available
                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
            )}
          >
            {modifier.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
