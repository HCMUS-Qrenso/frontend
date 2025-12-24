'use client'

import { useState } from 'react'
import { Label } from '@/src/components/ui/label'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { X, Loader2, Package } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useModifierGroupsQuery } from '@/src/features/admin/menu/queries/modifiers.queries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'

interface ModifierGroupSelectorProps {
  selectedGroupIds: string[]
  onChange: (groupIds: string[]) => void
  disabled?: boolean
}

export function ModifierGroupSelector({
  selectedGroupIds,
  onChange,
  disabled = false,
}: ModifierGroupSelectorProps) {
  const [open, setOpen] = useState(false)

  // Fetch all modifier groups
  const { data: groupsData, isLoading } = useModifierGroupsQuery({
    include_usage_count: false,
    sort_by: 'display_order',
    sort_order: 'asc',
  })

  const modifierGroups = groupsData?.data.modifier_groups || []
  const selectedGroups = modifierGroups.filter((g) => selectedGroupIds.includes(g.id))

  const handleToggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      onChange(selectedGroupIds.filter((id) => id !== groupId))
    } else {
      onChange([...selectedGroupIds, groupId])
    }
  }

  const handleRemoveGroup = (groupId: string) => {
    onChange(selectedGroupIds.filter((id) => id !== groupId))
  }

  return (
    <div className="space-y-2">
      {/* Display selected groups */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGroups.map((group) => (
            <Badge
              key={group.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1 text-sm"
            >
              <Package className="h-3 w-3" />
              {group.name}
              <span className="text-xs text-slate-500">
                ({group.type === 'single_choice' ? 'Single' : 'Multiple'})
              </span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                  onClick={() => handleRemoveGroup(group.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Select button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                {selectedGroups.length > 0
                  ? `Đã chọn ${selectedGroups.length} nhóm`
                  : 'Chọn nhóm tuỳ chọn'}
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chọn nhóm tuỳ chọn</DialogTitle>
            <DialogDescription>Chọn các nhóm tuỳ chọn có thể áp dụng cho món này</DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : modifierGroups.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Chưa có nhóm tuỳ chọn nào
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Tạo nhóm tuỳ chọn từ trang Modifiers trước
                </p>
              </div>
            ) : (
              modifierGroups.map((group) => (
                <div
                  key={group.id}
                  className={cn(
                    'flex items-start space-x-3 rounded-lg border p-3 transition-colors',
                    selectedGroupIds.includes(group.id)
                      ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-500/10'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50',
                  )}
                >
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroupIds.includes(group.id)}
                    onCheckedChange={() => handleToggleGroup(group.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`group-${group.id}`}
                      className="cursor-pointer font-medium text-slate-900 dark:text-white"
                    >
                      {group.name}
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge
                        variant={group.type === 'single_choice' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {group.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
                      </Badge>
                      {group.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Min: {group.min_selections} | Max:{' '}
                        {group.max_selections === null ? '∞' : group.max_selections}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
