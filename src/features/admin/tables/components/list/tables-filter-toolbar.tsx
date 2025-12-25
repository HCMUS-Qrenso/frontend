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

interface TablesFilterToolbarProps {
  isTrashView?: boolean
  onCreate: () => void
  zones: SimpleZone[] | undefined
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'available', label: 'Trống' },
  { value: 'occupied', label: 'Đang sử dụng' },
  { value: 'reserved', label: 'Đã đặt trước' },
  { value: 'maintenance', label: 'Bảo trì' },
]

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'tableNumber', label: 'Số bàn' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
]

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' },
]

export function TablesFilterToolbar({
  isTrashView = false,
  onCreate,
  zones,
}: TablesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Build dynamic zone options from API data
  const zoneOptions: FilterOption[] = [
    { value: '', label: 'Tất cả' },
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
          placeholder="Tìm theo số bàn, tên khu vực..."
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label="Khu vực:"
          value={selectedZoneId}
          options={zoneOptions}
          onChange={(value) => updateFilter('zone_id', value)}
          placeholder="Tất cả"
          emptyMessage="Chưa có khu vực"
        />

        <FilterDropdown
          label="Trạng thái:"
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label="Sắp xếp:"
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
        {!isTrashView && (
          <>
            <Link href="/admin/tables/layout">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title="Xem sơ đồ"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/admin/tables/qr">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title="Quản lý QR"
              >
                <QrCode className="h-3 w-3" />
              </Button>
            </Link>
            <Button
              onClick={() => onCreate()}
              className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden text-sm md:inline">Thêm bàn</span>
            </Button>
          </>
        )}
      </div>
    </AdminFilterToolbarWrapper>
  )
}
