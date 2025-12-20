'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Tạm ẩn' },
]

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'displayOrder', label: 'Thứ tự' },
  { value: 'name', label: 'Tên khu vực' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
]

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' },
]

export function ZonesFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleAddZone = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('id')
    params.set('modal', 'zone')
    params.set('mode', 'create')
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left - Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Tìm theo tên khu vực..."
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label="Trạng thái:"
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('is_active', value)}
          menuWidth="w-40"
        />

        <FilterDropdown
          label="Sắp xếp:"
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
          onClick={handleAddZone}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm md:inline">Thêm khu vực</span>
        </Button>
      </div>
    </div>
  )
}

