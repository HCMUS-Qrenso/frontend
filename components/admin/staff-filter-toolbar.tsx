'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Download, UserPlus, ArrowUpDown } from 'lucide-react'
import { AdminFilterToolbarWrapper } from './admin-filter-toolbar-wrapper'
import { useRouter, useSearchParams } from 'next/navigation'

interface StaffFilterToolbarProps {
  onInvite: () => void
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'suspended', label: 'Đình chỉ' },
]

const VERIFIED_OPTIONS: FilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đã xác thực' },
  { value: 'false', label: 'Chưa xác thực' },
]

const SORT_OPTIONS: FilterOption[] = [
  { value: 'createdAt', label: 'Thời gian tạo' },
  { value: 'fullName', label: 'Họ tên' },
  { value: 'lastLoginAt', label: 'Đăng nhập gần đây' },
]

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
]

export function StaffFilterToolbar({ onInvite }: StaffFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleExportCSV = () => {
    console.log('Exporting CSV')
  }

  return (
    <AdminFilterToolbarWrapper>
      {/* Left: Filters + Sort */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Tìm theo tên, email, SĐT..."
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
          width="sm:w-56"
        />

        <FilterDropdown
          label="Trạng thái:"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label="Xác thực:"
          value={emailVerified}
          options={VERIFIED_OPTIONS}
          onChange={(value) => updateFilter('email_verified', value)}
        />

        <FilterDropdown
          label="Sắp xếp:"
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          icon={ArrowUpDown}
        />

        <FilterDropdown
          label="Thứ tự:"
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-32"
        />
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="h-8 gap-1 rounded-lg bg-transparent px-3"
        >
          <Download className="h-3 w-3" />
          <span className="hidden text-sm sm:inline">Xuất CSV</span>
        </Button>
        <Button
          onClick={onInvite}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <UserPlus className="h-3 w-3" />
          <span className="text-sm">Mời nhân viên</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
