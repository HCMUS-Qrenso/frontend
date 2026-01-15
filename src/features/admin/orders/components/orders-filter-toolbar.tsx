'use client'

import { useState, useEffect, useMemo } from 'react'
import { Switch } from '@/src/components/ui/switch'
import { SearchInput } from '@/src/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/src/components/ui/filter-dropdown'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminFilterToolbarWrapper } from '../../shared/components/admin-filter-toolbar-wrapper'
import { cn } from '@/src/lib/utils'
import { useOrdersSocket } from '../hooks'
import { useTablesQuery } from '@/src/features/admin/tables/queries'
import { useZonesSimpleQuery } from '@/src/features/admin/tables/queries/zones.queries'
import { useTranslations } from 'next-intl'

export function OrdersFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('orders')

  const STATUS_OPTIONS = [
    { value: 'all', label: t('all') },
    { value: 'pending', label: t('pending') },
    { value: 'accepted', label: t('accepted') },
    { value: 'in_progress', label: t('preparing') },
    { value: 'ready', label: t('ready') },
    { value: 'served', label: t('served') },
    { value: 'completed', label: t('completed') },
    { value: 'rejected', label: t('rejected') },
    { value: 'cancelled', label: t('cancelled') },
    { value: 'abandoned', label: t('abandoned') },
  ]

  const TIME_RANGE_OPTIONS: FilterOption[] = [
    { value: 'all', label: t('all') },
    { value: 'today', label: t('today') },
    { value: 'last24h', label: t('last24h') },
    { value: 'last7d', label: t('last7d') },
  ]

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [zoneId, setZoneId] = useState(searchParams.get('zoneId') || 'all')
  const [tableId, setTableId] = useState(searchParams.get('tableId') || 'all')
  const [timeRange, setTimeRange] = useState(searchParams.get('timeRange') || 'all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Connect to WebSocket for real-time updates
  const { isConnected } = useOrdersSocket({
    enabled: autoRefresh,
    showNotifications: true,
  })

  // Fetch zones for filter dropdown
  const { data: zonesData } = useZonesSimpleQuery()

  // Fetch tables for filter dropdown (filtered by zone if selected)
  const { data: tablesData } = useTablesQuery({
    limit: 100,
    ...(zoneId !== 'all' && { zone_id: zoneId }),
  })

  // Build zone options from API data
  const zoneOptions = useMemo((): FilterOption[] => {
    const options: FilterOption[] = [{ value: 'all', label: t('all') }]

    if (zonesData?.zones) {
      zonesData.zones.forEach((zone) => {
        options.push({
          value: zone.id,
          label: zone.name,
        })
      })
    }

    return options
  }, [zonesData, t])

  // Build table options from API data
  const tableOptions = useMemo((): FilterOption[] => {
    const options: FilterOption[] = [{ value: 'all', label: t('all') }]

    if (tablesData?.data?.tables) {
      tablesData.data.tables.forEach((table) => {
        options.push({
          value: table.id,
          label: `${t('table')} ${table.table_number}`,
        })
      })
    }

    return options
  }, [tablesData, t])

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const isDefaultValue = value === '' || value === 'all'

    if (isDefaultValue) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/admin/orders?${params.toString()}`, { scroll: false })
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('q', search)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateFilter('status', value)
  }

  const handleZoneChange = (value: string) => {
    setZoneId(value)
    updateFilter('zoneId', value)
    // Reset table when zone changes
    if (tableId !== 'all') {
      setTableId('all')
      updateFilter('tableId', 'all')
    }
  }

  const handleTableChange = (value: string) => {
    setTableId(value)
    updateFilter('tableId', value)
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    updateFilter('timeRange', value)
  }

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              status === option.value
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <AdminFilterToolbarWrapper>
        {/* Left: Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput placeholder={t('searchPlaceholder')} value={search} onChange={setSearch} />

          <FilterDropdown
            label={`${t('zone')}:`}
            value={zoneId}
            options={zoneOptions}
            onChange={handleZoneChange}
            placeholder={t('all')}
          />

          <FilterDropdown
            label={`${t('table')}:`}
            value={tableId}
            options={tableOptions}
            onChange={handleTableChange}
            placeholder={t('all')}
          />

          <FilterDropdown
            label={`${t('timeRange')}:`}
            value={timeRange}
            options={TIME_RANGE_OPTIONS}
            onChange={handleTimeRangeChange}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <label
              htmlFor="auto-refresh"
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {t('autoRefresh')}
            </label>
            {/* Connection Status */}
            <div
              className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-emerald-500' : 'bg-red-500')}
              title={isConnected ? t('connected') : t('disconnected')}
            />
          </div>
        </div>
      </AdminFilterToolbarWrapper>
    </div>
  )
}
