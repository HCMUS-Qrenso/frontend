'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { AdminFilterToolbarWrapper } from '../../../shared/components/admin-filter-toolbar-wrapper'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CategoriesFilterToolbarProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
  onCreateClick: () => void
}

export function CategoriesFilterToolbar({
  reorderMode,
  setReorderMode,
  onCreateClick,
}: CategoriesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('menu.filters')
  const tMenu = useTranslations('menu')

  // Build filter options using translations
  const STATUS_OPTIONS: FilterOption[] = [
    { value: 'all', label: t('allStatuses') },
    { value: 'active', label: t('activeStatus') },
    { value: 'inactive', label: t('hiddenStatus') },
  ]

  const SORT_BY_OPTIONS: FilterOption[] = [
    { value: 'display_order', label: t('sortDisplayOrder') },
    { value: 'name', label: t('sortName') },
    { value: 'created_at', label: t('sortCreatedAt') },
    { value: 'updated_at', label: t('sortUpdatedAt') },
  ]

  const SORT_ORDER_OPTIONS: FilterOption[] = [
    { value: 'asc', label: t('sortAsc') },
    { value: 'desc', label: t('sortDesc') },
  ]

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedSortBy = searchParams.get('sort_by') || 'display_order'
  const selectedSortOrder = searchParams.get('sort_order') || 'asc'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const defaultValues: Record<string, string> = {
      status: 'all',
      sort_by: 'display_order',
      sort_order: 'asc',
    }
    if (value === '' || value === defaultValues[key]) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset page if exists (for future pagination)
    params.delete('page')
    router.push(`/admin/menu/categories?${params.toString()}`)
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
    <AdminFilterToolbarWrapper>
      {/* Left: Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder={t('searchCategoryPlaceholder')}
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label={t('statusLabel')}
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label={t('sortByLabel')}
          value={selectedSortBy}
          options={SORT_BY_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          disabled={reorderMode}
          disabledTooltip={t('disabledInReorderMode')}
        />

        <FilterDropdown
          label={t('orderLabel')}
          value={selectedSortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-40"
          disabled={reorderMode}
          disabledTooltip={t('disabledInReorderMode')}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setReorderMode(!reorderMode)}
          className="h-8 gap-1 rounded-lg bg-transparent px-3"
        >
          <ArrowUpDown className="h-3 w-3" />
          <span className="text-sm">{reorderMode ? t('cancelReorder') : t('reorder')}</span>
        </Button>
        <Button
          onClick={onCreateClick}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm sm:inline">{tMenu('addCategory')}</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
