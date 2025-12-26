'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { X, Loader2, Package } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useModifierGroupsQuery } from '@/src/features/admin/menu/queries'
import { FormDialog } from '@/src/components/ui/form-dialog'

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
  // Temporary state for selections inside dialog (only applied on submit)
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([])

  // Sync temp state when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelectedIds([...selectedGroupIds])
    }
  }, [open, selectedGroupIds])

  // Fetch all modifier groups
  const { data: groupsData, isLoading } = useModifierGroupsQuery({
    include_usage_count: false,
    sort_by: 'display_order',
    sort_order: 'asc',
  })

  const modifierGroups = groupsData?.data.modifier_groups || []
  const selectedGroups = modifierGroups.filter((g) => selectedGroupIds.includes(g.id))

  // Toggle in temporary state (inside dialog)
  const handleToggleGroup = (groupId: string) => {
    if (tempSelectedIds.includes(groupId)) {
      setTempSelectedIds(tempSelectedIds.filter((id) => id !== groupId))
    } else {
      setTempSelectedIds([...tempSelectedIds, groupId])
    }
  }

  // Remove from actual selected (outside dialog, via badge X button)
  const handleRemoveGroup = (groupId: string) => {
    onChange(selectedGroupIds.filter((id) => id !== groupId))
  }

  // Apply changes when user clicks "Xong"
  const handleSubmit = () => {
    onChange(tempSelectedIds)
    setOpen(false)
  }

  // Discard changes when user clicks "Huỷ" or closes dialog
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Dialog is closing - discard temp changes
      setTempSelectedIds([...selectedGroupIds])
    }
    setOpen(newOpen)
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

      {/* Select button to open dialog */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled || isLoading}
        onClick={() => setOpen(true)}
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

      {/* FormDialog for consistency */}
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Chọn nhóm tuỳ chọn"
        description="Chọn các nhóm tuỳ chọn có thể áp dụng cho món này"
        onSubmit={handleSubmit}
        submitText="Xong"
        cancelText="Huỷ"
        size="md"
      >
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
                  tempSelectedIds.includes(group.id)
                    ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-500/10'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50',
                )}
              >
                <Checkbox
                  id={`group-${group.id}`}
                  checked={tempSelectedIds.includes(group.id)}
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
      </FormDialog>
    </div>
  )
}
