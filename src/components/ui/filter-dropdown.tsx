'use client'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { ChevronDown, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterDropdownProps {
  /** Label prefix shown before selected value (e.g., "Trạng thái:") */
  label: string
  /** Currently selected value */
  value: string
  /** Available options - can be static array or dynamic from API */
  options: FilterOption[]
  /** Callback when option is selected */
  onChange: (value: string) => void
  /** Optional icon to show before label */
  icon?: LucideIcon
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Tooltip when disabled */
  disabledTooltip?: string
  /** Dropdown alignment */
  align?: 'start' | 'center' | 'end'
  /** Dropdown menu width class */
  menuWidth?: string
  /** Additional className for the trigger button */
  className?: string
  /** Loading state for dynamic options */
  isLoading?: boolean
  /** Placeholder when no option is selected */
  placeholder?: string
  /** Empty state message when options array is empty */
  emptyMessage?: string
}

/**
 * Reusable filter dropdown component for admin toolbars
 * Supports both static options and dynamic options from API
 *
 * @example Static options
 * ```tsx
 * const STATUS_OPTIONS = [
 *   { value: 'all', label: 'Tất cả' },
 *   { value: 'active', label: 'Hoạt động' },
 * ]
 * <FilterDropdown options={STATUS_OPTIONS} ... />
 * ```
 *
 * @example Dynamic options from API
 * ```tsx
 * const { data, isLoading } = useZonesQuery()
 * const zoneOptions = [
 *   { value: '', label: 'Tất cả' },
 *   ...(data?.zones.map(z => ({ value: z.id, label: z.name })) || [])
 * ]
 * <FilterDropdown options={zoneOptions} isLoading={isLoading} ... />
 * ```
 */
export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  disabled = false,
  disabledTooltip,
  align = 'start',
  menuWidth = 'w-48',
  className,
  isLoading = false,
  placeholder,
  emptyMessage = 'Không có dữ liệu',
}: FilterDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = selectedOption?.label || placeholder || value || 'Chọn...'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-8 gap-1 rounded-lg bg-transparent px-3', className)}
          disabled={disabled || isLoading}
          title={disabled ? disabledTooltip : undefined}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            Icon && <Icon className="h-3 w-3" />
          )}
          <span className="text-sm">
            {label} {displayLabel}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={menuWidth}>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        ) : options.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-slate-500">{emptyMessage}</div>
        ) : (
          options.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
