'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Plus, Download, ArrowUpDown } from 'lucide-react'
import { AdminFilterToolbarWrapper } from './admin-filter-toolbar-wrapper'
import { Category } from '@/types/categories'

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Đang bán' },
  { value: 'sold_out', label: 'Hết hàng' },
  { value: 'unavailable', label: 'Tạm ẩn' },
]

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'name', label: 'Tên món' },
  { value: 'basePrice', label: 'Giá' },
  { value: 'popularityScore', label: 'Độ phổ biến' },
]

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' },
]

interface MenuItemsFilterToolbarProps {
  categories: Category[] | undefined
  onCreateClick: () => void
}

export function MenuItemsFilterToolbar({ categories, onCreateClick }: MenuItemsFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Build dynamic category options from API data
  const categoryOptions: FilterOption[] = [
    { value: 'all', label: 'Tất cả danh mục' },
    ...(categories ? categories.map((c) => ({ value: c.id, label: c.name })) : []),
  ]

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedCategoryId =
    searchParams.get('category_id') || searchParams.get('category') || 'all'
  const selectedStatus = searchParams.get('status') || 'all'
  const sortBy = searchParams.get('sort_by') || 'createdAt'
  const sortOrder = searchParams.get('sort_order') || 'desc'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const isDefaultValue =
      value === '' ||
      value === 'all' ||
      (key === 'sort_by' && value === 'createdAt') ||
      (key === 'sort_order' && value === 'desc')

    if (isDefaultValue) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', localSearchQuery)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery])

  const handleImportExport = () => {
    router.push('/admin/menu/import-export')
  }

  return (
    <AdminFilterToolbarWrapper>
      {/* Left: Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Tìm theo tên món..."
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
        />

        <FilterDropdown
          label="Danh mục:"
          value={selectedCategoryId}
          options={categoryOptions}
          onChange={(value) => updateFilter('category_id', value)}
          isLoading={!categories}
          placeholder="Tất cả danh mục"
          emptyMessage="Chưa có danh mục"
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
        />

        <FilterDropdown
          label=""
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(value) => updateFilter('sort_order', value)}
          menuWidth="w-40"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleImportExport}
          className="h-8 gap-1 rounded-lg bg-transparent px-3"
        >
          <Download className="h-3 w-3" />
          <span className="hidden text-sm sm:inline">Import/Export</span>
        </Button>
        <Button
          onClick={onCreateClick}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm sm:inline">Thêm món</span>
        </Button>
      </div>
    </AdminFilterToolbarWrapper>
  )
}
