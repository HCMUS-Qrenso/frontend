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
import { AdminFilterToolbarWrapper } from './admin-filter-toolbar-wrapper'
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
    inactive: 'Đang ẩn',
  }

  // Map sort_by values to UI labels
  const sortByMap: Record<string, string> = {
    display_order: 'Thứ tự hiển thị',
    name: 'Tên danh mục',
    created_at: 'Ngày tạo',
    updated_at: 'Ngày cập nhật',
  }

  // Map sort_order values to UI labels
  const sortOrderMap: Record<string, string> = {
    asc: 'Tăng dần',
    desc: 'Giảm dần',
  }

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedSortBy = searchParams.get('sort_by') || 'display_order'
  const selectedSortOrder = searchParams.get('sort_order') || 'asc'

  const selectedStatusLabel = statusMap[selectedStatus] || 'Tất cả'
  const selectedSortByLabel = sortByMap[selectedSortBy] || 'Thứ tự hiển thị'
  const selectedSortOrderLabel = sortOrderMap[selectedSortOrder] || 'Tăng dần'

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
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên danh mục..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <span className="text-sm">Trạng thái: {selectedStatusLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('status', 'all')}>
              Tất cả
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('status', 'active')}>
              Đang hiển thị
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('status', 'inactive')}>
              Đang ẩn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort By - Disable when reorderMode is active */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-1 rounded-lg bg-transparent px-3"
              disabled={reorderMode}
              title={reorderMode ? 'Vui lòng tắt chế độ sắp xếp để dùng tính năng này' : undefined}
            >
              <span className="text-sm">Sắp xếp: {selectedSortByLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'display_order')}>
              Thứ tự hiển thị
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'name')}>
              Tên danh mục
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'created_at')}>
              Ngày tạo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'updated_at')}>
              Ngày cập nhật
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Order - Disable when reorderMode is active */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-1 rounded-lg bg-transparent px-3"
              disabled={reorderMode}
              title={reorderMode ? 'Vui lòng tắt chế độ sắp xếp để dùng tính năng này' : undefined}
            >
              <span className="text-sm">Thứ tự: {selectedSortOrderLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => updateFilter('sort_order', 'asc')}>
              Tăng dần
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_order', 'desc')}>
              Giảm dần
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
