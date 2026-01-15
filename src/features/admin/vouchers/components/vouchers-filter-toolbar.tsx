'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { Plus } from 'lucide-react'
import { AdminFilterToolbarWrapper } from '@/src/features/admin/shared/components/admin-filter-toolbar-wrapper'
import { useTranslations } from 'next-intl'
import type { VoucherStatus, VoucherKind } from '../types'

interface VouchersFilterToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: VoucherStatus | 'all'
  onStatusChange: (value: VoucherStatus | 'all') => void
  kindFilter: VoucherKind | 'all'
  onKindChange: (value: VoucherKind | 'all') => void
  onCreate: () => void
}

export function VouchersFilterToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  kindFilter,
  onKindChange,
  onCreate,
}: VouchersFilterToolbarProps) {
  const t = useTranslations('vouchers')
  const [localSearch, setLocalSearch] = useState(search)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])

  const STATUS_OPTIONS: FilterOption[] = [
    { value: 'all', label: t('filters.allStatus') },
    { value: 'active', label: t('status.active') },
    { value: 'draft', label: t('status.draft') },
    { value: 'paused', label: t('status.paused') },
    { value: 'archived', label: t('status.archived') },
  ]

  const KIND_OPTIONS: FilterOption[] = [
    { value: 'all', label: t('filters.allKind') },
    { value: 'automatic', label: t('kind.automatic') },
    { value: 'staff_only', label: t('kind.staffOnly') },
    { value: 'code', label: t('kind.code') },
  ]

  return (
    <AdminFilterToolbarWrapper>
      {/* Left - Filters */}
      <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center md:justify-start">
        <SearchInput
          placeholder={t('filters.searchPlaceholder')}
          value={localSearch}
          onChange={setLocalSearch}
        />

        <FilterDropdown
          label={`${t('filters.status')}:`}
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(value) => onStatusChange(value as VoucherStatus | 'all')}
        />

        <FilterDropdown
          label={`${t('filters.kind')}:`}
          value={kindFilter}
          options={KIND_OPTIONS}
          onChange={(value) => onKindChange(value as VoucherKind | 'all')}
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center justify-center gap-2 md:justify-start">
        <Button
          onClick={onCreate}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm md:inline">{t('actions.create')}</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
