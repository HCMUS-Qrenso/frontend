'use client'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string
  /** Current search value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Icon to show (defaults to Search) */
  icon?: LucideIcon
  /** Input width class */
  width?: string
  /** Additional className */
  className?: string
}

/**
 * Reusable search input component for admin toolbars
 * Provides consistent styling with search icon
 */
export function SearchInput({
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  icon: Icon = Search,
  width = 'sm:w-64',
  className,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Icon className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900',
          width,
          className,
        )}
      />
    </div>
  )
}
