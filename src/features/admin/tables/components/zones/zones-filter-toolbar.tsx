'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ZonesFilterToolbarProps {
  onCreateZone: () => void
}

export function ZonesFilterToolbar({ onCreateZone }: ZonesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('tables')

  const STATUS_OPTIONS: FilterOption[] = [
    { value: 'all', label: t('all') },
    { value: 'true', label: t('active') },
    { value: 'false', label: t('inactive') },
  ]

  const SORT_BY_OPTIONS: FilterOption[] = [
    { value: 'displayOrder', label: t('displayOrderSort') },
    { value: 'name', label: t('zoneNameSort') },
    { value: 'createdAt', label: t('createdAtSort') },
    { value: 'updatedAt', label: t('updatedAtSort') },
  ]

  const SORT_ORDER_OPTIONS: FilterOption[] = [
    { value: 'asc', label: t('ascending') },
    { value: 'desc', label: t('descending') },
  ]

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('is_active') || 'all'
  const sortBy = searchParams.get('sort_by') || 'displayOrder'
  const sortOrder = searchParams.get('sort_order') || 'asc'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset to first page when filtering
    router.replace(`/admin/tables/zones?${params.toString()}`)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', localSearchQuery)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery])

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left - Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder={t('searchZones')}
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label={`${t('status')}:`}
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('is_active', value)}
          menuWidth="w-40"
        />

        <FilterDropdown
          label=""
          value={sortBy}
          options={SORT_BY_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          icon={ArrowUpDown}
        />

        <FilterDropdown
          label=""
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-32"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onCreateZone()}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm md:inline">{t('addZone')}</span>
        </Button>
      </div>
    </div>
  )
}
