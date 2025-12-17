'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, ArrowUpDown, Search, ChevronDown } from 'lucide-react'

interface CategoriesFilterToolbarProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
}

export function CategoriesFilterToolbar({
  reorderMode,
  setReorderMode,
}: CategoriesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Map status values to UI labels
  const statusMap: Record<string, string> = {
    all: 'Tất cả',
    active: 'Đang hiển thị',
    hidden: 'Đang ẩn',
  }

  // Map sort values to UI labels
  const sortMap: Record<string, string> = {
    order: 'Theo thứ tự',
    updated: 'Mới cập nhật',
  }

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('status') || searchParams.get('is_active') || 'all'
  const selectedSort = searchParams.get('sort') || searchParams.get('order_by') || 'order'

  const selectedStatusLabel = statusMap[selectedStatus] || 'Tất cả'
  const selectedSortLabel = sortMap[selectedSort] || 'Theo thứ tự'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'Tất cả' || value === '' || value === 'all' || value === 'order') {
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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left: Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên danh mục..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

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
            <DropdownMenuItem onClick={() => updateFilter('status', 'active')}>
              Đang hiển thị
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('status', 'hidden')}>
              Đang ẩn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort - Disable when reorderMode is active */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-full bg-transparent"
              disabled={reorderMode}
              title={reorderMode ? 'Vui lòng tắt chế độ sắp xếp để dùng tính năng này' : undefined}
            >
              <span className="text-sm">Sắp xếp: {selectedSortLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('sort', 'order')}>
              Theo thứ tự
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort', 'updated')}>
              Mới cập nhật
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setReorderMode(!reorderMode)}
          className="h-10 gap-2 rounded-full bg-transparent"
        >
          <ArrowUpDown className="h-4 w-4" />
          {reorderMode ? 'Hủy sắp xếp' : 'Sắp xếp'}
        </Button>
        <Button
          onClick={handleAddCategory}
          className="h-10 gap-2 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm danh mục</span>
        </Button>
      </div>
    </div>
  )
}
