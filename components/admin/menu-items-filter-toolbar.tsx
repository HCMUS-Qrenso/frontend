'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Plus, Download, ChevronDown } from 'lucide-react'

// TODO: Fetch categories from API (similar to zones in tables-filter-toolbar)
// For now, using hardcoded categories
const mockCategories = [
  { id: '1', name: 'Khai vị' },
  { id: '2', name: 'Món chính' },
  { id: '3', name: 'Tráng miệng' },
  { id: '4', name: 'Đồ uống' },
]

export function MenuItemsFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Map status values to UI labels
  const statusMap: Record<string, string> = {
    all: 'Tất cả',
    available: 'Đang bán',
    sold_out: 'Hết hàng',
    unavailable: 'Tạm ẩn',
  }

  // Map sort values to UI labels
  const sortMap: Record<string, string> = {
    updated: 'Mới cập nhật',
    popularity: 'Phổ biến',
    price_asc: 'Giá tăng dần',
    price_desc: 'Giá giảm dần',
  }

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedCategoryId =
    searchParams.get('category_id') || searchParams.get('category') || 'all'
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedSort = searchParams.get('sort') || searchParams.get('order_by') || 'updated'

  // Get labels for display
  const selectedCategoryLabel =
    selectedCategoryId === 'all'
      ? 'Tất cả danh mục'
      : mockCategories.find((c) => c.id === selectedCategoryId)?.name || 'Tất cả danh mục'
  const selectedStatusLabel = statusMap[selectedStatus] || 'Tất cả'
  const selectedSortLabel = sortMap[selectedSort] || 'Mới cập nhật'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'Tất cả' || value === '' || value === 'all' || value === 'updated') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset page if exists (for future pagination)
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

  const handleCreateItem = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'item')
    params.set('mode', 'create')
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const handleImportExport = () => {
    router.push('/admin/menu/import-export')
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left: Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên món..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Danh mục: {selectedCategoryLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('category_id', 'all')}>
              Tất cả danh mục
            </DropdownMenuItem>
            {mockCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => updateFilter('category_id', category.id)}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Trạng thái: {selectedStatusLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('status', 'all')}>
              Tất cả
            </DropdownMenuItem>
            {Object.entries(statusMap)
              .filter(([key]) => key !== 'all')
              .map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => updateFilter('status', key)}>
                  {label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Sắp xếp: {selectedSortLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {Object.entries(sortMap).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => updateFilter('sort', key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleImportExport}
          className="h-10 gap-2 rounded-full bg-transparent"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Import/Export</span>
        </Button>
        <Button
          onClick={handleCreateItem}
          className="h-10 gap-2 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm món</span>
        </Button>
      </div>
    </div>
  )
}
