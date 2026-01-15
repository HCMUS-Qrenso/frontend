'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { Plus, LayoutGrid, QrCode, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { AdminFilterToolbarWrapper } from '../../../shared/components/admin-filter-toolbar-wrapper'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SimpleZone } from '@/src/features/admin/tables/types'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/src/features/auth/hooks'
import { ROLES } from '@/src/types/roles'

interface TablesFilterToolbarProps {
  isTrashView?: boolean
  onCreate: () => void
  zones: SimpleZone[] | undefined
}

export function TablesFilterToolbar({
  isTrashView = false,
  onCreate,
  zones,
}: TablesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('tables')
  const { user } = useAuth()

  const STATUS_OPTIONS: FilterOption[] = [
    { value: '', label: t('all') },
    { value: 'available', label: t('available') },
    { value: 'occupied', label: t('inUse') },
    { value: 'reserved', label: t('reserved') },
    { value: 'maintenance', label: t('maintenance') },
  ]

  const SORT_BY_OPTIONS: FilterOption[] = [
    { value: 'tableNumber', label: t('tableNumberSort') },
    { value: 'status', label: t('statusSort') },
    { value: 'createdAt', label: t('createdAtSort') },
    { value: 'updatedAt', label: t('updatedAtSort') },
  ]

  const SORT_ORDER_OPTIONS: FilterOption[] = [
    { value: 'asc', label: t('ascending') },
    { value: 'desc', label: t('descending') },
  ]

  // Build dynamic zone options from API data
  const zoneOptions: FilterOption[] = [
    { value: '', label: t('all') },
    ...(zones?.map((zone) => ({ value: zone.id, label: zone.name })) || []),
  ]

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedZoneId = searchParams.get('zone_id') || ''
  const selectedStatus = searchParams.get('status') || ''
  const sortBy = searchParams.get('sort_by') || 'tableNumber'
  const sortOrder = searchParams.get('sort_order') || 'asc'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1')
    router.push(`/admin/tables/list?${params.toString()}`)
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
      {/* Left - Filters */}
      <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center md:justify-start">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label={`${t('zone')}:`}
          value={selectedZoneId}
          options={zoneOptions}
          onChange={(value) => updateFilter('zone_id', value)}
          placeholder={t('all')}
          emptyMessage={t('noZones')}
        />

        <FilterDropdown
          label={`${t('status')}:`}
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label=""
          value={sortBy}
          options={SORT_BY_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          icon={ArrowUpDown}
          menuWidth="w-56"
        />

        <FilterDropdown
          label=""
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-40"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center justify-center gap-2 md:justify-start">
        {!isTrashView && user?.role && user?.role !== ROLES.WAITER && (
          <>
            <Link href="/admin/tables/layout">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title={t('viewLayout')}
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/admin/tables/qr">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title={t('manageQR')}
              >
                <QrCode className="h-3 w-3" />
              </Button>
            </Link>
            <Button
              onClick={() => onCreate()}
              className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden text-sm md:inline">{t('addTable')}</span>
            </Button>
          </>
        )}
      </div>
    </AdminFilterToolbarWrapper>
  )
}
