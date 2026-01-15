'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { UserPlus, ArrowUpDown } from 'lucide-react'
import { AdminFilterToolbarWrapper } from '../../shared/components/admin-filter-toolbar-wrapper'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface StaffFilterToolbarProps {
  onInvite: () => void
}

export function StaffFilterToolbar({ onInvite }: StaffFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('staff')

  const STATUS_OPTIONS: FilterOption[] = [
    { value: '', label: t('allStatuses') },
    { value: 'active', label: t('activeStatus') },
    { value: 'inactive', label: t('inactiveStatus') },
    { value: 'suspended', label: t('suspendedStatus') },
  ]

  const VERIFIED_OPTIONS: FilterOption[] = [
    { value: '', label: t('allVerified') },
    { value: 'true', label: t('verified') },
    { value: 'false', label: t('notVerified') },
  ]

  const SORT_OPTIONS: FilterOption[] = [
    { value: 'createdAt', label: t('createdAtSort') },
    { value: 'fullName', label: t('fullNameSort') },
    { value: 'lastLoginAt', label: t('lastLoginSort') },
  ]

  const SORT_ORDER_OPTIONS: FilterOption[] = [
    { value: 'desc', label: t('descOrder') },
    { value: 'asc', label: t('ascOrder') },
  ]

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const emailVerified = searchParams.get('email_verified') || ''
  const sortBy = searchParams.get('sort_by') || 'createdAt'
  const sortOrder = searchParams.get('sort_order') || 'desc'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset pagination
    router.push(`/admin/staff?${params.toString()}`)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        updateFilter('search', localSearchQuery)
      }
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery])

  // Sync local search with URL when URL changes externally
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  return (
    <AdminFilterToolbarWrapper>
      {/* Left: Filters + Sort */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
          width="sm:w-56"
        />

        <FilterDropdown
          label={t('statusFilter')}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label={t('verifiedFilter')}
          value={emailVerified}
          options={VERIFIED_OPTIONS}
          onChange={(value) => updateFilter('email_verified', value)}
        />

        <FilterDropdown
          label={t('sortBy')}
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          icon={ArrowUpDown}
        />

        <FilterDropdown
          label={t('sortOrder')}
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-32"
        />
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onInvite}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <UserPlus className="h-3 w-3" />
          <span className="text-sm">{t('inviteBtn')}</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
