'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { AdminFilterToolbarWrapper } from './admin-filter-toolbar-wrapper'
import { Plus, ArrowUpDown } from 'lucide-react'

interface CategoriesFilterToolbarProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'inactive', label: 'Đang ẩn' },
]

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'display_order', label: 'Thứ tự hiển thị' },
  { value: 'name', label: 'Tên danh mục' },
  { value: 'created_at', label: 'Ngày tạo' },
  { value: 'updated_at', label: 'Ngày cập nhật' },
]

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' },
]

export function CategoriesFilterToolbar({
  reorderMode,
  setReorderMode,
}: CategoriesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleAddCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'category')
    params.set('mode', 'create')
    router.push(`/admin/menu/categories?${params.toString()}`)
  }

  return (
    <AdminFilterToolbarWrapper>
      {/* Left: Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Tìm theo tên danh mục..."
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label="Trạng thái:"
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />

        <FilterDropdown
          label="Sắp xếp:"
          value={selectedSortBy}
          options={SORT_BY_OPTIONS}
          onChange={(value) => updateFilter('sort_by', value)}
          disabled={reorderMode}
          disabledTooltip="Vui lòng tắt chế độ sắp xếp để dùng tính năng này"
        />

        <FilterDropdown
          label="Thứ tự:"
          value={selectedSortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-40"
          disabled={reorderMode}
          disabledTooltip="Vui lòng tắt chế độ sắp xếp để dùng tính năng này"
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
          <span className="text-sm">{reorderMode ? 'Hủy sắp xếp' : 'Sắp xếp'}</span>
        </Button>
        <Button
          onClick={handleAddCategory}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm sm:inline">Thêm danh mục</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
